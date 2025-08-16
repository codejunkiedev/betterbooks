import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/Dialog';
import { Button } from '@/shared/components/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/Select';
import { Textarea } from '@/shared/components/Textarea';
import { Switch } from '@/shared/components/Switch';
import { useToast } from '@/shared/hooks/useToast';
import { Status } from '@/shared/types/admin';
import { manageUserStatus } from '@/shared/services/api';

interface SuspendAccountDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string;
    companyId: string;
    currentStatus: Status;
    onCompleted?: () => void;
}

const SUSPEND_REASONS = [
    { value: 'payment_issue', label: 'Payment Issue' },
    { value: 'policy_violation', label: 'Policy Violation' },
    { value: 'security_concern', label: 'Security Concern' },
    { value: 'other', label: 'Other' },
] as const;

export function SuspendAccountDialog({
    open,
    onOpenChange,
    userId,
    companyId,
    currentStatus,
    onCompleted,
}: SuspendAccountDialogProps) {
    const isSuspending = currentStatus !== 'suspended';
    const [reason, setReason] = useState<string>(SUSPEND_REASONS[0].value);
    const [notes, setNotes] = useState<string>('');
    const [notifyUser, setNotifyUser] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const { toast } = useToast();

    const handleConfirm = async () => {
        try {
            setSubmitting(true);
            const action = isSuspending ? 'suspend' : 'reactivate';
            await manageUserStatus({
                action,
                user_id: userId,
                company_id: companyId,
                reason: isSuspending ? reason : 'reactivation',
                ...(notes ? { notes } : {}),
                notify_user: notifyUser,
                notify_accountant: true,
            });

            toast({
                title: isSuspending ? 'Account Suspended' : 'Account Reactivated',
                description: isSuspending
                    ? 'The user has been suspended and access has been revoked.'
                    : 'The user has been reactivated and access has been restored.',
            });

            onOpenChange(false);
            onCompleted?.();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unable to complete the requested action.';
            toast({
                title: 'Action Failed',
                description: message,
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isSuspending ? 'Suspend Account' : 'Reactivate Account'}</DialogTitle>
                </DialogHeader>

                {isSuspending ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for suspension</label>
                            <Select value={reason} onValueChange={setReason}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a reason" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SUSPEND_REASONS.map((r) => (
                                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Additional notes (optional)</label>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add any context or reference IDs"
                                rows={4}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Email user</p>
                                <p className="text-xs text-gray-500">Send a notification email about this suspension</p>
                            </div>
                            <Switch checked={notifyUser} onCheckedChange={setNotifyUser} />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="p-3 rounded-md bg-green-50 text-green-800 text-sm">
                            This will immediately restore the user's access and set the account status to Active.
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Email user</p>
                                <p className="text-xs text-gray-500">Send a welcome back notification</p>
                            </div>
                            <Switch checked={notifyUser} onCheckedChange={setNotifyUser} />
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
                    <Button onClick={handleConfirm} disabled={submitting} className={isSuspending ? 'bg-red-600 hover:bg-red-700 text-white' : ''}>
                        {submitting ? 'Processing...' : isSuspending ? 'Confirm Suspension' : 'Reactivate Account'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 