import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/shared/components/Dialog';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { Label } from '@/shared/components/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/Select';
import { useToast } from '@/shared/hooks/useToast';
import { updateUserInfo } from '@/shared/services/supabase/admin';
import type { DetailedUserInfo } from '@/shared/types/admin';

interface EditUserModalProps {
    user: DetailedUserInfo;
    isOpen: boolean;
    onClose: () => void;
    onUserUpdated: (updatedUser: DetailedUserInfo) => void;
}

export const EditUserModal = ({ user, isOpen, onClose, onUserUpdated }: EditUserModalProps) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        companyName: user.company?.name || '',
        companyType: user.company?.type || '',
        primaryContactName: user.company?.primaryContactName || '',
        phoneNumber: user.company?.phoneNumber || '',
        email: user.email || '',
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const updatedUserInfo: Partial<DetailedUserInfo> = {
                email: formData.email,
                company: {
                    ...user.company!,
                    name: formData.companyName,
                    type: formData.companyType,
                    primaryContactName: formData.primaryContactName,
                    phoneNumber: formData.phoneNumber,
                }
            };

            const response = await updateUserInfo(user.id, updatedUserInfo);

            if (response.error) {
                toast({
                    title: "Error",
                    description: response.error.message,
                    variant: "destructive",
                });
                return;
            }

            toast({
                title: "Success",
                description: "User information updated successfully",
            });

            // Update the user data
            const updatedUser: DetailedUserInfo = {
                ...user,
                ...updatedUserInfo,
                company: updatedUserInfo.company!
            };

            onUserUpdated(updatedUser);
            onClose();
        } catch {
            toast({
                title: "Error",
                description: "Failed to update user information",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const companyTypes = [
        'INDEPENDENT_WORKER',
        'PROFESSIONAL_SERVICES',
        'SMALL_BUSINESS'
    ];



    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit User Information</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Company Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Company Information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="companyName">Company Name *</Label>
                                <Input
                                    id="companyName"
                                    value={formData.companyName}
                                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="companyType">Company Type *</Label>
                                <Select value={formData.companyType} onValueChange={(value) => handleInputChange('companyType', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select company type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {companyTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>


                        </div>


                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="primaryContactName">Primary Contact Name *</Label>
                                <Input
                                    id="primaryContactName"
                                    value={formData.primaryContactName}
                                    onChange={(e) => handleInputChange('primaryContactName', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="phoneNumber">Phone Number</Label>
                                <Input
                                    id="phoneNumber"
                                    type="tel"
                                    value={formData.phoneNumber}
                                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Label htmlFor="email">Email Address *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    required
                                />
                                <p className="text-sm text-gray-600 mt-1">
                                    Note: Changing email address will require user verification
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}; 