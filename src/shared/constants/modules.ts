export const MODULES = {
    ACCOUNTING: 'ACCOUNTING',
    TAX_FILING: 'TAX_FILING',
    PRAL_INVOICING: 'PRAL_INVOICING',
} as const;

export type ModuleName = typeof MODULES[keyof typeof MODULES];

export function isModuleName(value: string): value is ModuleName {
    return (Object.values(MODULES) as string[]).includes(value);
} 