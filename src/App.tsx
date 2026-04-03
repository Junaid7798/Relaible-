import { useState, lazy, Suspense, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { DatabaseProvider } from '@nozbe/watermelondb/DatabaseProvider';
import { database } from './db';
import { syncDatabase, startAutoSync } from './db/sync';
import Layout from './components/Layout';
import Login from './screens/Login';
import Driver from './screens/Driver';

const Dashboard = lazy(() => import('./screens/Dashboard'));
const Fleet = lazy(() => import('./screens/Fleet'));
const Sales = lazy(() => import('./screens/Sales'));
const Admin = lazy(() => import('./screens/Admin'));
const Ledger = lazy(() => import('./screens/Ledger'));
const Stock = lazy(() => import('./screens/Stock'));
const Expenses = lazy(() => import('./screens/Expenses'));

interface UserData {
  role: string;
  orgId: string;
  siteIds: string[];
}

function AppContent() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentTab, setCurrentTab] = useState('DASH');

  useEffect(() => {
    if (userData) {
      // Start auto-sync when user is logged in
      startAutoSync(30000);
    }
  }, [userData]);

  const handleLogin = (role: string, orgId: string, siteIds: string[]) => {
    setUserData({ role, orgId, siteIds });
    setCurrentTab('DASH');
  };

  const handleLogout = () => {
    setUserData(null);
    localStorage.removeItem('accessToken');
  };

  // Show Driver interface for driver role
  if (userData?.role === 'driver') {
    return <Driver userName="Driver" onLogout={handleLogout} />;
  }

  if (!userData) {
    return <Login onLogin={handleLogin} />;
  }

  // Role-based tab filtering
  const getVisibleTabs = () => {
    const role = userData.role.toLowerCase();
    const allTabs = [
      { id: 'DASH', label: 'Dashboard', roles: ['owner', 'admin', 'site_manager'] },
      { id: 'SALES', label: 'Sales', roles: ['owner', 'admin', 'site_manager', 'partner'] },
      { id: 'LEDGER', label: 'Ledger', roles: ['owner', 'admin', 'site_manager'] },
      { id: 'STOCK', label: 'Stock', roles: ['owner', 'admin', 'site_manager'] },
      { id: 'FLEET', label: 'Fleet', roles: ['owner', 'admin', 'site_manager'] },
      { id: 'EXPENSES', label: 'Expenses', roles: ['owner', 'admin', 'site_manager'] },
      { id: 'TEAM', label: 'Team', roles: ['owner', 'admin'] },
      { id: 'ADMIN', label: 'Admin', roles: ['owner'] },
    ];
    
    return allTabs.filter(tab => tab.roles.includes(role) || tab.roles.includes('partner'));
  };

  const visibleTabs = getVisibleTabs();
  
  // Get default tab for role
  const roleDefaultTabs: Record<string, string> = {
    owner: 'DASH',
    admin: 'DASH',
    site_manager: 'DASH',
    partner: 'SALES',
  };
  
  // Set initial tab if current is not visible
  useEffect(() => {
    const visibleIds = visibleTabs.map(t => t.id);
    if (!visibleIds.includes(currentTab)) {
      setCurrentTab(roleDefaultTabs[userData.role] || 'DASH');
    }
  }, []);

  const renderScreen = () => {
    switch (currentTab) {
      case 'DASH': return <Dashboard />;
      case 'FLEET': return <Fleet />;
      case 'SALES': return <Sales />;
      case 'ADMIN': return <Admin />;
      case 'LEDGER': return <Ledger />;
      case 'STOCK': return <Stock />;
      case 'EXPENSES': return <Expenses />;
      case 'TEAM': return <TeamScreen />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout 
      currentTab={currentTab} 
      setCurrentTab={setCurrentTab} 
      userRole={userData.role}
      onLogout={handleLogout}
    >
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

// Simple Team screen component
function TeamScreen() {
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  return (
    <div className="space-y-8 overflow-x-hidden pb-8">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-accent font-semibold tracking-wider text-[13px] uppercase">
            <span className="material-symbols-outlined text-[16px]">groups</span>
            Team Management
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-text-main leading-none">Invite Team</h2>
        </div>
        <button 
          onClick={() => setShowInviteModal(true)}
          className="bg-primary text-white px-5 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-primary-hover transition-colors"
        >
          <span className="material-symbols-outlined">person_add</span>
          Invite Member
        </button>
      </section>

      <section className="bg-surface p-6 md:p-8 rounded-2xl border border-border">
        <h3 className="font-bold text-xl text-text-main mb-6">Active Members</h3>
        <div className="space-y-4">
          {[
            { name: 'Khan', role: 'Owner', status: 'active' },
            { name: 'Rajesh Sharma', role: 'Driver', status: 'active' },
            { name: 'Vikram Kumar', role: 'Site Manager', status: 'active' },
          ].map((member, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-surface-hover rounded-xl border border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-text-main">{member.name}</p>
                  <p className="text-sm text-text-muted">{member.role}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-success-bg text-success rounded-full text-xs font-medium">
                {member.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function App() {
  return (
    <DatabaseProvider database={database}>
      <AppContent />
    </DatabaseProvider>
  );
}
