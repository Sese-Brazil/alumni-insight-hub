import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { submissionHistory, surveyQuestions } from '@/data/mockData';
import { useState } from 'react';

export default function AlumniSubmissions() {
  const [viewSub, setViewSub] = useState<typeof submissionHistory[0] | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">My Submissions</h1>
        <p className="text-muted-foreground text-sm">View your past tracer survey submissions (read-only)</p>
      </div>

      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissionHistory.map(s => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.date}</TableCell>
                <TableCell>{s.version}</TableCell>
                <TableCell>{s.questionsAnswered}</TableCell>
                <TableCell><StatusBadge status={s.status} /></TableCell>
                <TableCell><Button variant="ghost" size="sm" onClick={() => setViewSub(s)}><Eye className="h-4 w-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!viewSub} onOpenChange={() => setViewSub(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">Submission Details — {viewSub?.version}</DialogTitle></DialogHeader>
          {viewSub && (
            <div className="space-y-4">
              <div className="flex justify-between text-sm border-b pb-2">
                <span className="text-muted-foreground">Submitted</span>
                <span className="font-medium">{viewSub.date}</span>
              </div>
              <div className="flex justify-between text-sm border-b pb-2">
                <span className="text-muted-foreground">Questions Answered</span>
                <span className="font-medium">{viewSub.questionsAnswered}</span>
              </div>
              <div>
                <p className="text-sm font-semibold mb-2">Sections covered:</p>
                {surveyQuestions.map(s => (
                  <p key={s.id} className="text-sm text-muted-foreground">• {s.category} ({s.questions.length} questions)</p>
                ))}
              </div>
              <p className="text-xs text-muted-foreground italic">Read-only view. Past submissions cannot be edited.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
