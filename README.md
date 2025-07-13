# BetterBooks 📚

## 📋 Project Overview

BetterBooks is an advanced book management and accounting reconciliation system that leverages cutting-edge AI technologies to automate and streamline the accounting process. The system combines Optical Character Recognition (OCR) and Large Language Models (LLM) to create an intelligent, end-to-end automated accounts reconciliation solution.

### �� Key Capabilities

- **AI-Powered Document Processing**: OCR and LLM integration for intelligent data extraction
- **Modern Tech Stack**: React 19, TypeScript, Vite, Supabase, and Shadcn UI
- **Feature-Sliced Architecture**: Scalable, maintainable codebase with clear separation of concerns
- **Real-time Collaboration**: Multi-user support with real-time updates
- **Comprehensive Accounting**: Chart of accounts, invoice management, and financial reporting

## 🏗️ Architecture

BetterBooks follows a **Feature-Sliced Architecture** with clear separation of concerns:

```
src/
├── app/                    # Application root (App.tsx, main.tsx)
├── pages/                  # Page-level components
├── features/              # Feature-based modules
│   ├── auth/              # Authentication
│   ├── dashboard/         # Dashboard & analytics
│   ├── documents/         # Document management
│   ├── company/           # Company setup & management
│   └── profile/           # User profile management
├── shared/                # Shared, reusable code
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Shared hooks
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript types
│   └── config/            # Configuration
└── services/              # App-wide services
    ├── api/               # API layer
    ├── store/             # Redux state management
    └── supabase/          # Supabase integration
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

### 3. Start Development

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

- **`auth/`**: Authentication, login, registration, password reset
- **`dashboard/`**: Main dashboard, analytics, recent activity
- **`documents/`**: Document upload, processing, and management
- **`company/`**: Company setup, chart of accounts, opening balances
- **`profile/`**: User profile management and settings

### Shared (`src/shared/`)

Reusable code across features:

- **`components/`**: UI components (Button, Modal, Table, etc.)
- **`hooks/`**: Custom React hooks
- **`utils/`**: Utility functions and helpers
- **`types/`**: TypeScript type definitions
- **`config/`**: Application configuration

### Services (`src/services/`)

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

### Backend & Services
- **Supabase**: PostgreSQL database, authentication, real-time
- **Redux Toolkit**: State management
- **React Router**: Client-side routing

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Static type checking

## 🎨 UI/UX Guidelines

### Component Usage

```typescript
// Import from shared components
import { Button } from '@/shared/components/button';
import { Card } from '@/shared/components/card';
import { Input } from '@/shared/components/input';

// Use consistent styling patterns
<Card className="p-6">
  <Input placeholder="Enter text..." />
  <Button variant="default">Submit</Button>
</Card>
```

### Styling Patterns

- Use Tailwind CSS utility classes
- Follow the design system in `shared/components/`
- Maintain consistent spacing and typography
- Ensure accessibility (ARIA labels, keyboard navigation)

## 🔐 Authentication & Security

### User Authentication
- JWT-based authentication via Supabase
- Automatic token refresh
- Protected routes with authentication guards
- Role-based access control

### Security Best Practices
- Environment variables for sensitive data
- Input validation with TypeScript
- API endpoint protection
- Secure data transmission (HTTPS)

## 📊 Database Schema

The application uses PostgreSQL with the following key tables:

- **`users`**: User accounts and profiles
- **`companies`**: Company information
- **`company_coa`**: Chart of accounts
- **`invoices`**: Invoice records
- **`line_items`**: Invoice line items
- **`documents`**: Document storage and metadata

See `src/database/schema/` for detailed schema definitions.

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

---

**Welcome to BetterBooks! We're excited to have you contribute to building the future of automated accounting.** 🚀
