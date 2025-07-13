import { createClient } from '@supabase/supabase-js';
import { IFileStorageService, FileUploadResult } from '../../core/domain/services/IFileStorageService';
import { Result } from '../../core/shared/Result';

export class SupabaseFileStorageService implements IFileStorageService {
    private supabase;

    constructor() {
        this.supabase = createClient(
            import.meta.env.VITE_SUPABASE_URL,
            import.meta.env.VITE_SUPABASE_ANON_KEY
        );
    }

    async uploadFile(file: File, path: string): Promise<Result<FileUploadResult>> {
        try {
            const { error } = await this.supabase.storage
                .from('documents')
                .upload(path, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                return Result.fail<FileUploadResult>(`Failed to upload file: ${error.message}`);
            }

            const { data: urlData } = this.supabase.storage
                .from('documents')
                .getPublicUrl(path);

            return Result.ok<FileUploadResult>({
                filePath: path,
                fileUrl: urlData.publicUrl
            });
        } catch (error) {
            return Result.fail<FileUploadResult>(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async deleteFile(path: string): Promise<Result<void>> {
        try {
            const { error } = await this.supabase.storage
                .from('documents')
                .remove([path]);

            if (error) {
                return Result.fail<void>(`Failed to delete file: ${error.message}`);
            }

            return Result.ok<void>();
        } catch (error) {
            return Result.fail<void>(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getFileUrl(path: string): Promise<Result<string>> {
        try {
            const { data } = this.supabase.storage
                .from('documents')
                .getPublicUrl(path);

            return Result.ok<string>(data.publicUrl);
        } catch (error) {
            return Result.fail<string>(`Failed to get file URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async downloadFile(path: string): Promise<Result<Blob>> {
        try {
            const { data, error } = await this.supabase.storage
                .from('documents')
                .download(path);

            if (error) {
                return Result.fail<Blob>(`Failed to download file: ${error.message}`);
            }

            return Result.ok<Blob>(data);
        } catch (error) {
            return Result.fail<Blob>(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
} 