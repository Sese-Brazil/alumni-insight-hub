import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Save, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { surveyQuestions } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function AlumniSurvey() {
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showReview, setShowReview] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { completeSurvey } = useAuth();
  const { toast } = useToast();

  const sections = surveyQuestions;
  const section = sections[currentSection];
  const progress = ((currentSection + 1) / sections.length) * 100;

  const setAnswer = (qId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = () => {
    setShowReview(false);
    setSubmitted(true);
    completeSurvey();
    toast({ title: 'Survey Submitted!', description: 'Thank you for completing the tracer survey.' });
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
        </motion.div>
        <h2 className="text-2xl font-display font-bold mb-2">Survey Submitted!</h2>
        <p className="text-muted-foreground mb-6">Your responses have been recorded. You can now view your results and job recommendations.</p>
        <Button onClick={() => window.location.href = '/app/alumni/results'}>View My Results</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Tracer Survey</h1>
        <p className="text-muted-foreground text-sm">Complete all sections to submit your survey</p>
      </div>

      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Section {currentSection + 1} of {sections.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <motion.div key={currentSection} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6">
        <h3 className="font-display font-semibold text-lg mb-6">{section.category}</h3>
        <div className="space-y-6">
          {section.questions.map(q => (
            <div key={q.id}>
              <Label className="mb-2 block">
                {q.text} {q.required && <span className="text-destructive">*</span>}
              </Label>
              {q.type === 'select' && q.options && (
                <Select value={answers[q.id] || ''} onValueChange={v => setAnswer(q.id, v)}>
                  <SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger>
                  <SelectContent>{q.options.map((o: string) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              )}
              {q.type === 'text' && <Input value={answers[q.id] || ''} onChange={e => setAnswer(q.id, e.target.value)} />}
              {q.type === 'number' && <Input type="number" value={answers[q.id] || ''} onChange={e => setAnswer(q.id, e.target.value)} />}
              {q.type === 'scale' && (
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">1</span>
                  <Slider value={[answers[q.id] || 5]} onValueChange={v => setAnswer(q.id, v[0])} min={1} max={10} step={1} className="flex-1" />
                  <span className="text-xs text-muted-foreground">10</span>
                  <span className="text-sm font-bold w-8 text-center">{answers[q.id] || 5}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-8">
          <Button variant="outline" disabled={currentSection === 0} onClick={() => setCurrentSection(p => p - 1)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          {currentSection < sections.length - 1 ? (
            <Button onClick={() => setCurrentSection(p => p + 1)}>Next <ArrowRight className="h-4 w-4 ml-1" /></Button>
          ) : (
            <Button onClick={() => setShowReview(true)}>Review & Submit</Button>
          )}
        </div>
      </motion.div>

      <Dialog open={showReview} onOpenChange={setShowReview}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">Review Your Answers</DialogTitle></DialogHeader>
          <div className="max-h-80 overflow-auto space-y-3">
            {sections.map(s => (
              <div key={s.id}>
                <p className="font-semibold text-sm text-primary">{s.category}</p>
                {s.questions.map(q => (
                  <div key={q.id} className="flex justify-between py-1 text-sm border-b last:border-0">
                    <span className="text-muted-foreground">{q.text}</span>
                    <span className="font-medium">{answers[q.id] || '—'}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReview(false)}>Edit</Button>
            <Button onClick={handleSubmit}><Save className="h-4 w-4 mr-1" /> Submit Survey</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
