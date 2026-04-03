import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from './components/ErrorBoundary';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallback={<div className="p-4 text-red-600">App failed to load. Please refresh.</div>}>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
