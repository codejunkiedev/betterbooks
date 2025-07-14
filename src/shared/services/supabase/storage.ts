import { StorageResponse } from '@/shared/types/storage';
import { supabase } from '@/shared/services/supabase/client';

export const uploadFiles = async (
    files: File[],
    folder: string = '',
    bucket: string = 'documents'
): Promise<StorageResponse> => {
    try {
        const uploadPromises = files.map(async (file) => {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = folder ? `${folder}/${fileName}` : fileName;

            const { error } = await supabase.storage
                .from(bucket)
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
        return { data: null, error: error as Error };
    }
};

export const deleteFile = async (
    path: string,
    bucket: string = 'documents'
): Promise<{ error: Error | null }> => {
    try {
        const { error } = await supabase.storage
            .from(bucket)
            .remove([path]);

        return { error: error ?? null };
    } catch (error) {
        return { error: error as Error };
    }
};

export const getFileUrl = async (
    path: string,
    bucket: string = 'documents',
    options?: { transform?: { width?: number; height?: number; resize?: 'cover' | 'contain' | 'fill'; format?: 'origin'; quality?: number } }
): Promise<string> => {
    const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 3600, options);

    if (error) throw error;
    return data.signedUrl;
};

export const getThumbnailUrl = async (
    path: string,
    bucket: string = 'documents'
): Promise<string> => {
    return getFileUrl(path, bucket, {
        transform: {
            width: 200,
            height: 200,
            resize: 'contain',
            format: 'origin',
            quality: 80
        }
    });
}; 