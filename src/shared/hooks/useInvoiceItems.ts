import { useState, useCallback } from 'react';
import { FBRInvoiceItem } from '@/shared/types/invoice';

interface UseInvoiceItemsReturn {
    items: FBRInvoiceItem[];
    addItem: (item: FBRInvoiceItem) => void;
    updateItem: (index: number, item: FBRInvoiceItem) => void;
    removeItem: (index: number) => void;
    clearItems: () => void;
    setItems: (items: FBRInvoiceItem[]) => void;
}

export function useInvoiceItems(initialItems: FBRInvoiceItem[] = []): UseInvoiceItemsReturn {
    const [items, setItems] = useState<FBRInvoiceItem[]>(initialItems);

    const addItem = useCallback((item: FBRInvoiceItem) => {
        setItems(prev => [...prev, item]);
    }, []);

    const updateItem = useCallback((index: number, item: FBRInvoiceItem) => {
        setItems(prev => {
            const newItems = [...prev];
            newItems[index] = item;
            return newItems;
        });
    }, []);

    const removeItem = useCallback((index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    }, []);

    const clearItems = useCallback(() => {
        setItems([]);
    }, []);

    return {
        items,
        addItem,
        updateItem,
        removeItem,
        clearItems,
        setItems
    };
}
