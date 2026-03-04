import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Upload, Eye, FileSpreadsheet, CheckCircle2, AlertCircle, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/StatusBadge';
import { alumniRecords, programs, batchYears } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [selectedAlumni, setSelectedAlumni] = useState<typeof alumniRecords[0] | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importStep, setImportStep] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();

  const filtered = alumniRecords.filter(a => {
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.id.includes(search)) return false;
    if (programFilter && programFilter !== 'all' && a.program !== programFilter) return false;
    if (batchFilter && batchFilter !== 'all' && a.batch !== parseInt(batchFilter)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">User Management</h1>
          <p className="text-muted-foreground text-sm">Manage alumni records and bulk import</p>
        </div>
        <Button onClick={() => { setShowImport(true); setImportStep(0); }} className="gap-2">
          <Upload className="h-4 w-4" /> Import Alumni
        </Button>
      </div>

      <div className="glass-card p-4">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name or ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={programFilter} onValueChange={setProgramFilter}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Programs" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Programs</SelectItem>
              {programs.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={batchFilter} onValueChange={setBatchFilter}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="All Years" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {batchYears.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Survey</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-sm">{a.id}</TableCell>
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell className="text-sm">{a.program}</TableCell>
                  <TableCell>{a.batch}</TableCell>
                  <TableCell><StatusBadge status={a.status} /></TableCell>
                  <TableCell><StatusBadge status={a.surveyStatus} /></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedAlumni(a)}><Eye className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Profile view modal */}
      <Dialog open={!!selectedAlumni} onOpenChange={() => setSelectedAlumni(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Alumni Profile</DialogTitle></DialogHeader>
          {selectedAlumni && (
            <div className="space-y-3">
              {[
                ['Student ID', selectedAlumni.id],
                ['Name', selectedAlumni.name],
                ['Program', selectedAlumni.program],
                ['Batch', selectedAlumni.batch],
                ['Email', selectedAlumni.email],
                ['Status', selectedAlumni.status],
                ['Survey', selectedAlumni.surveyStatus],
              ].map(([l, v]) => (
                <div key={l as string} className="flex justify-between py-2 border-b last:border-0">
                  <span className="text-sm text-muted-foreground">{l}</span>
                  <span className="text-sm font-medium">{String(v)}</span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Import dialog */}
      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle className="font-display">Import Alumni Data</DialogTitle></DialogHeader>
          {importStep === 0 && (
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-border'}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); setImportStep(1); }}
            >
              <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="font-medium mb-2">Drag & drop your Excel file here</p>
              <p className="text-sm text-muted-foreground mb-4">Accepts .xlsx and .csv files</p>
              <Button variant="outline" onClick={() => setImportStep(1)}>Browse Files</Button>
            </div>
          )}
          {importStep === 1 && (
            <div className="space-y-4">
              <p className="text-sm font-medium">Column Mapping Preview</p>
              <div className="rounded-lg border overflow-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>File Column</TableHead><TableHead>Maps To</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {['Student ID', 'Full Name', 'Program', 'Batch Year', 'Email'].map(col => (
                      <TableRow key={col}><TableCell>{col}</TableCell><TableCell className="text-primary font-medium">{col}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Button className="w-full" onClick={() => setImportStep(2)}>Preview Import <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </div>
          )}
          {importStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-success/10"><p className="text-2xl font-bold text-success">48</p><p className="text-xs text-muted-foreground">Success</p></div>
                <div className="p-3 rounded-lg bg-destructive/10"><p className="text-2xl font-bold text-destructive">2</p><p className="text-xs text-muted-foreground">Failed</p></div>
                <div className="p-3 rounded-lg bg-muted"><p className="text-2xl font-bold">50</p><p className="text-xs text-muted-foreground">Total</p></div>
              </div>
              <Button className="w-full" onClick={() => { setShowImport(false); toast({ title: 'Import Complete', description: '48 alumni records imported successfully.' }); }}>
                <CheckCircle2 className="h-4 w-4 mr-2" /> Confirm Import
              </Button>
              <Button variant="outline" className="w-full gap-2" size="sm"><AlertCircle className="h-4 w-4" /> Download Error Report</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
