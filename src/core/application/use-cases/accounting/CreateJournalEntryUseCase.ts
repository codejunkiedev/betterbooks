import { JournalEntry } from '../../../domain/entities/JournalEntry';
import { JournalEntryLine } from '../../../domain/entities/JournalEntryLine';
import { IJournalEntryRepository } from '../../../domain/repositories/IJournalEntryRepository';
import { IDocumentRepository } from '../../../domain/repositories/IDocumentRepository';
import { Result } from '../../../shared/Result';

export interface JournalEntryLineRequest {
    accountId: string;
    type: 'DEBIT' | 'CREDIT';
    amount: number;
}

export interface CreateJournalEntryRequest {
    companyId: string;
    entryDate: Date;
    description: string;
    createdByAccountantId: string;
    sourceDocumentId?: string;
    isAdjustingEntry?: boolean;
    lines: JournalEntryLineRequest[];
}

export interface CreateJournalEntryResponse {
    journalEntry: JournalEntry;
}

export class CreateJournalEntryUseCase {
    constructor(
        private journalEntryRepository: IJournalEntryRepository,
        private documentRepository: IDocumentRepository
    ) { }

    async execute(request: CreateJournalEntryRequest): Promise<Result<CreateJournalEntryResponse>> {
        try {
            // Validate request
            const validationErrors = JournalEntry.validate({
                companyId: request.companyId,
                entryDate: request.entryDate,
                description: request.description,
                createdByAccountantId: request.createdByAccountantId,
                sourceDocumentId: request.sourceDocumentId,
                isAdjustingEntry: request.isAdjustingEntry
            });
            if (validationErrors.length > 0) {
                return Result.fail<CreateJournalEntryResponse>(validationErrors.join(', '));
            }

            // Validate source document exists if provided
            if (request.sourceDocumentId) {
                const sourceDocument = await this.documentRepository.findById(request.sourceDocumentId);
                if (!sourceDocument) {
                    return Result.fail<CreateJournalEntryResponse>('Source document not found');
                }
                if (sourceDocument.companyId !== request.companyId) {
                    return Result.fail<CreateJournalEntryResponse>('Source document does not belong to this company');
                }
            }

            // Create journal entry
            const journalEntry = JournalEntry.create({
                companyId: request.companyId,
                entryDate: request.entryDate,
                description: request.description,
                createdByAccountantId: request.createdByAccountantId,
                sourceDocumentId: request.sourceDocumentId,
                isAdjustingEntry: request.isAdjustingEntry || false
            });

            // Add lines to journal entry
            for (const lineRequest of request.lines) {
                const line = JournalEntryLine.create({
                    journalEntryId: journalEntry.id,
                    accountId: lineRequest.accountId,
                    type: lineRequest.type,
                    amount: lineRequest.amount
                });
                journalEntry.addLine(line);
            }

            // Validate double-entry bookkeeping
            const validation = journalEntry.validateDoubleEntry();
            if (!validation.isValid) {
                return Result.fail<CreateJournalEntryResponse>(validation.errors.join(', '));
            }

            // Save journal entry
            const savedJournalEntry = await this.journalEntryRepository.save(journalEntry);

            // Update source document status if provided
            if (request.sourceDocumentId) {
                const sourceDocument = await this.documentRepository.findById(request.sourceDocumentId);
                if (sourceDocument) {
                    sourceDocument.markCompleted();
                    await this.documentRepository.update(sourceDocument);
                }
            }

            return Result.ok<CreateJournalEntryResponse>({
                journalEntry: savedJournalEntry
            });
        } catch (error) {
            return Result.fail<CreateJournalEntryResponse>(`Failed to create journal entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
} 