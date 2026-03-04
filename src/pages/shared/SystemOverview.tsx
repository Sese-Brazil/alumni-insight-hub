import { useAuth } from '@/contexts/AuthContext';
import { KpiCard } from '@/components/KpiCard';
import { Users, TrendingUp, Target, GraduationCap } from 'lucide-react';

export default function SystemOverview() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <div className="glass-card p-8">
        <h1 className="text-2xl font-display font-bold mb-2">Welcome to the Alumni Employability Tracer System</h1>
        <p className="text-muted-foreground leading-relaxed">This system is designed to track, analyze, and predict the employability outcomes of university alumni. By collecting comprehensive data through tracer surveys, we generate actionable insights that help improve educational programs and career readiness.</p>
      </div>
      <div className="glass-card p-6">
        <h3 className="font-display font-semibold mb-2">Why Your Participation Matters</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">Your participation helps the university understand how well our programs prepare graduates for the workforce, identify areas of improvement, and provide data-driven career guidance to future alumni.</p>
      </div>
      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Total Alumni" value="1,703" icon={Users} delay={0} />
          <KpiCard title="Participation" value="78.3%" icon={Target} delay={0.1} />
          <KpiCard title="Employment" value="83.6%" icon={TrendingUp} delay={0.2} />
          <KpiCard title="Degree Alignment" value="74.2%" icon={GraduationCap} delay={0.3} />
        </div>
      )}
    </div>
  );
}
