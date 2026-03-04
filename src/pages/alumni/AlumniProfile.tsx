import { useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function AlumniProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '09123456789',
    program: user?.program || '',
    batch: user?.batchYear || 2023,
    address: 'Manila, Philippines',
    employmentStatus: 'Employed',
    company: 'Tech Solutions Inc.',
    position: 'Junior Developer',
    industry: 'Technology',
  });

  const handleSave = () => {
    toast({ title: 'Profile Updated', description: 'Your profile has been saved. If you changed employment info, results will refresh.' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">My Profile</h1>
          <p className="text-muted-foreground text-sm">View and update your personal information</p>
        </div>
        <Button onClick={handleSave} className="gap-1"><Save className="h-4 w-4" /> Save Changes</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-display font-semibold">Academic Information</h3>
          <div><Label>Student ID</Label><Input className="mt-1.5" value={user?.id} disabled /></div>
          <div><Label>Full Name</Label><Input className="mt-1.5" value={profile.name} disabled /></div>
          <div><Label>Program</Label><Input className="mt-1.5" value={profile.program} disabled /></div>
          <div><Label>Batch Year</Label><Input className="mt-1.5" value={String(profile.batch)} disabled /></div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <h3 className="font-display font-semibold">Contact Information</h3>
          <div><Label>Email</Label><Input className="mt-1.5" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} /></div>
          <div><Label>Phone</Label><Input className="mt-1.5" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} /></div>
          <div><Label>Address</Label><Input className="mt-1.5" value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} /></div>
        </div>

        <div className="glass-card p-6 space-y-4 lg:col-span-2">
          <h3 className="font-display font-semibold">Employment Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Employment Status</Label>
              <Select value={profile.employmentStatus} onValueChange={v => setProfile({ ...profile, employmentStatus: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Employed', 'Unemployed', 'Self-Employed', 'Freelancer', 'Further Studies'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Company</Label><Input className="mt-1.5" value={profile.company} onChange={e => setProfile({ ...profile, company: e.target.value })} /></div>
            <div><Label>Position</Label><Input className="mt-1.5" value={profile.position} onChange={e => setProfile({ ...profile, position: e.target.value })} /></div>
            <div><Label>Industry</Label><Input className="mt-1.5" value={profile.industry} onChange={e => setProfile({ ...profile, industry: e.target.value })} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
