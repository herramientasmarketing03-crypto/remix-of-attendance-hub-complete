import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { motion } from 'framer-motion';
import { Book } from 'lucide-react';
import { mockRegulations } from '@/data/mockData';

const RegulationsPage = () => (
  <MainLayout>
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-bold mb-2">Reglamento Interno</h1>
      <p className="text-muted-foreground mb-6">Normativas y políticas de la empresa</p>
    </motion.div>
    <Card className="glass-card">
      <CardHeader><CardTitle className="flex items-center gap-2"><Book className="w-5 h-5 text-primary" />Artículos del Reglamento</CardTitle></CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {mockRegulations.map((article) => (
            <AccordionItem key={article.number} value={article.number}>
              <AccordionTrigger className="text-left"><span className="font-semibold mr-2">{article.number}</span>{article.title}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{article.content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  </MainLayout>
);
export default RegulationsPage;
