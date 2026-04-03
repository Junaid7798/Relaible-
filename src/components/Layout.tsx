import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userRole: string;
  onLogout: () => void;
}

// Role definitions with access levels
const ROLE_TABS: Record<string, { id: string; label: string; icon: string }[]> = {
  owner: [
    { id: 'DASH', label: 'Dashboard', icon: 'dashboard' },
    { id: 'SALES', label: 'Sales', icon: 'payments' },
    { id: 'LEDGER', label: 'Ledger', icon: 'menu_book' },
    { id: 'STOCK', label: 'Stock', icon: 'inventory_2' },
    { id: 'FLEET', label: 'Fleet', icon: 'local_shipping' },
    { id: 'EXPENSES', label: 'Expenses', icon: 'receipt_long' },
    { id: 'TEAM', label: 'Team', icon: 'groups' },
    { id: 'ADMIN', label: 'Admin', icon: 'settings' },
  ],
  admin: [
    { id: 'DASH', label: 'Dashboard', icon: 'dashboard' },
    { id: 'SALES', label: 'Sales', icon: 'payments' },
    { id: 'LEDGER', label: 'Ledger', icon: 'menu_book' },
    { id: 'STOCK', label: 'Stock', icon: 'inventory_2' },
    { id: 'FLEET', label: 'Fleet', icon: 'local_shipping' },
    { id: 'EXPENSES', label: 'Expenses', icon: 'receipt_long' },
    { id: 'TEAM', label: 'Team', icon: 'groups' },
    { id: 'ADMIN', label: 'Admin', icon: 'settings' },
  ],
  site_manager: [
    { id: 'DASH', label: 'Dashboard', icon: 'dashboard' },
    { id: 'SALES', label: 'Sales', icon: 'payments' },
    { id: 'LEDGER', label: 'Ledger', icon: 'menu_book' },
    { id: 'STOCK', label: 'Stock', icon: 'inventory_2' },
    { id: 'FLEET', label: 'Fleet', icon: 'local_shipping' },
    { id: 'EXPENSES', label: 'Expenses', icon: 'receipt_long' },
  ],
  driver: [
    { id: 'TRIPS', label: 'Trips', icon: 'local_shipping' },
    { id: 'VEHICLE', label: 'Vehicle', icon: 'directions_car' },
  ],
  partner: [
    // Dynamically shown based on permissions
  ],
};

export default function Layout({ children, currentTab, setCurrentTab, userRole, onLogout }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get tabs for current role
  const roleLower = userRole.toLowerCase();
  const roleKey = Object.keys(ROLE_TABS).find(k => roleLower.includes(k)) || 'owner';
  const allTabs = ROLE_TABS[roleKey] || ROLE_TABS.owner;
  
  // For mobile: show first 4 and "More"
  const mobileMainTabs = allTabs.slice(0, 4);
  const mobileMoreTabs = allTabs.slice(4);

  const getRoleLabel = () => {
    const labels: Record<string, string> = {
      owner: 'Owner',
      admin: 'Admin',
      site_manager: 'Site Manager',
      driver: 'Driver',
      partner: 'Partner',
    };
    return labels[userRole] || userRole;
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-border flex justify-between items-center px-4 md:px-8 h-16 pt-[env(safe-area-inset-top)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-subtle">
            <span className="material-symbols-outlined text-on-primary text-[18px]">local_shipping</span>
          </div>
          <h1 className="font-bold text-[17px] tracking-tight text-text-main">RSCI</h1>
          <span className="ml-2 px-2 py-0.5 bg-surface-hover border border-border rounded text-[10px] font-bold uppercase tracking-wider text-text-muted hidden sm:block">
            {getRoleLabel()}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Desktop Nav */}
          <div className="hidden md:flex gap-1 mr-2 overflow-x-auto custom-scrollbar">
            {allTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`relative px-3 py-2 text-[14px] font-medium rounded-lg transition-colors whitespace-nowrap ${
                  currentTab === tab.id 
                    ? 'text-primary' 
                    : 'text-text-muted hover:text-text-main hover:bg-surface-hover'
                }`}
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
          
          {/* Sync status */}
          <div className="flex items-center gap-3">
            <div className="bg-success-bg px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-success/20 hidden sm:flex">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
              <span className="text-success font-semibold text-[12px]">Synced</span>
            </div>
            <button 
              onClick={onLogout} 
              className="w-8 h-8 rounded-full bg-surface-hover border border-border flex items-center justify-center text-text-muted hover:text-error transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
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
              transition={{ type: 'spring', damping: 25,
