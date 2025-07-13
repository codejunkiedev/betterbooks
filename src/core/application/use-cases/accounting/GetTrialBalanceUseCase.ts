import { IJournalEntryRepository } from '../../../domain/repositories/IJournalEntryRepository';
import { Result } from '../../../shared/Result';
import { TrialBalance } from '../../../domain/repositories/IJournalEntryRepository';

export interface GetTrialBalanceRequest {
    companyId: string;
    asOfDate: Date;
    userId: string;
}

export class GetTrialBalanceUseCase {
    constructor(
        private journalEntryRepository: IJournalEntryRepository
    ) { }

    async execute(request: GetTrialBalanceRequest): Promise<Result<TrialBalance>> {
        try {
            // Validate input
            if (!request.companyId) {
                return Result.fail<TrialBalance>('Company ID is required');
            }

            if (!request.asOfDate) {
                return Result.fail<TrialBalance>('As of date is required');
            }

            if (!request.userId) {
                return Result.fail<TrialBalance>('User ID is required');
            }

            // Validate date is not in the future
            const now = new Date();
            if (request.asOfDate > now) {
                return Result.fail<TrialBalance>('As of date cannot be in the future');
            }

            // Get trial balance
            const trialBalance = await this.journalEntryRepository.getTrialBalance(
                request.companyId,
                request.asOfDate
            );

            return Result.ok<TrialBalance>(trialBalance);
        } catch (error) {
            console.error('Error in GetTrialBalanceUseCase:', error);
            return Result.fail<TrialBalance>(
                `Failed to generate trial balance: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }
} 