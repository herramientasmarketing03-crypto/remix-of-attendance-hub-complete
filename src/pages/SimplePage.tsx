import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { MessageSquare, Upload, BarChart3, Settings, Wallet } from 'lucide-react';

const SimplePage = ({ title, subtitle, icon: Icon }: { title: string; subtitle: string; icon: any }) => (
  <MainLayout>
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground mb-6">{subtitle}</p>
    </motion.div>
    <Card className="glass-card"><CardHeader><CardTitle className="flex items-center gap-2"><Icon className="w-5 h-5 text-primary" />{title}</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Funcionalidad disponible próximamente.</p></CardContent></Card>
  </MainLayout>
);

export const MessagesPage = () => <SimplePage title="Mensajes" subtitle="Comunicación interna" icon={MessageSquare} />;
export const UploadPage = () => <SimplePage title="Cargar Reporte" subtitle="Subir archivos de asistencia" icon={Upload} />;
export const ReportsPage = () => <SimplePage title="Reportes" subtitle="Informes y estadísticas" icon={BarChart3} />;
export const SettingsPage = () => <SimplePage title="Configuración" subtitle="Ajustes del sistema" icon={Settings} />;
export const PayrollPage = () => <SimplePage title="Boletas de Pago" subtitle="Gestión de nómina" icon={Wallet} />;
