/**
 * CloseVDS Lead Import Engine
 * Client-side RFC-4180 CSV parsing, column mapping, normalization,
 * deterministic validation, duplicate detection, and bounded batch persistence.
 */

import { api, ApiClientError } from '@/lib/api-client';
import type { Lead, ImportLeadCandidateInput } from '@/types/leads';

export type TargetLeadField =
  | 'businessName'
  | 'phone'
  | 'email'
  | 'contactName'
  | 'contactTitle'
  | 'website'
  | 'address'
  | 'city'
  | 'source';

export interface TargetFieldDef {
  key: TargetLeadField;
  label: string;
  description: string;
  required: boolean;
  samplePlaceholder: string;
  aliases: RegExp[];
}

export const TARGET_FIELDS: TargetFieldDef[] = [
  {
    key: 'businessName',
    label: 'Business Name',
    description: 'Company or commercial business title (mandatory)',
    required: true,
    samplePlaceholder: 'Acme Dental Care',
    aliases: [
      /^(business[_\s]?name|company[_\s]?name|company|business|organization|organisation|account[_\s]?name|name)$/i,
      /^(firm|client[_\s]?name|store[_\s]?name|shop[_\s]?name)$/i,
    ],
  },
  {
    key: 'phone',
    label: 'Phone Number',
    description: 'Direct or primary company phone number',
    required: false,
    samplePlaceholder: '+1 (555) 234-5678',
    aliases: [
      /^(phone|phone[_\s]?number|telephone|tel|mobile|cell|contact[_\s]?phone|phone1)$/i,
      /^(phone[_\s]?1|work[_\s]?phone|business[_\s]?phone)$/i,
    ],
  },
  {
    key: 'email',
    label: 'Contact Email',
    description: 'Primary or direct inbox email address',
    required: false,
    samplePlaceholder: 'hello@acmedental.com',
    aliases: [
      /^(email|e[_\s]?mail|contact[_\s]?email|mail|primary[_\s]?email|work[_\s]?email)$/i,
      /^(email[_\s]?address|email1|email[_\s]?1)$/i,
    ],
  },
  {
    key: 'contactName',
    label: 'Contact Full Name',
    description: 'Owner, executive, or key decision maker',
    required: false,
    samplePlaceholder: 'Dr. Sarah Connor',
    aliases: [
      /^(contact|contact[_\s]?name|full[_\s]?name|owner|decision[_\s]?maker|person|lead[_\s]?name)$/i,
      /^(first[_\s]?name|rep|representative)$/i,
    ],
  },
  {
    key: 'contactTitle',
    label: 'Job Title / Role',
    description: 'Role or designation within the company',
    required: false,
    samplePlaceholder: 'Owner & Chief Dentist',
    aliases: [
      /^(contact[_\s]?title|title|role|position|job[_\s]?title|designation)$/i,
    ],
  },
  {
    key: 'website',
    label: 'Website / Domain',
    description: 'Company URL or web domain',
    required: false,
    samplePlaceholder: 'https://acmedental.com',
    aliases: [
      /^(website|domain|url|web|site|website[_\s]?url|homepage|web[_\s]?address)$/i,
    ],
  },
  {
    key: 'address',
    label: 'Address / Street',
    description: 'Physical location or street address',
    required: false,
    samplePlaceholder: '124 Market St, Suite 400',
    aliases: [
      /^(address|street|location|addr|full[_\s]?address|street[_\s]?address|address[_\s]?1)$/i,
    ],
  },
  {
    key: 'city',
    label: 'City / Market',
    description: 'City, region, or metropolitan area',
    required: false,
    samplePlaceholder: 'San Francisco',
    aliases: [
      /^(city|town|municipality|market)$/i,
    ],
  },
  {
    key: 'source',
    label: 'Source / Notes',
    description: 'Origin list identifier or custom context',
    required: false,
    samplePlaceholder: 'Conference Attendee List Q3',
    aliases: [
      /^(source|origin|lead[_\s]?source|notes|note|tag|tags|category)$/i,
    ],
  },
];

export type ColumnMappingState = Record<TargetLeadField, string>;

export interface RowValidationIssue {
  field: TargetLeadField | 'csv';
  fieldLabel: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Robust RFC-4180 compliant CSV parser.
 * Supports embedded commas, quotes, CRLF/LF line endings, BOM stripping,
 * empty line skipping, and unclosed quote detection.
 */
export function parseCsv(text: string): {
  headers: string[];
  rows: Record<string, string>[];
  parseErrors: string[];
} {
  const parseErrors: string[] = [];
  if (!text || !text.trim()) {
    return { headers: [], rows: [], parseErrors: ['CSV file is empty.'] };
  }

  // Strip UTF-8 Byte Order Mark (BOM) if present from Excel
  const cleanText = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;

  const rawRows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;
  let quoteStartLine = 1;
  let currentLine = 1;
  let i = 0;
  const len = cleanText.length;

  while (i < len) {
    const char = cleanText[i];
    const nextChar = i + 1 < len ? cleanText[i + 1] : '';

    if (insideQuotes) {
      if (char === '\n') {
        currentLine++;
        currentField += char;
        i++;
        continue;
      } else if (char === '\r') {
        if (nextChar === '\n') {
          currentField += '\r\n';
          currentLine++;
          i += 2;
          continue;
        } else {
          currentField += '\r';
          currentLine++;
          i++;
          continue;
        }
      } else if (char === '"') {
        if (nextChar === '"') {
          // Escaped double quote
          currentField += '"';
          i += 2;
          continue;
        } else {
          // End of quoted field
          insideQuotes = false;
          i++;
          continue;
        }
      } else {
        currentField += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
        quoteStartLine = currentLine;
        i++;
        continue;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
        i++;
        continue;
      } else if (char === '\r' && nextChar === '\n') {
        currentRow.push(currentField.trim());
        currentField = '';
        if (currentRow.some((f) => f.length > 0)) {
          rawRows.push(currentRow);
        }
        currentRow = [];
        currentLine++;
        i += 2;
        continue;
      } else if (char === '\n' || char === '\r') {
        currentRow.push(currentField.trim());
        currentField = '';
        if (currentRow.some((f) => f.length > 0)) {
          rawRows.push(currentRow);
        }
        currentRow = [];
        currentLine++;
        i++;
        continue;
      } else {
        currentField += char;
        i++;
        continue;
      }
    }
  }

  // Push final field and row
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      rawRows.push(currentRow);
    }
  }

  if (insideQuotes) {
    parseErrors.push(
      `Malformed CSV: Unclosed quoted field detected starting at line ${quoteStartLine}. Check for missing closing quotes.`
    );
  }

  if (rawRows.length === 0) {
    return { headers: [], rows: [], parseErrors: parseErrors.length > 0 ? parseErrors : ['No readable rows found in CSV.'] };
  }

  const rawHeaders = rawRows[0];
  const headers = rawHeaders.map((h, idx) => h.trim() || `Column_${idx + 1}`);

  const rows: Record<string, string>[] = [];
  for (let r = 1; r < rawRows.length; r++) {
    const rowValues = rawRows[r];
    const rowObj: Record<string, string> = {};
    let hasData = false;

    for (let c = 0; c < headers.length; c++) {
      const header = headers[c];
      const val = (rowValues[c] || '').trim();
      rowObj[header] = val;
      if (val.length > 0) hasData = true;
    }

    if (hasData) {
      rows.push(rowObj);
    }
  }

  return { headers, rows, parseErrors };
}

/**
 * Intelligent automatic column matcher.
 * Matches CSV headers against target domain field aliases.
 */
export function detectColumnMappings(headers: string[]): ColumnMappingState {
  const mapping: ColumnMappingState = {
    businessName: '',
    phone: '',
    email: '',
    contactName: '',
    contactTitle: '',
    website: '',
    address: '',
    city: '',
    source: '',
  };

  const assignedHeaders = new Set<string>();

  for (const field of TARGET_FIELDS) {
    for (const header of headers) {
      if (assignedHeaders.has(header)) continue;
      const cleanHeader = header.trim();

      const isMatch = field.aliases.some((regex) => regex.test(cleanHeader));
      if (isMatch) {
        mapping[field.key] = header;
        assignedHeaders.add(header);
        break;
      }
    }
  }

  return mapping;
}

/**
 * Domain normalizer: strips scheme, www, and trailing path/queries.
 */
export function normalizeDomain(raw?: string): string {
  if (!raw) return '';
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .split('/')[0]
    .split('?')[0]
    .trim();
}

/**
 * Phone normalizer: keeps leading '+' if present, strips non-numeric characters.
 */
export function normalizePhone(raw?: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return '';
  return hasPlus ? `+${digits}` : digits;
}

/**
 * International phone validator.
 * Accepts standard international formats with country code, leading +,
 * hyphens, dots, parentheses, and spaces without national format bias.
 * Rejects alphabetic characters, invalid punctuation, and numbers outside 6-16 digits.
 */
export function isValidPhone(phone?: string): boolean {
  if (!phone || !phone.trim()) return false;
  const trimmed = phone.trim();
  // Backend limit: phone max 50 chars
  if (trimmed.length > 50) return false;
  // Disallow alphabetic letters
  if (/[a-zA-Z]/.test(trimmed)) return false;
  // Only allow digits and standard international phone separators
  if (/[^0-9+\s\-()./]/.test(trimmed)) return false;
  // Count digits (E.164 standard is 7-15 digits; allow 6-16 for leniency)
  const digits = trimmed.replace(/\D/g, '');
  return digits.length >= 6 && digits.length <= 16;
}

/**
 * RFC 5322 compliant practical email validator.
 * Validates syntax, prevents whitespace, and enforces backend max length of 255 chars.
 */
export function isValidEmail(email?: string): boolean {
  if (!email || !email.trim()) return false;
  const trimmed = email.trim();
  if (trimmed.length > 255) return false;
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(
    trimmed
  );
}

/**
 * Cleans business name by collapsing internal whitespace.
 */
export function cleanBusinessName(name?: string): string {
  if (!name) return '';
  return name.trim().replace(/\s+/g, ' ');
}

export interface ProcessedLeadRow {
  rowNumber: number; // 1-indexed data row
  status: 'valid' | 'duplicate' | 'invalid';
  raw: Record<string, string>;
  mapped: {
    businessName: string;
    phone?: string;
    email?: string;
    contactName?: string;
    contactTitle?: string;
    website?: string;
    domain?: string;
    address?: string;
    city?: string;
    source?: string;
  };
  isDuplicateInFile: boolean;
  isDuplicateInWorkspace: boolean;
  duplicateOfRow?: number;
  matchingLeadName?: string;
  duplicateReason?: string;
  issues: RowValidationIssue[];
}

export interface LeadImportValidationSummary {
  totalRows: number;
  validCount: number;
  duplicateCount: number;
  inFileDuplicateCount: number;
  workspaceDuplicateCount: number;
  invalidCount: number;
}

interface InternalLeadIndexEntry {
  rowNumber?: number;
  leadId?: string;
  businessName: string;
  domain: string;
  phone: string;
  address: string;
  city: string;
}

/**
 * Validates, normalizes, and performs conservative deduplication.
 *
 * Validation rules:
 * - Business name is required after trimming whitespace (max 255 chars).
 * - Optional email is validated when provided (must match RFC format, max 255 chars).
 * - Optional phone is validated when provided (international formats accepted, 6-16 digits, max 50 chars).
 * - Domain, website, address, city, and source are normalized safely.
 * - Validation errors identify the affected row and field with severity.
 * - Valid rows remain importable even when other rows are invalid.
 *
 * Deduplication rules:
 * - Exact domain match (if domain present and non-empty).
 * - Exact phone match (if normalized phone has >= 7 digits).
 * - Business name match with corroboration: does NOT treat unrelated businesses
 *   as duplicates solely because they share a common name (e.g. "Apex" or "Subway")
 *   if their domains or phones conflict.
 */
export function validateAndDeduplicateLeads(
  rows: Record<string, string>[],
  mapping: ColumnMappingState,
  existingLeads: Lead[] = []
): {
  processedRows: ProcessedLeadRow[];
  summary: LeadImportValidationSummary;
} {
  const processedRows: ProcessedLeadRow[] = [];

  // Index existing workspace leads
  const existingDomainMap = new Map<string, InternalLeadIndexEntry>();
  const existingPhoneMap = new Map<string, InternalLeadIndexEntry>();
  const existingNameMap = new Map<string, InternalLeadIndexEntry[]>();

  for (const l of existingLeads) {
    const entry: InternalLeadIndexEntry = {
      leadId: l.id,
      businessName: l.companyName,
      domain: normalizeDomain(l.website),
      phone: normalizePhone(l.phone),
      address: cleanBusinessName(l.address).toLowerCase(),
      city: cleanBusinessName(l.city).toLowerCase(),
    };

    if (entry.domain) {
      existingDomainMap.set(entry.domain, entry);
    }
    if (entry.phone && entry.phone.length >= 7) {
      existingPhoneMap.set(entry.phone, entry);
    }
    const n = cleanBusinessName(entry.businessName).toLowerCase().replace(/[^a-z0-9]/g, '');
    if (n) {
      const list = existingNameMap.get(n) || [];
      list.push(entry);
      existingNameMap.set(n, list);
    }
  }

  // Track entries seen within this upload file
  const seenFileDomains = new Map<string, InternalLeadIndexEntry>();
  const seenFilePhones = new Map<string, InternalLeadIndexEntry>();
  const seenFileNames = new Map<string, InternalLeadIndexEntry[]>();

  let validCount = 0;
  let inFileDuplicateCount = 0;
  let workspaceDuplicateCount = 0;
  let invalidCount = 0;

  for (let idx = 0; idx < rows.length; idx++) {
    const raw = rows[idx];
    const rowNumber = idx + 1;
    const issues: RowValidationIssue[] = [];

    const rawBusinessName = mapping.businessName ? raw[mapping.businessName] : '';
    const rawPhone = mapping.phone ? raw[mapping.phone] : '';
    const rawEmail = mapping.email ? raw[mapping.email] : '';
    const rawContactName = mapping.contactName ? raw[mapping.contactName] : '';
    const rawContactTitle = mapping.contactTitle ? raw[mapping.contactTitle] : '';
    const rawWebsite = mapping.website ? raw[mapping.website] : '';
    const rawAddress = mapping.address ? raw[mapping.address] : '';
    const rawCity = mapping.city ? raw[mapping.city] : '';
    const rawSource = mapping.source ? raw[mapping.source] : '';

    const businessName = cleanBusinessName(rawBusinessName);
    const domain = normalizeDomain(rawWebsite);
    const phone = normalizePhone(rawPhone);
    const email = rawEmail ? rawEmail.trim().toLowerCase() : '';
    const contactName = cleanBusinessName(rawContactName);
    const contactTitle = cleanBusinessName(rawContactTitle);
    const address = cleanBusinessName(rawAddress);
    const city = cleanBusinessName(rawCity);
    const source = cleanBusinessName(rawSource);

    // 1. Mandatory business name validation
    if (!businessName) {
      issues.push({
        field: 'businessName',
        fieldLabel: 'Business Name',
        message: 'Business name is required after trimming whitespace.',
        severity: 'error',
      });
    } else if (businessName.length > 255) {
      issues.push({
        field: 'businessName',
        fieldLabel: 'Business Name',
        message: `Business name exceeds 255 characters limit (${businessName.length} chars).`,
        severity: 'error',
      });
    }

    // 2. Email validation (validated when provided)
    if (rawEmail && rawEmail.trim().length > 0) {
      if (!isValidEmail(email)) {
        issues.push({
          field: 'email',
          fieldLabel: 'Contact Email',
          message: `Invalid email address format: "${rawEmail.trim()}".`,
          severity: 'error',
        });
      }
    }

    // 3. Phone validation (validated when provided)
    if (rawPhone && rawPhone.trim().length > 0) {
      if (!isValidPhone(rawPhone)) {
        issues.push({
          field: 'phone',
          fieldLabel: 'Phone Number',
          message: `Invalid phone number format: "${rawPhone.trim()}". Must contain 6-16 digits without foreign text.`,
          severity: 'error',
        });
      }
    }

    // 4. Website / Domain safe check
    if (rawWebsite && rawWebsite.trim().length > 0 && !domain) {
      issues.push({
        field: 'website',
        fieldLabel: 'Website / Domain',
        message: `Website value "${rawWebsite.trim()}" could not be normalized to a valid domain.`,
        severity: 'warning',
      });
    }

    // Determine row validity so far
    const hasValidationError = issues.some((iss) => iss.severity === 'error');

    // 5. In-file duplicate detection (conservative & corroborated)
    let isDuplicateInFile = false;
    let duplicateOfRow: number | undefined;
    let duplicateReason: string | undefined;

    const nameKey = businessName.toLowerCase().replace(/[^a-z0-9]/g, '');

    const currentEntry: InternalLeadIndexEntry = {
      rowNumber,
      businessName,
      domain,
      phone,
      address: address.toLowerCase(),
      city: city.toLowerCase(),
    };

    if (domain && seenFileDomains.has(domain)) {
      isDuplicateInFile = true;
      const prior = seenFileDomains.get(domain)!;
      duplicateOfRow = prior.rowNumber;
      duplicateReason = `Duplicate website domain (${domain}) matches row #${duplicateOfRow}`;
      issues.push({
        field: 'website',
        fieldLabel: 'Website / Domain',
        message: duplicateReason,
        severity: 'warning',
      });
    } else if (phone && phone.length >= 7 && seenFilePhones.has(phone)) {
      isDuplicateInFile = true;
      const prior = seenFilePhones.get(phone)!;
      duplicateOfRow = prior.rowNumber;
      duplicateReason = `Duplicate phone number (${phone}) matches row #${duplicateOfRow}`;
      issues.push({
        field: 'phone',
        fieldLabel: 'Phone Number',
        message: duplicateReason,
        severity: 'warning',
      });
    } else if (nameKey && seenFileNames.has(nameKey)) {
      // Conservative name comparison: only mark duplicate if not in conflict
      const priorList = seenFileNames.get(nameKey)!;
      for (const prior of priorList) {
        const conflictingDomain = domain && prior.domain && domain !== prior.domain;
        const conflictingPhone =
          phone && prior.phone && phone.length >= 7 && prior.phone.length >= 7 && phone !== prior.phone;

        if (!conflictingDomain && !conflictingPhone) {
          isDuplicateInFile = true;
          duplicateOfRow = prior.rowNumber;
          duplicateReason = `Duplicate business name matches row #${duplicateOfRow}`;
          issues.push({
            field: 'businessName',
            fieldLabel: 'Business Name',
            message: duplicateReason,
            severity: 'warning',
          });
          break;
        }
      }
    }

    // Record keys for subsequent in-file rows (even if invalid, to prevent duplicates)
    if (domain && !seenFileDomains.has(domain)) seenFileDomains.set(domain, currentEntry);
    if (phone && phone.length >= 7 && !seenFilePhones.has(phone)) seenFilePhones.set(phone, currentEntry);
    if (nameKey) {
      const list = seenFileNames.get(nameKey) || [];
      list.push(currentEntry);
      seenFileNames.set(nameKey, list);
    }

    // 6. Workspace duplicate cross-check (if not already duplicate in file)
    let isDuplicateInWorkspace = false;
    let matchingLeadName: string | undefined;

    if (!isDuplicateInFile) {
      if (domain && existingDomainMap.has(domain)) {
        isDuplicateInWorkspace = true;
        const matched = existingDomainMap.get(domain)!;
        matchingLeadName = matched.businessName;
        duplicateReason = `Matches existing lead domain in workspace (${domain}): "${matchingLeadName}"`;
        issues.push({
          field: 'website',
          fieldLabel: 'Website / Domain',
          message: duplicateReason,
          severity: 'warning',
        });
      } else if (phone && phone.length >= 7 && existingPhoneMap.has(phone)) {
        isDuplicateInWorkspace = true;
        const matched = existingPhoneMap.get(phone)!;
        matchingLeadName = matched.businessName;
        duplicateReason = `Matches existing lead phone in workspace (${phone}): "${matchingLeadName}"`;
        issues.push({
          field: 'phone',
          fieldLabel: 'Phone Number',
          message: duplicateReason,
          severity: 'warning',
        });
      } else if (nameKey && existingNameMap.has(nameKey)) {
        const priorList = existingNameMap.get(nameKey)!;
        for (const prior of priorList) {
          const conflictingDomain = domain && prior.domain && domain !== prior.domain;
          const conflictingPhone =
            phone && prior.phone && phone.length >= 7 && prior.phone.length >= 7 && phone !== prior.phone;

          if (!conflictingDomain && !conflictingPhone) {
            isDuplicateInWorkspace = true;
            matchingLeadName = prior.businessName;
            duplicateReason = `Matches existing lead name in workspace: "${matchingLeadName}"`;
            issues.push({
              field: 'businessName',
              fieldLabel: 'Business Name',
              message: duplicateReason,
              severity: 'warning',
            });
            break;
          }
        }
      }
    }

    // 7. Determine final row status
    let status: 'valid' | 'duplicate' | 'invalid' = 'valid';
    if (hasValidationError) {
      status = 'invalid';
      invalidCount++;
    } else if (isDuplicateInFile || isDuplicateInWorkspace) {
      status = 'duplicate';
      if (isDuplicateInFile) inFileDuplicateCount++;
      if (isDuplicateInWorkspace) workspaceDuplicateCount++;
    } else {
      validCount++;
    }

    processedRows.push({
      rowNumber,
      status,
      raw,
      mapped: {
        businessName,
        phone: phone || undefined,
        email: email || undefined,
        contactName: contactName || undefined,
        contactTitle: contactTitle || undefined,
        website: rawWebsite.trim() || undefined,
        domain: domain || undefined,
        address: address || undefined,
        city: city || undefined,
        source: source || undefined,
      },
      isDuplicateInFile,
      isDuplicateInWorkspace,
      duplicateOfRow,
      matchingLeadName,
      duplicateReason,
      issues,
    });
  }

  const duplicateCount = inFileDuplicateCount + workspaceDuplicateCount;

  return {
    processedRows,
    summary: {
      totalRows: rows.length,
      validCount,
      duplicateCount,
      inFileDuplicateCount,
      workspaceDuplicateCount,
      invalidCount,
    },
  };
}

export interface ImportBatchChunkResult {
  chunkIndex: number;
  size: number;
  success: boolean;
  importedCount: number;
  updatedCount: number;
  skippedDuplicateCount: number;
  failedCount: number;
  error?: string;
}

export interface ImportExecutionResult {
  success: boolean;
  totalRequested: number;
  importedCount: number;
  updatedCount: number;
  skippedDuplicateCount: number;
  failedCount: number;
  chunkResults: ImportBatchChunkResult[];
  errors: string[];
}

/**
 * Bounded batch persistence executor.
 * Conforms strictly to backend's maximum batch size of 100 leads per request.
 * Reports per-chunk progress and genuine persistence counts.
 * Correctly preserves earlier batch successes when a later batch fails.
 */
export async function executeLeadImport(
  candidates: ImportLeadCandidateInput[],
  onProgress?: (completed: number, total: number) => void
): Promise<ImportExecutionResult> {
  const CHUNK_SIZE = 100;
  let importedCount = 0;
  let updatedCount = 0;
  let skippedDuplicateCount = 0;
  let failedCount = 0;
  const errors: string[] = [];
  const chunkResults: ImportBatchChunkResult[] = [];

  const chunks: ImportLeadCandidateInput[][] = [];
  for (let i = 0; i < candidates.length; i += CHUNK_SIZE) {
    chunks.push(candidates.slice(i, i + CHUNK_SIZE));
  }

  let completedCount = 0;

  for (let c = 0; c < chunks.length; c++) {
    const chunk = chunks[c];
    try {
      const response = await api.leads.importBatch({ leads: chunk });

      const chunkImported = response?.importedCount || 0;
      const chunkUpdated = response?.updatedCount || 0;
      const chunkSkipped = response?.skippedDuplicateCount || 0;

      importedCount += chunkImported;
      updatedCount += chunkUpdated;
      skippedDuplicateCount += chunkSkipped;
      completedCount += chunk.length;

      chunkResults.push({
        chunkIndex: c + 1,
        size: chunk.length,
        success: true,
        importedCount: chunkImported,
        updatedCount: chunkUpdated,
        skippedDuplicateCount: chunkSkipped,
        failedCount: 0,
      });

      if (onProgress) {
        onProgress(completedCount, candidates.length);
      }
    } catch (err: unknown) {
      failedCount += chunk.length;
      let msg = 'Failed to persist batch';
      if (err instanceof ApiClientError) {
        msg = err.message || `API error (${err.code})`;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      errors.push(`Batch #${c + 1} (${chunk.length} leads): ${msg}`);

      chunkResults.push({
        chunkIndex: c + 1,
        size: chunk.length,
        success: false,
        importedCount: 0,
        updatedCount: 0,
        skippedDuplicateCount: 0,
        failedCount: chunk.length,
        error: msg,
      });
    }
  }

  const success = failedCount === 0 && (importedCount > 0 || updatedCount > 0 || skippedDuplicateCount > 0);

  return {
    success,
    totalRequested: candidates.length,
    importedCount,
    updatedCount,
    skippedDuplicateCount,
    failedCount,
    chunkResults,
    errors,
  };
}

/**
 * Sample CSV template generator for operators to download.
 */
export function generateSampleCsv(): string {
  const headers = [
    'Company Name',
    'Phone Number',
    'Contact Email',
    'Contact Name',
    'Job Title',
    'Website',
    'Street Address',
    'City',
    'Source',
  ];

  const sampleRows = [
    [
      '"Apex Health Clinic"',
      '"+1 (415) 555-0192"',
      '"dr.apex@example.com"',
      '"Dr. Marcus Apex"',
      '"Clinical Director"',
      '"https://apexhealthclinic.com"',
      '"742 Evergreen Terrace"',
      '"San Francisco"',
      '"Medical Directory 2026"',
    ],
    [
      '"Blue Horizon Architects"',
      '"+1 (212) 555-0144"',
      '"info@bluehorizonarch.com"',
      '"Elena Vance"',
      '"Principal Architect"',
      '"https://bluehorizonarch.com"',
      '"100 Madison Ave, Fl 14"',
      '"New York"',
      '"Commercial Referral"',
    ],
    [
      '"Vanguard Financial Group"',
      '"+1 (312) 555-0188"',
      '"contact@vanguardfin.com"',
      '"James Sterling"',
      '"Managing Partner"',
      '"https://vanguardfin.com"',
      '"333 W Wacker Dr"',
      '"Chicago"',
      '"Q3 Prospect List"',
    ],
  ];

  return [headers.join(','), ...sampleRows.map((r) => r.join(','))].join('\n');
}
