import { motion } from 'framer-motion';
import { ClipboardCheck, Briefcase, TrendingUp, AlertTriangle } from 'lucide-react';
import { KpiCard } from '@/components/KpiCard';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function AlumniDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <h1 className="text-2xl font-display font-bold mb-1">Welcome back, {user?.name}! 👋</h1>
        <p className="text-muted-foreground">Here's a summary of your tracer profile</p>
      </motion.div>

      {!user?.surveyCompleted && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl bg-warning/10 border border-warning/20 flex items-center gap-4 flex-wrap">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold">Tracer Survey Pending</p>
            <p className="text-xs text-muted-foreground">Please complete the tracer survey to receive your results and job recommendations.</p>
          </div>
          <Button size="sm" onClick={() => navigate('/app/alumni/survey')}>Take Survey</Button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard title="Survey Status" value={user?.surveyCompleted ? 'Completed' : 'Pending'} icon={ClipboardCheck} delay={0} />
        <KpiCard title="Employment Status" value="Employed" icon={Briefcase} subtitle="Updated Dec 2024" delay={0.1} />
        <KpiCard title="Readiness Score" value="82%" icon={TrendingUp} subtitle="Based on latest survey" delay={0.2} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/app/alumni/profile')}>📝 Update My Profile</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/app/alumni/results')}>📊 View Results & Jobs</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/app/alumni/submissions')}>📋 View Submissions</Button>
          </div>
        </div>
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold mb-3">Latest Submission</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium">September 20, 2024</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Version</span><span className="font-medium">v1.1</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Questions Answered</span><span className="font-medium">14</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-medium text-success">Completed</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
