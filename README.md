# BetterBooks 📚

## 📋 Project Overview

BetterBooks is an advanced book management and accounting reconciliation system that leverages cutting-edge AI technologies to automate and streamline the accounting process. The system combines Optical Character Recognition (OCR) and Large Language Models (LLM) to create an intelligent, end-to-end automated accounts reconciliation solution.

### 🚀 Key Capabilities

- **AI-Powered Document Processing**: OCR and LLM integration for intelligent data extraction
- **Modern Tech Stack**: React 19, TypeScript, Vite, Supabase, and Shadcn UI
- **Feature-Sliced Architecture**: Scalable, maintainable codebase with clear separation of concerns
- **Real-time Collaboration**: Multi-user support with real-time updates
- **Comprehensive Accounting**: Chart of accounts, invoice management, and financial reporting
- **Advanced Filtering**: Backend-side filtering with modal interfaces for optimal performance
- **Financial Reporting**: Profit & Loss, Balance Sheet, and Trial Balance reports with PDF export
- **Multi-Role Support**: User, Accountant, and Admin roles with role-based access control

## 🏗️ Architecture

BetterBooks follows a **Feature-Sliced Architecture** with clear separation of concerns:

```
src/
├── app/                    # Application root (App.tsx, main.tsx)
├── pages/                  # Page-level components
│   ├── user/              # User-specific pages
│   ├── accountant/        # Accountant-specific pages
│   └── admin/             # Admin-specific pages
├── features/              # Feature-based modules
│   ├── users/             # User features (dashboard, journal, reports)
│   ├── accountant/        # Accountant features (clients, bank statements)
│   ├── admin/             # Admin features (user management, role management)
│   └── shared/            # Shared features across roles
├── shared/                # Shared, reusable code
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Shared hooks
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript types
│   ├── config/            # Configuration
│   ├── services/          # API and database services
│   └── layout/            # Layout components
└── database/              # Database schema and migrations
    ├── schema/            # Table definitions
    ├── migrations/        # Database migrations
    └── procedures/        # Stored procedures
```

For detailed architecture information, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## 🛠️ Prerequisites

- **Node.js** (v20.x.x or higher)
- **npm** (v9.x.x or higher)
- **Git**
- **Supabase account** (for backend services)
- **Code editor** (VS Code recommended with TypeScript support)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/codejunkiedev/betterbooks.git
cd betterbooks

# Install dependencies
npm install
```

### 2. Environment Configuration

```bash
# Copy environment templates
cp .env.example .env.development
cp .env.example .env.production

# Edit .env.development with your Supabase credentials
```

Required environment variables:
```env
VITE_APP_ENV=development
VITE_API_URL=your_api_url
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup

```bash
# Apply database migrations
# Run the SQL files in src/database/migrations/ in order
# Set up the database schema and initial data
```

### 4. Start Development

```bash
# Start development server
npm run dev

# Or build and start
npm run build
npm run dev
```

The application will be available at `http://localhost:5173`

## 🧪 Development Workflow

### Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for development
npm run build-production # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run type-check       # Run TypeScript type checking
```

### Code Quality Standards

- **TypeScript**: Strict mode enabled, all code must be typed
- **ESLint**: Code linting with custom rules
- **Prettier**: Automatic code formatting
- **Conventional Commits**: Follow conventional commit message format

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add new feature description"

# Push and create PR
git push origin feature/your-feature-name
```

## 📁 Project Structure Deep Dive

### Features (`src/features/`)

Each feature is self-contained with its own components, hooks, and API calls:

#### User Features (`src/features/users/`)
- **`dashboard/`**: Financial summary, recent activity, key metrics
- **`journal/`**: Double-entry journal with backend filtering and pagination
- **`reports/`**: Financial reports (P&L, Balance Sheet, Trial Balance) with PDF export
- **`company/`**: Company setup, chart of accounts, opening balances
- **`profile/`**: User profile management and settings

#### Accountant Features (`src/features/accountant/`)
- **`dashboard/`**: Client overview with backend filtering and modal interfaces
- **`clients/`**: Client management with advanced filtering
- **`bank-statements/`**: Bank statement management with backend filtering
- **`text-documents/`**: Document review and processing

#### Admin Features (`src/features/admin/`)
- **`user-management/`**: User administration and role management
- **`role-management/`**: Role and permission management

### Shared (`src/shared/`)

Reusable code across features:

- **`components/`**: UI components (Button, Modal, Table, Dialog, etc.)
- **`hooks/`**: Custom React hooks (useToast, useRedux, etc.)
- **`utils/`**: Utility functions and helpers
- **`types/`**: TypeScript type definitions
- **`config/`**: Application configuration
- **`services/`**: API and database services
- **`layout/`**: Layout components for different user roles

### Services (`src/shared/services/`)

App-wide services and integrations:

- **`api/`**: HTTP client and API layer
- **`store/`**: Redux Toolkit state management
- **`supabase/`**: Supabase client and database operations

## 🔧 Key Technologies

### Frontend
- **React 19**: Latest React with concurrent features
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn UI**: Beautiful, accessible components
- **React Router**: Client-side routing with role-based access

### Backend & Services
- **Supabase**: PostgreSQL database, authentication, real-time
- **Redux Toolkit**: State management
- **date-fns**: Date manipulation and formatting

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Static type checking

## 🎨 UI/UX Guidelines

### Component Usage

```typescript
// Import from shared components
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Input } from '@/shared/components/Input';
import { Dialog } from '@/shared/components/Dialog';

// Use consistent styling patterns
<Card className="p-6">
  <Input placeholder="Enter text..." />
  <Button variant="default">Submit</Button>
</Card>
```

### Filter Modal Pattern

```typescript
// Consistent filter modal implementation
<Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Filter Options</DialogTitle>
    </DialogHeader>
    {/* Filter content */}
  </DialogContent>
</Dialog>
```

### Styling Patterns

- Use Tailwind CSS utility classes
- Follow the design system in `shared/components/`
- Maintain consistent spacing and typography
- Ensure accessibility (ARIA labels, keyboard navigation)
- Implement responsive design for all screen sizes

## 🔐 Authentication & Security

### User Authentication
- JWT-based authentication via Supabase
- Automatic token refresh
- Protected routes with authentication guards
- Role-based access control (User, Accountant, Admin)

### Security Best Practices
- Environment variables for sensitive data
- Input validation with TypeScript
- API endpoint protection
- Secure data transmission (HTTPS)
- Row Level Security (RLS) in database

## 📊 Database Schema

The application uses PostgreSQL with the following key tables:

- **`users`**: User accounts and profiles
- **`companies`**: Company information with accountant assignments
- **`accountants`**: Accountant profiles and permissions
- **`admins`**: Admin user profiles
- **`company_coa`**: Chart of accounts
- **`journal_entries`**: Double-entry journal entries
- **`journal_entry_lines`**: Individual journal entry lines
- **`invoices`**: Invoice records
- **`line_items`**: Invoice line items
- **`documents`**: Document storage and metadata
- **`messages`**: Communication between users and accountants

See `src/database/schema/` for detailed schema definitions.

## 🚀 Key Features

### 📈 Financial Dashboard
- Real-time financial metrics calculation
- Total Revenue, Expenses, Net Profit tracking
- Cash balance monitoring
- Monthly and quarterly summaries

### 📖 Journal Management
- Full double-entry journal system
- Backend-side filtering and pagination
- Search by description and account names
- Date range filtering
- CSV export functionality
- Tooltips for better readability

### 📊 Financial Reporting
- **Profit & Loss Statement**: Revenue, expenses, and net profit calculation
- **Balance Sheet**: Assets, liabilities, and equity with balance verification
- **Trial Balance**: Account balances with debit/credit verification
- **PDF Export**: Professional report generation
- **Date Range Selection**: Flexible period reporting

### 🔍 Advanced Filtering System
- **Modal-based Filter Interfaces**: Clean, consistent filter modals across all pages
- **Backend-side Filtering**: High-performance filtering for large datasets
- **Real-time Search**: Debounced search functionality
- **Status Filtering**: Filter by client status, document status, etc.
- **Pagination**: Efficient data loading with page navigation

### 👥 Multi-Role Support
- **User Role**: Company management, document upload, financial reporting
- **Accountant Role**: Client management, document review, bank statement processing
- **Admin Role**: User management, role assignment, system administration

### 📄 Document Management
- AI-powered document processing
- Bank statement upload and review
- Invoice and expense document handling
- Document status tracking
- Comment and collaboration features

## 🧪 Testing Strategy

### Testing Levels
1. **Unit Tests**: Individual components and functions
2. **Integration Tests**: Feature workflows and API calls
3. **E2E Tests**: Complete user journeys

### Running Tests
```bash
npm run test              # Run all tests
npm run test:unit         # Run unit tests only
npm run test:integration  # Run integration tests
npm run test:e2e          # Run end-to-end tests
```

## 🚀 Deployment

### Production Build
```bash
npm run build-production
```

### Deployment Platforms
- **Vercel** (recommended)
- **Netlify**
- **AWS S3 + CloudFront**

### Environment Setup
1. Set production environment variables
2. Configure Supabase production project
3. Set up CI/CD pipeline
4. Configure domain and SSL

## 🤝 Contributing Guidelines

### Before You Start
1. Read the [ARCHITECTURE.md](./ARCHITECTURE.md) document
2. Familiarize yourself with the codebase structure
3. Check existing issues and discussions
4. Join the project discussions

### Development Process
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Follow** the coding standards and architecture patterns
4. **Test** your changes thoroughly
5. **Commit** with conventional commit messages
6. **Push** to your branch (`git push origin feature/amazing-feature`)
7. **Create** a Pull Request with detailed description

### Pull Request Guidelines
- Provide clear description of changes
- Include screenshots for UI changes
- Add tests for new features
- Update documentation if needed
- Ensure all CI checks pass

### Code Review Process
- All PRs require at least one review
- Address review comments promptly
- Maintain constructive feedback culture
- Follow up on suggestions and improvements

## 🐛 Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**TypeScript Errors**
```bash
# Run type checking
npm run type-check
```

**Environment Issues**
- Verify all environment variables are set
- Check Supabase project configuration
- Ensure database migrations are applied

**Database Connection Issues**
- Verify Supabase credentials
- Check RLS policies
- Ensure proper role assignments

### Getting Help
- Check existing issues and discussions
- Review the architecture documentation
- Ask questions in project discussions
- Create detailed bug reports with steps to reproduce

## 📚 Learning Resources

### Project-Specific
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture guide
- [Database Schema](./src/database/schema/) - Database structure
- [Component Library](./src/shared/components/) - UI components
- [Feature Documentation](./src/features/) - Feature-specific documentation

### Technology Stack
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn UI](https://ui.shadcn.com/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Talha Mushtaq** - Project Lead & Initial Development

## 🙏 Acknowledgments

- [Vite](https://vitejs.dev/) - Build tool
- [React](https://reactjs.org/) - UI framework
- [Supabase](https://supabase.io/) - Backend services
- [Shadcn UI](https://ui.shadcn.com/) - Component library
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [date-fns](https://date-fns.org/) - Date manipulation

---

**Welcome to BetterBooks! We're excited to have you contribute to building the future of automated accounting.** 🚀
