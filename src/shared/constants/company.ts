export const COMPANY_TYPES = [
  "sole_proprietorship",
  "partnership",
  "corporation",
  "llc",
  "nonprofit",
  "other"
] as const;

export type CompanyType = typeof COMPANY_TYPES[number]; 