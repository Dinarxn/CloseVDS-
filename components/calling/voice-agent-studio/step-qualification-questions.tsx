"use client";

import React, { useState } from "react";
import { QualificationQuestion } from "@/types/voice-agent";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface StepQualificationQuestionsProps {
  questions: string[];
  onQuestionsChange: (questions: string[]) => void;
  structuredQuestions?: QualificationQuestion[];
  onStructuredQuestionsChange?: (questions: QualificationQuestion[]) => void;
}

const PRESET_QUALIFICATION_QUESTIONS: Array<{ text: string; type: "BOOLEAN" | "TEXT" | "NUMBER" | "CHOICE" }> = [
  { text: "Are you currently accepting new client or patient bookings?", type: "BOOLEAN" },
  { text: "Who primarily manages your scheduling and inbound telephone intake?", type: "TEXT" },
  { text: "Approximately how many incoming inquiries do you handle weekly?", type: "NUMBER" },
  { text: "What electronic medical record or CRM software do you currently operate?", type: "TEXT" },
];

export function StepQualificationQuestions({
  questions,
  onQuestionsChange,
  structuredQuestions,
  onStructuredQuestionsChange,
}: StepQualificationQuestionsProps) {
  const [newQuestionText, setNewQuestionText] = useState("");
  const [answerType, setAnswerType] = useState<"BOOLEAN" | "TEXT" | "NUMBER" | "CHOICE">("BOOLEAN");
  const [isRequired, setIsRequired] = useState(true);

  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return;

    const trimmed = newQuestionText.trim();
    onQuestionsChange([...questions, trimmed]);

    if (onStructuredQuestionsChange) {
      const newStructured: QualificationQuestion = {
        id: `qual_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        questionText: trimmed,
        required: isRequired,
        expectedAnswerType: answerType,
      };
      onStructuredQuestionsChange([...(structuredQuestions || []), newStructured]);
    }

    setNewQuestionText("");
  };

  const handleRemoveQuestion = (index: number) => {
    onQuestionsChange(questions.filter((_, i) => i !== index));
    if (onStructuredQuestionsChange && structuredQuestions) {
      onStructuredQuestionsChange(structuredQuestions.filter((_, i) => i !== index));
    }
  };

  const handleApplyPresets = () => {
    const texts = PRESET_QUALIFICATION_QUESTIONS.map((p) => p.text);
    onQuestionsChange(texts);
    if (onStructuredQuestionsChange) {
      const structured: QualificationQuestion[] = PRESET_QUALIFICATION_QUESTIONS.map((p, idx) => ({
        id: `preset_qual_${idx + 1}`,
        questionText: p.text,
        required: true,
        expectedAnswerType: p.type,
      }));
      onStructuredQuestionsChange(structured);
    }
  };

  const hasQuestions = questions.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight">
            Step 7: Mandatory Qualification Criteria (Hard Gate: ≥ 1 Question)
          </h3>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Formulate the discovery questions that determine whether a prospective lead qualifies for booking handoff or disqualification.
          </p>
        </div>

        <button
          type="button"
          onClick={handleApplyPresets}
          className="h-7 px-3 text-xs rounded-lg font-mono bg-surface-panel hover:bg-surface-elevated text-zinc-300 hover:text-white border border-white/[0.08] hover:border-violet-500/40 transition-colors shrink-0"
        >
          Load Acquisition Criteria Presets
        </button>
      </div>

      {/* Add New Question Form */}
      <div className="rounded-xl border border-white/[0.08] bg-surface-card p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
            Add Qualification Question
          </h4>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
              hasQuestions
                ? "bg-lime-500/10 text-[#C6FF33] border-lime-500/30"
                : "bg-rose-500/15 text-rose-300 border-rose-500/40"
            }`}
          >
            {questions.length} Question{questions.length === 1 ? "" : "s"} {hasQuestions ? "✓ Gate Passed" : "✗ Blocker"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-3 space-y-1.5">
            <label className="text-xs font-semibold text-white">Question Prompt</label>
            <Input
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddQuestion();
                }
              }}
              placeholder="e.g. Are you currently taking on new clients or patients?"
              className="bg-surface-panel border-white/[0.08] text-white text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white">Answer Type</label>
            <select
              value={answerType}
              onChange={(e) => setAnswerType(e.target.value as "BOOLEAN" | "TEXT" | "NUMBER" | "CHOICE")}
              className="w-full h-9 rounded-md bg-surface-panel border border-white/[0.08] text-white text-xs px-2.5 focus:outline-none focus:border-violet-500"
            >
              <option value="BOOLEAN">Yes / No (Boolean)</option>
              <option value="TEXT">Freeform Text</option>
              <option value="NUMBER">Numeric Value</option>
              <option value="CHOICE">Multiple Choice</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              className="rounded bg-zinc-800 border-white/[0.1] text-violet-600 accent-violet-600"
            />
            <span>Mandatory qualification gate (must be answered to qualify)</span>
          </label>

          <Button
            type="button"
            onClick={handleAddQuestion}
            size="sm"
            className="h-8.5 px-4 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold"
          >
            Add Question
          </Button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
          Configured Qualification Criteria ({questions.length} Items)
        </span>

        {!hasQuestions ? (
          <div className="p-8 text-center rounded-xl border border-rose-500/20 bg-surface-card text-rose-300 text-xs font-mono space-y-1">
            <p>⚠ No qualification questions configured.</p>
            <p className="text-zinc-500 text-[11px]">
              The backend activation readiness audit requires at least one qualification question before the agent can be activated.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {questions.map((q, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-surface-panel border border-white/[0.08] flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-violet-950/60 border border-violet-500/40 text-violet-300 font-mono text-[10px] flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="text-white font-medium">{q}</span>
                    <span className="text-[10px] font-mono text-zinc-500 ml-2">
                      [Mandatory Criteria]
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(idx)}
                  className="text-zinc-500 hover:text-rose-400 transition-colors p-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
