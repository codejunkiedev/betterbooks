import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { Label } from '@/shared/components/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/Dialog';
import { useToast } from '@/shared/hooks/useToast';
import {
    createBuyer,
    searchBuyers,
    generateWalkInCustomerData
} from '@/shared/services/supabase/buyer';
import {
    type BuyerSearchResult,
    type CreateBuyerData
} from '@/shared/types/buyer';
import { RegistrationType, REGISTRATION_TYPE_OPTIONS } from '@/shared/constants/buyer';
import { Search, Plus, User } from 'lucide-react';

interface BuyerManagementProps {
    onBuyerSelect: (buyerData: {
        buyerNTNCNIC: string;
        buyerBusinessName: string;
        buyerProvince: string;
        buyerAddress: string;
        buyerRegistrationType: string;
    }) => void;
    currentBuyerData?: {
        buyerNTNCNIC: string;
        buyerBusinessName: string;
        buyerProvince: string;
        buyerAddress: string;
        buyerRegistrationType: string;
    };
}

export default function BuyerManagement({
    onBuyerSelect,
    currentBuyerData
}: BuyerManagementProps) {
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<BuyerSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);


    // Create buyer form state
    const [createFormData, setCreateFormData] = useState<CreateBuyerData>({
        ntn_cnic: '',
        business_name: '',
        province_code: '',
        address: '',
        registration_type: 'Registered'
    });

    // Search buyers with debouncing
    const searchBuyersDebounced = useCallback(
        async (query: string) => {
            if (!query.trim()) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const response = await searchBuyers({ query: query.trim(), limit: 10 });
                if (response.error) {
                    toast({
                        title: 'Error',
                        description: response.error.message,
                        variant: 'destructive'
                    });
                    setSearchResults([]);
                } else {
                    setSearchResults(response.data || []);
                }
            } catch (error) {
                console.error('Error searching buyers:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        },
        [toast]
    );

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            searchBuyersDebounced(searchQuery);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, searchBuyersDebounced]);

    // Handle walk-in customer selection
    const handleWalkInCustomer = () => {
        const walkInData = generateWalkInCustomerData();
        const buyerData = {
            buyerNTNCNIC: walkInData.ntn_cnic,
            buyerBusinessName: walkInData.business_name,
            buyerProvince: walkInData.province_code,
            buyerAddress: walkInData.address,
            buyerRegistrationType: walkInData.registration_type
        };
        onBuyerSelect(buyerData);
        toast({
            title: 'Walk-in Customer Selected',
            description: 'Walk-in customer data has been populated. This will not be saved to your buyer database.',
        });
    };

    // Handle existing buyer selection
    const handleBuyerSelect = (buyer: BuyerSearchResult) => {
        const buyerData = {
            buyerNTNCNIC: buyer.ntn_cnic,
            buyerBusinessName: buyer.business_name,
            buyerProvince: buyer.province_code,
            buyerAddress: buyer.address,
            buyerRegistrationType: buyer.registration_type
        };
        onBuyerSelect(buyerData);
        setShowSearchModal(false);
        setSearchQuery('');
        setSearchResults([]);
        toast({
            title: 'Buyer Selected',
            description: `${buyer.business_name} has been selected for this invoice.`,
        });
    };

    // Handle create new buyer
    const handleCreateBuyer = async () => {
        try {
            const response = await createBuyer(createFormData);
            if (response.error) {
                toast({
                    title: 'Error',
                    description: response.error.message,
                    variant: 'destructive'
                });
                return;
            }

            if (response.data) {
                const buyerData = {
                    buyerNTNCNIC: response.data.ntn_cnic,
                    buyerBusinessName: response.data.business_name,
                    buyerProvince: response.data.province_code,
                    buyerAddress: response.data.address,
                    buyerRegistrationType: response.data.registration_type
                };
                onBuyerSelect(buyerData);
                setShowCreateModal(false);
                setCreateFormData({
                    ntn_cnic: '',
                    business_name: '',
                    province_code: '',
                    address: '',
                    registration_type: 'Registered'
                });
                toast({
                    title: 'Buyer Created',
                    description: `${response.data.business_name} has been created and selected for this invoice.`,
                });
            }
        } catch (error) {
            console.error('Error creating buyer:', error);
            toast({
                title: 'Error',
                description: 'Failed to create buyer. Please try again.',
                variant: 'destructive'
            });
        }
    };

    // Validate create form
    const isCreateFormValid = () => {
        return (
            createFormData.ntn_cnic.trim() &&
            createFormData.business_name.trim() &&
            createFormData.province_code &&
            createFormData.address.trim() &&
            createFormData.registration_type
        );
    };

    return (
        <div className="space-y-4">
            {/* Buyer Management Buttons */}
            <div className="flex flex-wrap gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleWalkInCustomer}
                    className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300"
                >
                    <User className="w-4 h-4" />
                    Walk-in Customer
                </Button>

                <Dialog open={showSearchModal} onOpenChange={setShowSearchModal}>
                    <DialogTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:border-green-300"
                        >
                            <Search className="w-4 h-4" />
                            Select Existing Buyer
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Select Existing Buyer</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="buyer-search">Search Buyers</Label>
                                <Input
                                    id="buyer-search"
                                    placeholder="Search by NTN/CNIC, business name, or address..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="max-h-60 overflow-y-auto">
                                {isSearching ? (
                                    <div className="text-center py-4 text-muted-foreground">
                                        Searching...
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    <div className="space-y-2">
                                        {searchResults.map((buyer) => (
                                            <div
                                                key={buyer.id}
                                                className="p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                                                onClick={() => handleBuyerSelect(buyer)}
                                            >
                                                <div className="font-medium">{buyer.business_name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    NTN/CNIC: {buyer.ntn_cnic}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {buyer.address}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : searchQuery ? (
                                    <div className="text-center py-4 text-muted-foreground">
                                        No buyers found matching "{searchQuery}"
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-muted-foreground">
                                        Start typing to search for buyers
                                    </div>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                    <DialogTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 hover:border-purple-300"
                        >
                            <Plus className="w-4 h-4" />
                            Create New Buyer
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Create New Buyer</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="ntn-cnic">NTN/CNIC *</Label>
                                <Input
                                    id="ntn-cnic"
                                    placeholder="Enter 7 or 13 digit NTN/CNIC"
                                    value={createFormData.ntn_cnic}
                                    onChange={(e) => setCreateFormData(prev => ({
                                        ...prev,
                                        ntn_cnic: e.target.value
                                    }))}
                                />
                            </div>

                            <div>
                                <Label htmlFor="business-name">Business Name *</Label>
                                <Input
                                    id="business-name"
                                    placeholder="Enter business name"
                                    value={createFormData.business_name}
                                    onChange={(e) => setCreateFormData(prev => ({
                                        ...prev,
                                        business_name: e.target.value
                                    }))}
                                />
                            </div>

                            <div>
                                <Label htmlFor="province">Province *</Label>
                                <Select
                                    value={createFormData.province_code}
                                    onValueChange={(value) => setCreateFormData(prev => ({
                                        ...prev,
                                        province_code: value
                                    }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select province" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Punjab">Punjab</SelectItem>
                                        <SelectItem value="Sindh">Sindh</SelectItem>
                                        <SelectItem value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</SelectItem>
                                        <SelectItem value="Balochistan">Balochistan</SelectItem>
                                        <SelectItem value="Islamabad Capital Territory">Islamabad Capital Territory</SelectItem>
                                        <SelectItem value="Gilgit-Baltistan">Gilgit-Baltistan</SelectItem>
                                        <SelectItem value="Azad Jammu and Kashmir">Azad Jammu and Kashmir</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="address">Address *</Label>
                                <Input
                                    id="address"
                                    placeholder="Enter address"
                                    value={createFormData.address}
                                    onChange={(e) => setCreateFormData(prev => ({
                                        ...prev,
                                        address: e.target.value
                                    }))}
                                />
                            </div>

                            <div>
                                <Label htmlFor="registration-type">Registration Type *</Label>
                                <Select
                                    value={createFormData.registration_type}
                                    onValueChange={(value: RegistrationType) => setCreateFormData(prev => ({
                                        ...prev,
                                        registration_type: value
                                    }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select registration type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {REGISTRATION_TYPE_OPTIONS.map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleCreateBuyer}
                                    disabled={!isCreateFormValid()}
                                    className="flex-1"
                                >
                                    Create Buyer
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Current Buyer Display */}
            {currentBuyerData && (
                <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-2">Selected Buyer</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                            <span className="text-muted-foreground">Business Name:</span>
                            <span className="ml-2 font-medium">{currentBuyerData.buyerBusinessName}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">NTN/CNIC:</span>
                            <span className="ml-2 font-medium">{currentBuyerData.buyerNTNCNIC}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Province:</span>
                            <span className="ml-2 font-medium">{currentBuyerData.buyerProvince}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Registration Type:</span>
                            <span className="ml-2 font-medium">{currentBuyerData.buyerRegistrationType}</span>
                        </div>
                        <div className="md:col-span-2">
                            <span className="text-muted-foreground">Address:</span>
                            <span className="ml-2 font-medium">{currentBuyerData.buyerAddress}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
