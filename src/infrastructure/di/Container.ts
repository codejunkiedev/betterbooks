import { ICompanyRepository } from '../../core/domain/repositories/ICompanyRepository';
import { IDocumentRepository } from '../../core/domain/repositories/IDocumentRepository';
import { IFileStorageService } from '../../core/domain/services/IFileStorageService';
import { SupabaseCompanyRepository } from '../repositories/SupabaseCompanyRepository';
import { SupabaseDocumentRepository } from '../repositories/SupabaseDocumentRepository';
import { SupabaseFileStorageService } from '../services/SupabaseFileStorageService';

export class Container {
    private static instance: Container;
    private services: Map<string, unknown> = new Map();

    private constructor() {
        this.registerServices();
    }

    static getInstance(): Container {
        if (!Container.instance) {
            Container.instance = new Container();
        }
        return Container.instance;
    }

    private registerServices(): void {
        // Register repositories
        this.services.set('ICompanyRepository', new SupabaseCompanyRepository());
        this.services.set('IDocumentRepository', new SupabaseDocumentRepository());

        // Register services
        this.services.set('IFileStorageService', new SupabaseFileStorageService());
    }

    get<T>(serviceName: string): T {
        const service = this.services.get(serviceName);
        if (!service) {
            throw new Error(`Service ${serviceName} not found in container`);
        }
        return service as T;
    }

    // Convenience methods for getting repositories
    getCompanyRepository(): ICompanyRepository {
        return this.get<ICompanyRepository>('ICompanyRepository');
    }

    getDocumentRepository(): IDocumentRepository {
        return this.get<IDocumentRepository>('IDocumentRepository');
    }

    getFileStorageService(): IFileStorageService {
        return this.get<IFileStorageService>('IFileStorageService');
    }
} 