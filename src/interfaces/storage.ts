export interface UploadedFile {
    path: string;
    name: string;
    size: number;
    type: string;
}

export interface StorageResponse {
    data: UploadedFile[] | null;
    error: Error | null;
}