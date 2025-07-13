import { Company, CompanyType } from '../../../domain/entities/Company';
import { ICompanyRepository } from '../../../domain/repositories/ICompanyRepository';
import { Result } from '../../../shared/Result';

export interface CreateCompanyRequest {
    userId: string;
    name: string;
    type: CompanyType;
    assignedAccountantId?: string;
    openingBalance?: number;
    openingBalanceDate?: Date;
}

export interface CreateCompanyResponse {
    company: Company;
}

export class CreateCompanyUseCase {
    constructor(private companyRepository: ICompanyRepository) { }

    async execute(request: CreateCompanyRequest): Promise<Result<CreateCompanyResponse>> {
        try {
            // Validate request
            const validationErrors = Company.validate(request);
            if (validationErrors.length > 0) {
                return Result.fail<CreateCompanyResponse>(validationErrors.join(', '));
            }

            // Check if user already has a company
            const existingCompany = await this.companyRepository.findByUserId(request.userId);
            if (existingCompany) {
                return Result.fail<CreateCompanyResponse>('User already has a company');
            }

            // Create company
            const company = Company.create({
                userId: request.userId,
                name: request.name,
                type: request.type,
                assignedAccountantId: request.assignedAccountantId,
                isActive: true
            });

            // Save to repository
            const savedCompany = await this.companyRepository.save(company);

            // If opening balance is provided, save it
            if (request.openingBalance !== undefined && request.openingBalanceDate) {
                await this.companyRepository.saveOpeningBalance({
                    companyId: savedCompany.id,
                    cashBalance: request.openingBalance,
                    balanceAsOfDate: request.openingBalanceDate
                });
            }

            return Result.ok<CreateCompanyResponse>({
                company: savedCompany
            });
        } catch (error) {
            return Result.fail<CreateCompanyResponse>(`Failed to create company: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
} 