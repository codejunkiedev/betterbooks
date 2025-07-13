import { createClient } from '@supabase/supabase-js';
import { Company, CompanyType } from '../../core/domain/entities/Company';
import { ICompanyRepository, OpeningBalanceData } from '../../core/domain/repositories/ICompanyRepository';

export class SupabaseCompanyRepository implements ICompanyRepository {
    private supabase;

    constructor() {
        this.supabase = createClient(
            import.meta.env.VITE_SUPABASE_URL,
            import.meta.env.VITE_SUPABASE_ANON_KEY
        );
    }

    async findById(id: string): Promise<Company | null> {
        try {
            const { data, error } = await this.supabase
                .from('companies')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !data) {
                return null;
            }

            return new Company({
                id: data.id,
                userId: data.user_id,
                assignedAccountantId: data.assigned_accountant_id,
                name: data.name,
                type: data.type as CompanyType,
                isActive: data.is_active,
                createdAt: new Date(data.created_at),
                updatedAt: new Date(data.updated_at)
            });
        } catch (error) {
            console.error('Error finding company by ID:', error);
            return null;
        }
    }

    async findByUserId(userId: string): Promise<Company | null> {
        try {
            const { data, error } = await this.supabase
                .from('companies')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error || !data) {
                return null;
            }

            return new Company({
                id: data.id,
                userId: data.user_id,
                assignedAccountantId: data.assigned_accountant_id,
                name: data.name,
                type: data.type as CompanyType,
                isActive: data.is_active,
                createdAt: new Date(data.created_at),
                updatedAt: new Date(data.updated_at)
            });
        } catch (error) {
            console.error('Error finding company by user ID:', error);
            return null;
        }
    }

    async findByAccountantId(accountantId: string): Promise<Company[]> {
        try {
            const { data, error } = await this.supabase
                .from('companies')
                .select('*')
                .eq('assigned_accountant_id', accountantId);

            if (error || !data) {
                return [];
            }

            return data.map(row => new Company({
                id: row.id,
                userId: row.user_id,
                assignedAccountantId: row.assigned_accountant_id,
                name: row.name,
                type: row.type as CompanyType,
                isActive: row.is_active,
                createdAt: new Date(row.created_at),
                updatedAt: new Date(row.updated_at)
            }));
        } catch (error) {
            console.error('Error finding companies by accountant ID:', error);
            return [];
        }
    }

    async save(company: Company): Promise<Company> {
        try {
            const companyData = company.toJSON();

            const { data, error } = await this.supabase
                .from('companies')
                .insert({
                    id: companyData.id,
                    user_id: companyData.userId,
                    assigned_accountant_id: companyData.assignedAccountantId,
                    name: companyData.name,
                    type: companyData.type,
                    is_active: companyData.isActive,
                    created_at: companyData.createdAt.toISOString(),
                    updated_at: companyData.updatedAt.toISOString()
                })
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to save company: ${error.message}`);
            }

            return new Company({
                id: data.id,
                userId: data.user_id,
                assignedAccountantId: data.assigned_accountant_id,
                name: data.name,
                type: data.type as CompanyType,
                isActive: data.is_active,
                createdAt: new Date(data.created_at),
                updatedAt: new Date(data.updated_at)
            });
        } catch (error) {
            throw new Error(`Failed to save company: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async update(company: Company): Promise<Company> {
        try {
            const companyData = company.toJSON();

            const { data, error } = await this.supabase
                .from('companies')
                .update({
                    assigned_accountant_id: companyData.assignedAccountantId,
                    name: companyData.name,
                    type: companyData.type,
                    is_active: companyData.isActive,
                    updated_at: companyData.updatedAt.toISOString()
                })
                .eq('id', companyData.id)
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to update company: ${error.message}`);
            }

            return new Company({
                id: data.id,
                userId: data.user_id,
                assignedAccountantId: data.assigned_accountant_id,
                name: data.name,
                type: data.type as CompanyType,
                isActive: data.is_active,
                createdAt: new Date(data.created_at),
                updatedAt: new Date(data.updated_at)
            });
        } catch (error) {
            throw new Error(`Failed to update company: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async delete(id: string): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('companies')
                .delete()
                .eq('id', id);

            if (error) {
                throw new Error(`Failed to delete company: ${error.message}`);
            }
        } catch (error) {
            throw new Error(`Failed to delete company: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findAll(): Promise<Company[]> {
        try {
            const { data, error } = await this.supabase
                .from('companies')
                .select('*');

            if (error || !data) {
                return [];
            }

            return data.map(row => new Company({
                id: row.id,
                userId: row.user_id,
                assignedAccountantId: row.assigned_accountant_id,
                name: row.name,
                type: row.type as CompanyType,
                isActive: row.is_active,
                createdAt: new Date(row.created_at),
                updatedAt: new Date(row.updated_at)
            }));
        } catch (error) {
            console.error('Error finding all companies:', error);
            return [];
        }
    }

    async findByType(type: CompanyType): Promise<Company[]> {
        try {
            const { data, error } = await this.supabase
                .from('companies')
                .select('*')
                .eq('type', type);

            if (error || !data) {
                return [];
            }

            return data.map(row => new Company({
                id: row.id,
                userId: row.user_id,
                assignedAccountantId: row.assigned_accountant_id,
                name: row.name,
                type: row.type as CompanyType,
                isActive: row.is_active,
                createdAt: new Date(row.created_at),
                updatedAt: new Date(row.updated_at)
            }));
        } catch (error) {
            console.error('Error finding companies by type:', error);
            return [];
        }
    }

    async findActiveCompanies(): Promise<Company[]> {
        try {
            const { data, error } = await this.supabase
                .from('companies')
                .select('*')
                .eq('is_active', true);

            if (error || !data) {
                return [];
            }

            return data.map(row => new Company({
                id: row.id,
                userId: row.user_id,
                assignedAccountantId: row.assigned_accountant_id,
                name: row.name,
                type: row.type as CompanyType,
                isActive: row.is_active,
                createdAt: new Date(row.created_at),
                updatedAt: new Date(row.updated_at)
            }));
        } catch (error) {
            console.error('Error finding active companies:', error);
            return [];
        }
    }

    async saveOpeningBalance(data: OpeningBalanceData): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('opening_balances')
                .insert({
                    company_id: data.companyId,
                    cash_balance: data.cashBalance,
                    balance_as_of_date: data.balanceAsOfDate.toISOString().split('T')[0]
                });

            if (error) {
                throw new Error(`Failed to save opening balance: ${error.message}`);
            }
        } catch (error) {
            throw new Error(`Failed to save opening balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
} 