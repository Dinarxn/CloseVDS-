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

/**
 * Robust RFC-4180 compliant CSV parser.
 * Supports embedded commas, quotes, CRLF/LF line endings, and ignores empty lines.
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
  let i = 0;
  const len = cleanText.length;

  while (i < len) {
    const char = cleanText[i];
    const nextChar = i + 1 < len ? cleanText[i + 1] : '';

    if (insideQuotes) {
      if (char === '"') {
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
        i += 2;
        continue;
      } else if (char === '\n' || char === '\r') {
        currentRow.push(currentField.trim());
        currentField = '';
        if (currentRow.some((f) => f.length > 0)) {
          rawRows.push(currentRow);
        }
        currentRow = [];
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

  if (rawRows.length === 0) {
    return { headers: [], rows: [], parseErrors: ['No readable rows found in CSV.'] };
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
 * Domain normalizer: strips scheme, www, and trailing slash.
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
 * Email format validator.
 */
export function isValidEmail(email?: string): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email.trim());
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
  issues: string[];
}

export interface LeadImportValidationSummary {
  totalRows: number;
  validCount: number;
  duplicateCount: number;
  inFileDuplicateCount: number;
  workspaceDuplicateCount: number;
  invalidCount: number;
}

/**
 * Validates, normalizes, and performs multi-layer deduplication.
 * Deterministic matching rules:
 * 1. Normalized domain (if present)
 * 2. Normalized phone digits (if >= 7 digits)
 * 3. Business name (lowercase alphanumeric)
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

  // Index existing workspace leads for rapid cross-check
  const existingDomainMap = new Map<string, string>();
  const existingPhoneMap = new Map<string, string>();
  const existingNameMap = new Map<string, string>();

  for (const l of existingLeads) {
    const d = normalizeDomain(l.website);
    if (d) existingDomainMap.set(d, l.companyName);

    const p = normalizePhone(l.phone);
    if (p && p.length >= 7) existingPhoneMap.set(p, l.companyName);

    const n = cleanBusinessName(l.companyName).toLowerCase().replace(/[^a-z0-9]/g, '');
    if (n) existingNameMap.set(n, l.companyName);
  }

  // Track keys seen within this upload file
  const seenFileDomains = new Map<string, number>();
  const seenFilePhones = new Map<string, number>();
  const seenFileNames = new Map<string, number>();

  let validCount = 0;
  let inFileDuplicateCount = 0;
  let workspaceDuplicateCount = 0;
  let invalidCount = 0;

  for (let idx = 0; idx < rows.length; idx++) {
    const raw = rows[idx];
    const rowNumber = idx + 1;
    const issues: string[] = [];

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
    const email = rawEmail.trim().toLowerCase();
    const contactName = cleanBusinessName(rawContactName);
    const contactTitle = cleanBusinessName(rawContactTitle);
    const address = cleanBusinessName(rawAddress);
    const city = cleanBusinessName(rawCity);
    const source = cleanBusinessName(rawSource);

    // 1. Mandatory field check
    if (!businessName) {
      issues.push('Missing business name (required)');
    }

    // 2. Email format check (warning if provided but malformed)
    if (email && !isValidEmail(email)) {
      issues.push(`Malformed email format: "${email}"`);
    }

    // 3. In-file duplicate detection
    let isDuplicateInFile = false;
    let duplicateOfRow: number | undefined;

    const nameKey = businessName.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (domain && seenFileDomains.has(domain)) {
      isDuplicateInFile = true;
      duplicateOfRow = seenFileDomains.get(domain);
      issues.push(`Duplicate website (${domain}) matches row #${duplicateOfRow}`);
    } else if (phone && phone.length >= 7 && seenFilePhones.has(phone)) {
      isDuplicateInFile = true;
      duplicateOfRow = seenFilePhones.get(phone);
      issues.push(`Duplicate phone (${phone}) matches row #${duplicateOfRow}`);
    } else if (nameKey && seenFileNames.has(nameKey)) {
      isDuplicateInFile = true;
      duplicateOfRow = seenFileNames.get(nameKey);
      issues.push(`Duplicate company name matches row #${duplicateOfRow}`);
    }

    // Record keys for subsequent in-file rows
    if (domain && !seenFileDomains.has(domain)) seenFileDomains.set(domain, rowNumber);
    if (phone && phone.length >= 7 && !seenFilePhones.has(phone)) seenFilePhones.set(phone, rowNumber);
    if (nameKey && !seenFileNames.has(nameKey)) seenFileNames.set(nameKey, rowNumber);

    // 4. Workspace duplicate cross-check
    let isDuplicateInWorkspace = false;
    let matchingLeadName: string | undefined;

    if (domain && existingDomainMap.has(domain)) {
      isDuplicateInWorkspace = true;
      matchingLeadName = existingDomainMap.get(domain);
      issues.push(`Matches existing lead in workspace: "${matchingLeadName}"`);
    } else if (phone && phone.length >= 7 && existingPhoneMap.has(phone)) {
      isDuplicateInWorkspace = true;
      matchingLeadName = existingPhoneMap.get(phone);
      issues.push(`Matches existing lead phone in workspace: "${matchingLeadName}"`);
    } else if (nameKey && existingNameMap.has(nameKey)) {
      isDuplicateInWorkspace = true;
      matchingLeadName = existingNameMap.get(nameKey);
      issues.push(`Matches existing lead name in workspace: "${matchingLeadName}"`);
    }

    // Determine row status
    let status: 'valid' | 'duplicate' | 'invalid' = 'valid';
    if (!businessName) {
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

export interface ImportExecutionResult {
  success: boolean;
  totalRequested: number;
  importedCount: number;
  updatedCount: number;
  skippedDuplicateCount: number;
  failedCount: number;
  errors: string[];
}

/**
 * Bounded batch persistence executor.
 * Conforms strictly to backend's maximum batch size of 100 leads per request.
 * Reports per-chunk progress and genuine persistence counts.
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

  const chunks: ImportLeadCandidateInput[][] = [];
  for (let i = 0; i < candidates.length; i += CHUNK_SIZE) {
    chunks.push(candidates.slice(i, i + CHUNK_SIZE));
  }

  let completedCount = 0;

  for (let c = 0; c < chunks.length; c++) {
    const chunk = chunks[c];
    try {
      const response = await api.leads.importBatch({ leads: chunk });

      importedCount += response?.importedCount || 0;
      updatedCount += response?.updatedCount || 0;
      skippedDuplicateCount += response?.skippedDuplicateCount || 0;
      completedCount += chunk.length;

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
