import React from 'react';
import { motion } from 'motion/react';
import Button from '../components/Button';

interface LoginProps {
  onLogin: (role: 'OWNER' | 'PLANT_MANAGER' | 'SHOP_MANAGER', unit: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-surface p-8 rounded-3xl shadow-modal border border-border"
      >
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-floating mb-8 mx-auto">
          <span className="material-symbols-outlined text-on-primary text-3xl">layers</span>
        </div>
        <h1 className="text-3xl font-bold text-center text-text-main tracking-tight mb-2">CrushOps</h1>
        <p className="text-center text-text-muted font-medium mb-10">Select your role to continue</p>

        <div className="space-y-4">
          <Button 
            variant="primary" 
            size="lg" 
            className="w-full justify-between" 
            rightIcon="arrow_forward"
            onClick={() => onLogin('OWNER', 'ALL')}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined">admin_panel_settings</span>
              <span>Login as Owner</span>
            </div>
          </Button>
          
          <Button 
            variant="secondary" 
            size="lg" 
            className="w-full justify-between bg-surface-hover border border-border" 
            rightIcon="arrow_forward"
            onClick={() => onLogin('PLANT_MANAGER', 'PLANT_1')}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined">factory</span>
              <span>Plant Manager</span>
            </div>
          </Button>

          <Button 
            variant="secondary" 
            size="lg" 
            className="w-full justify-between bg-surface-hover border border-border" 
            rightIcon="arrow_forward"
            onClick={() => onLogin('SHOP_MANAGER', 'SHOP_1')}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined">storefront</span>
              <span>Shop 1 Manager</span>
            </div>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
