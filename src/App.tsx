import { useState, lazy, Suspense, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { DatabaseProvider } from '@nozbe/watermelondb/DatabaseProvider';
import { database } from './db';
import { syncDatabase } from './db/sync';
import Layout from './components/Layout';
import Login from './screens/Login';

const Dashboard = lazy(() => import('./screens/Dashboard'));
const Fleet = lazy(() => import('./screens/Fleet'));
const Sales = lazy(() => import('./screens/Sales'));
const Admin = lazy(() => import('./screens/Admin'));
const Ledger = lazy(() => import('./screens/Ledger'));
const Stock = lazy(() => import('./screens/Stock'));
const Expenses = lazy(() => import('./screens/Expenses'));

function AppContent() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userUnit, setUserUnit] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState('DASH');

  useEffect(() => {
    if (userRole) {
      syncDatabase().catch(console.error);
    }
  }, [userRole]);

  const handleLogin = (role: string, unit: string) => {
    setUserRole(role);
    setUserUnit(unit);
    setCurrentTab('DASH');
  };

  const handleLogout = () => {
    setUserRole(null);
    setUserUnit(null);
  };

  if (!userRole) {
    return <Login onLogin={handleLogin} />;
  }

  const renderScreen = () => {
    switch (currentTab) {
      case 'DASH': return <Dashboard />;
      case 'FLEET': return <Fleet />;
      case 'SALES': return <Sales />;
      case 'ADMIN': return <Admin />;
      case 'LEDGER': return <Ledger />;
      case 'STOCK': return <Stock />;
      case 'EXPENSES': return <Expenses />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout currentTab={currentTab} setCurrentTab={setCurrentTab} userRole={userRole} onLogout={handleLogout}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="h-full"
        >
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
            </div>
          }>
            {renderScreen()}
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}

export default function App() {
  return (
    <DatabaseProvider database={database}>
      <AppContent />
    </DatabaseProvider>
  );
}
