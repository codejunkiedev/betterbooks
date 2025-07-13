import * as React from "react";
import { useFormContext } from "react-hook-form";

// These contexts must match the ones in form.tsx
const FormFieldContext = React.createContext<unknown>({});
const FormItemContext = React.createContext<unknown>({});

export const useFormField = () => {
    const fieldContext = React.useContext(FormFieldContext) as { name: string };
    const itemContext = React.useContext(FormItemContext) as { id: string };
    const { getFieldState, formState } = useFormContext();

    const fieldState = getFieldState(fieldContext.name, formState);

    if (!fieldContext) {
        throw new Error("useFormField should be used within <FormField>");
    }

    const { id } = itemContext;

    return {
        id,
        name: fieldContext.name,
        formItemId: `${id}-form-item`,
        formDescriptionId: `${id}-form-item-description`,
        formMessageId: `${id}-form-item-message`,
        ...fieldState,
    };
}; 