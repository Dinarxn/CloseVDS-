"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { CreateVoiceAgentConfigInput, VoiceAgentConfig } from "@/types/calling";

export interface VoiceAgentFormProps {
  initialData?: VoiceAgentConfig | null;
  onSubmit: (data: CreateVoiceAgentConfigInput) => Promise<void>;
  isSubmitting?: boolean;
}

export function VoiceAgentForm({
  initialData,
  onSubmit,
  isSubmitting = false,
}: VoiceAgentFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [callObjective, setCallObjective] = useState(initialData?.callObjective || "");
  const [openingScript, setOpeningScript] = useState(initialData?.openingScript || "");
  const [maxDurationSeconds, setMaxDurationSeconds] = useState(
    initialData?.maxDurationSeconds || 300
  );

  // Dynamic Array Fields
  const [qualificationQuestions, setQualificationQuestions] = useState<string[]>(
    initialData?.qualificationQuestions?.length
      ? initialData.qualificationQuestions
      : ["Are you currently taking on new clients?", "Who handles your technology and booking workflows?"]
  );

  const [approvedTalkingPoints, setApprovedTalkingPoints] = useState<string[]>(
    initialData?.approvedTalkingPoints?.length
      ? initialData.approvedTalkingPoints
      : ["Observed technical audit gaps on company website", "Automated booking integration without staff overhead"]
  );

  const [prohibitedClaims, setProhibitedClaims] = useState<string[]>(
    initialData?.prohibitedClaims?.length
      ? initialData.prohibitedClaims
      : ["Never guarantee 100% revenue increases", "Never quote unapproved custom pricing"]
  );

  const [escalationConditions, setEscalationConditions] = useState<string[]>(
    initialData?.escalationConditions?.length
      ? initialData.escalationConditions
      : ["Prospect explicitly requests human manager", "Prospect mentions legal/compliance inquiry"]
  );

  const [newQuestion, setNewQuestion] = useState("");
  const [newPoint, setNewPoint] = useState("");
  const [newProhibited, setNewProhibited] = useState("");
  const [newEscalation, setNewEscalation] = useState("");

  const [formError, setFormError] = useState<string | null>(null);

  const handleAddQuestion = () => {
    if (newQuestion.trim()) {
      setQualificationQuestions([...qualificationQuestions, newQuestion.trim()]);
      setNewQuestion("");
    }
  };

  const handleRemoveQuestion = (index: number) => {
    setQualificationQuestions(qualificationQuestions.filter((_, i) => i !== index));
  };

  const handleAddPoint = () => {
    if (newPoint.trim()) {
      setApprovedTalkingPoints([...approvedTalkingPoints, newPoint.trim()]);
      setNewPoint("");
    }
  };

  const handleRemovePoint = (index: number) => {
    setApprovedTalkingPoints(approvedTalkingPoints.filter((_, i) => i !== index));
  };

  const handleAddProhibited = () => {
    if (newProhibited.trim()) {
      setProhibitedClaims([...prohibitedClaims, newProhibited.trim()]);
      setNewProhibited("");
    }
  };

  const handleRemoveProhibited = (index: number) => {
    setProhibitedClaims(prohibitedClaims.filter((_, i) => i !== index));
  };

  const handleAddEscalation = () => {
    if (newEscalation.trim()) {
      setEscalationConditions([...escalationConditions, newEscalation.trim()]);
      setNewEscalation("");
    }
  };

  const handleRemoveEscalation = (index: number) => {
    setEscalationConditions(escalationConditions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (name.trim().length < 2) {
      setFormError("Agent name must be at least 2 characters.");
      return;
    }

    if (callObjective.trim().length < 10) {
      setFormError("Call objective must be at least 10 characters.");
      return;
    }

    if (openingScript.trim().length < 10) {
      setFormError("Opening script must be at least 10 characters.");
      return;
    }

    await onSubmit({
      name: name.trim(),
      callObjective: callObjective.trim(),
      openingScript: openingScript.trim(),
      qualificationQuestions,
      approvedTalkingPoints,
      prohibitedClaims,
      escalationConditions,
      maxDurationSeconds: Number(maxDurationSeconds),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Prominent Anti-Hallucination Warning */}
      <Alert variant="warning" title="Anti-Hallucination &amp; Factual Grounding Requirement">
        AI-generated content must remain grounded in verified lead data and approved acquisition intelligence. The AI calling agent is strictly prohibited from inventing facts, unverified metrics, or unauthorized pricing.
      </Alert>

      {formError && (
        <Alert variant="destructive" title="Validation Error">
          {formError}
        </Alert>
      )}

      {/* Core Profile */}
      <Card variant="standard">
        <CardHeader>
          <CardTitle>Voice Agent Identity &amp; Objective</CardTitle>
          <CardDescription>
            Configure the name, high-level conversational goal, and maximum duration threshold.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="agent-name"
              label="Agent Name"
              placeholder="e.g., Alex - Senior Growth Specialist"
              value={name}
              onChange={(e) => setName(e.target.value)}
              helperText="Identifies this persona in call queues and dispatch logs."
              required
            />

            <Input
              id="agent-max-duration"
              label="Max Call Duration (Seconds)"
              type="number"
              min={30}
              max={1800}
              value={maxDurationSeconds}
              onChange={(e) => setMaxDurationSeconds(Number(e.target.value))}
              helperText="Enforces safety timeout (e.g. 300s = 5 minutes)."
              required
            />
          </div>

          <Textarea
            id="agent-objective"
            label="Call Objective"
            placeholder="e.g., Introduce closeVDS client acquisition capabilities, qualify prospective business fit, identify current booking gaps, and secure a demo."
            value={callObjective}
            onChange={(e) => setCallObjective(e.target.value)}
            rows={2}
            helperText="The high-level goal that directs conversational decision paths."
            required
          />

          <Textarea
            id="agent-opening"
            label="Opening Script / Greeting Hook"
            placeholder="e.g., Hi [Contact Name], this is Alex with closeVDS. I'm reaching out specifically regarding [Business Name]'s online client intake. Do you have two minutes?"
            value={openingScript}
            onChange={(e) => setOpeningScript(e.target.value)}
            rows={3}
            helperText="The exact grounded opening hook the agent delivers when answered."
            required
          />
        </CardContent>
      </Card>

      {/* Qualification Questions */}
      <Card variant="standard">
        <CardHeader>
          <CardTitle>Qualification Questions</CardTitle>
          <CardDescription>
            Structured inquiry criteria the agent uses to verify lead viability and readiness.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              id="new-question"
              placeholder="Add qualification question..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="flex-1"
            />
            <Button type="button" variant="secondary" onClick={handleAddQuestion}>
              Add
            </Button>
          </div>

          <div className="space-y-1.5 pt-2">
            {qualificationQuestions.map((q, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#0d0d12] border border-white/[0.06] text-xs text-white"
              >
                <span>{q}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(idx)}
                  className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Approved Talking Points & Prohibited Claims */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="standard">
          <CardHeader>
            <CardTitle>Approved Talking Points</CardTitle>
            <CardDescription>Verified value assertions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                id="new-point"
                placeholder="Add talking point..."
                value={newPoint}
                onChange={(e) => setNewPoint(e.target.value)}
                className="flex-1"
              />
              <Button type="button" variant="secondary" onClick={handleAddPoint}>
                Add
              </Button>
            </div>
            <div className="space-y-1.5 pt-2">
              {approvedTalkingPoints.map((tp, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#0d0d12] border border-white/[0.06] text-xs text-white"
                >
                  <span>{tp}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePoint(idx)}
                    className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card variant="standard" className="border-rose-950/40">
          <CardHeader>
            <CardTitle className="text-rose-400">Prohibited Claims</CardTitle>
            <CardDescription>Strictly forbidden claims.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                id="new-prohibited"
                placeholder="Add prohibited claim..."
                value={newProhibited}
                onChange={(e) => setNewProhibited(e.target.value)}
                className="flex-1"
              />
              <Button type="button" variant="secondary" onClick={handleAddProhibited}>
                Add
              </Button>
            </div>
            <div className="space-y-1.5 pt-2">
              {prohibitedClaims.map((pc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#0d0d12] border border-rose-900/40 text-xs text-rose-200"
                >
                  <span>{pc}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveProhibited(idx)}
                    className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Escalation Conditions */}
      <Card variant="standard" className="border-amber-950/40">
        <CardHeader>
          <CardTitle>Escalation &amp; Call Termination Rules</CardTitle>
          <CardDescription>
            Conditions where the AI agent must immediately end call, offer human callback, or register an opt-out.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              id="new-escalation"
              placeholder="Add escalation condition..."
              value={newEscalation}
              onChange={(e) => setNewEscalation(e.target.value)}
              className="flex-1"
            />
            <Button type="button" variant="secondary" onClick={handleAddEscalation}>
              Add
            </Button>
          </div>
          <div className="space-y-1.5 pt-2">
            {escalationConditions.map((ec, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#0d0d12] border border-amber-900/40 text-xs text-amber-200"
              >
                <span>{ec}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveEscalation(idx)}
                  className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form Submission */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? "Saving Configuration..." : initialData ? "Update Voice Agent" : "Create Voice Agent"}
        </Button>
      </div>
    </form>
  );
}
