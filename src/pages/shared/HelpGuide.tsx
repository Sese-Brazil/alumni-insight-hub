import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  { q: 'How often should I update my survey?', a: 'We recommend updating whenever your employment status changes.' },
  { q: 'Can I view other alumni data?', a: 'No, individual data is confidential. Only aggregated statistics are shown.' },
  { q: 'How are job recommendations generated?', a: 'Using machine learning models based on your skills, degree, and employment history.' },
  { q: 'Is my data safe?', a: 'Yes, all data is handled in compliance with the Data Privacy Act.' },
];

export default function HelpGuide() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div><h1 className="text-2xl font-display font-bold">Help / Guide</h1><p className="text-muted-foreground text-sm">Learn how the system works</p></div>
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-display font-semibold">How the Tracer System Works</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">The system collects employment data from alumni through structured surveys. This data is analyzed using statistical models and machine learning algorithms to identify trends, predict outcomes, and generate personalized job recommendations.</p>
      </div>
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-display font-semibold">How to Complete the Tracer Survey</h3>
        <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
          <li>Navigate to "Tracer Survey" from the sidebar</li>
          <li>Answer each section's questions honestly</li>
          <li>Review your answers before submitting</li>
          <li>View your results and job recommendations</li>
        </ol>
      </div>
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-display font-semibold">Data Privacy</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">All personal data is handled in strict compliance with the Data Privacy Act. Your information is used solely for employment tracking and institutional improvement. You can request data modification or deletion at any time.</p>
      </div>
      <div className="glass-card p-6">
        <h3 className="font-display font-semibold mb-4">Frequently Asked Questions</h3>
        <Accordion type="single" collapsible>
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-sm">{f.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
