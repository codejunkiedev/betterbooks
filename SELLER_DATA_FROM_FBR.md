# Seller Data from FBR Profile

## Overview

The application now automatically populates seller data in invoices from the user's FBR profile, ensuring consistency and reducing manual data entry.

## Features

### 1. Automatic Population
- When creating a new invoice, seller data is automatically populated from the user's FBR profile if available
- This includes:
  - Seller NTN/CNIC
  - Seller Business Name
  - Seller Province
  - Seller Address

### 2. Manual Population Button
- A "Use FBR Profile" button is available in the seller information section
- Users can manually populate seller data from their FBR profile at any time
- Visual feedback shows when data has been populated from FBR profile

### 3. Visual Indicators
- A badge with "From FBR Profile" appears when seller data has been populated from FBR
- Loading states are shown during data fetching
- Error messages are displayed if FBR profile is not found

## Implementation

### Backend Function
```typescript
// src/shared/services/supabase/fbr.ts
export async function getFbrProfileForSellerData(userId: string) {
    // Fetches FBR profile data and formats it for seller information
    // Returns null if no profile is found
}
```

### Custom Hook
```typescript
// src/shared/hooks/useFbrProfile.ts
export function useFbrProfile() {
    // Provides a reusable hook for FBR profile data management
    // Includes loading states, error handling, and toast notifications
}
```

### Form Integration
```typescript
// src/features/user/sandbox-testing/ScenarioInvoiceForm.tsx
// Auto-population on form load
useEffect(() => {
    const autoPopulateSellerData = async () => {
        if (user?.id && !formData.sellerNTNCNIC && !formData.sellerBusinessName) {
            const sellerData = await getFbrProfileForSellerData(user.id);
            if (sellerData) {
                setFormData(prev => ({
                    ...prev,
                    sellerNTNCNIC: sellerData.sellerNTNCNIC,
                    sellerBusinessName: sellerData.sellerBusinessName,
                    sellerProvince: sellerData.sellerProvince,
                    sellerAddress: sellerData.sellerAddress
                }));
            }
        }
    };
    autoPopulateSellerData();
}, [user?.id, formData.sellerNTNCNIC, formData.sellerBusinessName]);
```

## Usage

### For Users
1. Complete your FBR profile setup during onboarding
2. When creating invoices, seller data will be automatically populated
3. Use the "Use FBR Profile" button to manually populate if needed
4. The "From FBR Profile" badge indicates when data has been populated from FBR

### For Developers
1. Import the hook: `import { useFbrProfile } from '@/shared/hooks/useFbrProfile'`
2. Use in components: `const { sellerData, loading, populateSellerData } = useFbrProfile()`
3. Call `populateSellerData(userId)` to fetch and populate seller data

## Data Flow

1. **FBR Profile Creation**: User completes FBR profile during onboarding
2. **Data Storage**: Profile data is stored in `fbr_profiles` table
3. **Invoice Creation**: When creating invoices, seller data is fetched from FBR profile
4. **Form Population**: Seller fields are automatically populated with FBR profile data
5. **Visual Feedback**: User sees indication that data came from FBR profile

## Error Handling

- **No FBR Profile**: User is prompted to complete FBR profile setup
- **Network Errors**: Error messages are displayed with retry options
- **Invalid Data**: Validation ensures data integrity

## Benefits

1. **Consistency**: Seller data is always consistent with FBR profile
2. **Efficiency**: Reduces manual data entry
3. **Accuracy**: Eliminates typos and data entry errors
4. **Compliance**: Ensures FBR compliance by using official profile data
5. **User Experience**: Streamlined invoice creation process 