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
              <input type="password" className="w-full h-14 bg-surface-hover border border-border rounded-xl text-xl font-medium px-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-text-main" placeholder="••••••••" value={registerData.password} onChange={e => setRegisterData({...registerData, password: e.target.value})} />
            </div>
            {error && <p className="text-error text-sm">{error}</p>}
            <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>Continue</Button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (mode === 'join') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-surface p-8 rounded-3xl shadow-modal border border-border">
          <button onClick={() => setMode('login')} className="text-text-muted hover:text-text-main mb-4"><span className="material-symbols-outlined">arrow_back</span></button>
          <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-6 mx-auto"><span className="material-symbols-outlined text-accent text-2xl">qr_code</span></div>
          <h1 className="text-2xl font-bold text-center text-text-main tracking-tight mb-2">Join Organization</h1>
          <p className="text-center text-text-muted font-medium mb-8">Enter your invite code</p>
          <form onSubmit={handleAcceptInvite} className="space-y-4">
            <div>
              <input type="text" className="w-full h-16 bg-surface-hover border border-border rounded-xl text-2xl font-bold text-center tracking-[0.3em] uppercase focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all text-text-main" placeholder="XXXXXX" value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase().slice(0, 6))} maxLength={6} />
            </div>
            {error && <p className="text-error text-sm text-center">{error}</p>}
            <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>Join Organization</Button>
          </form>
          <p className="text-center text-text-muted text-sm mt-6">Or scan QR code to join</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          {['org-details', 'add-sites', 'add-materials', 'add-vehicles', 'invite-team'].map((step, i) => {
            const steps = ['org-details', 'add-sites', 'add-materials', 'add-vehicles', 'invite-team'];
            const currentIdx = steps.indexOf(onboardingStep);
            return <div key={step} className={`flex-1 h-1.5 rounded-full ${i <= currentIdx ? 'bg-accent' : 'bg-border'}`} />;
          })}
        </div>
        <AnimatePresence mode="wait">
          {onboardingStep === 'org-details' && (
            <motion.div key="org-details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-surface p-8 rounded-2xl border border-border">
              <h2 className="text-2xl font-bold text-text-main mb-2">Set up your Organization</h2>
              <p className="text-text-muted mb-8">Tell us about your business</p>
              <div className="space-y-4">
                <div>
                  <label className="text-[13px] font-semibold uppercase tracking-wider text-text-muted ml-1">Organization Name</label>
                  <input type="text" className="w-full h-14 bg-surface-hover border border-border rounded-xl text-xl font-medium px-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-text-main" placeholder="Reliable Stone Crushing Industry" value={orgData.name} onChange={e => setOrgData({...orgData, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-[13px] font-semibold uppercase tracking-wider text-text-muted ml-1">Industry</label>
                  <select className="w-full h-14 bg-surface-hover border border-border rounded-xl text-lg font-medium px-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-text-main" value={orgData.industryType} onChange={e => setOrgData({...orgData, industryType: e.target.value})}>
                    <option value="stone_crushing">Stone Crushing</option>
                    <option value="logistics">Logistics & Delivery</option>
                    <option value="retail">Retail</option>
                    <option value="manufacturing">Manufacturing</option>
                  </select>
                </div>
                {error && <p className="text-error text-sm">{error}</p>}
                <Button variant="primary" size="lg" className="w-full mt-6" onClick={handleCreateOrg} isLoading={isLoading}>Continue</Button>
              </div>
            </motion.div>
          )}
          {onboardingStep === 'add-sites' && (
            <motion.div key="add-sites" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-surface p-8 rounded-2xl border border-border">
              <h2 className="text-2xl font-bold text-text-main mb-2">Add Your Sites</h2>
              <p className="text-text-muted mb-6">Create locations (plant, shops, warehouses)</p>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {sites.map((site, i) => (
                  <div key={i} className="p-4 bg-surface-hover rounded-xl border border-border">
                    <input type="text" className="w-full bg-transparent border-b border-border pb-2 mb-3 text-lg font-medium focus:outline-none focus:border-primary" placeholder="Site name (e.g., Main Plant)" value={site.name} onChange={e => updateSite(i, 'name', e.target.value)} />
                    <div className="flex gap-3">
                      <select className="flex-1 h-10 bg-surface rounded-lg text-sm" value={site.type} onChange={e => updateSite(i, 'type', e.target.value)}>
                        <option value="plant">Plant</option>
                        <option value="shop">Shop</option>
                        <option value="warehouse">Warehouse</option>
                      </select>
                      <button onClick={() => setSites(sites.filter((_, idx) => idx !== i))} className="text-error"><span className="material-symbols-outlined">delete</span></button>
                    </div>
                  </div>
                ))}
                <button onClick={addSite} className="w-full p-4 border-2 border-dashed border-border rounded-xl text-text-muted hover:border-accent hover:text-accent transition-colors flex items-center justify-center gap-2"><span className="material-symbols-outlined">add</span> Add Site</button>
              </div>
              <Button variant="primary" size="lg" className="w-full mt-6" onClick={handleSitesComplete}>Continue</Button>
            </motion.div>
          )}
          {onboardingStep === 'add-materials' && (
            <motion.div key="add-materials" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-surface p-8 rounded-2xl border border-border">
              <h2 className="text-2xl font-bold text-text-main mb-2">Add Materials</h2>
              <p className="text-text-muted mb-6">Products you deal in (optional)</p>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {materials.map((mat, i) => (
                  <div key={i} className="p-4 bg-surface-hover rounded-xl border border-border">
                    <input type="text" className="w-full bg-transparent border-b border-border pb-2 mb-3 text-lg font-medium focus:outline-none focus:border-primary" placeholder="Material name" value={mat.name} onChange={e => updateMaterial(i, 'name', e.target.value)} />
                    <div className="flex gap-3">
                      <select className="flex-1 h-10 bg-surface rounded-lg text-sm" value={mat.unit} onChange={e => updateMaterial(i, 'unit', e.target.value)}>
                        <option value="brass">Brass</option>
                        <option value="bag">Bag</option>
                        <option value="piece">Piece</option>
                        <option value="kg">KG</option>
                        <option value="tonnes">Tonnes</option>
                      </select>
                      <input type="text" className="flex-1 h-10 bg-surface rounded-lg text-sm px-3" placeholder="Rate" value={mat.rate} onChange={e => updateMaterial(i, 'rate', e.target.value)} />
                      <button onClick={() => setMaterials(materials.filter((_, idx) => idx !== i))} className="text-error"><span className="material-symbols-outlined">delete</span></button>
                    </div>
                  </div>
                ))}
                <button onClick={addMaterial} className="w-full p-4 border-2 border-dashed border-border rounded-xl text-text-muted hover:border-accent hover:text-accent transition-colors flex items-center justify-center gap-2"><span className="material-symbols-outlined">add</span> Add Material</button>
              </div>
              <Button variant="primary" size="lg" className="w-full mt-6" onClick={handleMaterialsComplete}>Continue</Button>
            </motion.div>
          )}
          {onboardingStep === 'add-vehicles' && (
            <motion.div key="add-vehicles" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-surface p-8 rounded-2xl border border-border">
              <h2 className="text-2xl font-bold text-text-main mb-2">Add Vehicles</h2>
              <p className="text-text-muted mb-6">Your fleet (optional)</p>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {vehicles.map((veh, i) => (
                  <div key={i} className="p-4 bg-surface-hover rounded-xl border border-border">
                    <input type="text" className="w-full bg-transparent border-b border-border pb-2 mb-3 text-lg font-medium focus:outline-none focus:border-primary" placeholder="Vehicle name" value={veh.name} onChange={e => updateVehicle(i, 'name', e.target.value)} />
                    <div className="flex gap-3 flex-wrap">
                      <select className="h-10 bg-surface rounded-lg text-sm" value={veh.type} onChange={e => updateVehicle(i, 'type', e.target.value)}>
                        <option value="hywa">Hywa (4-6 brass)</option>
                        <option value="709">Tata 709 (2 brass)</option>
                        <option value="chanchat">Chanchat (1 brass)</option>
                      </select>
                      <input type="text" className="h-10 bg-surface rounded-lg text-sm px-3 flex-1" placeholder="MH-XX-XXXX" value={veh.registration} onChange={e => updateVehicle(i, 'registration', e.target.value)} />
                      <button onClick={() => setVehicles(vehicles.filter((_, idx) => idx !== i))} className="text-error"><span className="material-symbols-outlined">delete</span></button>
                    </div>
                  </div>
                ))}
                <button onClick={addVehicle} className="w-full p-4 border-2 border-dashed border-border rounded-xl text-text-muted hover:border-accent hover:text-accent transition-colors flex items-center justify-center gap-2"><span className="material-symbols-outlined">add</span> Add Vehicle</button>
              </div>
              <Button variant="primary" size="lg" className="w-full mt-6" onClick={handleComplete}>Complete Setup</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
