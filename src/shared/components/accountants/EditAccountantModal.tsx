import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/Dialog';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { Label } from '@/shared/components/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/Select';
import { Checkbox } from '@/shared/components/Checkbox';
import { Switch } from '@/shared/components/Switch';
import type { Accountant } from '@/shared/types/accountant';
import { supabase } from '@/shared/services/supabase/client';
import { useToast } from '@/shared/hooks/useToast';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    accountant: Accountant;
    onSaved?: (updated: Accountant) => void;
}

const SPECIALIZATIONS = ['Accounting', 'Tax Filing', 'Digital Invoicing'] as const;
const QUALIFICATIONS = ['CA', 'ACCA', 'CMA', 'Other'] as const;
const EMPLOYMENTS = ['Full-time', 'Part-time', 'Consultant'] as const;
const AVAILABILITIES = ['Available', 'Busy', 'On Leave'] as const;

type Qualification = (typeof QUALIFICATIONS)[number];
type Employment = (typeof EMPLOYMENTS)[number];
type Availability = (typeof AVAILABILITIES)[number];

function toQualification(val?: string | null): Qualification | '' {
    if (!val) return '';
    return (QUALIFICATIONS as readonly string[]).includes(val) ? (val as Qualification) : '';
}

function toEmployment(val?: string | null): Employment | '' {
    if (!val) return '';
    return (EMPLOYMENTS as readonly string[]).includes(val) ? (val as Employment) : '';
}

function toAvailability(val?: string | null): Availability | '' {
    if (!val) return '';
    return (AVAILABILITIES as readonly string[]).includes(val) ? (val as Availability) : '';
}

export function EditAccountantModal({ isOpen, onClose, accountant, onSaved }: Props) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [notify, setNotify] = useState(false);

    const [fullName, setFullName] = useState(accountant.full_name);
    const [phone, setPhone] = useState(accountant.phone_number ?? '');
    const [qualification, setQualification] = useState<Qualification | ''>(toQualification(accountant.professional_qualifications ?? undefined));
    const [specializations, setSpecializations] = useState<string[]>([...(accountant.specialization ?? [])]);
    const [employmentType, setEmploymentType] = useState<Employment | ''>(toEmployment(accountant.employment_type ?? undefined));
    const [maxCapacity, setMaxCapacity] = useState<string>(accountant.max_client_capacity != null ? String(accountant.max_client_capacity) : '');
    const [startDate, setStartDate] = useState<string>(accountant.start_date ?? '');
    const [availability, setAvailability] = useState<Availability | ''>(toAvailability(accountant.availability_status ?? undefined));
    const [hourlyRate, setHourlyRate] = useState<string>(accountant.hourly_rate != null ? String(accountant.hourly_rate) : '');

    useEffect(() => {
        setFullName(accountant.full_name);
        setPhone(accountant.phone_number ?? '');
        setQualification(toQualification(accountant.professional_qualifications ?? undefined));
        setSpecializations([...(accountant.specialization ?? [])]);
        setEmploymentType(toEmployment(accountant.employment_type ?? undefined));
        setMaxCapacity(accountant.max_client_capacity != null ? String(accountant.max_client_capacity) : '');
        setStartDate(accountant.start_date ?? '');
        setAvailability(toAvailability(accountant.availability_status ?? undefined));
        setHourlyRate(accountant.hourly_rate != null ? String(accountant.hourly_rate) : '');
    }, [accountant]);

    const toggleSpec = (spec: string) => {
        setSpecializations(prev => prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]);
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!fullName || !phone) {
            toast({ title: 'Validation', description: 'Full Name and Phone are required', variant: 'destructive' });
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
            const baseUpdates: Record<string, unknown> = {
                full_name: fullName,
                phone_number: phone || null,
                professional_qualifications: qualification || null,
                specialization: specializations,
                employment_type: employmentType || null,
                max_client_capacity: maxCapacity ? Number(maxCapacity) : null,
                start_date: startDate || null,
            };

            if (availability) {
                baseUpdates['availability_status'] = availability;
            }
            if (employmentType === 'Consultant' && hourlyRate) {
                baseUpdates['hourly_rate'] = Number(hourlyRate);
            }

            const tryUpdate = async (updates: Record<string, unknown>) => {
                return await supabase
                    .from('accountants')
                    .update(updates)
                    .eq('id', accountant.id)
                    .select('*')
                    .maybeSingle();
            };

            let res = await tryUpdate(baseUpdates);

            if (res.error && typeof res.error.message === 'string') {
                const msg = res.error.message;
                const cleanedUpdates: Record<string, unknown> = { ...baseUpdates };
                let retried = false;

                if (msg.includes("'hourly_rate'")) {
                    delete cleanedUpdates['hourly_rate'];
                    retried = true;
                }
                if (msg.includes("'availability_status'")) {
                    delete cleanedUpdates['availability_status'];
                    retried = true;
                }

                if (retried) {
                    res = await tryUpdate(cleanedUpdates);
                }
            }

            if (res.error) throw res.error;

            if (res.data) {
                if (notify) {
                    try {
                        await supabase.functions.invoke('send-profile-update-notification', {
                            body: {
                                accountant_user_id: accountant.user_id,
                                changes: baseUpdates,
                            },
                        });
                    } catch {
                        // Non-blocking
                    }
                }

                onSaved?.(res.data as Accountant);
                onClose();
                toast({ title: 'Updated', description: 'Accountant profile updated successfully' });
            }
        } catch (err) {
            const message = (err instanceof Error ? err.message : 'Failed to update profile');
            toast({ title: 'Error', description: message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Accountant</DialogTitle>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Full Name</Label>
                            <Input value={fullName} onChange={e => setFullName(e.target.value)} required />
                        </div>
                        <div>
                            <Label>Phone Number</Label>
                            <Input value={phone} onChange={e => setPhone(e.target.value)} required />
                        </div>
                        <div>
                            <Label>Professional Qualifications</Label>
                            <Select value={qualification} onValueChange={(v: Qualification) => setQualification(v)}>
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
                            <Select value={employmentType} onValueChange={(v: Employment) => setEmploymentType(v)}>
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
                        <div>
                            <Label>Availability Status</Label>
                            <Select value={availability} onValueChange={(v: Availability) => setAvailability(v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {AVAILABILITIES.map(a => (
                                        <SelectItem key={a} value={a}>{a}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {employmentType === 'Consultant' && (
                            <div>
                                <Label>Hourly Rate</Label>
                                <Input type="number" min={0} step={0.01} value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} />
                            </div>
                        )}
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

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-700">Email user</p>
                            <p className="text-xs text-gray-500">Send a notification email about these profile changes</p>
                        </div>
                        <Switch checked={notify} onCheckedChange={(v) => setNotify(Boolean(v))} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 