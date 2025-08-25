import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/Dialog';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { Label } from '@/shared/components/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/Select';
import { Checkbox } from '@/shared/components/Checkbox';
import { useToast } from '@/shared/hooks/useToast';
import { supabase } from '@/shared/services/supabase/client';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
}

const SPECIALIZATIONS = ['Accounting', 'Tax Filing', 'Digital Invoicing'] as const;
const QUALIFICATIONS = ['CA', 'ACCA', 'CMA', 'Other'] as const;
const EMPLOYMENTS = ['Full-time', 'Part-time', 'Consultant'] as const;

type CreateAccountantResponse = {
    success?: boolean;
    data?: unknown;
    error?: string;
    code?: 'EMAIL_EXISTS' | 'CREATE_USER_FAILED';
};

export function AddAccountantModal({ isOpen, onClose, onCreated }: Props) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [qualification, setQualification] = useState<typeof QUALIFICATIONS[number] | ''>('');
    const [specializations, setSpecializations] = useState<string[]>([]);
    const [employmentType, setEmploymentType] = useState<typeof EMPLOYMENTS[number] | ''>('');
    const [maxCapacity, setMaxCapacity] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');

    const toggleSpec = (spec: string) => {
        setSpecializations(prev => prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]);
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName || !email || !phone) {
            toast({ title: 'Validation', description: 'Full Name, Email and Phone are required', variant: 'destructive' });
            return;
        }
        if (!qualification) {
            toast({ title: 'Validation', description: 'Professional Qualifications is required', variant: 'destructive' });
            return;
        }
        if (!employmentType) {
            toast({ title: 'Validation', description: 'Employment Type is required', variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            const { data } = await supabase.auth.getUser();
            const actorId = data.user?.id;
            const { data: resp, error: fnError } = await supabase.functions.invoke<CreateAccountantResponse>('create-accountant', {
                body: {
                    full_name: fullName,
                    email,
                    phone_number: phone,
                    professional_qualifications: qualification,
                    specialization: specializations,
                    employment_type: employmentType,
                    max_client_capacity: maxCapacity ? Number(maxCapacity) : null,
                    start_date: startDate || null,
                    actor_id: actorId,
                },
            });

            if (fnError) {
                throw fnError;
            }

            if (resp?.error) {
                if (resp.code === 'EMAIL_EXISTS') {
                    toast({ title: 'Error', description: 'Email already exists in the system', variant: 'destructive' });
                } else {
                    toast({ title: 'Error', description: resp.error || 'Failed to create accountant', variant: 'destructive' });
                }
                return;
            }

            onCreated();
        } catch (err) {
            const message = (err as Error).message ?? 'Failed to create accountant';
            toast({ title: 'Error', description: message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Accountant</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Full Name</Label>
                            <Input value={fullName} onChange={e => setFullName(e.target.value)} required />
                        </div>
                        <div>
                            <Label>Email Address</Label>
                            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div>
                            <Label>Phone Number</Label>
                            <Input value={phone} onChange={e => setPhone(e.target.value)} required />
                        </div>
                        <div>
                            <Label>Professional Qualifications</Label>
                            <Select value={qualification} onValueChange={(v: typeof QUALIFICATIONS[number]) => setQualification(v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {QUALIFICATIONS.map(q => (
                                        <SelectItem key={q} value={q}>{q}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Employment Type</Label>
                            <Select value={employmentType} onValueChange={(v: typeof EMPLOYMENTS[number]) => setEmploymentType(v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {EMPLOYMENTS.map(e => (
                                        <SelectItem key={e} value={e}>{e}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Maximum Client Capacity</Label>
                            <Input type="number" value={maxCapacity} onChange={e => setMaxCapacity(e.target.value)} min={0} />
                        </div>
                        <div>
                            <Label>Start Date</Label>
                            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Specialization</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {SPECIALIZATIONS.map(spec => (
                                <label key={spec} className="flex items-center gap-2">
                                    <Checkbox checked={specializations.includes(spec)} onCheckedChange={() => toggleSpec(spec)} />
                                    <span>{spec}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Accountant'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 