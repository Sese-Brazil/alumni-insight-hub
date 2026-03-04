import { useState } from 'react';
import { Save, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function AlumniChangePassword() {
  const [current, setCurrent] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const { toast } = useToast();

  const strength = () => {
    if (newPw.length < 4) return { label: 'Weak', pct: 25, color: 'bg-destructive' };
    if (newPw.length < 8) return { label: 'Fair', pct: 50, color: 'bg-warning' };
    if (/[A-Z]/.test(newPw) && /\d/.test(newPw)) return { label: 'Strong', pct: 100, color: 'bg-success' };
    return { label: 'Good', pct: 75, color: 'bg-info' };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirm) { toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' }); return; }
    if (newPw.length < 4) { toast({ title: 'Error', description: 'Password too short', variant: 'destructive' }); return; }
    toast({ title: 'Password Changed', description: 'Your password has been updated successfully.' });
    setCurrent(''); setNewPw(''); setConfirm('');
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Change Password</h1>
        <p className="text-muted-foreground text-sm">Update your account password</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
        <div>
          <Label>Current Password</Label>
          <div className="relative mt-1.5">
            <Input type={showCurrent ? 'text' : 'password'} value={current} onChange={e => setCurrent(e.target.value)} />
            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div>
          <Label>New Password</Label>
          <div className="relative mt-1.5">
            <Input type={showNew ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)} />
            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {newPw && (
            <div className="mt-2">
              <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className={`h-full rounded-full transition-all ${strength().color}`} style={{ width: `${strength().pct}%` }} /></div>
              <p className="text-xs text-muted-foreground mt-1">Strength: {strength().label}</p>
            </div>
          )}
        </div>
        <div>
          <Label>Confirm New Password</Label>
          <Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className="mt-1.5" />
          {confirm && newPw !== confirm && <p className="text-xs text-destructive mt-1">Passwords do not match</p>}
        </div>
        <Button type="submit" className="w-full gap-1"><Save className="h-4 w-4" /> Update Password</Button>
      </form>
    </div>
  );
}
