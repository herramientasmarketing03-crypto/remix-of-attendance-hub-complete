import { MainLayout } from '@/components/layout/MainLayout';
import { VirtualAttendance } from '@/components/attendance/VirtualAttendance';
import { motion } from 'framer-motion';

const VirtualAttendancePage = () => {
  return (
    <MainLayout>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-2">Marcar Asistencia Virtual</h1>
        <p className="text-muted-foreground mb-6">Registra tu entrada y salida con evidencia fotográfica</p>
      </motion.div>
      <div className="max-w-2xl">
        <VirtualAttendance />
      </div>
    </MainLayout>
  );
};

export default VirtualAttendancePage;
