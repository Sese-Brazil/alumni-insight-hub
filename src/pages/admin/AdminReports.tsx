import { useState } from 'react';
import { FileText, Download, FileSpreadsheet, Table2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GlobalFilterBar, FilterState, defaultFilters } from '@/components/GlobalFilterBar';
import { alumniPerProgram } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const reportTypes = [
  'Alumni per Program',
  'Employment Trends',
  'Participation Rate',
  'Degree Alignment',
  'Skills Assessment Summary',
];

export default function AdminReports() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [reportType, setReportType] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const handleGenerate = () => {
    setShowPreview(true);
    toast({ title: 'Report Generated', description: 'Preview ready. Choose export format to download.' });
  };

  const handleExport = (format: string) => {
    toast({ title: `Exporting as ${format}`, description: 'Your download will start shortly.' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Report Generation</h1>
        <p className="text-muted-foreground text-sm">Generate and export analytical reports</p>
      </div>

      <div className="glass-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Report Type</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger><SelectValue placeholder="Select report type" /></SelectTrigger>
              <SelectContent>
                {reportTypes.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleGenerate} disabled={!reportType} className="gap-2"><FileText className="h-4 w-4" /> Generate Report</Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExport('Excel')} className="gap-1"><FileSpreadsheet className="h-4 w-4" /> Excel</Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('CSV')} className="gap-1"><Table2 className="h-4 w-4" /> CSV</Button>
          </div>
        </div>
      </div>

      <GlobalFilterBar filters={filters} onFiltersChange={setFilters} />

      {showPreview && (
        <div className="glass-card p-6 animate-fade-in">
          <h3 className="font-display font-semibold mb-4">Data Preview — {reportType}</h3>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Program</TableHead>
                  <TableHead>Total Alumni</TableHead>
                  <TableHead>Employed</TableHead>
                  <TableHead>Employment Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alumniPerProgram.map(r => (
                  <TableRow key={r.program}>
                    <TableCell className="font-medium">{r.program}</TableCell>
                    <TableCell>{r.count}</TableCell>
                    <TableCell>{r.employed}</TableCell>
                    <TableCell>{r.rate}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
