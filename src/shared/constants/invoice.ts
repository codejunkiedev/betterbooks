// Invoice Status Constants
export const INVOICE_STATUS = {
    DRAFT: 'draft',
    SUBMITTED: 'submitted',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    FAILED: 'failed'
} as const;

// Invoice Type Constants
export const INVOICE_TYPE = {
    SALE: 'Sale Invoice',
    PURCHASE: 'Purchase Invoice',
    CREDIT_NOTE: 'Credit Note',
    DEBIT_NOTE: 'Debit Note'
} as const;

// Buyer Registration Type Constants
export const BUYER_REGISTRATION_TYPE = {
    REGISTERED: 'Registered',
    UNREGISTERED: 'Unregistered'
} as const;
