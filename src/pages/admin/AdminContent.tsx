import { useState } from 'react';
import { Save, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

export default function AdminContent() {
  const { toast } = useToast();
  const [overviewContent, setOverviewContent] = useState({
    welcome: 'Welcome to the Alumni Employability Tracer System',
    purpose: 'This system is designed to track, analyze, and predict the employability outcomes of university alumni. By collecting comprehensive data through tracer surveys, we generate actionable insights that help improve educational programs and career readiness.',
    importance: 'Your participation helps the university understand how well our programs prepare graduates for the workforce, identify areas of improvement, and provide data-driven career guidance to future alumni.',
  });

  const [helpContent, setHelpContent] = useState({
    howItWorks: 'The tracer system collects employment data from alumni through structured surveys. This data is analyzed using statistical models and machine learning algorithms to identify trends and predict future outcomes.',
    privacy: 'All data is collected and processed in compliance with the Data Privacy Act of 2012. Personal information is anonymized in analytics and never shared with third parties.',
  });

  const [faqs, setFaqs] = useState([
    { q: 'How often should I update my survey?', a: 'We recommend updating your information whenever your employment status changes.' },
    { q: 'Can I view other alumni data?', a: 'No, individual data is confidential. Only aggregated and anonymized statistics are available.' },
    { q: 'How are job recommendations generated?', a: 'Recommendations are based on your skills assessment, degree, and employment history using machine learning models.' },
  ]);

  const handleSave = () => {
    toast({ title: 'Content Saved', description: 'All changes have been saved successfully.' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Content Manager</h1>
          <p className="text-muted-foreground text-sm">Edit system pages and content blocks</p>
        </div>
        <Button onClick={handleSave} className="gap-1"><Save className="h-4 w-4" /> Save All</Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="help">Help / Guide</TabsTrigger>
          <TabsTrigger value="faq">FAQs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="glass-card p-6 space-y-4">
            <div><Label>Welcome Title</Label><Input className="mt-1.5" value={overviewContent.welcome} onChange={e => setOverviewContent({ ...overviewContent, welcome: e.target.value })} /></div>
            <div><Label>System Purpose</Label><Textarea className="mt-1.5 min-h-[100px]" value={overviewContent.purpose} onChange={e => setOverviewContent({ ...overviewContent, purpose: e.target.value })} /></div>
            <div><Label>Importance of Participation</Label><Textarea className="mt-1.5 min-h-[100px]" value={overviewContent.importance} onChange={e => setOverviewContent({ ...overviewContent, importance: e.target.value })} /></div>
          </div>
        </TabsContent>

        <TabsContent value="help" className="space-y-4 mt-4">
          <div className="glass-card p-6 space-y-4">
            <div><Label>How It Works</Label><Textarea className="mt-1.5 min-h-[100px]" value={helpContent.howItWorks} onChange={e => setHelpContent({ ...helpContent, howItWorks: e.target.value })} /></div>
            <div><Label>Data Privacy Statement</Label><Textarea className="mt-1.5 min-h-[100px]" value={helpContent.privacy} onChange={e => setHelpContent({ ...helpContent, privacy: e.target.value })} /></div>
          </div>
        </TabsContent>

        <TabsContent value="faq" className="space-y-4 mt-4">
          <div className="glass-card p-6 space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="p-4 rounded-lg border space-y-2">
                <div><Label>Question</Label><Input className="mt-1" value={faq.q} onChange={e => { const f = [...faqs]; f[i].q = e.target.value; setFaqs(f); }} /></div>
                <div><Label>Answer</Label><Textarea className="mt-1" value={faq.a} onChange={e => { const f = [...faqs]; f[i].a = e.target.value; setFaqs(f); }} /></div>
              </div>
            ))}
            <Button variant="outline" onClick={() => setFaqs([...faqs, { q: '', a: '' }])}>+ Add FAQ</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
