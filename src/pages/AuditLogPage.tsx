import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Shield, 
  Search, 
  Download,
  RefreshCw,
  FileText,
  User,
  Calendar,
  Clock
} from 'lucide-react';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const ACTION_LABELS: Record<string, { label: string; className: string }> = {
  CREATE: { label: 'Crear', className: 'bg-success/10 text-success' },
  UPDATE: { label: 'Actualizar', className: 'bg-info/10 text-info' },
  DELETE: { label: 'Eliminar', className: 'bg-destructive/10 text-destructive' },
  APPROVE: { label: 'Aprobar', className: 'bg-success/10 text-success' },
  REJECT: { label: 'Rechazar', className: 'bg-destructive/10 text-destructive' },
  LOGIN: { label: 'Inicio sesión', className: 'bg-primary/10 text-primary' },
  LOGOUT: { label: 'Cierre sesión', className: 'bg-muted text-muted-foreground' },
  UPLOAD: { label: 'Carga', className: 'bg-info/10 text-info' },
  DOWNLOAD: { label: 'Descarga', className: 'bg-info/10 text-info' },
  VIEW: { label: 'Visualización', className: 'bg-muted text-muted-foreground' },
};

const ENTITY_LABELS: Record<string, string> = {
  employee: 'Empleado',
  contract: 'Contrato',
  sanction: 'Sanción',
  justification: 'Justificación',
  vacation: 'Vacaciones',
  permission: 'Permiso',
  payslip: 'Boleta',
  attendance: 'Asistencia',
  evaluation: 'Evaluación',
  task: 'Tarea',
  user: 'Usuario',
  message: 'Mensaje',
  applicant: 'Postulante',
  termination: 'Retiro',
  inventory: 'Inventario',
  requirement: 'Requerimiento',
  activity: 'Actividad',
  settings: 'Configuración',
};

export default function AuditLogPage() {
  const { logs, loading, fetchLogs } = useAuditLogs();
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterEntity, setFilterEntity] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const filters: any = {};
    if (filterAction !== 'all') filters.action = filterAction;
    if (filterEntity !== 'all') filters.entity = filterEntity;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    fetchLogs(filters);
  }, [filterAction, filterEntity, startDate, endDate]);

  const filteredLogs = logs.filter(log => 
    (log.details?.toLowerCase().includes(search.toLowerCase()) || false) ||
    log.user_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    const csv = [
      ['Fecha', 'Usuario', 'Acción', 'Entidad', 'Detalle'].join(','),
      ...filteredLogs.map(log => [
        format(parseISO(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
        log.user_name,
        ACTION_LABELS[log.action]?.label || log.action,
        ENTITY_LABELS[log.entity] || log.entity,
        `"${log.details || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const todayLogs = logs.filter(l => {
    const logDate = new Date(l.created_at);
    const today = new Date();
    return logDate.toDateString() === today.toDateString();
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Log de Auditoría
            </h1>
            <p className="text-muted-foreground">
              Registro de todas las acciones del sistema
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => fetchLogs()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
            <Button onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  {loading ? <Skeleton className="h-8 w-16" /> : (
                    <p className="text-2xl font-bold">{logs.length}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Total registros</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <User className="w-5 h-5 text-success" />
                </div>
                <div>
                  {loading ? <Skeleton className="h-8 w-16" /> : (
                    <p className="text-2xl font-bold">{new Set(logs.map(l => l.user_id)).size}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Usuarios activos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-info/10">
                  <Calendar className="w-5 h-5 text-info" />
                </div>
                <div>
                  {loading ? <Skeleton className="h-8 w-16" /> : (
                    <p className="text-2xl font-bold">{todayLogs.length}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Acciones hoy</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  {loading ? <Skeleton className="h-8 w-16" /> : (
                    <p className="text-2xl font-bold">
                      {logs[0] ? format(parseISO(logs[0].created_at), 'HH:mm') : '-'}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">Última acción</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar en registros..." 
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Acción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las acciones</SelectItem>
                  {Object.entries(ACTION_LABELS).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterEntity} onValueChange={setFilterEntity}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Entidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las entidades</SelectItem>
                  {Object.entries(ENTITY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input 
                type="date" 
                className="w-40"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Desde"
              />
              <Input 
                type="date" 
                className="w-40"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Hasta"
              />
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardContent className="pt-6">
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[180px]">Fecha y Hora</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead className="w-[120px]">Acción</TableHead>
                    <TableHead className="w-[120px]">Entidad</TableHead>
                    <TableHead>Detalle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No hay registros que mostrar
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log, index) => (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className="hover:bg-muted/30"
                      >
                        <TableCell className="font-mono text-sm">
                          {format(parseISO(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: es })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-medium">{log.user_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={ACTION_LABELS[log.action]?.className || 'bg-muted'}>
                            {ACTION_LABELS[log.action]?.label || log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{ENTITY_LABELS[log.entity] || log.entity}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {log.details}
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
