import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Button from '../components/Button';

type AuthMode = 'login' | 'register' | 'onboarding' | 'join';
type OnboardingStep = 'org-details' | 'add-sites' | 'add-materials' | 'add-vehicles' | 'invite-team' | 'complete';

interface LoginProps {
  onLogin: (role: string, orgId: string, siteIds: string[]) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>('org-details');
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [registerData, setRegisterData] = useState({
    name: '',
    phone: '',
    password: '',
    language: 'en'
  });
  
  const [orgData, setOrgData] = useState({
    name: '',
    industryType: 'stone_crushing'
  });
  
  const [sites, setSites] = useState<{name: string; type: string; address: string}[]>([]);
  const [materials, setMaterials] = useState<{name: string; unit: string; rate: string}[]>([]);
  const [vehicles, setVehicles] = useState<{name: string; type: string; registration: string; capacity: string}[]>([]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setTimeout(() => {
      setIsLoading(false);
      onLogin('owner', 'org-1', ['site-1']);
    }, 1000);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setTimeout(() => {
      setIsLoading(false);
      setMode('onboarding');
      setOnboardingStep('org-details');
    }, 1000);
  };

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      setError('Please enter invite code');
      return;
    }
    setIsLoading(true);
    setError('');
    setTimeout(() => {
      setIsLoading(false);
      onLogin('driver', 'org-1', ['site-1']);
    }, 1500);
  };

  const handleCreateOrg = async () => {
    if (!orgData.name.trim()) {
      setError('Organization name is required');
      return;
    }
    setIsLoading(true);
    setError('');
    setTimeout(() => {
      setIsLoading(false);
      setOnboardingStep('add-sites');
    }, 1000);
  };

  const addSite = () => setSites([...sites, { name: '', type: 'plant', address: '' }]);
  const updateSite = (index: number, field: string, value: string) => {
    const updated = [...sites];
    (updated[index] as any)[field] = value;
    setSites(updated);
  };
  const handleSitesComplete = () => setOnboardingStep(materials.length > 0 ? 'add-materials' : 'add-vehicles');

  const addMaterial = () => setMaterials([...materials, { name: '', unit: 'brass', rate: '' }]);
  const updateMaterial = (index: number, field: string, value: string) => {
    const updated = [...materials];
    (updated[index] as any)[field] = value;
    setMaterials(updated);
  };
  const handleMaterialsComplete = () => setOnboardingStep(vehicles.length > 0 ? 'invite-team' : 'complete');

  const addVehicle = () => setVehicles([...vehicles, { name: '', type: 'hywa', registration: '', capacity: '' }]);
  const updateVehicle = (index: number, field: string, value: string) => {
    const updated = [...vehicles];
    (updated[index] as any)[field] = value;
    setVehicles(updated);
  };

  const handleComplete = () => onLogin('owner', 'org-new', sites.map((_, i) => `site-${i}`));

  if (mode === 'login') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-surface p-8 rounded-3xl shadow-modal border border-border">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-floating mb-8 mx-auto">
            <span className="material-symbols-outlined text-on-primary text-3xl">local_shipping</span>
          </div>
          <h1 className="text-3xl font-bold text-center text-text-main tracking-tight mb-2">RSCI Logistics</h1>
          <p className="text-center text-text-muted font-medium mb-10">Sign in to continue</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[13px] font-semibold uppercase tracking-wider text-text-muted ml-1">Phone</label>
              <input type="tel" className="w-full h-14 bg-surface-hover border border-border rounded-xl text-xl font-medium px-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-text-main" placeholder="+91XXXXXXXXXX" />
            </div>
            <div>
              <label className="text-[13px] font-semibold uppercase tracking-wider text-text-muted ml-1">Password</label>
              <input type="password" className="w-full h-14 bg-surface-hover border border-border rounded-xl text-xl font-medium px-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-text-main" placeholder="••••••••" />
            </div>
            {error && <p className="text-error text-sm">{error}</p>}
            <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>Sign In</Button>
          </form>
          <div className="mt-6 pt-6 border-t border-border space-y-3">
            <Button variant="secondary" size="md" className="w-full justify-center" onClick={() => setMode('join')}>Join with Invite Code</Button>
            <Button variant="ghost" size="md" className="w-full justify-center" onClick={() => setMode('register')}>Create New Account</Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (mode === 'register') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-surface p-8 rounded-3xl shadow-modal border border-border">
          <button onClick={() => setMode('login')} className="text-text-muted hover:text-text-main mb-4"><span className="material-symbols-outlined">arrow_back</span></button>
          <h1 className="text-3xl font-bold text-center text-text-main tracking-tight mb-2">Create Account</h1>
          <p className="text-center text-text-muted font-medium mb-8">Set up your account</p>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-[13px] font-semibold uppercase tracking-wider text-text-muted ml-1">Full Name</label>
              <input type="text" className="w-full h-14 bg-surface-hover border border-border rounded-xl text-xl font-medium px-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-text-main" placeholder="Your name" value={registerData.name} onChange={e => setRegisterData({...registerData, name: e.target.value})} />
            </div>
            <div>
              <label className="text-[13px] font-semibold uppercase tracking-wider text-text-muted ml-1">Phone</label>
              <input type="tel" className="w-full h-14 bg-surface-hover border border-border rounded-xl text-xl font-medium px-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-text-main" placeholder="+91XXXXXXXXXX" value={registerData.phone} onChange={e => setRegisterData({...registerData, phone: e.target.value})} />
            </div>
            <div>
              <label className="text-[13px] font-semibold uppercase tracking-wider text-text-muted ml-1">Password</label>
              <input type="password" className="w-full h-14 bg-surface-hover border border-border rounded-xl text-xl font-medium px-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-text-main" placeholder="••••••••" value={registerData.password} onChange={e => setRegisterData({...registerData, passwor
