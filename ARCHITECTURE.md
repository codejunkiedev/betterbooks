# BetterBooks - Complete Architecture Documentation

## 🏗️ Architecture Overview

BetterBooks follows a **Feature-Sliced Architecture** with **Role-Based Access Control (RBAC)**, making it highly scalable, maintainable, and secure. The system supports three distinct user roles with clear separation of concerns and permissions.

## 👥 User Roles & Responsibilities

### 1. **User/Client (Business Owner)**
- **Primary Role**: Business owner or client using the accounting service
- **Responsibilities**:
  - Upload invoices, receipts, and bank statements
  - View their own financial reports and journal entries
  - Manage their company profile and settings
  - Communicate with assigned accountant
  - View tax documents prepared by accountant

### 2. **Accountant**
- **Primary Role**: Professional accountant providing bookkeeping services
- **Responsibilities**:
  - View and process client documents
  - Create and manage journal entries
  - Generate financial reports for clients
  - Upload tax documents for clients
  - Communicate with clients
  - View activity logs for their clients
  - Activate/deactivate client accounts

### 3. **Admin**
- **Primary Role**: System administrator managing the platform
- **Responsibilities**:
  - Manage all users and accountants
  - View system-wide reports and activity logs
  - Configure system settings
  - Manage COA templates
  - Oversee all companies and their data
  - System maintenance and monitoring

## 📁 Folder Structure

```
src/
├── app/                    # Application root
│   ├── App.tsx            # Main app component with role-based routing
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
│
├── features/              # Feature-based modules (role-specific)
│   ├── shared/            # Shared features across all roles
│   │   ├── auth/          # Authentication feature
│   │   │   ├── components/ # Auth-specific components
│   │   │   ├── hooks/     # Auth-specific hooks
│   │   │   ├── api/       # Auth API calls
│   │   │   ├── types.ts   # Auth types
│   │   │   └── index.ts   # Feature exports
│   │   ├── documents/     # Document management (shared)
│   │   ├── reports/       # Reporting (shared)
│   │   ├── journal/       # Journal entries (shared)
│   │   ├── messages/      # Communication (shared)
│   │   └── profile/       # User profile (shared)
│   ├── user/              # User-specific features
│   │   ├── dashboard/     # User dashboard
│   │   ├── upload/        # Document upload
│   │   ├── tax-documents/ # Tax document viewing
│   │   └── company-setup/ # Company setup wizard
│   ├── accountant/        # Accountant-specific features
│   │   ├── dashboard/     # Accountant dashboard
│   │   ├── clients/       # Client management
│   │   ├── activity-logs/ # Activity tracking
│   │   └── journal-entries/ # Journal entry management
│   └── admin/             # Admin-specific features
│       ├── dashboard/     # Admin dashboard
│       ├── users/         # User management
│       ├── accountants/   # Accountant management
│       ├── companies/     # Company oversight
│       ├── system-config/ # System configuration
│       └── activity-logs/ # System-wide logs
│
├── pages/                 # Page components (role-based)
│   ├── shared/            # Shared pages
│   │   └── auth/          # Authentication pages
│   ├── user/              # User pages
│   ├── accountant/        # Accountant pages
│   └── admin/             # Admin pages
│
├── shared/                # Shared, reusable code
│   ├── components/        # UI components (Button, Modal, etc.)
│   │   ├── ProtectedRoute.tsx      # Route protection
│   │   ├── RoleBasedNavigation.tsx # Dynamic navigation
│   │   ├── RoleBasedLayout.tsx     # Role-specific layouts
│   │   └── DashboardLayout.tsx     # Common dashboard layout
│   ├── hooks/             # Shared hooks
│   │   └── usePermissions.ts       # Permission checking
│   ├── utils/             # Utility functions
│   ├── types/             # Shared types/interfaces
│   │   └── roles.ts       # Role and permission definitions
│   ├── constants/         # Shared constants
│   ├── config/            # Configuration
│   └── contexts/          # React contexts
│       └── AuthContext.tsx # Role-based authentication
│
├── services/              # App-wide services
│   ├── api/               # API layer & HTTP client
│   ├── store/             # Redux store & slices
│   └── supabase/          # Supabase integration
│
└── assets/                # Static assets
```

## 🔐 Permission System

### Permission Categories

1. **Document Management**
   - `UPLOAD_DOCUMENTS` - Upload new documents
   - `VIEW_OWN_DOCUMENTS` - View own documents
   - `VIEW_ALL_DOCUMENTS` - View all client documents
   - `DELETE_DOCUMENTS` - Delete documents

2. **Journal Entries**
   - `CREATE_JOURNAL_ENTRIES` - Create new journal entries
   - `VIEW_OWN_JOURNAL_ENTRIES` - View own journal entries
   - `VIEW_ALL_JOURNAL_ENTRIES` - View all journal entries
   - `EDIT_JOURNAL_ENTRIES` - Edit journal entries
   - `DELETE_JOURNAL_ENTRIES` - Delete journal entries

3. **Reports**
   - `VIEW_OWN_REPORTS` - View own reports
   - `VIEW_ALL_REPORTS` - View all reports
   - `EXPORT_REPORTS` - Export reports to PDF

4. **Company Management**
   - `MANAGE_OWN_COMPANY` - Manage own company
   - `MANAGE_ALL_COMPANIES` - Manage all companies
   - `ACTIVATE_DEACTIVATE_COMPANIES` - Activate/deactivate companies

5. **User Management**
   - `MANAGE_OWN_PROFILE` - Manage own profile
   - `MANAGE_ALL_USERS` - Manage all users
   - `MANAGE_ACCOUNTANTS` - Manage accountants

6. **Communication**
   - `SEND_MESSAGES` - Send messages
   - `VIEW_OWN_MESSAGES` - View own messages
   - `VIEW_ALL_MESSAGES` - View all messages

7. **System Administration**
   - `VIEW_ACTIVITY_LOGS` - View activity logs
   - `MANAGE_SYSTEM_CONFIG` - Manage system configuration
   - `VIEW_SYSTEM_REPORTS` - View system reports

8. **Chart of Accounts**
   - `VIEW_OWN_COA` - View own chart of accounts
   - `VIEW_ALL_COA` - View all charts of accounts
   - `MANAGE_COA_TEMPLATES` - Manage COA templates

9. **Tax Documents**
   - `UPLOAD_TAX_DOCUMENTS` - Upload tax documents
   - `VIEW_TAX_DOCUMENTS` - View tax documents
   - `MANAGE_TAX_DOCUMENTS` - Manage tax documents

## 🎯 Key Principles

### 1. **Feature-First Organization**
- Each feature is self-contained with its own components, hooks, and API calls
- Features can be developed, tested, and deployed independently
- Easy to onboard new developers to specific features

### 2. **Role-Based Access Control**
- Clear permission hierarchy: Admin > Accountant > User
- Route-level protection based on user roles
- Component-level permission checking
- API endpoint protection

### 3. **Shared Layer**
- All cross-cutting concerns are in the `shared/` folder
- UI components, utilities, types, and constants are reusable across features
- Prevents code duplication and ensures consistency

### 4. **Service Layer**
- Centralized API management with proper error handling
- State management with Redux Toolkit
- Third-party integrations (Supabase) are abstracted

### 5. **Type Safety**
- Strict TypeScript configuration
- Comprehensive type definitions for all data structures
- Custom error types with proper error handling

## 🔧 Technical Stack

- **Frontend**: React 19 + TypeScript
- **State Management**: Redux Toolkit
- **UI Library**: Radix UI + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Authentication**: Supabase Auth with JWT
- **Database**: PostgreSQL with Row Level Security (RLS)

## 🚀 Best Practices

### 1. **Import Organization**
```typescript
// External libraries
import React from 'react';
import { useNavigate } from 'react-router-dom';

// Internal imports (feature-specific first, then shared)
import { useAuth } from '@/features/shared/auth/hooks/useAuth';
import { Button } from '@/shared/components/button';
import { logger } from '@/shared/utils/logger';
```

### 2. **Role-Based Component Structure**
```typescript
// Role-specific component
export const UserDashboard = () => {
  // Hooks
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();

  // Permission checking
  const canUploadDocuments = hasPermission(Permission.UPLOAD_DOCUMENTS);

  // Event handlers
  const handleUpload = async (file: File) => {
    if (!canUploadDocuments) {
      toast({ title: 'Error', description: 'Permission denied', variant: 'destructive' });
      return;
    }
    
    try {
      await uploadDocument(file);
      toast({ title: 'Success', description: 'Document uploaded' });
    } catch (error) {
      logger.error('Failed to upload document', error);
      toast({ title: 'Error', description: 'Upload failed', variant: 'destructive' });
    }
  };

  // Render
  return (
    <RoleBasedLayout role={UserRole.USER}>
      <div>
        {canUploadDocuments && <DocumentUpload onUpload={handleUpload} />}
        {/* Other dashboard components */}
      </div>
    </RoleBasedLayout>
  );
};
```

### 3. **Route Protection**
```typescript
// App.tsx - Role-based routing
const App = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthRoutes />;
  }

  return (
    <Routes>
      {/* User routes */}
      <Route path="/user/*" element={
        <ProtectedRoute role={UserRole.USER}>
          <UserRoutes />
        </ProtectedRoute>
      } />
      
      {/* Accountant routes */}
      <Route path="/accountant/*" element={
        <ProtectedRoute role={UserRole.ACCOUNTANT}>
          <AccountantRoutes />
        </ProtectedRoute>
      } />
      
      {/* Admin routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute role={UserRole.ADMIN}>
          <AdminRoutes />
        </ProtectedRoute>
      } />
    </Routes>
  );
};
```

### 4. **Permission Checking**
```typescript
// Hook for permission checking
export const usePermissions = () => {
  const { user } = useAuth();
  
  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!user) return false;
    
    // Check user role permissions
    const rolePermissions = ROLE_PERMISSIONS[user.role];
    return rolePermissions.includes(permission);
  }, [user]);

  const isRole = useCallback((role: UserRole): boolean => {
    return user?.role === role;
  }, [user]);

  return { hasPermission, isRole };
};
```

### 5. **Error Handling**
```typescript
import { ApplicationError, ErrorCode } from '@/shared/types/errors';
import { logger } from '@/shared/utils/logger';

try {
  const result = await apiCall();
  return result;
} catch (error) {
  if (error instanceof ApplicationError) {
    logger.error('Application error', { code: error.code, message: error.message });
    throw error;
  }
  logger.error('Unexpected error', error);
  throw new ApplicationError(ErrorCode.UNKNOWN_ERROR, 'An unexpected error occurred');
}
```

### 6. **API Layer with Role-Based Access**
```typescript
// Service interface
interface DocumentApiService {
  getDocuments(): Promise<ApiResponse<Document[]>>;
  uploadDocument(file: File): Promise<ApiResponse<Document>>;
  deleteDocument(id: string): Promise<ApiResponse<void>>;
}

// Implementation with role checking
export class DocumentApi implements DocumentApiService {
  constructor(private httpClient: HttpClient, private auth: AuthService) {}

  async getDocuments(): Promise<ApiResponse<Document[]>> {
    const { user } = this.auth.getCurrentUser();
    
    // Role-based endpoint selection
    const endpoint = user.role === UserRole.USER 
      ? '/documents/my' 
      : '/documents/all';
    
    return this.httpClient.get<Document[]>(endpoint);
  }
}
```

## 📦 Adding New Features

### 1. **Create Feature Folder Structure**
```bash
mkdir src/features/new-feature
mkdir src/features/new-feature/components
mkdir src/features/new-feature/hooks
mkdir src/features/new-feature/api
mkdir src/features/new-feature/types.ts
mkdir src/features/new-feature/index.ts
```

### 2. **Define Permissions**
```typescript
// src/shared/types/roles.ts
export enum Permission {
  // ... existing permissions
  MANAGE_NEW_FEATURE = 'MANAGE_NEW_FEATURE',
  VIEW_NEW_FEATURE = 'VIEW_NEW_FEATURE',
}

export const ROLE_PERMISSIONS = {
  [UserRole.USER]: [
    // ... existing permissions
    Permission.VIEW_NEW_FEATURE,
  ],
  [UserRole.ACCOUNTANT]: [
    // ... existing permissions
    Permission.VIEW_NEW_FEATURE,
    Permission.MANAGE_NEW_FEATURE,
  ],
  [UserRole.ADMIN]: [
    // ... all permissions
    Permission.VIEW_NEW_FEATURE,
    Permission.MANAGE_NEW_FEATURE,
  ],
};
```

### 3. **Create Feature Files**
```typescript
// src/features/new-feature/types.ts
export interface NewFeatureData {
  id: string;
  name: string;
  // ... other properties
}

// src/features/new-feature/index.ts
export { NewFeatureComponent } from './components/NewFeatureComponent';
export { useNewFeature } from './hooks/useNewFeature';
export type { NewFeatureData } from './types';
```

### 4. **Add to App Routes**
```typescript
// src/app/App.tsx
import { NewFeatureComponent } from '@/features/new-feature';

const routes = useRoutes([
  {
    path: "/new-feature",
    element: (
      <ProtectedRoute permission={Permission.VIEW_NEW_FEATURE}>
        <NewFeatureComponent />
      </ProtectedRoute>
    ),
  },
  // ... other routes
]);
```

## 🧪 Testing Strategy

### 1. **Unit Tests**
- Test individual components and hooks
- Mock external dependencies
- Test error scenarios
- Test permission checking logic

### 2. **Integration Tests**
- Test feature workflows
- Test API integrations
- Test user interactions
- Test role-based access control

### 3. **E2E Tests**
- Test complete user journeys
- Test critical business flows
- Test role switching scenarios

## 🔒 Security Considerations

### 1. **Authentication**
- JWT tokens managed by Supabase
- Automatic token refresh
- Protected routes with authentication guards
- Session timeout handling

### 2. **Authorization**
- Role-based access control at multiple levels
- Feature-level permissions
- API endpoint protection
- Row-level security in database

### 3. **Data Validation**
- Input validation with Zod schemas
- Type-safe API contracts
- Sanitization of user inputs
- SQL injection prevention

### 4. **Data Privacy**
- Users can only access their own data
- Accountants can only access assigned client data
- Admins have system-wide access with audit trails

## 📈 Performance Optimization

### 1. **Code Splitting**
- Feature-based code splitting
- Role-based lazy loading of routes
- Dynamic imports for heavy components

### 2. **Caching**
- Redux state caching
- API response caching
- Static asset optimization
- Role-based data caching

### 3. **Bundle Optimization**
- Tree shaking
- Dead code elimination
- Asset compression
- Role-specific bundle optimization

## 🚀 Deployment

### 1. **Environment Configuration**
```bash
# .env.development
VITE_SUPABASE_URL=your_dev_url
VITE_SUPABASE_ANON_KEY=your_dev_key
VITE_APP_ENV=development

# .env.production
VITE_SUPABASE_URL=your_prod_url
VITE_SUPABASE_ANON_KEY=your_prod_key
VITE_APP_ENV=production
```

### 2. **Build Process**
```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### 3. **Deployment Platforms**
- **Vercel**: Frontend deployment
- **Supabase**: Backend services
- **GitHub Actions**: CI/CD pipeline

## 📊 Monitoring & Analytics

### 1. **Error Tracking**
- Application error logging
- Performance monitoring
- User behavior analytics
- Role-based usage metrics

### 2. **Audit Trails**
- User action logging
- Permission change tracking
- Data access logs
- System configuration changes

## 🔄 Future Enhancements

### 1. **Scalability**
- Micro-frontend architecture
- Service worker implementation
- Advanced caching strategies
- Load balancing

### 2. **Features**
- Real-time notifications
- Advanced reporting
- Mobile app development
- API rate limiting

### 3. **Security**
- Multi-factor authentication
- Advanced audit logging
- Data encryption at rest
- Compliance certifications 