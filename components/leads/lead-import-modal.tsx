"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Alert } from "@/components/ui/alert";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  parseCsv,
  detectColumnMappings,
  validateAndDeduplicateLeads,
  executeLeadImport,
  generateSampleCsv,
  isValidEmail,
  TARGET_FIELDS,
  type ColumnMappingState,
  type TargetLeadField,
  type ImportExecutionResult,
} from "@/lib/lead-import";
import type { Lead, ImportLeadCandidateInput } from "@/types/leads";

export interface LeadImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingLeads?: Lead[];
}

type ImportStep = "upload" | "configure" | "importing" | "result";

export function LeadImportModal({
  isOpen,
  onClose,
  onSuccess,
  existingLeads = [],
}: LeadImportModalProps) {
  const [step, setStep] = useState<ImportStep>("upload");
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMappingState>({
    businessName: "",
    phone: "",
    email: "",
    contactName: "",
    contactTitle: "",
    website: "",
    address: "",
    city: "",
    source: "",
  });

  // Deduplication & Filter Policy options
  const [skipInFileDuplicates, setSkipInFileDuplicates] = useState(true);
  const [skipWorkspaceDuplicates, setSkipWorkspaceDuplicates] = useState(true);
  const [excludeInvalidRows, setExcludeInvalidRows] = useState(true);

  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Progress state
  const [progressText, setProgressText] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);

  // Result state
  const [importResult, setImportResult] = useState<ImportExecutionResult | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset state when modal is opened
  useEffect(() => {
    if (isOpen) {
      setStep("upload");
      setFileName("");
      setFileSize("");
      setCsvHeaders([]);
      setRawRows([]);
      setImportResult(null);
      setErrorMessage(null);
      setProgressText("");
      setProgressPercent(0);
    }
  }, [isOpen]);

  // Handle file selection and parsing
  const handleFileProcess = useCallback((file: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") {
      setErrorMessage("Please select a valid CSV (.csv) file.");
      return;
    }

    setFileName(file.name);
    setFileSize(
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`
    );
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const { headers, rows, parseErrors } = parseCsv(text);

        if (parseErrors.length > 0 && rows.length === 0) {
          setErrorMessage(parseErrors[0] || "Failed to parse CSV file.");
          return;
        }

        if (rows.length === 0) {
          setErrorMessage("The selected CSV file contains no readable data rows.");
          return;
        }

        setCsvHeaders(headers);
        setRawRows(rows);

        // Auto detect mappings
        const detected = detectColumnMappings(headers);
        setColumnMapping(detected);

        setStep("configure");
      } catch (err: unknown) {
        setErrorMessage(
          err instanceof Error ? err.message : "Error reading CSV file."
        );
      }
    };

    reader.onerror = () => {
      setErrorMessage("Failed to read the file from disk.");
    };

    reader.readAsText(file);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileProcess(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileProcess(files[0]);
    }
  };

  // Download sample CSV
  const handleDownloadSample = () => {
    const content = generateSampleCsv();
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "closevds_leads_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Mapping change handler
  const handleMappingChange = (field: TargetLeadField, csvColumn: string) => {
    setColumnMapping((prev) => ({
      ...prev,
      [field]: csvColumn,
    }));
  };

  // Re-run validation whenever raw rows, mapping, or existing leads change
  const { processedRows, summary } = useMemo(() => {
    if (rawRows.length === 0) {
      return {
        processedRows: [],
        summary: {
          totalRows: 0,
          validCount: 0,
          duplicateCount: 0,
          inFileDuplicateCount: 0,
          workspaceDuplicateCount: 0,
          invalidCount: 0,
        },
      };
    }
    return validateAndDeduplicateLeads(rawRows, columnMapping, existingLeads);
  }, [rawRows, columnMapping, existingLeads]);

  // Determine eligible candidates for actual persistence
  const readyCandidates = useMemo(() => {
    return processedRows.filter((row) => {
      if (excludeInvalidRows && row.status === "invalid") {
        return false;
      }
      if (skipInFileDuplicates && row.isDuplicateInFile) {
        return false;
      }
      if (skipWorkspaceDuplicates && row.isDuplicateInWorkspace) {
        return false;
      }
      return Boolean(row.mapped.businessName);
    });
  }, [processedRows, excludeInvalidRows, skipInFileDuplicates, skipWorkspaceDuplicates]);

  // Execute persistence
  const handleStartImport = async () => {
    if (readyCandidates.length === 0) return;

    setStep("importing");
    setErrorMessage(null);
    setProgressText(`Preparing ${readyCandidates.length} leads for persistence...`);
    setProgressPercent(5);

    const candidatesPayload: ImportLeadCandidateInput[] = readyCandidates.map(
      (row, idx) => {
        const contactEmail = row.mapped.email;
        const hasValidEmail = Boolean(contactEmail && isValidEmail(contactEmail));

        return {
          externalId: `csv_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
          businessName: row.mapped.businessName,
          domain: row.mapped.domain || null,
          phone: row.mapped.phone || null,
          address: row.mapped.address || null,
          contact: hasValidEmail && contactEmail
            ? {
                fullName: row.mapped.contactName || row.mapped.businessName,
                email: contactEmail,
                title: row.mapped.contactTitle || null,
                phone: row.mapped.phone || null,
                isPrimary: true,
              }
            : null,
          metadata: {
            importedAt: new Date().toISOString(),
            sourceList: fileName || "manual_csv_upload",
            originalRow: row.rowNumber,
            ...(row.mapped.city ? { city: row.mapped.city } : {}),
            ...(row.mapped.website ? { websiteUrl: row.mapped.website } : {}),
            ...(row.mapped.source ? { importSource: row.mapped.source } : {}),
          },
        };
      }
    );

    try {
      const result = await executeLeadImport(
        candidatesPayload,
        (completed, total) => {
          const pct = Math.round((completed / total) * 100);
          setProgressPercent(pct);
          setProgressText(`Persisted ${completed} of ${total} leads into workspace...`);
        }
      );

      setImportResult(result);
      setStep("result");
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Unexpected error during import."
      );
      setStep("configure");
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && step !== "importing") {
          onClose();
        }
      }}
      title="Import Leads"
      description="Upload and validate your prospect list (.csv) with column mapping and deduplication."
      className="sm:max-w-3xl !bg-[#0a0a0f] !border-white/[0.08] !rounded-xl !p-5 shadow-[0_24px_64px_rgba(0,0,0,0.85)]"
    >
      <div className="relative space-y-4">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] text-xs font-mono">
          <div className="flex items-center gap-3">
            <span
              className={`flex items-center gap-1.5 ${
                step === "upload" ? "text-white font-semibold" : "text-zinc-500"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                  step === "upload"
                    ? "bg-white text-black font-bold"
                    : "bg-white/[0.06] text-zinc-400"
                }`}
              >
                1
              </span>
              <span>Upload CSV</span>
            </span>

            <span className="text-zinc-700">→</span>

            <span
              className={`flex items-center gap-1.5 ${
                step === "configure" ? "text-white font-semibold" : "text-zinc-500"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                  step === "configure"
                    ? "bg-white text-black font-bold"
                    : "bg-white/[0.06] text-zinc-400"
                }`}
              >
                2
              </span>
              <span>Map &amp; Validate</span>
            </span>

            <span className="text-zinc-700">→</span>

            <span
              className={`flex items-center gap-1.5 ${
                step === "importing" || step === "result"
                  ? "text-white font-semibold"
                  : "text-zinc-500"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                  step === "importing" || step === "result"
                    ? "bg-white text-black font-bold"
                    : "bg-white/[0.06] text-zinc-400"
                }`}
              >
                3
              </span>
              <span>Persist</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleDownloadSample}
            className="text-[11px] text-zinc-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer font-sans"
            title="Download example CSV structure"
          >
            <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Sample CSV</span>
          </button>
        </div>

        {errorMessage && (
          <Alert variant="destructive" title="Import Notice">
            {errorMessage}
          </Alert>
        )}

        {/* STEP 1: UPLOAD */}
        {step === "upload" && (
          <div className="space-y-4">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative p-8 sm:p-10 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-white bg-white/[0.06] scale-[0.99]"
                  : "border-white/[0.12] hover:border-white/[0.24] bg-[#07070a]/80 hover:bg-[#07070a]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div className="w-12 h-12 mx-auto rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300 mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>

              <h4 className="text-sm font-semibold text-white tracking-tight mb-1">
                Drop your CSV file here, or browse
              </h4>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Supports standard comma-separated lead lists exported from Apollo, Google Maps, ZoomInfo, or custom spreadsheets.
              </p>

              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] font-mono text-zinc-500">
                <span>Maximum 1,000 rows per batch</span>
                <span>•</span>
                <span>UTF-8 encoded</span>
              </div>
            </div>

            {/* Quick Helper Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="p-2.5 rounded-lg bg-[#07070a] border border-white/[0.06] space-y-1">
                <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                  Required Fields
                </div>
                <p className="text-[11px] text-zinc-300 font-medium">Business Name</p>
                <p className="text-[10px] text-zinc-500">Company title is required for record creation.</p>
              </div>

              <div className="p-2.5 rounded-lg bg-[#07070a] border border-white/[0.06] space-y-1">
                <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                  Contact Details
                </div>
                <p className="text-[11px] text-zinc-300 font-medium">Phone &amp; Email</p>
                <p className="text-[10px] text-zinc-500">Normalized for AI outreach and call preparation.</p>
              </div>

              <div className="p-2.5 rounded-lg bg-[#07070a] border border-white/[0.06] space-y-1">
                <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                  Deduplication
                </div>
                <p className="text-[11px] text-zinc-300 font-medium">Domain &amp; Phone</p>
                <p className="text-[10px] text-zinc-500">Automatically detects duplicates before saving.</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: CONFIGURE & VALIDATE */}
        {step === "configure" && (
          <div className="space-y-4 max-h-[68vh] overflow-y-auto pr-1">
            {/* File Info Bar */}
            <div className="p-2.5 rounded-lg bg-[#07070a] border border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <div className="w-6 h-6 rounded bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-zinc-300 shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-white truncate">{fileName}</span>
                <span className="text-[11px] font-mono text-zinc-500 shrink-0">({fileSize})</span>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {rawRows.length} rows detected
                </Badge>
              </div>

              <button
                type="button"
                onClick={() => setStep("upload")}
                className="text-[11px] text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0 ml-2"
              >
                Change File
              </button>
            </div>

            {/* Validation & Deduplication Health Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 rounded-lg bg-[#07070a] border border-white/[0.06]">
                <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Total Rows</div>
                <div className="text-lg font-bold text-white font-mono mt-0.5">{summary.totalRows}</div>
                <div className="text-[10px] text-zinc-500">In uploaded CSV</div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/25">
                <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Valid Rows</div>
                <div className="text-lg font-bold text-emerald-300 font-mono mt-0.5">{summary.validCount}</div>
                <div className="text-[10px] text-emerald-400/70">Ready for import</div>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/25">
                <div className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">Duplicates</div>
                <div className="text-lg font-bold text-amber-300 font-mono mt-0.5">{summary.duplicateCount}</div>
                <div className="text-[10px] text-amber-400/70">
                  {summary.inFileDuplicateCount} file / {summary.workspaceDuplicateCount} workspace
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-500/25">
                <div className="text-[10px] font-mono text-rose-400 uppercase tracking-wider">Invalid Rows</div>
                <div className="text-lg font-bold text-rose-300 font-mono mt-0.5">{summary.invalidCount}</div>
                <div className="text-[10px] text-rose-400/70">Missing business name</div>
              </div>
            </div>

            {/* Deduplication & Exclusion Policy Toggles */}
            <div className="p-3 rounded-lg bg-[#07070a] border border-white/[0.06] space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <div className="text-xs font-semibold text-zinc-200">Import &amp; Deduplication Policy</div>
                <span className="text-[10px] font-mono text-zinc-500">
                  Workspace cross-check scans {existingLeads.length} loaded records; backend deduplicates across DB.
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-zinc-300">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={skipInFileDuplicates}
                    onChange={(e) => setSkipInFileDuplicates(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-900 text-white focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>Skip in-file duplicates</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={skipWorkspaceDuplicates}
                    onChange={(e) => setSkipWorkspaceDuplicates(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-900 text-white focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>Skip workspace matches</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={excludeInvalidRows}
                    onChange={(e) => setExcludeInvalidRows(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-900 text-white focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>Exclude invalid rows</span>
                </label>
              </div>
            </div>

            {/* Column Mapping Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-semibold text-white tracking-tight">Column Mapping</h5>
                <span className="text-[11px] font-mono text-zinc-400">Map CSV headers to lead fields</span>
              </div>

              <div className="p-3 rounded-lg bg-[#07070a] border border-white/[0.06] grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TARGET_FIELDS.map((field) => {
                  const currentValue = columnMapping[field.key] || "";
                  return (
                    <div key={field.key} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-medium text-zinc-300">
                          {field.label} {field.required && <span className="text-rose-400">*</span>}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500 truncate max-w-[140px]">
                          {field.description}
                        </span>
                      </div>

                      <Select
                        id={`map-${field.key}`}
                        value={currentValue}
                        onChange={(e) => handleMappingChange(field.key, e.target.value)}
                        className="h-8 text-xs bg-[#0D0D12] border-white/[0.08]"
                      >
                        <option value="">(Not Mapped)</option>
                        {csvHeaders.map((header) => (
                          <option key={header} value={header}>
                            {header}
                          </option>
                        ))}
                      </Select>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Preview of Uploaded Rows */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-semibold text-white tracking-tight">Preview Mapped Records</h5>
                <span className="text-[11px] font-mono text-zinc-400">Showing first 5 records with validation status</span>
              </div>

              <div className="border border-white/[0.06] rounded-lg overflow-x-auto bg-[#07070a]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.02] text-zinc-400 text-[10px] font-mono uppercase tracking-wider">
                      <th className="py-2 px-3">Row</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">Company Name</th>
                      <th className="py-2 px-3">Phone</th>
                      <th className="py-2 px-3">Email</th>
                      <th className="py-2 px-3">Website</th>
                      <th className="py-2 px-3">Validation &amp; Deduplication Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {processedRows.slice(0, 5).map((row) => (
                      <tr key={row.rowNumber} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-2 px-3 font-mono text-zinc-500 text-[11px]">#{row.rowNumber}</td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          {row.status === "valid" ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-medium">
                              Valid
                            </span>
                          ) : row.status === "duplicate" ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-950/40 border border-amber-500/30 text-amber-400 font-medium">
                              Duplicate
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-950/40 border border-rose-500/30 text-rose-400 font-medium">
                              Invalid
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-medium text-white max-w-[160px] truncate">
                          {row.mapped.businessName || <span className="text-rose-400 italic">Missing</span>}
                        </td>
                        <td className="py-2 px-3 text-zinc-300 font-mono text-[11px] whitespace-nowrap">
                          {row.mapped.phone || "—"}
                        </td>
                        <td className="py-2 px-3 text-zinc-300 max-w-[140px] truncate text-[11px]">
                          {row.mapped.email || "—"}
                        </td>
                        <td className="py-2 px-3 text-zinc-300 font-mono text-[11px] max-w-[140px] truncate">
                          {row.mapped.domain || "—"}
                        </td>
                        <td className="py-2 px-3 text-zinc-400 text-[11px] max-w-[260px]">
                          {row.issues.length > 0 ? (
                            <div className="space-y-1">
                              {row.issues.map((iss, iIdx) => (
                                <div
                                  key={iIdx}
                                  className={`text-[11px] leading-tight ${
                                    iss.severity === "error" ? "text-rose-400" : "text-amber-400/90"
                                  }`}
                                >
                                  <span className="font-semibold font-mono text-[10px] uppercase mr-1">
                                    [{iss.fieldLabel}]:
                                  </span>
                                  <span>{iss.message}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-zinc-600 font-mono">Clean</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Explicit Import Confirmation Banner */}
            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
              <div>
                <span className="text-zinc-300">Ready to persist: </span>
                <span className="text-white font-bold font-mono text-sm">{readyCandidates.length}</span>
                <span className="text-zinc-400"> leads into your authenticated workspace.</span>
                <span className="text-[11px] font-mono text-zinc-500 ml-1.5">
                  ({Math.ceil(readyCandidates.length / 100)} batch{Math.ceil(readyCandidates.length / 100) === 1 ? '' : 'es'})
                </span>
                {!columnMapping.businessName && (
                  <p className="text-rose-400 text-[11px] mt-0.5">
                    * Please map the Business Name column to proceed.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 shrink-0">
                {summary.duplicateCount > 0 && (skipInFileDuplicates || skipWorkspaceDuplicates) && (
                  <span className="text-amber-400">
                    {summary.duplicateCount} duplicate(s) excluded
                  </span>
                )}
                {summary.invalidCount > 0 && excludeInvalidRows && (
                  <span className="text-rose-400">
                    {summary.invalidCount} invalid row(s) excluded
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PERSISTING IN PROGRESS */}
        {step === "importing" && (
          <div className="py-12 px-6 text-center space-y-4">
            <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-white tracking-tight">Persisting Leads to Workspace</h4>
            <p className="text-xs font-mono text-zinc-400">{progressText}</p>

            <div className="w-full max-w-md mx-auto bg-white/[0.06] rounded-full h-1.5 overflow-hidden mt-3">
              <div
                className="bg-white h-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="text-[11px] text-zinc-500 pt-2">
              Writing directly to PostgreSQL via backend API with deduplication checks. Please do not close this window.
            </p>
          </div>
        )}

        {/* STEP 4: IMPORT RESULT SUMMARY */}
        {step === "result" && importResult && (
          <div className="space-y-4 py-2">
            {/* Status Header Banner */}
            {importResult.failedCount === 0 ? (
              <div className="p-4 rounded-xl border bg-emerald-950/20 border-emerald-500/30 text-emerald-300">
                <div className="flex items-center gap-2.5 font-semibold text-sm text-white mb-1">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                  <span>Import Completed Successfully</span>
                </div>
                <p className="text-xs text-zinc-300">
                  Successfully processed all {importResult.totalRequested} requested records against the backend database.
                </p>
              </div>
            ) : importResult.importedCount > 0 || importResult.updatedCount > 0 ? (
              <div className="p-4 rounded-xl border bg-amber-950/20 border-amber-500/30 text-amber-300">
                <div className="flex items-center gap-2.5 font-semibold text-sm text-white mb-1">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center text-xs font-bold">
                    !
                  </span>
                  <span>Partial Import: Completed with Batch Failures</span>
                </div>
                <p className="text-xs text-zinc-300">
                  {importResult.importedCount + importResult.updatedCount} leads persisted from earlier batches. {importResult.failedCount} leads failed due to API errors.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl border bg-rose-950/20 border-rose-500/30 text-rose-300">
                <div className="flex items-center gap-2.5 font-semibold text-sm text-white mb-1">
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold">
                    ✕
                  </span>
                  <span>Import Failed — No Records Persisted</span>
                </div>
                <p className="text-xs text-zinc-300">
                  All {importResult.totalRequested} requested records failed to persist. Review the failure details below before retrying.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-3 rounded-lg bg-[#07070a] border border-white/[0.06]">
                <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Created</div>
                <div className="text-xl font-bold text-emerald-300 font-mono mt-0.5">
                  {importResult.importedCount}
                </div>
                <div className="text-[10px] text-zinc-500">New leads persisted</div>
              </div>

              <div className="p-3 rounded-lg bg-[#07070a] border border-white/[0.06]">
                <div className="text-[10px] font-mono text-zinc-300 uppercase tracking-wider">Updated</div>
                <div className="text-xl font-bold text-white font-mono mt-0.5">
                  {importResult.updatedCount}
                </div>
                <div className="text-[10px] text-zinc-500">Existing records synced</div>
              </div>

              <div className="p-3 rounded-lg bg-[#07070a] border border-white/[0.06]">
                <div className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">Skipped</div>
                <div className="text-xl font-bold text-amber-300 font-mono mt-0.5">
                  {importResult.skippedDuplicateCount}
                </div>
                <div className="text-[10px] text-zinc-500">Identified duplicates</div>
              </div>

              <div className="p-3 rounded-lg bg-[#07070a] border border-white/[0.06]">
                <div className="text-[10px] font-mono text-rose-400 uppercase tracking-wider">Failed</div>
                <div className="text-xl font-bold text-rose-300 font-mono mt-0.5">
                  {importResult.failedCount}
                </div>
                <div className="text-[10px] text-zinc-500">Rejections / errors</div>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/20 space-y-1 text-xs">
                <span className="font-semibold text-rose-300">Failure details:</span>
                <ul className="list-disc list-inside text-rose-400 space-y-0.5 text-[11px] font-mono">
                  {importResult.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Modal Action Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
          {step === "configure" ? (
            <button
              type="button"
              onClick={() => setStep("upload")}
              className="h-8.5 px-3.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors cursor-pointer"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {step !== "result" && (
              <button
                type="button"
                onClick={onClose}
                disabled={step === "importing"}
                className="h-8.5 px-3.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white bg-transparent hover:bg-white/[0.04] transition-colors cursor-pointer disabled:opacity-40"
              >
                Cancel
              </button>
            )}

            {step === "upload" && (
              <button
                type="button"
                disabled={!fileName || rawRows.length === 0}
                onClick={() => setStep("configure")}
                className="h-8.5 px-4 rounded-lg bg-white hover:bg-zinc-100 text-black text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue to Mapping →
              </button>
            )}

            {step === "configure" && (
              <button
                type="button"
                disabled={readyCandidates.length === 0 || !columnMapping.businessName}
                onClick={handleStartImport}
                className="h-8.5 px-4 rounded-lg bg-white hover:bg-zinc-100 text-black text-xs font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <span>Confirm &amp; Import ({readyCandidates.length})</span>
                <span className="text-xs">→</span>
              </button>
            )}

            {step === "result" && (
              <button
                type="button"
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
                className="h-8.5 px-4 rounded-lg bg-white hover:bg-zinc-100 text-black text-xs font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
              >
                Done &amp; View Leads →
              </button>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
