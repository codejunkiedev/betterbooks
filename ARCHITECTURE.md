# BetterBooks - Clean Architecture Implementation

## Overview

BetterBooks is a modern accounting application built with React, TypeScript, and Supabase, implementing Clean Architecture principles for scalability, maintainability, and testability.

## Architecture Overview

### Clean Architecture Layers

```
┌─────────────────────────────────────┐
│           Presentation Layer        │  ← React Components, Hooks
├─────────────────────────────────────┤
│         Application Layer           │  ← Use Cases, Application Services
├─────────────────────────────────────┤
│           Domain Layer              │  ← Entities, Value Objects, Domain Services
├─────────────────────────────────────┤
│        Infrastructure Layer         │  ← Repositories, External Services
└─────────────────────────────────────┘
```

## Design Patterns Implemented

### 1. Clean Architecture (Hexagonal Architecture)
- **Separation of Concerns**: Clear boundaries between layers
- **Dependency Inversion**: High-level modules don't depend on low-level modules
- **Testability**: Each layer can be tested independently

### 2. Domain-Driven Design (DDD)
- **Entities**: Rich domain objects with business logic
- **Value Objects**: Immutable objects representing concepts
- **Aggregates**: Clusters of related entities
- **Repositories**: Data access abstraction

### 3. Repository Pattern
- **Abstraction**: Data access logic is abstracted behind interfaces
- **Testability**: Easy to mock for unit testing
- **Flexibility**: Can switch implementations without changing business logic

### 4. Use Case Pattern
- **Single Responsibility**: Each use case handles one business operation
- **Input/Output Contracts**: Clear interfaces for data flow
- **Error Handling**: Consistent error handling with Result pattern

### 5. Dependency Injection
- **Loose Coupling**: Components depend on abstractions, not concretions
- **Testability**: Easy to inject mocks for testing
- **Flexibility**: Easy to swap implementations

## Project Structure

```
src/
├── core/                           # Domain and Application layers
│   ├── domain/                     # Domain layer
│   │   ├── entities/               # Domain entities
│   │   │   ├── Company.ts
│   │   │   ├── Document.ts
│   │   │   ├── JournalEntry.ts
│   │   │   ├── JournalEntryLine.ts
│   │   │   └── Accountant.ts
│   │   ├── repositories/           # Repository interfaces
│   │   │   ├── ICompanyRepository.ts
│   │   │   ├── IDocumentRepository.ts
│   │   │   └── IJournalEntryRepository.ts
│   │   └── services/               # Domain services
│   │       └── IFileStorageService.ts
│   ├── application/                # Application layer
│   │   └── use-cases/              # Use cases
│   │       ├── company/
│   │       │   └── CreateCompanyUseCase.ts
│   │       ├── documents/
│   │       │   └── UploadDocumentUseCase.ts
│   │       └── accounting/
│   │           └── CreateJournalEntryUseCase.ts
│   └── shared/                     # Shared utilities
│       └── Result.ts               # Result pattern for error handling
├── infrastructure/                 # Infrastructure layer
│   ├── repositories/               # Repository implementations
│   │   ├── SupabaseCompanyRepository.ts
│   │   ├── SupabaseDocumentRepository.ts
│   │   └── SupabaseJournalEntryRepository.ts
│   ├── services/                   # External service implementations
│   │   └── SupabaseFileStorageService.ts
│   └── di/                         # Dependency injection
│       └── Container.ts
├── hooks/                          # React hooks using the architecture
│   ├── useCompanySetup.ts
│   └── useDocumentUpload.ts
└── components/                     # React components (Presentation layer)
```

## Key Components

### Domain Entities

#### Company
- **Purpose**: Represents a business entity in the system
- **Business Rules**:
  - Must have a unique name per user
  - Can be assigned to an accountant
  - Can be activated/deactivated
  - Supports different company types

#### Document
- **Purpose**: Represents uploaded files (invoices, receipts, bank statements)
- **Business Rules**:
  - Status transitions: PENDING_REVIEW → IN_PROGRESS → COMPLETED
  - Can request user input during processing
  - Linked to specific company

#### JournalEntry
- **Purpose**: Represents double-entry bookkeeping transactions
- **Business Rules**:
  - Must have balanced debits and credits
  - Can be linked to source documents
  - Supports adjusting entries
  - Validates double-entry bookkeeping rules

### Use Cases

#### CreateCompanyUseCase
- **Input**: Company name, type, user ID
- **Output**: Created company or error
- **Business Logic**:
  - Validates company data
  - Checks for existing company per user
  - Creates and saves company

#### UploadDocumentUseCase
- **Input**: File, company ID, user ID, document type
- **Output**: Created document and file URL
- **Business Logic**:
  - Validates file type and size
  - Uploads file to storage
  - Creates document record
  - Links to company

#### CreateJournalEntryUseCase
- **Input**: Entry details, lines, company ID
- **Output**: Created journal entry
- **Business Logic**:
  - Validates double-entry bookkeeping
  - Creates journal entry with lines
  - Updates source document status
  - Ensures data integrity

### Repository Pattern

Each repository interface defines the contract for data access:

```typescript
export interface ICompanyRepository {
  findById(id: string): Promise<Company | null>;
  findByUserId(userId: string): Promise<Company | null>;
  save(company: Company): Promise<Company>;
  update(company: Company): Promise<Company>;
  delete(id: string): Promise<void>;
  // ... other methods
}
```

### Result Pattern

Consistent error handling using the Result pattern:

```typescript
const result = await createCompanyUseCase.execute(request);
if (result.isSuccess) {
  // Handle success
  const company = result.value.company;
} else {
  // Handle error
  console.error(result.error);
}
```

## Security & Validation

### Input Validation
- **Zod Schemas**: Type-safe validation for all inputs
- **Domain Validation**: Business rules enforced in domain entities
- **File Validation**: Type and size restrictions for uploads

### Authorization
- **Role-Based Access**: Accountants vs Users
- **Company Isolation**: Users can only access their own data
- **Accountant Assignment**: Accountants only see assigned companies

### Data Integrity
- **Double-Entry Validation**: Ensures balanced journal entries
- **Status Transitions**: Enforces valid document status changes
- **Referential Integrity**: Database constraints and application validation

## Testing Strategy

### Unit Testing
- **Domain Entities**: Test business logic and validation
- **Use Cases**: Test application logic with mocked dependencies
- **Repositories**: Test data access logic

### Integration Testing
- **Repository Integration**: Test with real database
- **Use Case Integration**: Test complete workflows
- **API Integration**: Test external service interactions

### E2E Testing
- **User Workflows**: Test complete user journeys
- **Cross-Browser**: Ensure compatibility
- **Performance**: Load testing for scalability

## Scalability Considerations

### Performance
- **Caching**: Redis for frequently accessed data
- **Pagination**: Large dataset handling
- **Indexing**: Database query optimization
- **CDN**: Static asset delivery

### Horizontal Scaling
- **Stateless Design**: Easy to scale horizontally
- **Database Sharding**: Partition data by company
- **Microservices**: Future service decomposition
- **Load Balancing**: Distribute traffic

### Monitoring
- **Error Tracking**: Sentry integration
- **Performance Monitoring**: APM tools
- **Logging**: Structured logging with correlation IDs
- **Metrics**: Business and technical metrics

## Deployment

### Environment Configuration
- **Environment Variables**: Secure configuration management
- **Feature Flags**: Gradual feature rollout
- **Database Migrations**: Version-controlled schema changes
- **CI/CD**: Automated testing and deployment

### Infrastructure
- **Supabase**: Backend-as-a-Service
- **Vercel**: Frontend hosting
- **CDN**: Global content delivery
- **Monitoring**: Health checks and alerting

## Future Enhancements

### Planned Features
- **Real-time Collaboration**: WebSocket integration
- **Advanced Reporting**: Custom report builder
- **Mobile App**: React Native implementation
- **AI Integration**: Automated document processing
- **Multi-currency**: International business support

### Technical Improvements
- **GraphQL**: More efficient data fetching
- **Microservices**: Service decomposition
- **Event Sourcing**: Audit trail and history
- **CQRS**: Command-Query Responsibility Segregation

## Contributing

### Development Guidelines
1. **Follow Clean Architecture**: Maintain layer separation
2. **Write Tests**: Ensure code quality and reliability
3. **Document Changes**: Update architecture documentation
4. **Code Review**: Peer review for all changes
5. **Performance**: Monitor and optimize performance

### Code Standards
- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Consistent formatting
- **Conventional Commits**: Standardized commit messages

## Conclusion

This Clean Architecture implementation provides a solid foundation for building a scalable, maintainable, and testable accounting application. The separation of concerns, dependency inversion, and domain-driven design principles ensure that the codebase can evolve and scale with business requirements while maintaining high quality and reliability. 