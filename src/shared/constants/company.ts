export const COMPANY_TYPES = [
  "INDEPENDENT_WORKER",
  "PROFESSIONAL_SERVICES",
  "SMALL_BUSINESS"
] as const;

export type CompanyType = typeof COMPANY_TYPES[number]; 