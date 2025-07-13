# BetterBooks - Architecture Documentation

## 🏗️ Architecture Overview

BetterBooks follows a **Feature-Sliced Architecture** with clear separation of concerns, making it highly scalable, maintainable, and developer-friendly.

## 📁 Folder Structure

```
src/
├── app/                    # Application root
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
│
├── features/              # Feature-based modules
│   ├── auth/              # Authentication feature
│   │   ├── components/    # Auth-specific components
│   │   ├── hooks/         # Auth-specific hooks
│   │   ├── api/           # Auth API calls
│   │   ├── types.ts       # Auth types
│   │   └── index.ts       # Feature exports
│   ├── dashboard/         # Dashboard feature
│   ├── documents/         # Documents management
│   ├── company/           # Company setup & management
│   └── profile/           # User profile
│
├── shared/                # Shared, reusable code
│   ├── components/        # UI components (Button, Modal, etc.)
│   ├── hooks/             # Shared hooks
│   ├── utils/             # Utility functions
│   ├── types/             # Shared types/interfaces
│   ├── constants/         # Shared constants
│   └── config/            # Configuration
│
├── services/              # App-wide services
│   ├── api/               # API layer & HTTP client
│   ├── store/             # Redux store & slices
│   └── supabase/          # Supabase integration
│
└── assets/                # Static assets
```

## 🎯 Key Principles

### 1. **Feature-First Organization**
- Each feature is self-contained with its own components, hooks, and API calls
- Features can be developed, tested, and deployed independently
- Easy to onboard new developers to specific features

### 2. **Shared Layer**
- All cross-cutting concerns are in the `shared/` folder
- UI components, utilities, types, and constants are reusable across features
- Prevents code duplication and ensures consistency

### 3. **Service Layer**
- Centralized API management with proper error handling
- State management with Redux Toolkit
- Third-party integrations (Supabase) are abstracted

### 4. **Type Safety**
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

## 🚀 Best Practices

### 1. **Import Organization**
```typescript
// External libraries
import React from 'react';
import { useNavigate } from 'react-router-dom';

// Internal imports (feature-specific first, then shared)
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/shared/components/button';
import { logger } from '@/shared/utils/logger';
```

### 2. **Component Structure**
```typescript
// Feature-specific component
export const UserProfile = () => {
  // Hooks
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();

  // Event handlers
  const handleSubmit = async (data: ProfileData) => {
    try {
      await updateProfile(data);
      toast({ title: 'Success', description: 'Profile updated' });
    } catch (error) {
      logger.error('Failed to update profile', error);
      toast({ title: 'Error', description: 'Update failed', variant: 'destructive' });
    }
  };

  // Render
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};
```

### 3. **Error Handling**
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

### 4. **API Layer**
```typescript
// Service interface
interface UserApiService {
  getProfile(): Promise<ApiResponse<UserProfile>>;
  updateProfile(data: UpdateProfileData): Promise<ApiResponse<UserProfile>>;
}

// Implementation
export class UserApi implements UserApiService {
  constructor(private httpClient: HttpClient) {}

  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return this.httpClient.get<UserProfile>('/users/profile');
  }
}
```

## 📦 Adding New Features

### 1. **Create Feature Folder**
```bash
mkdir src/features/new-feature
mkdir src/features/new-feature/components
mkdir src/features/new-feature/hooks
mkdir src/features/new-feature/api
```

### 2. **Create Feature Files**
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

### 3. **Add to App Routes**
```typescript
// src/app/App.tsx
import { NewFeatureComponent } from '@/features/new-feature';

const routes = useRoutes([
  {
    path: "/new-feature",
    element: <NewFeatureComponent />,
  },
  // ... other routes
]);
```

## 🧪 Testing Strategy

### 1. **Unit Tests**
- Test individual components and hooks
- Mock external dependencies
- Test error scenarios

### 2. **Integration Tests**
- Test feature workflows
- Test API integrations
- Test user interactions

### 3. **E2E Tests**
- Test complete user journeys
- Test critical business flows

## 🔒 Security Considerations

### 1. **Authentication**
- JWT tokens managed by Supabase
- Automatic token refresh
- Protected routes with authentication guards

### 2. **Authorization**
- Role-based access control
- Feature-level permissions
- API endpoint protection

### 3. **Data Validation**
- Input validation with Zod schemas
- Type-safe API contracts
- Sanitization of user inputs

## 📈 Performance Optimization

### 1. **Code Splitting**
- Feature-based code splitting
- Lazy loading of routes
- Dynamic imports for heavy components

### 2. **Caching**
- Redux state caching
- API response caching
- Static asset optimization

### 3. **Bundle Optimization**
- Tree shaking
- Dead code elimination
- Asset compression

## 🚀 Deployment

### 1. **Environment Configuration**
```bash
# .env.development
VITE_SUPABASE_URL=your_dev_url
VITE_SUPABASE_ANON_KEY=your_dev_key

# .env.production
VITE_SUPABASE_URL=your_prod_url
VITE_SUPABASE_ANON_KEY=your_prod_key
```

### 2. **Build Process**
```bash
npm run build:production
```

### 3. **Deployment Platforms**
- Vercel (recommended)
- Netlify
- AWS S3 + CloudFront

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Redux Toolkit Guide](https://redux-toolkit.js.org/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Follow the established folder structure
2. Use TypeScript for all new code
3. Write tests for new features
4. Follow the error handling patterns
5. Update documentation when adding new features
6. Use conventional commits for commit messages

---

**This architecture ensures your application is scalable, maintainable, and follows industry best practices.** 