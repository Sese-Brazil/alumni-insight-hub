import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Loader2, CheckCircle2, ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

const STEPS = ['Identity', 'Verification', 'Credentials', 'OTP Sent', 'Confirm OTP'];

export default function ActivationPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [fullName, setFullName] = useState('');
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'found' | 'not_found' | 'already'>('idle');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);

  const progress = ((step + 1) / STEPS.length) * 100;

  const passwordStrength = () => {
    if (password.length < 4) return { label: 'Weak', pct: 25, color: 'bg-destructive' };
    if (password.length < 8) return { label: 'Fair', pct: 50, color: 'bg-warning' };
    if (/[A-Z]/.test(password) && /\d/.test(password)) return { label: 'Strong', pct: 100, color: 'bg-success' };
    return { label: 'Good', pct: 75, color: 'bg-info' };
  };

  const handleVerify = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    if (studentId === '23-00240') setVerifyStatus('already');
    else if (studentId.match(/^\d{2}-\d{5}$/)) setVerifyStatus('found');
    else setVerifyStatus('not_found');
    setLoading(false);
  };

  const handleSendOtp = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setStep(3);
    startCooldown();
  };

  const startCooldown = () => {
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown(p => { if (p <= 1) { clearInterval(timer); return 0; } return p - 1; });
    }, 1000);
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setStep(4);
  };

  const handleOtpChange = (idx: number, val: string) => {
    if (val.length > 1) return;
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < 5) {
      const next = document.getElementById(`otp-${idx + 1}`);
      next?.focus();
    }
  };

  const maskedEmail = email ? email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : '';

  const stepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div><Label>Student ID Number</Label><Input placeholder="e.g. 24-00100" value={studentId} onChange={e => setStudentId(e.target.value)} className="mt-1.5" /></div>
            <div><Label>Full Name</Label><Input placeholder="Juan Dela Cruz" value={fullName} onChange={e => setFullName(e.target.value)} className="mt-1.5" /></div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => navigate('/login')}>Cancel</Button>
              <Button className="flex-1" disabled={!studentId || !fullName} onClick={() => { setStep(1); handleVerify(); }}>Next <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            {loading && <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /><p className="text-sm text-muted-foreground mt-3">Checking alumni record…</p></div>}
            {!loading && verifyStatus === 'found' && (
              <div className="text-center py-6">
                <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-3" />
                <p className="font-semibold text-lg">Alumni Record Found!</p>
                <p className="text-muted-foreground text-sm mt-1">Welcome, {fullName}. Proceed to set up your account.</p>
                <Button className="mt-6 w-full" onClick={() => setStep(2)}>Continue <ArrowRight className="h-4 w-4 ml-1" /></Button>
              </div>
            )}
            {!loading && verifyStatus === 'not_found' && (
              <div className="text-center py-6">
                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3"><span className="text-2xl">❌</span></div>
                <p className="font-semibold text-lg">Record Not Found</p>
                <p className="text-muted-foreground text-sm mt-1">No alumni record matches your Student ID. Please contact the registrar office.</p>
                <Button variant="outline" className="mt-6" onClick={() => { setStep(0); setVerifyStatus('idle'); }}>
                  <ArrowLeft className="h-4 w-4 mr-1" /> Go Back
                </Button>
              </div>
            )}
            {!loading && verifyStatus === 'already' && (
              <div className="text-center py-6">
                <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-3"><span className="text-2xl">⚠️</span></div>
                <p className="font-semibold text-lg">Already Activated</p>
                <p className="text-muted-foreground text-sm mt-1">This student ID has an existing account. Please log in instead.</p>
                <Button className="mt-6" onClick={() => navigate('/login')}>Go to Login</Button>
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div><Label>Personal Email</Label><Input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} className="mt-1.5" /></div>
            <div>
              <Label>Password</Label>
              <div className="relative mt-1.5">
                <Input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Create password" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
              {password && (
                <div className="mt-2">
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className={`h-full rounded-full transition-all ${passwordStrength().color}`} style={{ width: `${passwordStrength().pct}%` }} /></div>
                  <p className="text-xs text-muted-foreground mt-1">Strength: {passwordStrength().label}</p>
                </div>
              )}
            </div>
            <div><Label>Confirm Password</Label><Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter password" className="mt-1.5" /></div>
            {confirmPassword && password !== confirmPassword && <p className="text-xs text-destructive">Passwords do not match</p>}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep(0)}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
              <Button className="flex-1" disabled={!email || !password || password !== confirmPassword || password.length < 4} onClick={handleSendOtp}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Send OTP <ArrowRight className="h-4 w-4 ml-1" /></>}
              </Button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 text-center">
            <div className="p-4 rounded-xl bg-muted/50 inline-block"><span className="text-3xl">📧</span></div>
            <p className="font-semibold text-lg">OTP Sent!</p>
            <p className="text-muted-foreground text-sm">We've sent a verification code to <strong>{maskedEmail}</strong></p>
            <div className="flex gap-2 justify-center my-6">
              {otp.map((d, i) => (
                <Input key={i} id={`otp-${i}`} maxLength={1} value={d} onChange={e => handleOtpChange(i, e.target.value)} className="w-12 h-12 text-center text-lg font-bold" />
              ))}
            </div>
            <Button className="w-full" disabled={otp.some(d => !d)} onClick={handleVerifyOtp}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify & Activate'}
            </Button>
            <div className="flex justify-center gap-4 text-sm">
              <button disabled={resendCooldown > 0} onClick={() => { startCooldown(); }} className="text-primary hover:underline disabled:text-muted-foreground disabled:no-underline">
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
              </button>
              <button onClick={() => setStep(2)} className="text-muted-foreground hover:text-foreground">Change email</button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="text-center py-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
              <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
            </motion.div>
            <h3 className="text-2xl font-display font-bold mb-2">Account Activated!</h3>
            <p className="text-muted-foreground mb-8">Your account has been successfully activated. You can now log in.</p>
            <Button size="lg" className="w-full font-semibold" onClick={() => navigate('/login')}>Proceed to Login <ArrowRight className="h-4 w-4 ml-1" /></Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <div className="glass-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-primary/10"><GraduationCap className="h-6 w-6 text-primary" /></div>
            <span className="font-display font-bold">Account Activation</span>
          </div>

          {step < 4 && (
            <div className="mb-6">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                {STEPS.map((s, i) => (
                  <span key={i} className={i <= step ? 'text-primary font-medium' : ''}>{s}</span>
                ))}
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              {stepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="text-center mt-4">
          <button onClick={() => navigate('/')} className="text-sm text-muted-foreground hover:text-foreground">← Back to Home</button>
        </div>
      </motion.div>
    </div>
  );
}
