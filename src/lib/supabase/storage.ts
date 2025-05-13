import { StorageResponse } from '@/interfaces/storage';
import { supabase } from '@/lib/supabase/client';

export const uploadFiles = async (files: File[], folder: string = 'invoices'): Promise<StorageResponse> => {
    try {
        const uploadPromises = files.map(async (file) => {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = `${folder}/${fileName}`;

            const { error } = await supabase.storage
                .from('invoices')
                .upload(filePath, file);

            if (error) throw error;

            return {
                path: filePath,
                name: file.name,
                size: file.size,
                type: file.type
            };
        });

        const results = await Promise.all(uploadPromises);
        return { data: results, error: null };
    } catch (error) {
        console.error('Error uploading files:', error);
        return { data: null, error: error as Error };
    }
};

export const deleteFile = async (path: string): Promise<{ error: Error | null }> => {
    try {
        const { error } = await supabase.storage
            .from('invoices')
            .remove([path]);

        return { error };
    } catch (error) {
        console.error('Error deleting file:', error);
        return { error: error as Error };
    }
};

export const getFileUrl = (path: string): string => {
    const { data } = supabase.storage
        .from('invoices')
        .getPublicUrl(path);

    return data.publicUrl;
}; 