import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";
import { UserBusinessActivity, UserBusinessActivitySelection, BusinessActivitySectorCombination } from "@/shared/types/fbr";

interface ReviewStepProps {
    companyName: string;
    companyType: string;
    skipBalance: boolean;
    cashBalance: string;
    balanceDate: string;
    skipTaxInfo: boolean;
    taxIdNumber: string;
    filingStatus: string;
    taxYearEnd: string;
    // FBR Profile data
    fbrCnicNtn: string;
    fbrBusinessName: string;
    fbrProvinceCode: string;
    fbrAddress: string;
    fbrMobileNumber: string;
    fbrActivityName: string; // Keep for backward compatibility
    fbrSector: string; // Keep for backward compatibility
    fbrBusinessActivities?: UserBusinessActivity[]; // Keep for backward compatibility
    fbrBusinessActivitySelection?: UserBusinessActivitySelection; // New field for new structure
}

export function ReviewStep({
    companyName,
    companyType,
    skipBalance,
    cashBalance,
    balanceDate,
    skipTaxInfo,
    taxIdNumber,
    filingStatus,
    taxYearEnd,
    fbrCnicNtn,
    fbrBusinessName,
    fbrProvinceCode,
    fbrAddress,
    fbrMobileNumber,
    fbrActivityName,
    fbrSector,
    fbrBusinessActivities,
    fbrBusinessActivitySelection
}: ReviewStepProps) {
    const formatCompanyType = (type: string) => {
        return type
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    const getBalanceDisplay = () => {
        if (skipBalance) {
            return "Skipped (will be set to $0.00)";
        }
        return `$${parseFloat(cashBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })} as of ${new Date(balanceDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`;
    };

    const getTaxInfoDisplay = () => {
        if (skipTaxInfo) {
            return "Skipped (can be added later)";
        }
        const parts = [];
        if (taxIdNumber) parts.push(`Tax ID: ${taxIdNumber}`);
        if (filingStatus) parts.push(`Filing Status: ${filingStatus.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}`);
        if (taxYearEnd) parts.push(`Tax Year End: ${new Date(taxYearEnd).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`);
        return parts.length > 0 ? parts.join(', ') : "Not provided";
    };

    const getFbrProfileDisplay = () => {
        if (!fbrCnicNtn && !fbrBusinessName) {
            return "Not provided";
        }
        return "Provided";
    };

    return (
        <Card className="shadow-lg border-0">
            <CardHeader>
                <CardTitle>Review & Complete</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-3">Summary</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="font-medium">Company Name:</span>
                            <span>{companyName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Company Type:</span>
                            <span>{formatCompanyType(companyType)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Opening Balance:</span>
                            <span>{getBalanceDisplay()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Tax Information:</span>
                            <span>{getTaxInfoDisplay()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">FBR Profile:</span>
                            <span>{getFbrProfileDisplay()}</span>
                        </div>
                    </div>
                </div>

                {fbrCnicNtn && fbrBusinessName && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-3">FBR Profile Details</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="font-medium">CNIC/NTN:</span>
                                <span>{fbrCnicNtn}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Business Name:</span>
                                <span>{fbrBusinessName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Province:</span>
                                <span>{fbrProvinceCode}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Address:</span>
                                <span>{fbrAddress}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Mobile Number:</span>
                                <span>{fbrMobileNumber}</span>
                            </div>
                            {/* Display new business activity selection if available */}
                            {fbrBusinessActivitySelection &&
                                fbrBusinessActivitySelection.business_activity_ids.length > 0 &&
                                fbrBusinessActivitySelection.sector_ids.length > 0 ? (
                                <div className="space-y-2">
                                    <div className="font-medium">Business Activity & Sector Combinations:</div>
                                    {fbrBusinessActivitySelection.combinations.map((combination: BusinessActivitySectorCombination, index: number) => (
                                        <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm">{combination.business_activity} - {combination.sector}</span>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="text-xs text-gray-500 mt-2">
                                        Selected Activities: {fbrBusinessActivitySelection.business_activity_ids.length} |
                                        Selected Sectors: {fbrBusinessActivitySelection.sector_ids.length} |
                                        Total Combinations: {fbrBusinessActivitySelection.combinations.length}
                                    </div>
                                </div>
                            ) : fbrBusinessActivities && fbrBusinessActivities.length > 0 ? (
                                /* Display old multiple business activities for backward compatibility */
                                <div className="space-y-2">
                                    <div className="font-medium">Business Activities:</div>
                                    {fbrBusinessActivities.map((activity, index) => (
                                        <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm">{activity.business_activity} - {activity.sector}</span>
                                                {activity.is_primary && (
                                                    <Badge variant="default" className="text-xs">Primary</Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                /* Fallback to old single activity display for backward compatibility */
                                <>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Business Activity:</span>
                                        <span>{fbrActivityName || 'Not provided'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Business Sector:</span>
                                        <span>{fbrSector || 'Not provided'}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                <p className="text-gray-600 text-sm">
                    Click below to complete your company setup.
                </p>
            </CardContent>
        </Card>
    );
} 