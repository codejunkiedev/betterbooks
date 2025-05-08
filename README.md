# BetterBooks 📚

## 📋 Project Overview

BetterBooks is an advanced book management and accounting reconciliation system that leverages cutting-edge AI technologies to automate and streamline the accounting process. The system combines Optical Character Recognition (OCR) and Large Language Models (LLM) to create an intelligent, end-to-end automated accounts reconciliation solution.

### 🎯 Key Capabilities

### 💡 AI Integration

The system integrates multiple AI technologies:
- OCR for document digitization
- LLM for intelligent data processing

A modern book management application built with React, Vite, Supabase, and Shadcn UI.

## 🚀 Features

- **Modern Tech Stack**
  - React 19 with TypeScript
  - Vite for fast development and building
  - Supabase for backend and authentication
  - Shadcn UI for beautiful, accessible components
  - Tailwind CSS for styling

- **AI & Machine Learning**
  - OCR integration for document processing
  - LLM-powered data analysis

- **UI Components**
  - Responsive design
  - Accessible components
  - Modern and clean interface

## 🛠️ Prerequisites

- Node.js (v20.x.x)
- npm
- Supabase account

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/codejunkiedev/betterbooks.git
cd betterbooks
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.development` and `.env.production`
   - Fill in your Supabase credentials:
```env
VITE_APP_ENV=development
VITE_API_URL=your_api_url
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🚀 Running the Application

### Development
```baloggingsh
# Build and start development server
npm run build
npm run dev
```

### Production
```bash
# Build for production
npm run build-production

# Start production server
npm run start
```

## 🏗️ Project Structure

```
betterbooks/
├── dist/                   # Production build output
├── node_modules/           # Project dependencies
├── public/                 # Static assets
├── src/                    # Source code
│   ├── assets/             # Images and static assets
│   ├── components/         # React components (including Shadcn UI)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions and configurations
│   ├── pages/              # Page-level components (if using routing)
│   ├── services/           # API and service layer
│   ├── types/              # TypeScript type definitions
│   ├── App.css             # App-level CSS
│   ├── App.tsx             # Main App component
│   ├── index.css           # Global styles (Tailwind CSS)
│   ├── main.tsx            # Application entry point
│   └── vite-env.d.ts       # Vite environment type definitions
├── .env.development        # Development environment variables
├── .env.production         # Production environment variables
├── .gitignore              # Git ignore rules
├── components.json         # Shadcn UI components registry
├── eslint.config.js        # ESLint configuration
├── index.html              # Main HTML file
├── package.json            # Project metadata and scripts
├── package-lock.json       # Dependency lock file
├── postcss.config.cjs      # PostCSS configuration
├── README.md               # Project documentation
├── tailwind.config.cjs     # Tailwind CSS configuration
├── tsconfig.app.json       # TypeScript config for app
├── tsconfig.json           # Base TypeScript configuration
├── tsconfig.node.json      # TypeScript config for node
└── vite.config.ts          # Vite configuration
```

## 🎨 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for development
- `npm run build-production` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🔧 Configuration

### Vite Configuration
The project uses Vite with the following features:
- TypeScript support
- Path aliases (@/ for src directory)
- Environment variables
- Production optimizations

### Supabase Setup
1. Create a new Supabase project
2. Enable authentication
3. Configure your database schema
4. Add your Supabase URL and anon key to environment variables

### Shadcn UI
The project uses Shadcn UI components which are:
- Built on Radix UI primitives
- Styled with Tailwind CSS
- Fully accessible
- Customizable

## 🧪 Testing

To test the application:

1. Development testing:
```bash
npm run build
npm run dev
```

2. Production testing:
```bash
npm run build-production
npm run start
```

## 📝 Environment Variables

Required environment variables:
- `VITE_APP_ENV`: Environment name (development/production)
- `VITE_API_URL`: Your API URL
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## 🔐 Security

- Environment variables are not committed to the repository
- Supabase authentication is used for secure user management
- API keys are kept secure and not exposed to the client

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some feature/AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Talha Mushtaq - Initial work

## 🙏 Acknowledgments

- [Vite](https://vitejs.dev/)
- [React](https://reactjs.org/)
- [Supabase](https://supabase.io/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
