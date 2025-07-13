import { Result } from '../../shared/Result';

export interface FileUploadResult {
    filePath: string;
    fileUrl: string;
}

export interface IFileStorageService {
    uploadFile(file: File, path: string): Promise<Result<FileUploadResult>>;
    deleteFile(path: string): Promise<Result<void>>;
    getFileUrl(path: string): Promise<Result<string>>;
    downloadFile(path: string): Promise<Result<Blob>>;
} 