import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/Select";
import { useToast } from "@/shared/hooks/useToast";
import { getCurrentUser } from "@/shared/services/supabase/auth";
import { createAdminRecord, createAccountantRecord, getUserRoleFromDatabase } from "@/shared/services/supabase/roles";
import { UserRole } from "@/shared/types/auth";

export default function RoleManagement() {
    const [selectedRole, setSelectedRole] = useState<UserRole>("USER");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleUpdateRole = async () => {
        setLoading(true);

        try {
            const { user } = await getCurrentUser();
            if (!user) {
                toast({
                    title: "Error",
                    description: "User not authenticated",
                    variant: "destructive"
                });
                return;
            }

            let error = null;

            if (selectedRole === 'ADMIN') {
                const result = await createAdminRecord(user.id);
                error = result.error;
            } else if (selectedRole === 'ACCOUNTANT') {
                const result = await createAccountantRecord(user.id);
                error = result.error;
            }

            if (error) {
                toast({
                    title: "Error",
                    description: error.message,
                    variant: "destructive"
                });
            } else {
                toast({
                    title: "Success",
                    description: `Role updated to ${selectedRole}. Please log out and log back in to see changes.`,
                });
            }
        } catch {
            toast({
                title: "Error",
                description: "Failed to update role",
                variant: "destructive"
            });
        }

        setLoading(false);
    };

    const handleGetCurrentUser = async () => {
        const { user } = await getCurrentUser();
        if (user) {
            const currentRole = await getUserRoleFromDatabase(user.id);
            toast({
                title: "Current User Info",
                description: `Email: ${user.email}, Role: ${currentRole}`,
            });
        }
    };

    return (
        <div className="p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Role Management (Testing Utility)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Select Role:</label>
                        <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="USER">User</SelectItem>
                                <SelectItem value="ACCOUNTANT">Accountant</SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={handleUpdateRole}
                            disabled={loading}
                            className="flex-1"
                        >
                            {loading ? "Updating..." : "Update My Role"}
                        </Button>

                        <Button
                            onClick={handleGetCurrentUser}
                            variant="outline"
                            className="flex-1"
                        >
                            Check Current Role
                        </Button>
                    </div>

                    <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded">
                        <strong>Note:</strong> This is a testing utility. After updating your role, you'll need to log out and log back in using the appropriate portal for the changes to take effect.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 