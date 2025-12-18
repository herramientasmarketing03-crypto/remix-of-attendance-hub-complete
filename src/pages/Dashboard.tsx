import { MainLayout } from '@/components/layout/MainLayout';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { JefeDashboard } from '@/components/dashboard/JefeDashboard';
import { EmpleadoDashboard } from '@/components/dashboard/EmpleadoDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { userRole, loading, isAdmin, isJefe, isEmpleado } = useAuth();

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {isAdmin && <AdminDashboard />}
      {isJefe && <JefeDashboard />}
      {isEmpleado && <EmpleadoDashboard />}
      {!userRole && <AdminDashboard />}
    </MainLayout>
  );
};

export default Dashboard;
