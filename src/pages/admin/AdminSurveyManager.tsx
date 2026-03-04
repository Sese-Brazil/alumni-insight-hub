import { useState } from 'react';
import { Plus, Edit2, Trash2, GripVertical, Eye, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { surveyQuestions } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface Question {
  id: string;
  text: string;
  type: string;
  required: boolean;
  options?: string[];
  version: number;
}

export default function AdminSurveyManager() {
  const [categories, setCategories] = useState(surveyQuestions as any[]);
  const [editQ, setEditQ] = useState<Question | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newCat, setNewCat] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);
  const { toast } = useToast();

  const [newQ, setNewQ] = useState({ text: '', type: 'text', required: true, category: '' });

  const handleSave = () => {
    toast({ title: 'Survey Saved', description: 'Survey structure has been updated successfully.' });
  };

  const handleDeleteQ = (catId: string, qId: string) => {
    setCategories(prev => prev.map(c => c.id === catId ? { ...c, questions: c.questions.filter(q => q.id !== qId) } : c));
    toast({ title: 'Question Deleted' });
  };

  const handleAddCategory = () => {
    if (!newCat.trim()) return;
    setCategories(prev => [...prev, { id: `cat-${Date.now()}`, category: newCat, questions: [] }]);
    setNewCat('');
    setShowAddCat(false);
    toast({ title: 'Category Added' });
  };

  const handleAddQuestion = () => {
    if (!newQ.text || !newQ.category) return;
    setCategories(prev => prev.map(c => c.id === newQ.category ? {
      ...c,
      questions: [...c.questions, { id: `q-${Date.now()}`, text: newQ.text, type: newQ.type as any, required: newQ.required, version: 2 }]
    } : c));
    setShowAdd(false);
    setNewQ({ text: '', type: 'text', required: true, category: '' });
    toast({ title: 'Question Added' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Tracer Survey Manager</h1>
          <p className="text-muted-foreground text-sm">Manage survey sections and questions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAddCat(true)}>Add Category</Button>
          <Button variant="outline" onClick={() => setShowAdd(true)} className="gap-1"><Plus className="h-4 w-4" /> Add Question</Button>
          <Button onClick={handleSave} className="gap-1"><Save className="h-4 w-4" /> Save</Button>
        </div>
      </div>

      <Accordion type="multiple" defaultValue={categories.map(c => c.id)}>
        {categories.map(cat => (
          <AccordionItem key={cat.id} value={cat.id} className="glass-card mb-3 overflow-hidden border">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <span className="font-display font-semibold">{cat.category}</span>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{cat.questions.length} questions</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <div className="space-y-2">
                {cat.questions.map((q, i) => (
                  <div key={q.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 group">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    <span className="text-sm flex-1">{q.text}</span>
                    <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded">{q.type}</span>
                    {q.required && <span className="text-xs text-primary font-medium">Required</span>}
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => setEditQ(q)}><Edit2 className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => handleDeleteQ(cat.id, q.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                ))}
                {cat.questions.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No questions in this category yet.</p>}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Add question dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Add Question</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Category</Label>
              <Select value={newQ.category} onValueChange={v => setNewQ({ ...newQ, category: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.category}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Question Text</Label><Input className="mt-1.5" value={newQ.text} onChange={e => setNewQ({ ...newQ, text: e.target.value })} /></div>
            <div><Label>Type</Label>
              <Select value={newQ.type} onValueChange={v => setNewQ({ ...newQ, type: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['text', 'select', 'scale', 'number', 'checkbox', 'dropdown'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2"><Switch checked={newQ.required} onCheckedChange={v => setNewQ({ ...newQ, required: v })} /><Label>Required</Label></div>
          </div>
          <DialogFooter><Button onClick={handleAddQuestion}>Add Question</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add category dialog */}
      <Dialog open={showAddCat} onOpenChange={setShowAddCat}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Add Category</DialogTitle></DialogHeader>
          <div><Label>Category Name</Label><Input className="mt-1.5" value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="e.g., Work Environment" /></div>
          <DialogFooter><Button onClick={handleAddCategory}>Add Category</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editQ} onOpenChange={() => setEditQ(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Edit Question</DialogTitle></DialogHeader>
          {editQ && (
            <div className="space-y-4">
              <div><Label>Question Text</Label><Input className="mt-1.5" value={editQ.text} onChange={e => setEditQ({ ...editQ, text: e.target.value })} /></div>
              <div className="flex items-center gap-2"><Switch checked={editQ.required} onCheckedChange={v => setEditQ({ ...editQ, required: v })} /><Label>Required</Label></div>
            </div>
          )}
          <DialogFooter><Button onClick={() => { setEditQ(null); toast({ title: 'Question Updated' }); }}>Save Changes</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
