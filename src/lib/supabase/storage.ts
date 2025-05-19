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

export const getFileUrl = async (path: string, options?: { transform?: { width?: number; height?: number; resize?: 'cover' | 'contain' | 'fill'; format?: 'origin'; quality?: number } }): Promise<string> => {
    const { data, error } = await supabase.storage
        .from('invoices')
        .createSignedUrl(path, 3600, options);

    if (error) {
        console.error('Error creating signed URL:', error);
        throw error;
    }

    return data.signedUrl;
};

export const getThumbnailUrl = async (path: string): Promise<string> => {
    return getFileUrl(path, {
        transform: {
            width: 200,
            height: 200,
            resize: 'contain',
            format: 'origin',
            quality: 80
        }
    });
}; 