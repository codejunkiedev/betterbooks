export const COMPANY_TYPES = [
  "INDEPENDENT_WORKER",
  "PROFESSIONAL_SERVICES",
  "SMALL_BUSINESS"
] as const;

export type CompanyType = typeof COMPANY_TYPES[number];

export const FILING_STATUSES = [
  "SOLE_PROPRIETOR",
  "PARTNERSHIP",
  "LLC",
  "S_CORP",
  "C_CORP",
  "NONPROFIT",
  "OTHER"
] as const;

export type FilingStatus = typeof FILING_STATUSES[number]; 