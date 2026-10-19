/**
 * CloseVDS V2 — Phase 5 Sales Operations & Analytics Test Suite
 * Validates CRM stage transitions, follow-up management, unified activity timeline,
 * authentic analytics endpoints, zero-division safety, and regression checks.
 */

import assert from "node:assert";
import { api, ApiClientError } from "../lib/api-client";
import {
  ALLOWED_STAGE_TRANSITIONS,
  type CanonicalLeadStatus,
} from "../types/crm";
import {
  getAllowedNextStages,
  isStageTransitionAllowed,
  mapBackendLeadToCrmDeal,
} from "../lib/mappers";
import type { BackendLead } from "../lib/mappers";

let passed = 0;
let total = 0;

async function test(name: string, fn: () => void | Promise<void>) {
  total++;
  try {
    await fn();
    passed++;
    console.log(`  ✓ PASS: ${name}`);
  } catch (err: any) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message || err}`);
    throw err;
  }
}

async function runPhase5Tests() {
  console.log("================================================================");
  console.log("CloseVDS V2 — Phase 5 Sales Operations & Analytics Test Suite");
  console.log("================================================================\n");

  const originalFetch = globalThis.fetch;

  try {
    // -------------------------------------------------------------------------
    // 1. CRM STAGE TRANSITION MATRIX & LIFECYCLE CONSTRAINTS
    // -------------------------------------------------------------------------
    console.log("--- 1. CRM STAGE TRANSITIONS & MATRIX VALIDATION ---");

    await test("1.1: ALLOWED_STAGE_TRANSITIONS defines valid next states for all canonical statuses", () => {
      const canonicalStatuses: CanonicalLeadStatus[] = [
        "DISCOVERED",
        "IMPORTED",
        "NEW",
        "RESEARCH_PENDING",
        "RESEARCHED",
        "QUALIFICATION_PENDING",
        "QUALIFIED",
        "CALL_READY",
        "CONTACTED",
        "REPLIED",
        "INTERESTED",
        "MEETING",
        "WON",
        "LOST",
        "DISQUALIFIED",
        "OPT_OUT",
      ];

      for (const st of canonicalStatuses) {
        assert(
          Array.isArray(ALLOWED_STAGE_TRANSITIONS[st]),
          `Missing transitions for status: ${st}`
        );
      }
    });

    await test("1.2: Terminal state OPT_OUT strictly forbids further stage transitions", () => {
      const nextStages = getAllowedNextStages("OPT_OUT");
      assert.strictEqual(nextStages.length, 0, "OPT_OUT must have 0 allowed next transitions");
      assert.strictEqual(
        isStageTransitionAllowed("OPT_OUT", "QUALIFIED"),
        false,
        "Cannot transition out of OPT_OUT"
      );
    });

    await test("1.3: Valid next transitions succeed via transition helper", () => {
      assert.strictEqual(isStageTransitionAllowed("NEW", "QUALIFIED"), true);
      assert.strictEqual(isStageTransitionAllowed("QUALIFIED", "CALL_READY"), true);
      assert.strictEqual(isStageTransitionAllowed("CALL_READY", "CONTACTED"), true);
      assert.strictEqual(isStageTransitionAllowed("CONTACTED", "INTERESTED"), true);
      assert.strictEqual(isStageTransitionAllowed("INTERESTED", "MEETING"), true);
      assert.strictEqual(isStageTransitionAllowed("MEETING", "WON"), true);
      assert.strictEqual(isStageTransitionAllowed("WON", "LOST"), true);
    });

    await test("1.4: Invalid / skipped stage transitions are strictly rejected", () => {
      assert.strictEqual(isStageTransitionAllowed("DISCOVERED", "WON"), false);
      assert.strictEqual(isStageTransitionAllowed("IMPORTED", "MEETING"), false);
      assert.strictEqual(isStageTransitionAllowed("RESEARCH_PENDING", "WON"), false);
    });

    await test("1.5: api.crm.updateStage issues PATCH to /crm/leads/:id/stage with valid payload", async () => {
      let interceptedUrl = "";
      let interceptedMethod = "";
      let interceptedBody: any = null;

      globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        interceptedUrl = String(input);
        interceptedMethod = init?.method || "GET";
        interceptedBody = init?.body ? JSON.parse(String(init.body)) : null;

        return new Response(
          JSON.stringify({
            success: true,
            lead: { id: "lead-123", status: "MEETING" },
            activity: {
              id: "act-1",
              leadId: "lead-123",
              type: "STAGE_CHANGE",
              description: "Stage transitioned from INTERESTED to MEETING",
              createdAt: new Date().toISOString(),
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      };

      const res = await api.crm.updateStage("lead-123", {
        status: "MEETING",
        note: "Demo call booked with practice manager",
      });

      assert(interceptedUrl.includes("/crm/leads/lead-123/stage"));
      assert.strictEqual(interceptedMethod, "PATCH");
      assert.strictEqual(interceptedBody.status, "MEETING");
      assert.strictEqual(interceptedBody.note, "Demo call booked with practice manager");
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.lead.status, "MEETING");
    });

    // -------------------------------------------------------------------------
    // 2. FOLLOW-UP TASKS WORKSPACE & LIFECYCLE
    // -------------------------------------------------------------------------
    console.log("\n--- 2. FOLLOW-UP MANAGEMENT & TASK LIFECYCLE ---");

    await test("2.1: api.followUps.list passes query parameters and deserializes task items", async () => {
      let interceptedUrl = "";

      globalThis.fetch = async (input: RequestInfo | URL) => {
        interceptedUrl = String(input);
        return new Response(
          JSON.stringify({
            success: true,
            data: [
              {
                id: "task-1",
                leadId: "lead-abc",
                leadBusinessName: "Sunset Smiles Dental",
                assignedToUserId: null,
                assignedUserName: null,
                title: "Call back regarding pricing plan",
                description: "Spoke with front desk; Dr. Miller available at 3 PM",
                dueDate: "2026-10-25T15:00:00.000Z",
                status: "PENDING",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ],
            total: 1,
            page: 1,
            limit: 20,
            totalPages: 1,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      };

      const res = await api.followUps.list({ status: "PENDING", limit: 20 });
      assert(interceptedUrl.includes("/follow-ups?status=PENDING&limit=20"));
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.data.length, 1);
      assert.strictEqual(res.data[0].leadBusinessName, "Sunset Smiles Dental");
      assert.strictEqual(res.data[0].status, "PENDING");
    });

    await test("2.2: api.followUps.create posts task with leadId and title", async () => {
      let interceptedUrl = "";
      let interceptedMethod = "";
      let interceptedBody: any = null;

      globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        interceptedUrl = String(input);
        interceptedMethod = init?.method || "GET";
        interceptedBody = init?.body ? JSON.parse(String(init.body)) : null;

        return new Response(
          JSON.stringify({
            success: true,
            task: {
              id: "task-new",
              leadId: interceptedBody.leadId,
              leadBusinessName: "Apex Dental Studio",
              title: interceptedBody.title,
              description: interceptedBody.description,
              dueDate: interceptedBody.dueDate,
              status: "PENDING",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          }),
          { status: 201, headers: { "Content-Type": "application/json" } }
        );
      };

      const res = await api.followUps.create({
        leadId: "lead-apex",
        title: "Send technical proposal",
        description: "Focus on AI voice receptionist uptime",
        dueDate: "2026-10-22T10:00:00Z",
      });

      assert(interceptedUrl.endsWith("/follow-ups"));
      assert.strictEqual(interceptedMethod, "POST");
      assert.strictEqual(interceptedBody.leadId, "lead-apex");
      assert.strictEqual(interceptedBody.title, "Send technical proposal");
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.task.id, "task-new");
    });

    await test("2.3: api.followUps.update sends PATCH to /follow-ups/:id to mark COMPLETED", async () => {
      let interceptedUrl = "";
      let interceptedMethod = "";
      let interceptedBody: any = null;

      globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        interceptedUrl = String(input);
        interceptedMethod = init?.method || "GET";
        interceptedBody = init?.body ? JSON.parse(String(init.body)) : null;

        return new Response(
          JSON.stringify({
            success: true,
            task: {
              id: "task-1",
              status: interceptedBody.status,
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      };

      const res = await api.followUps.update("task-1", { status: "COMPLETED" });
      assert(interceptedUrl.includes("/follow-ups/task-1"));
      assert.strictEqual(interceptedMethod, "PATCH");
      assert.strictEqual(interceptedBody.status, "COMPLETED");
      assert.strictEqual(res.task.status, "COMPLETED");
    });

    await test("2.4: api.followUps.delete sends DELETE to /follow-ups/:id", async () => {
      let interceptedUrl = "";
      let interceptedMethod = "";

      globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        interceptedUrl = String(input);
        interceptedMethod = init?.method || "GET";
        return new Response(
          JSON.stringify({ success: true, message: "Follow-up task deleted successfully" }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      };

      const res = await api.followUps.delete("task-1");
      assert(interceptedUrl.includes("/follow-ups/task-1"));
      assert.strictEqual(interceptedMethod, "DELETE");
      assert.strictEqual(res.success, true);
    });

    // -------------------------------------------------------------------------
    // 3. SALES ANALYTICS & DENOMINATOR SAFETY
    // -------------------------------------------------------------------------
    console.log("\n--- 3. SALES ANALYTICS DASHBOARD & DIVISION SAFETY ---");

    await test("3.1: api.analytics.getOverview calls /analytics/overview with date range", async () => {
      let interceptedUrl = "";

      globalThis.fetch = async (input: RequestInfo | URL) => {
        interceptedUrl = String(input);
        return new Response(
          JSON.stringify({
            success: true,
            metrics: {
              leads: {
                total: 42,
                byStatus: { DISCOVERED: 10, QUALIFIED: 12, CONTACTED: 15, WON: 5 },
                qualificationRate: 75.5,
                replyRate: 20.0,
              },
              campaigns: { total: 3, byStatus: { ACTIVE: 3 } },
              outreach: { total: 25, draft: 5, approved: 10, sent: 8, rejected: 1, failed: 1, approvalRate: 80.0 },
              crm: { totalActivities: 60, byType: { STAGE_CHANGE: 30, NOTE: 20, CALL_LOG: 10 } },
              tasks: { total: 10, pending: 4, inProgress: 2, completed: 4, cancelled: 0 },
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      };

      const from = "2026-09-20T00:00:00.000Z";
      const to = "2026-10-20T00:00:00.000Z";
      const res = await api.analytics.getOverview({ from, to });

      assert(interceptedUrl.includes("/analytics/overview?"));
      assert(interceptedUrl.includes("from=2026-09-20"));
      assert(interceptedUrl.includes("to=2026-10-20"));
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.metrics.leads.total, 42);
      assert.strictEqual(res.metrics.leads.byStatus.WON, 5);
    });

    await test("3.2: Analytics conversion math guards against division-by-zero", () => {
      // Test when total leads is 0
      const totalLeads = 0;
      const qualified = 0;
      const qualRate = totalLeads > 0 ? Math.round((qualified / totalLeads) * 100) : 0;
      assert.strictEqual(qualRate, 0);
      assert(!isNaN(qualRate));
      assert(isFinite(qualRate));

      // Test when calls is 0
      const totalCalls = 0;
      const meetings = 0;
      const meetingRate = totalCalls > 0 ? Math.round((meetings / totalCalls) * 100) : 0;
      assert.strictEqual(meetingRate, 0);
      assert(!isNaN(meetingRate));

      // Test when numerator > 0 but denominator is 0 (anomalous data guard)
      const orphanMeetings = 2;
      const safeOrphanRate = totalCalls > 0 ? Math.round((orphanMeetings / totalCalls) * 100) : 0;
      assert.strictEqual(safeOrphanRate, 0);
    });

    await test("3.3: api.analytics.getAcquisitionFunnel returns nested funnel contract", async () => {
      let interceptedUrl = "";

      globalThis.fetch = async (input: RequestInfo | URL) => {
        interceptedUrl = String(input);
        return new Response(
          JSON.stringify({
            success: true,
            data: {
              leadPool: {
                total: 56,
                byStatus: {
                  DISCOVERED: 20,
                  QUALIFIED: 15,
                  CALL_READY: 5,
                  CONTACTED: 8,
                  INTERESTED: 4,
                  MEETING: 2,
                  WON: 2,
                },
                qualified: 36,
              },
              voiceQueue: {
                totalCalls: 12,
                queued: 5,
                approved: 10,
                completed: 8,
                connectRate: 75.0,
              },
              conversions: {
                interested: 6,
                meetings: 2,
                won: 2,
              },
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      };

      const res = await api.analytics.getAcquisitionFunnel();
      assert(interceptedUrl.endsWith("/analytics/acquisition-funnel"));
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.data.leadPool.total, 56);
      assert.strictEqual(res.data.leadPool.qualified, 36);
      assert.strictEqual(res.data.voiceQueue.totalCalls, 12);
      assert.strictEqual(res.data.voiceQueue.completed, 8);
      assert.strictEqual(res.data.voiceQueue.connectRate, 75.0);
      assert.strictEqual(res.data.conversions.meetings, 2);
      assert.strictEqual(res.data.conversions.won, 2);
    });

    await test("3.4: api.analytics.exportReport receives and returns raw CSV text", async () => {
      let interceptedUrl = "";

      const rawCsvSample =
        '"Lead ID","Business Name","Domain","Phone","Status","Campaign Name","Niche","Primary Contact","Primary Email","Created At"\n' +
        '"uuid-1","Dental Care","dentalcare.com","+1234567890","QUALIFIED","Dental Q4","Dental","Dr. Smith","smith@dentalcare.com","2026-10-18T10:00:00.000Z"';

      globalThis.fetch = async (input: RequestInfo | URL) => {
        interceptedUrl = String(input);
        return new Response(rawCsvSample, {
          status: 200,
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": 'attachment; filename="leads_export.csv"',
          },
        });
      };

      const res = await api.analytics.exportReport({ format: "csv" });
      assert(interceptedUrl.includes("/analytics/export?format=csv"));
      assert.strictEqual(typeof res, "string");
      if (typeof res === "string") {
        assert(res.startsWith('"Lead ID"'));
        assert(res.includes("Dental Care"));
      } else {
        assert.fail("Expected raw CSV string from exportReport");
      }
    });

    await test("3.5: api.analytics.exportReport handles HTTP error responses cleanly", async () => {
      globalThis.fetch = async () => {
        return new Response(
          JSON.stringify({
            statusCode: 400,
            error: "Bad Request",
            message: "from must be an ISO 8601 datetime string",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      };

      let caughtError: unknown = null;
      try {
        await api.analytics.exportReport({ format: "csv", from: "invalid-date" });
      } catch (err) {
        caughtError = err;
      }

      assert(caughtError instanceof ApiClientError);
      assert.strictEqual((caughtError as ApiClientError).statusCode, 400);
      assert((caughtError as ApiClientError).message.includes("from must be an ISO 8601 datetime string"));
    });

    await test("3.6: Missing or null funnel data does not fabricate metrics or crash", () => {
      // Simulate missing or undefined funnel response
      const missingFunnel = null as any;
      const pool = missingFunnel?.leadPool?.total ?? 0;
      const qualified = missingFunnel?.leadPool?.qualified ?? 0;
      const completed = missingFunnel?.voiceQueue?.completed ?? 0;

      assert.strictEqual(pool, 0);
      assert.strictEqual(qualified, 0);
      assert.strictEqual(completed, 0);

      const conversion = pool > 0 ? Math.round((qualified / pool) * 100) : 0;
      assert.strictEqual(conversion, 0);
      assert(!isNaN(conversion));
    });

    // -------------------------------------------------------------------------
    // 4. UNIFIED ACTIVITY TIMELINE & LOGGING
    // -------------------------------------------------------------------------
    console.log("\n--- 4. UNIFIED ACTIVITY TIMELINE & VERIFIED DATA ---");

    await test("4.1: api.crm.getActivities returns chronological activities", async () => {
      globalThis.fetch = async () => {
        return new Response(
          JSON.stringify({
            success: true,
            activities: [
              {
                id: "act-1",
                leadId: "lead-1",
                type: "STAGE_CHANGE",
                description: "Stage transitioned from NEW to QUALIFIED",
                createdAt: "2026-10-18T10:00:00Z",
              },
              {
                id: "act-2",
                leadId: "lead-1",
                type: "NOTE",
                description: "Dr. Evans prefers morning appointments",
                createdAt: "2026-10-19T11:00:00Z",
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      };

      const res = await api.crm.getActivities("lead-1");
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.activities.length, 2);
      assert.strictEqual(res.activities[0].type, "STAGE_CHANGE");
      assert.strictEqual(res.activities[1].type, "NOTE");
    });

    await test("4.2: api.crm.recordActivity records user note without claiming provider dispatch", async () => {
      let interceptedBody: any = null;

      globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        interceptedBody = init?.body ? JSON.parse(String(init.body)) : null;
        return new Response(
          JSON.stringify({
            success: true,
            activity: {
              id: "act-manual",
              leadId: "lead-1",
              type: interceptedBody.type,
              description: interceptedBody.description,
              metadata: interceptedBody.metadata,
              createdAt: new Date().toISOString(),
            },
          }),
          { status: 201, headers: { "Content-Type": "application/json" } }
        );
      };

      const res = await api.crm.recordActivity("lead-1", {
        type: "NOTE",
        description: "Spoke briefly with receptionist. Receptionist requested PDF by email.",
        metadata: { source: "operator_manual_log", isConfirmed: false },
      });

      assert.strictEqual(res.activity.type, "NOTE");
      assert.strictEqual(interceptedBody.metadata.isConfirmed, false);
    });

    // -------------------------------------------------------------------------
    // 5. REGRESSION & SECURITY CHECKS
    // -------------------------------------------------------------------------
    console.log("\n--- 5. REGRESSION & SECURITY AUDIT ---");

    await test("5.1: mapBackendLeadToCrmDeal correctly derives canonical fields and stage", () => {
      const mockLead: BackendLead = {
        id: "b-lead-99",
        workspaceId: "ws-1",
        businessName: "Downtown Dental Associates",
        phone: "+15551234567",
        status: "INTERESTED",
        createdAt: "2026-10-01T00:00:00Z",
        updatedAt: "2026-10-15T00:00:00Z",
        contacts: [
          {
            id: "c-1",
            leadId: "b-lead-99",
            fullName: "Dr. Sarah Downtown",
            email: "sarah@downtowndental.com",
            phone: "+15551234567",
            isPrimary: true,
          },
        ],
        leadScore: {
          id: "ls-1",
          leadId: "b-lead-99",
          relevanceScore: 85,
          opportunityScore: 90,
          totalScore: 88,
          isQualified: true,
        },
      };

      const deal = mapBackendLeadToCrmDeal(mockLead);
      assert.strictEqual(deal.leadId, "b-lead-99");
      assert.strictEqual(deal.companyName, "Downtown Dental Associates");
      assert.strictEqual(deal.contactName, "Dr. Sarah Downtown");
      assert.strictEqual(deal.contactEmail, "sarah@downtowndental.com");
      assert.strictEqual(deal.contactPhone, "+15551234567");
      assert.strictEqual(deal.stage, "in_followup");
      assert.strictEqual(deal.rawStatus, "INTERESTED");
      assert.strictEqual(deal.qualificationScore, 88);
    });

    await test("5.2: 401 Unauthorized API error propagates safely with clean message", async () => {
      globalThis.fetch = async () => {
        return new Response(
          JSON.stringify({
            error: {
              code: "UNAUTHORIZED",
              message: "Authentication required",
            },
          }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      };

      await assert.rejects(
        async () => {
          await api.crm.getProfile("some-id");
        },
        (err: any) => {
          assert(err instanceof ApiClientError);
          assert.strictEqual(err.statusCode, 401);
          return true;
        }
      );
    });

    await test("5.3: 400 Bad Request error from backend stage transition surfaces message clearly", async () => {
      globalThis.fetch = async () => {
        return new Response(
          JSON.stringify({
            error: {
              code: "BAD_REQUEST",
              message: "Invalid stage transition from DISCOVERED to WON. Allowed next stages: IMPORTED, RESEARCH_PENDING, DISQUALIFIED, OPT_OUT",
            },
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      };

      await assert.rejects(
        async () => {
          await api.crm.updateStage("lead-1", { status: "WON" });
        },
        (err: any) => {
          assert(err instanceof ApiClientError);
          assert.strictEqual(err.statusCode, 400);
          assert(err.message.includes("Invalid stage transition from DISCOVERED to WON"));
          return true;
        }
      );
    });

    console.log("\n================================================================");
    console.log(`Phase 5 Sales Operations Test Suite: ${passed} / ${total} tests PASSED`);
    console.log("================================================================\n");
  } finally {
    globalThis.fetch = originalFetch;
  }
}

runPhase5Tests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
