/**
 * Phase 4 AI Voice Calling & Automation Test Suite
 * Validates backend API contract alignment, policy management, call lifecycle,
 * opt-out/suppression enforcement, and error reporting without initiating real calls.
 */

import assert from 'node:assert';
import { api, ApiClientError } from '../lib/api-client';
import type {
  WorkspaceCallingPolicy,
  UpdateCallingPolicyInput,
  CallWithRelations,
  CallPreparationResult,
  VoiceSafetyCheckResult,
} from '../types/calling';

let passed = 0;
let total = 0;

function test(name: string, fn: () => void | Promise<void>) {
  total++;
  try {
    const res = fn();
    if (res instanceof Promise) {
      return res
        .then(() => {
          passed++;
          console.log(`  ✓ PASS: ${name}`);
        })
        .catch((err) => {
          console.error(`  ✗ FAIL: ${name}`);
          console.error(`    ${err.message || err}`);
          throw err;
        });
    } else {
      passed++;
      console.log(`  ✓ PASS: ${name}`);
    }
  } catch (err: any) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message || err}`);
    throw err;
  }
}

async function runPhase4Tests() {
  console.log('================================================================');
  console.log('CloseVDS V2 — Phase 4 AI Calling & Automation Test Suite');
  console.log('================================================================\n');

  const originalFetch = globalThis.fetch;

  try {
    // ----------------------------------------------------------------------------
    // 1. Calling Policy & Automation Controls Contract
    // ----------------------------------------------------------------------------
    console.log('--- 1. CALLING POLICY & AUTOMATION CONTROLS ---');

    await test('1.1: api.voice.getPolicy calls GET /voice/policy', async () => {
      let capturedUrl = '';
      let capturedMethod = '';

      globalThis.fetch = async (url: any, init?: any) => {
        capturedUrl = String(url);
        capturedMethod = init?.method || 'GET';
        return new Response(
          JSON.stringify({
            success: true,
            data: {
              id: 'policy-123',
              workspaceId: 'ws-456',
              dailyCallLimit: 25,
              maxConcurrentCalls: 1,
              maxAttemptsPerLead: 3,
              retryDelayMinutes: 120,
              allowedCallingDays: [1, 2, 3, 4, 5],
              callingWindowStart: '09:00',
              callingWindowEnd: '17:00',
              recordingConsent: false,
              humanApprovalRequired: true,
              providerRestrictions: [],
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      };

      const res = await api.voice.getPolicy();
      assert.strictEqual(capturedUrl.endsWith('/voice/policy'), true);
      assert.strictEqual(capturedMethod, 'GET');
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.data.dailyCallLimit, 25);
      assert.strictEqual(res.data.isActive, true);
      assert.strictEqual(res.data.humanApprovalRequired, true);
    });

    await test('1.2: api.voice.updatePolicy calls PUT /voice/policy with valid payload', async () => {
      let capturedUrl = '';
      let capturedMethod = '';
      let capturedBody: any = null;

      globalThis.fetch = async (url: any, init?: any) => {
        capturedUrl = String(url);
        capturedMethod = init?.method || 'GET';
        capturedBody = init?.body ? JSON.parse(init.body) : null;
        return new Response(
          JSON.stringify({
            success: true,
            data: {
              id: 'policy-123',
              workspaceId: 'ws-456',
              ...capturedBody,
            },
            message: 'Workspace calling policy updated successfully',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      };

      const updateInput: UpdateCallingPolicyInput = {
        dailyCallLimit: 50,
        maxAttemptsPerLead: 5,
        callingWindowStart: '08:30',
        callingWindowEnd: '18:00',
        humanApprovalRequired: true,
        isActive: true,
      };

      const res = await api.voice.updatePolicy(updateInput);
      assert.strictEqual(capturedUrl.endsWith('/voice/policy'), true);
      assert.strictEqual(capturedMethod, 'PUT');
      assert.strictEqual(capturedBody.dailyCallLimit, 50);
      assert.strictEqual(capturedBody.maxAttemptsPerLead, 5);
      assert.strictEqual(capturedBody.callingWindowStart, '08:30');
      assert.strictEqual(capturedBody.humanApprovalRequired, true);
      assert.strictEqual(res.success, true);
    });

    // ----------------------------------------------------------------------------
    // 2. Call Preparation & Pre-Flight Grounding
    // ----------------------------------------------------------------------------
    console.log('\n--- 2. CALL PREPARATION & PRE-FLIGHT SAFETY ---');

    await test('2.1: api.voice.prepareCall calls POST /voice/calls/prepare with optional campaignId', async () => {
      let capturedUrl = '';
      let capturedMethod = '';
      let capturedBody: any = null;

      globalThis.fetch = async (url: any, init?: any) => {
        capturedUrl = String(url);
        capturedMethod = init?.method || 'GET';
        capturedBody = init?.body ? JSON.parse(init.body) : null;
        return new Response(
          JSON.stringify({
            success: true,
            data: {
              callId: 'call-prep-789',
              status: 'SAFETY_CHECKING',
              safetyCheck: { passed: true, evaluatedGates: [{ gateNumber: 1, gateName: 'OPT_OUT_CHECK', passed: true }] },
              normalizedPhone: '+14155552671',
              groundedContext: {
                leadFacts: { businessName: 'Test Dental Clinic', phone: '+14155552671' },
                observedGaps: [],
                campaignOffer: { niche: 'Dentistry', targetOffer: 'AI Voice Receptionist' },
                approvedTalkingPoints: ['24/7 Patient booking'],
                prohibitedClaims: ['Never guarantee 100% increases'],
                unknownInformation: [],
              },
              requiresApproval: true,
            },
            message: 'Call pre-flight safety check completed',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      };

      const res = await api.voice.prepareCall({
        leadId: '8097b6a4-8480-4560-84dc-f80e541ceee5',
        contactId: 'f091c532-a55e-4bb5-a3ec-694539ef2a26',
      });

      assert.strictEqual(capturedUrl.endsWith('/voice/calls/prepare'), true);
      assert.strictEqual(capturedMethod, 'POST');
      assert.strictEqual(capturedBody.leadId, '8097b6a4-8480-4560-84dc-f80e541ceee5');
      assert.strictEqual(capturedBody.contactId, 'f091c532-a55e-4bb5-a3ec-694539ef2a26');
      assert.strictEqual(capturedBody.campaignId, undefined);
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.data.requiresApproval, true);
    });

    // ----------------------------------------------------------------------------
    // 3. Call Creation, Approval, Rejection & Cancellation
    // ----------------------------------------------------------------------------
    console.log('\n--- 3. CALL WORKFLOW: CREATE, APPROVE, REJECT, CANCEL ---');

    await test('3.1: api.voice.createCall posts to /voice/calls with humanApprovalRequired', async () => {
      let capturedUrl = '';
      let capturedMethod = '';
      let capturedBody: any = null;

      globalThis.fetch = async (url: any, init?: any) => {
        capturedUrl = String(url);
        capturedMethod = init?.method || 'GET';
        capturedBody = init?.body ? JSON.parse(init.body) : null;
        return new Response(
          JSON.stringify({
            success: true,
            data: {
              id: 'call-abc-123',
              workspaceId: 'ws-1',
              status: 'APPROVAL_REQUIRED',
              humanApprovalRequired: true,
              isApproved: false,
              recipientPhone: '+14155552671',
              normalizedPhone: '+14155552671',
            },
            message: 'Call session queued awaiting human approval',
          }),
          { status: 201, headers: { 'Content-Type': 'application/json' } }
        );
      };

      const res = await api.voice.createCall({
        leadId: '8097b6a4-8480-4560-84dc-f80e541ceee5',
        contactId: 'f091c532-a55e-4bb5-a3ec-694539ef2a26',
        humanApprovalRequired: true,
      });

      assert.strictEqual(capturedUrl.endsWith('/voice/calls'), true);
      assert.strictEqual(capturedMethod, 'POST');
      assert.strictEqual(capturedBody.humanApprovalRequired, true);
      assert.strictEqual(res.data.status, 'APPROVAL_REQUIRED');
    });

    await test('3.2: api.voice.approveCall calls POST /voice/calls/:id/approve', async () => {
      let capturedUrl = '';
      let capturedMethod = '';

      globalThis.fetch = async (url: any, init?: any) => {
        capturedUrl = String(url);
        capturedMethod = init?.method || 'GET';
        return new Response(
          JSON.stringify({
            success: true,
            data: { id: 'call-abc-123', status: 'APPROVED', isApproved: true },
            message: 'Call approved for manual dispatch',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      };

      const res = await api.voice.approveCall('call-abc-123');
      assert.strictEqual(capturedUrl.endsWith('/voice/calls/call-abc-123/approve'), true);
      assert.strictEqual(capturedMethod, 'POST');
      assert.strictEqual(res.data.status, 'APPROVED');
    });

    await test('3.3: api.voice.rejectCall calls POST /voice/calls/:id/reject with reason', async () => {
      let capturedUrl = '';
      let capturedMethod = '';
      let capturedBody: any = null;

      globalThis.fetch = async (url: any, init?: any) => {
        capturedUrl = String(url);
        capturedMethod = init?.method || 'GET';
        capturedBody = init?.body ? JSON.parse(init.body) : null;
        return new Response(
          JSON.stringify({
            success: true,
            data: { id: 'call-abc-123', status: 'BLOCKED' },
            message: 'Call rejected',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      };

      const res = await api.voice.rejectCall('call-abc-123', 'Number unverified');
      assert.strictEqual(capturedUrl.endsWith('/voice/calls/call-abc-123/reject'), true);
      assert.strictEqual(capturedMethod, 'POST');
      assert.strictEqual(capturedBody.reason, 'Number unverified');
      assert.strictEqual(res.data.status, 'BLOCKED');
    });

    await test('3.4: api.voice.cancelCall calls POST /voice/calls/:id/cancel with reason', async () => {
      let capturedUrl = '';
      let capturedMethod = '';
      let capturedBody: any = null;

      globalThis.fetch = async (url: any, init?: any) => {
        capturedUrl = String(url);
        capturedMethod = init?.method || 'GET';
        capturedBody = init?.body ? JSON.parse(init.body) : null;
        return new Response(
          JSON.stringify({
            success: true,
            data: { id: 'call-abc-123', status: 'CANCELLED' },
            message: 'Call session cancelled',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      };

      const res = await api.voice.cancelCall('call-abc-123', 'Operator cancelled before dispatch');
      assert.strictEqual(capturedUrl.endsWith('/voice/calls/call-abc-123/cancel'), true);
      assert.strictEqual(capturedMethod, 'POST');
      assert.strictEqual(capturedBody.reason, 'Operator cancelled before dispatch');
      assert.strictEqual(res.data.status, 'CANCELLED');
    });

    // ----------------------------------------------------------------------------
    // 4. CRM Synchronization & Outcome Completion
    // ----------------------------------------------------------------------------
    console.log('\n--- 4. CRM SYNCHRONIZATION & TRANSCRIPTS ---');

    await test('4.1: api.voice.completeCall triggers outcome classification and CRM activity record', async () => {
      let capturedUrl = '';
      let capturedMethod = '';

      globalThis.fetch = async (url: any, init?: any) => {
        capturedUrl = String(url);
        capturedMethod = init?.method || 'GET';
        return new Response(
          JSON.stringify({
            success: true,
            data: {
              id: 'outcome-123',
              callId: 'call-abc-123',
              outcome: 'MEETING_REQUESTED',
              interestLevel: 'HIGH',
              objections: [],
              sentiment: 'POSITIVE',
              optOutDetected: false,
              summary: 'Prospect requested 15-minute product walk-through.',
              derivedFromActual: true,
            },
            message: 'Call outcome analyzed and CRM activity recorded',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      };

      const res = await api.voice.completeCall('call-abc-123');
      assert.strictEqual(capturedUrl.endsWith('/voice/calls/call-abc-123/complete'), true);
      assert.strictEqual(capturedMethod, 'POST');
      assert.strictEqual(res.data.outcome, 'MEETING_REQUESTED');
      assert.strictEqual(res.data.sentiment, 'POSITIVE');
    });

    await test('4.2: api.voice.recordTurn records turn with timestamp and speaker', async () => {
      let capturedUrl = '';
      let capturedMethod = '';
      let capturedBody: any = null;

      globalThis.fetch = async (url: any, init?: any) => {
        capturedUrl = String(url);
        capturedMethod = init?.method || 'GET';
        capturedBody = init?.body ? JSON.parse(init.body) : null;
        return new Response(
          JSON.stringify({
            success: true,
            data: {
              id: 'turn-1',
              callId: 'call-abc-123',
              turnIndex: 0,
              speaker: 'agent',
              text: 'Hello, this is Alex from CloseVDS.',
              confidence: 0.98,
              timestampMs: 1200,
            },
            message: 'Call turn recorded',
          }),
          { status: 201, headers: { 'Content-Type': 'application/json' } }
        );
      };

      const res = await api.voice.recordTurn('call-abc-123', {
        turnIndex: 0,
        speaker: 'agent',
        text: 'Hello, this is Alex from CloseVDS.',
        confidence: 0.98,
        timestampMs: 1200,
      });

      assert.strictEqual(capturedUrl.endsWith('/voice/calls/call-abc-123/turns'), true);
      assert.strictEqual(capturedBody.speaker, 'agent');
      assert.strictEqual(capturedBody.turnIndex, 0);
      assert.strictEqual(res.data.confidence, 0.98);
    });

    // ----------------------------------------------------------------------------
    // 5. Error & Safety Handling
    // ----------------------------------------------------------------------------
    console.log('\n--- 5. SAFETY GATES & PROVIDER ERROR HANDLING ---');

    await test('5.1: Unconfigured provider returns honest error without fake success', async () => {
      globalThis.fetch = async () => {
        return new Response(
          JSON.stringify({
            error: {
              code: 'PROVIDER_UNCONFIGURED',
              message: 'Outbound telephony provider is not configured. Outbound voice calling is disabled for safety.',
            },
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      };

      await assert.rejects(
        async () => {
          await api.voice.dispatchCall('call-abc-123');
        },
        (err: any) => {
          assert.strictEqual(err instanceof ApiClientError, true);
          assert.strictEqual(err.message.includes('not configured'), true);
          return true;
        }
      );
    });

    await test('5.2: Global kill switch error (KILL_SWITCH_ACTIVE) handled correctly', async () => {
      globalThis.fetch = async () => {
        return new Response(
          JSON.stringify({
            error: {
              code: 'KILL_SWITCH_ACTIVE',
              message: 'Global outreach kill switch is currently active.',
            },
          }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      };

      await assert.rejects(
        async () => {
          await api.voice.createCall({
            leadId: '8097b6a4-8480-4560-84dc-f80e541ceee5',
            contactId: 'f091c532-a55e-4bb5-a3ec-694539ef2a26',
          });
        },
        (err: any) => {
          assert.strictEqual(err instanceof ApiClientError, true);
          assert.strictEqual(err.code, 'KILL_SWITCH_ACTIVE');
          return true;
        }
      );
    });

  } finally {
    globalThis.fetch = originalFetch;
  }

  console.log('\n================================================================');
  console.log(`Phase 4 Calling Test Suite: ${passed} / ${total} tests PASSED`);
  console.log('================================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runPhase4Tests().catch((err) => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
