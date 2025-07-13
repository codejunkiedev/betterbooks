import { Company } from '../entities/Company';
import { CompanyType } from '../entities/Company';

export interface OpeningBalanceData {
    companyId: string;
    cashBalance: number;
    balanceAsOfDate: Date;
}

export interface ICompanyRepository {
    findById(id: string): Promise<Company | null>;
    findByUserId(userId: string): Promise<Company | null>;
    findByAccountantId(accountantId: string): Promise<Company[]>;
    save(company: Company): Promise<Company>;
    update(company: Company): Promise<Company>;
    delete(id: string): Promise<void>;
    findAll(): Promise<Company[]>;
    findByType(type: CompanyType): Promise<Company[]>;
    findActiveCompanies(): Promise<Company[]>;
    saveOpeningBalance(data: OpeningBalanceData): Promise<void>;
} 