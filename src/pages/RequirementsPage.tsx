import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';

const RequirementsPage = () => (
  <MainLayout>
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-bold mb-2">Requerimientos de Personal</h1>
      <p className="text-muted-foreground mb-6">Solicitudes de nuevo personal</p>
    </motion.div>
    <Card className="glass-card"><CardHeader><CardTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5 text-primary" />Requerimientos</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Funcionalidad de requerimientos disponible próximamente.</p></CardContent></Card>
  </MainLayout>
);
export default RequirementsPage;
