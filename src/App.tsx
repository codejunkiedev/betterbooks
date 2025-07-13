import { memo } from 'react';
import { AuthProvider } from './hooks/useAuth';
import { Toaster } from './components/ui/toaster';
import AppRoutes from './routes/AppRoutes';
import './App.css';

const App = memo(() => {
  return (
    <AuthProvider>
      <div className="App">
        <AppRoutes />
        <Toaster />
      </div>
    </AuthProvider>
  );
});

export default App;
