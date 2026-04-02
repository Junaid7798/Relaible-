import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userRole: string;
  onLogout: () => void;
}

export default function Layout({ children, currentTab, setCurrentTab, userRole, onLogout }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Define tabs based on role
  const allTabs = [
    { id: 'DASH', label: 'Dashboard', icon: 'dashboard', roles: ['OWNER', 'PLANT_MANAGER', 'SHOP_MANAGER'] },
    { id: 'SALES', label: 'Sales', icon: 'payments', roles: ['OWNER', 'PLANT_MANAGER', 'SHOP_MANAGER'] },
    { id: 'LEDGER', label: 'Khata', icon: 'menu_book', roles: ['OWNER', 'PLANT_MANAGER', 'SHOP_MANAGER'] },
    { id: 'STOCK', label: 'Stock', icon: 'inventory_2', roles: ['OWNER', 'PLANT_MANAGER', 'SHOP_MANAGER'] },
    { id: 'FLEET', label: 'Fleet', icon: 'local_shipping', roles: ['OWNER', 'PLANT_MANAGER'] },
    { id: 'EXPENSES', label: 'Expenses', icon: 'receipt_long', roles: ['OWNER', 'PLANT_MANAGER', 'SHOP_MANAGER'] },
    { id: 'ADMIN', label: 'Admin', icon: 'settings', roles: ['OWNER'] },
  ];

  const visibleTabs = allTabs.filter(tab => tab.roles.includes(userRole));
  
  // For mobile bottom nav, show first 4 and a "More" button
  const mobileMainTabs = visibleTabs.slice(0, 4);
  const mobileMoreTabs = visibleTabs.slice(4);

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-border flex justify-between items-center px-4 md:px-8 h-16 pt-[env(safe-area-inset-top)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-subtle">
            <span className="material-symbols-outlined text-on-primary text-[18px]">layers</span>
          </div>
          <h1 className="font-bold text-[17px] tracking-tight text-text-main">CrushOps</h1>
          <span className="ml-2 px-2 py-0.5 bg-surface-hover border border-border rounded text-[10px] font-bold uppercase tracking-wider text-text-muted hidden sm:block">
            {userRole.replace('_', ' ')}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-1 mr-2 overflow-x-auto custom-scrollbar">
            {visibleTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`relative px-3 py-2 text-[14px] font-medium rounded-lg transition-colors whitespace-nowrap ${currentTab === tab.id ? 'text-primary' : 'text-text-muted hover:text-text-main hover:bg-surface-hover'}`}
              >
                {currentTab === tab.id && (
                  <motion.div 
                    layoutId="desktop-active-tab"
                    className="absolute inset-0 bg-surface-active rounded-lg -z-10"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-success-bg px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-success/20 hidden sm:flex">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
              <span className="text-success font-semibold text-[12px]">Synced</span>
            </div>
            <button onClick={onLogout} className="w-8 h-8 rounded-full bg-surface-hover border border-border flex items-center justify-center text-text-muted hover:text-error transition-colors">
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="pt-[calc(4rem+env(safe-area-inset-top))] pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-12 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-surface/80 backdrop-blur-xl flex justify-around items-center px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 z-50 border-t border-border md:hidden">
        {mobileMainTabs.map(tab => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setCurrentTab(tab.id);
                setIsMobileMenuOpen(false);
              }}
              className={`relative flex flex-col items-center justify-center h-14 min-w-[64px] px-2 transition-colors ${isActive ? 'text-primary' : 'text-text-muted'}`}
            >
              <motion.div
                animate={{ y: isActive ? -2 : 0 }}
                className="flex flex-col items-center"
              >
                <span className={`material-symbols-outlined mb-1 text-[24px] ${isActive ? 'filled-icon' : ''}`}>{tab.icon}</span>
                <span className="font-semibold text-[10px] tracking-wide">{tab.label}</span>
              </motion.div>
            </button>
          );
        })}
        
        {mobileMoreTabs.length > 0 && (
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`relative flex flex-col items-center justify-center h-14 min-w-[64px] px-2 transition-colors ${isMobileMenuOpen ? 'text-primary' : 'text-text-muted'}`}
          >
            <motion.div
              animate={{ y: isMobileMenuOpen ? -2 : 0 }}
              className="flex flex-col items-center"
            >
              <span className={`material-symbols-outlined mb-1 text-[24px] ${isMobileMenuOpen ? 'filled-icon' : ''}`}>menu</span>
              <span className="font-semibold text-[10px] tracking-wide">More</span>
            </motion.div>
          </button>
        )}
      </nav>

      {/* Mobile More Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-primary/40 backdrop-blur-sm md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 w-full z-40 md:hidden bg-surface rounded-t-[24px] border-t border-border p-6 shadow-modal"
            >
              <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-6" />
              <h3 className="font-bold text-lg mb-4 text-text-main">More Options</h3>
              <div className="grid grid-cols-4 gap-4">
                {mobileMoreTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setCurrentTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border ${currentTab === tab.id ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-surface-hover border-border text-text-main'}`}
                  >
                    <span className={`material-symbols-outlined mb-2 ${currentTab === tab.id ? 'filled-icon' : ''}`}>{tab.icon}</span>
                    <span className="text-[11px] font-semibold">{tab.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
