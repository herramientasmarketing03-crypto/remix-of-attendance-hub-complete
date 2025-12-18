import { useState } from 'react';
import { motion } from 'framer-motion';
import { Book, Search, FileText, Clock, AlertTriangle, Users, Shield, Calendar, Briefcase } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { mockRegulations } from '@/data/mockData';

const categories = [
  { id: 'all', name: 'Todos', icon: Book },
  { id: 'jornada', name: 'Jornada', icon: Clock },
  { id: 'ausencias', name: 'Ausencias', icon: Calendar },
  { id: 'faltas_sanciones', name: 'Faltas', icon: AlertTriangle },
];

const infractionsData = {
  leves: ['Llegar tarde sin autorización', 'Uso de celulares para fines no laborables', 'No usar uniforme', 'No marcar asistencia', 'Demora en servicios higiénicos'],
  graves: ['Disminución intencional del trabajo', 'Incumplimiento de actividades', 'Dormir en horario laboral', 'Perjudicar ambiente laboral'],
  muy_graves: ['Alterar registros de asistencia', 'Marcar asistencia de otro', 'Presentarse en estado de embriaguez', 'Faltar al respeto', 'Falsificar documentos'],
};

const RegulationsPage = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredRegulations = mockRegulations.filter(reg => {
    const matchesSearch = reg.title.toLowerCase().includes(search.toLowerCase()) || reg.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || reg.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold">Reglamento Interno</h1>
          <p className="text-muted-foreground">Normativa Laboral</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{ icon: Clock, label: 'Jornada', value: '48h' }, { icon: Calendar, label: 'Vacaciones', value: '15 días' }, { icon: Briefcase, label: 'Prueba', value: '3 meses' }, { icon: FileText, label: 'Refrigerio', value: '60 min' }].map((stat, i) => (
            <Card key={i} className="glass-card"><CardContent className="pt-6 flex items-center gap-4"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><stat.icon className="w-5 h-5 text-primary" /></div><div><p className="text-xs text-muted-foreground">{stat.label}</p><p className="text-xl font-bold">{stat.value}</p></div></CardContent></Card>
          ))}
        </div>

        <Tabs defaultValue="articles" className="space-y-4">
          <TabsList><TabsTrigger value="articles">Artículos</TabsTrigger><TabsTrigger value="infractions">Infracciones</TabsTrigger><TabsTrigger value="schedule">Horarios</TabsTrigger></TabsList>

          <TabsContent value="articles" className="space-y-4">
            <div className="flex gap-4"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" /></div></div>
            <div className="flex gap-2">{categories.map(cat => <Badge key={cat.id} variant={activeCategory === cat.id ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setActiveCategory(cat.id)}><cat.icon className="w-3 h-3 mr-1" />{cat.name}</Badge>)}</div>
            <Card className="glass-card"><CardContent className="pt-6"><Accordion type="multiple">{filteredRegulations.map(reg => <AccordionItem key={reg.number} value={reg.number}><AccordionTrigger><Badge variant="secondary" className="mr-2">{reg.number}</Badge>{reg.title}</AccordionTrigger><AccordionContent className="text-muted-foreground pl-16">{reg.content}</AccordionContent></AccordionItem>)}</Accordion></CardContent></Card>
          </TabsContent>

          <TabsContent value="infractions">
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="border-warning/30"><CardHeader><CardTitle className="text-warning flex items-center gap-2"><AlertTriangle className="w-5 h-5" />Faltas Leves</CardTitle></CardHeader><CardContent><ul className="space-y-1 text-sm">{infractionsData.leves.map((i,x) => <li key={x} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-warning mt-2" />{i}</li>)}</ul></CardContent></Card>
              <Card className="border-orange-500/30"><CardHeader><CardTitle className="text-orange-500 flex items-center gap-2"><AlertTriangle className="w-5 h-5" />Faltas Graves</CardTitle></CardHeader><CardContent><ul className="space-y-1 text-sm">{infractionsData.graves.map((i,x) => <li key={x} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2" />{i}</li>)}</ul></CardContent></Card>
              <Card className="border-destructive/30"><CardHeader><CardTitle className="text-destructive flex items-center gap-2"><AlertTriangle className="w-5 h-5" />Faltas Muy Graves</CardTitle></CardHeader><CardContent><ul className="space-y-1 text-sm">{infractionsData.muy_graves.map((i,x) => <li key={x} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-destructive mt-2" />{i}</li>)}</ul></CardContent></Card>
            </div>
          </TabsContent>

          <TabsContent value="schedule">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="glass-card"><CardHeader><CardTitle>Horario (Art. 19)</CardTitle></CardHeader><CardContent className="space-y-3"><div className="p-3 rounded bg-primary/5"><p className="font-semibold">Lun-Vie: 09:00-13:00 / 14:00-18:00</p></div><div className="p-3 rounded bg-muted/30"><p className="font-semibold">Sáb: 09:00-13:00</p></div></CardContent></Card>
              <Card className="glass-card"><CardHeader><CardTitle>Licencias con Goce</CardTitle></CardHeader><CardContent><div className="grid grid-cols-2 gap-2 text-sm">{['Enfermedad', 'Maternidad', 'Fallecimiento (3-6 días)', 'Capacitación', 'Citación judicial', 'Vacaciones (15 días)'].map((l,i) => <div key={i} className="p-2 rounded bg-muted/30">{l}</div>)}</div></CardContent></Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default RegulationsPage;
