import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Upload,
  MessageSquare,
  BarChart3,
  Settings,
  Clock,
  Building2,
  FileCheck,
  UserPlus,
  Book,
  Wallet,
  LogOut,
  Camera,
  Calendar,
  Database,
  FileText,
  ListTodo,
  Package,
  TrendingUp,
  UserMinus,
  Scale,
  Palmtree,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth, AppRole } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface MenuItem {
  icon: typeof LayoutDashboard;
  label: string;
  path: string;
  roles?: AppRole[];
}

const allMenuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Camera, label: 'Marcar Asistencia', path: '/virtual-attendance', roles: ['jefe_area', 'empleado'] },
  { icon: Calendar, label: 'Agenda', path: '/agenda' },
  { icon: Upload, label: 'Cargar Reporte', path: '/upload', roles: ['admin_rrhh'] },
  { icon: Users, label: 'Empleados', path: '/employees', roles: ['admin_rrhh', 'jefe_area'] },
  { icon: Database, label: 'Base de Personal', path: '/personnel-database', roles: ['admin_rrhh'] },
  { icon: Clock, label: 'Asistencia', path: '/attendance' },
  { icon: FileText, label: 'Justificaciones', path: '/justifications' },
  { icon: ListTodo, label: 'Tracker Tareas', path: '/task-tracker' },
  { icon: Building2, label: 'Departamentos', path: '/departments', roles: ['admin_rrhh', 'jefe_area'] },
  { icon: FileCheck, label: 'Contratos', path: '/contracts', roles: ['admin_rrhh', 'jefe_area'] },
  { icon: Wallet, label: 'Boletas de Pago', path: '/payroll' },
  { icon: UserPlus, label: 'Requerimientos', path: '/requirements', roles: ['admin_rrhh', 'jefe_area'] },
  { icon: TrendingUp, label: 'Rendimiento', path: '/performance', roles: ['admin_rrhh', 'jefe_area'] },
  { icon: Scale, label: 'Sanciones', path: '/sanctions', roles: ['admin_rrhh', 'jefe_area'] },
  { icon: Palmtree, label: 'Permisos/Vacaciones', path: '/leave-requests' },
  { icon: Package, label: 'Inventario', path: '/inventory', roles: ['admin_rrhh'] },
  { icon: UserMinus, label: 'Retiro Personal', path: '/termination', roles: ['admin_rrhh'] },
  { icon: MessageSquare, label: 'Mensajes', path: '/messages' },
  { icon: BarChart3, label: 'Reportes', path: '/reports', roles: ['admin_rrhh'] },
  { icon: Shield, label: 'Auditoría', path: '/audit-log', roles: ['admin_rrhh'] },
  { icon: Book, label: 'Reglamento', path: '/regulations' },
  { icon: Settings, label: 'Configuración', path: '/settings', roles: ['admin_rrhh'] },
];

const roleLabels: Record<AppRole, { label: string; color: string }> = {
  admin_rrhh: { label: 'Admin RRHH', color: 'bg-primary' },
  jefe_area: { label: 'Jefe de Área', color: 'bg-accent' },
  empleado: { label: 'Empleado', color: 'bg-muted' },
};

export function Sidebar() {
  const { user, userRole, signOut } = useAuth();

  const menuItems = allMenuItems.filter(item => {
    if (!item.roles) return true;
    if (!userRole) return false;
    return item.roles.includes(userRole.role);
  });

  const roleInfo = userRole ? roleLabels[userRole.role] : null;
  const initials = user ? `${user.nombres?.[0] || ''}${user.apellidos?.[0] || ''}`.toUpperCase() : 'U';

  return (
    <motion.aside 
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-0 h-screen w-[280px] bg-sidebar-background text-sidebar-foreground flex flex-col z-50"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-sidebar-foreground">AttendanceHub</h1>
            <p className="text-xs text-sidebar-foreground/60">Gestión de RRHH</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent/50">
          <Avatar className="h-10 w-10 border-2 border-sidebar-primary/30">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.nombres} {user?.apellidos}
            </p>
            {roleInfo && (
              <Badge className={cn("text-xs mt-1", roleInfo.color)}>
                {roleInfo.label}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-hide">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg'
                    : 'text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground/90 hover:text-destructive hover:bg-destructive/10"
          onClick={signOut}
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar Sesión</span>
        </Button>
      </div>
    </motion.aside>
  );
}
