export const REGISTRATION_TYPES = {
    REGISTERED: 'Registered',
    UNREGISTERED: 'Unregistered'
} as const;

export type RegistrationType = typeof REGISTRATION_TYPES[keyof typeof REGISTRATION_TYPES];

export const REGISTRATION_TYPE_OPTIONS = [
    { value: REGISTRATION_TYPES.REGISTERED, label: 'Registered' },
    { value: REGISTRATION_TYPES.UNREGISTERED, label: 'Unregistered' }
] as const;

export const WALK_IN_CUSTOMER_DATA = {
    NTN_CNIC: '0000000000000',
    BUSINESS_NAME: 'Walk-in Customer',
    PROVINCE: '5', // Capital Territory code
    ADDRESS: 'N/A',
    REGISTRATION_TYPE: REGISTRATION_TYPES.UNREGISTERED
} as const;
