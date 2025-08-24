import { Label } from './Label';
import { Input } from './Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';

interface FormFieldProps {
    label: string;
    type?: 'text' | 'number' | 'date' | 'select';
    value: string | number;
    onChange: (value: string) => void;
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
    readOnly?: boolean;
    min?: number;
    step?: number;
    helperText?: string;
    className?: string;
}

export const FormField = ({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    options = [],
    readOnly = false,
    min,
    step,
    helperText,
    className = ''
}: FormFieldProps) => {
    if (type === 'select') {
        return (
            <div className={className}>
                <Label className="text-sm font-medium">{label}</Label>
                <Select value={String(value)} onValueChange={onChange}>
                    <SelectTrigger className="mt-1">
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {helperText && (
                    <p className="text-xs text-muted-foreground mt-1">{helperText}</p>
                )}
            </div>
        );
    }

    return (
        <div className={className}>
            <Label className="text-sm font-medium">{label}</Label>
            <Input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                readOnly={readOnly}
                min={min}
                step={step}
                className={`mt-1 ${readOnly ? 'bg-muted' : ''}`}
            />
            {helperText && (
                <p className="text-xs text-muted-foreground mt-1">{helperText}</p>
            )}
        </div>
    );
};
