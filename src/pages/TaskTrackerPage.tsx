import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEmployeeTasks, type EmployeeTask, type TaskUpdate, getEmployeeIdForTask } from '@/hooks/useEmployeeTasks';
import { useEmployees } from '@/hooks/useEmployees';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ListTodo, 
  Calendar as CalendarIcon, 
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Pause,
  XCircle,
  ExternalLink,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Pencil,
  Trash2
} from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isToday, getDay, addMonths, subMonths, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock; bgColor: string }> = {
  pending: { label: 'Pendiente', color: 'text-warning', icon: Clock, bgColor: 'bg-warning/10' },
  in_progress: { label: 'En Progreso', color: 'text-info', icon: AlertCircle, bgColor: 'bg-info/10' },
  completed: { label: 'Completado', color: 'text-success', icon: CheckCircle2, bgColor: 'bg-success/10' },
  on_hold: { label: 'En Espera', color: 'text-orange-500', icon: Pause, bgColor: 'bg-orange-500/10' },
  cancelled: { label: 'Cancelado', color: 'text-destructive', icon: XCircle, bgColor: 'bg-destructive/10' },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: 'Baja', color: 'bg-green-500/10 text-green-500' },
  medium: { label: 'Media', color: 'bg-warning/10 text-warning' },
  high: { label: 'Importante', color: 'bg-orange-500/10 text-orange-500' },
  urgent: { label: 'Urgente', color: 'bg-destructive/10 text-destructive' },
};

const CATEGORY_OPTIONS = [
  'rrhh', 'campañas', 'marketing', 'diseño', 'tecnología', 'administración', 'general'
];

const PIE_COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#f97316', '#ef4444'];

export default function TaskTrackerPage() {
  const { userRole, user, profile } = useAuth();
  const { employees } = useEmployees();
  const { tasks, loading, stats, createTask, updateTask, toggleComplete, deleteTask } = useEmployeeTasks();
  const [activeTab, setActiveTab] = useState('seguimiento');
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    category: 'general',
    assigned_to: 'YO',
    due_date: '',
    link: '',
    notes: '',
  });

  // Advanced filters
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Edit task state
  const [editingTask, setEditingTask] = useState<EmployeeTask | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<TaskUpdate>({});

  const isAdmin = userRole?.role === 'admin_rrhh';
  const isJefe = userRole?.role === 'jefe_area';
  const canManage = isAdmin || isJefe;
  const currentUserName = `${profile?.nombres || ''} ${profile?.apellidos || ''}`.trim();

  // Get unique assignees for filter
  const uniqueAssignees = useMemo(() => {
    return [...new Set(tasks.map(t => t.assigned_to))].sort();
  }, [tasks]);

  // Check if user can edit a specific task
  const canEditTask = (task: EmployeeTask) => {
    if (isAdmin || isJefe) return true;
    // Employees can edit tasks they created (assigned_by matches their name)
    return task.assigned_by === currentUserName;
  };

  // Check if user can only change status (not full edit)
  const canOnlyChangeStatus = (task: EmployeeTask) => {
    if (isAdmin || isJefe) return false;
    // If employee didn't create the task, they can only change status
    return task.assigned_by !== currentUserName;
  };

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filterCategory !== 'all' && task.category !== filterCategory) return false;
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
      if (filterAssignee !== 'all' && task.assigned_to !== filterAssignee) return false;
      return true;
    });
  }, [tasks, filterCategory, filterPriority, filterAssignee]);

  const hasActiveFilters = filterCategory !== 'all' || filterPriority !== 'all' || filterAssignee !== 'all';

  const clearFilters = () => {
    setFilterCategory('all');
    setFilterPriority('all');
    setFilterAssignee('all');
  };

  const handleCreateTask = async () => {
    if (!newTask.title) {
      toast.error('El título es requerido');
      return;
    }

    try {
      // Get employee_id for the assigned person
      const employeeId = await getEmployeeIdForTask(newTask.assigned_to, user?.id);
      
      // Get the display name for assigned_to
      let assignedToName = newTask.assigned_to;
      if (newTask.assigned_to.toUpperCase() === 'YO') {
        assignedToName = currentUserName || 'YO';
      }

      await createTask({
        title: newTask.title,
        description: newTask.description || null,
        assigned_to: assignedToName,
        assigned_by: currentUserName,
        employee_id: employeeId,
        created_by_user_id: user?.id,
        priority: newTask.priority,
        status: newTask.status,
        category: newTask.category,
        due_date: newTask.due_date || null,
        link: newTask.link || null,
        notes: newTask.notes || null,
      });
      setIsNewTaskOpen(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        category: 'general',
        assigned_to: 'YO',
        due_date: '',
        link: '',
        notes: '',
      });
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    await updateTask(taskId, { status: newStatus });
  };

  const openEditDialog = (task: EmployeeTask) => {
    setEditingTask(task);
    setEditForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      category: task.category,
      due_date: task.due_date,
      link: task.link,
      notes: task.notes,
    });
    setIsEditOpen(true);
  };

  const handleEditTask = async () => {
    if (!editingTask) return;
    try {
      await updateTask(editingTask.id, editForm);
      setIsEditOpen(false);
      setEditingTask(null);
      toast.success('Tarea actualizada');
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('¿Estás seguro de eliminar esta tarea?')) {
      await deleteTask(taskId);
    }
  };

  // Prepare chart data
  const statusChartData = useMemo(() => [
    { name: 'Completado', value: stats.completed, color: '#10b981' },
    { name: 'En Progreso', value: stats.inProgress, color: '#3b82f6' },
    { name: 'Pendiente', value: stats.pending, color: '#f59e0b' },
    { name: 'En Espera', value: stats.onHold, color: '#f97316' },
    { name: 'Cancelado', value: stats.cancelled, color: '#ef4444' },
  ].filter(d => d.value > 0), [stats]);

  const assigneeChartData = useMemo(() => {
    const grouped: Record<string, number> = {};
    tasks.forEach(t => {
      grouped[t.assigned_to] = (grouped[t.assigned_to] || 0) + 1;
    });
    return Object.entries(grouped).map(([name, value], i) => ({
      name,
      value,
      color: PIE_COLORS[i % PIE_COLORS.length],
    }));
  }, [tasks]);

  // Calendar logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  const getTasksForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return tasks.filter(t => t.due_date === dateStr);
  };

  const todayTasks = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return tasks.filter(t => t.due_date === today && t.status !== 'completed');
  }, [tasks]);

  const getDaysRemaining = (dueDate: string | null) => {
    if (!dueDate) return null;
    return differenceInDays(parseISO(dueDate), new Date());
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-wider text-foreground">
              SEGUIMIENTO-DE-TAREA
            </h1>
            <p className="text-muted-foreground">
              Gestión y seguimiento de tareas del equipo
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant={showFilters ? "default" : "outline"} 
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtros
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                  !
                </Badge>
              )}
            </Button>
            
            <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nueva Tarea
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Crear Nueva Tarea</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Actividad *</Label>
                    <Input 
                      value={newTask.title}
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                      placeholder="Título de la tarea"
                    />
                  </div>
                  <div>
                    <Label>Notas</Label>
                    <Textarea 
                      value={newTask.notes}
                      onChange={(e) => setNewTask({...newTask, notes: e.target.value})}
                      placeholder="Notas adicionales"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Fecha Límite</Label>
                      <Input 
                        type="date"
                        value={newTask.due_date}
                        onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Prioridad</Label>
                      <Select value={newTask.priority} onValueChange={(v) => setNewTask({...newTask, priority: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                            <SelectItem key={key} value={key}>{config.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Categoría</Label>
                      <Select value={newTask.category} onValueChange={(v) => setNewTask({...newTask, category: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CATEGORY_OPTIONS.map(c => (
                            <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Responsable</Label>
                      <Select 
                        value={newTask.assigned_to} 
                        onValueChange={(v) => setNewTask({...newTask, assigned_to: v})}
                      >
                        <SelectTrigger><SelectValue placeholder="Seleccionar responsable" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="YO">Yo mismo</SelectItem>
                          {employees.map(emp => (
                            <SelectItem key={emp.id} value={emp.name}>
                              {emp.name} ({emp.department})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Enlace (opcional)</Label>
                    <Input 
                      value={newTask.link}
                      onChange={(e) => setNewTask({...newTask, link: e.target.value})}
                      placeholder="https://..."
                    />
                  </div>
                  <Button className="w-full" onClick={handleCreateTask}>
                    Crear Tarea
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm whitespace-nowrap">Categoría:</Label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {CATEGORY_OPTIONS.map(c => (
                        <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-sm whitespace-nowrap">Prioridad:</Label>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-sm whitespace-nowrap">Responsable:</Label>
                  <Select value={filterAssignee} onValueChange={setFilterAssignee}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {uniqueAssignees.map(a => (
                        <SelectItem key={a} value={a}>{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                    <X className="w-4 h-4" />
                    Limpiar
                  </Button>
                )}

                <div className="ml-auto text-sm text-muted-foreground">
                  Mostrando {filteredTasks.length} de {tasks.length} tareas
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="seguimiento" className="gap-2">
              <ListTodo className="w-4 h-4" />
              Seguimiento
            </TabsTrigger>
            <TabsTrigger value="calendario" className="gap-2">
              <CalendarIcon className="w-4 h-4" />
              Calendario
            </TabsTrigger>
          </TabsList>

          {/* SEGUIMIENTO TAB */}
          <TabsContent value="seguimiento" className="mt-6 space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Today's Date & Progress */}
              <Card className="bg-blue-100 dark:bg-blue-900/30 border-blue-200">
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">LA FECHA DE HOY</p>
                    <p className="text-lg font-medium">{format(new Date(), 'MMMM dd, yyyy', { locale: es })}</p>
                  </div>
                  <div className="p-3 bg-blue-200/50 dark:bg-blue-800/50 rounded-lg">
                    <p className="text-xs font-semibold uppercase tracking-wider">OVERALL TASKS COMPLETED: {stats.completed} OF {stats.total}</p>
                  </div>
                  <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                    <p className="text-xs font-semibold uppercase tracking-wider">TAREAS QUE VENCEN HOY</p>
                    <p className="text-2xl font-bold">{todayTasks.length}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Status Pie Chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-center text-sm uppercase tracking-wider">ESTADO</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {statusChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Responsible Pie Chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-center text-sm uppercase tracking-wider">RESPONSABLE</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={assigneeChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {assigneeChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tasks Table */}
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-rose-200/50 dark:bg-rose-900/20">
                        <TableHead className="w-10">HECHO</TableHead>
                        <TableHead>ACTIVIDAD</TableHead>
                        <TableHead>ESTADO</TableHead>
                        <TableHead>FECHA LÍMITE</TableHead>
                        <TableHead>DÍAS</TableHead>
                        <TableHead>PRIORIDAD</TableHead>
                        <TableHead>CATEGORÍA</TableHead>
                        <TableHead>RESPONSABLE</TableHead>
                        <TableHead>NOTAS</TableHead>
                        <TableHead>ENLACE</TableHead>
                        <TableHead className="w-20">ACCIONES</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTasks.map((task) => {
                        const daysRemaining = getDaysRemaining(task.due_date);
                        const StatusIcon = STATUS_CONFIG[task.status]?.icon || Clock;
                        const taskCanEdit = canEditTask(task);
                        const onlyStatus = canOnlyChangeStatus(task);
                        
                        return (
                          <TableRow key={task.id} className={task.status === 'completed' ? 'opacity-60' : ''}>
                            <TableCell>
                              <Checkbox 
                                checked={task.status === 'completed'}
                                onCheckedChange={() => toggleComplete(task.id, task.status)}
                              />
                            </TableCell>
                            <TableCell className="font-medium max-w-[250px]">
                              <span className={task.status === 'completed' ? 'line-through' : ''}>
                                {task.title}
                              </span>
                              {task.assigned_by && (
                                <p className="text-xs text-muted-foreground">Por: {task.assigned_by}</p>
                              )}
                            </TableCell>
                            <TableCell>
                              <Select 
                                value={task.status} 
                                onValueChange={(v) => handleStatusChange(task.id, v)}
                              >
                                <SelectTrigger className="w-32 h-8">
                                  <div className="flex items-center gap-1">
                                    <StatusIcon className={`w-3 h-3 ${STATUS_CONFIG[task.status]?.color}`} />
                                    <span className="text-xs">{STATUS_CONFIG[task.status]?.label}</span>
                                  </div>
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                    <SelectItem key={key} value={key}>
                                      <div className="flex items-center gap-2">
                                        <config.icon className={`w-4 h-4 ${config.color}`} />
                                        {config.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              {task.due_date ? format(parseISO(task.due_date), 'dd/MM/yyyy') : '-'}
                            </TableCell>
                            <TableCell>
                              {daysRemaining !== null && (
                                <span className={`font-medium ${daysRemaining < 0 ? 'text-destructive' : daysRemaining <= 7 ? 'text-warning' : 'text-muted-foreground'}`}>
                                  {daysRemaining}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge className={PRIORITY_CONFIG[task.priority]?.color || 'bg-muted'}>
                                {PRIORITY_CONFIG[task.priority]?.label || task.priority}
                              </Badge>
                            </TableCell>
                            <TableCell className="capitalize">{task.category}</TableCell>
                            <TableCell>{task.assigned_to}</TableCell>
                            <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                              {task.notes || '-'}
                            </TableCell>
                            <TableCell>
                              {task.link && (
                                <a href={task.link} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-4 h-4 text-primary hover:text-primary/80" />
                                </a>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {taskCanEdit && !onlyStatus && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => openEditDialog(task)}
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </Button>
                                )}
                                {taskCanEdit && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteTask(task.id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CALENDARIO TAB */}
          <TabsContent value="calendario" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar - Fechas Límites */}
              <Card className="lg:col-span-1 bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    FECHAS LÍMITES ESPECÍFICAS
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
                  {tasks.filter(t => t.due_date && t.status !== 'completed').slice(0, 10).map(task => (
                    <div key={task.id} className="p-2 bg-background rounded border text-xs">
                      <p className="font-medium truncate">{task.title}</p>
                      <div className="flex justify-between mt-1 text-muted-foreground">
                        <Badge variant="outline" className="text-[10px]">
                          {STATUS_CONFIG[task.status]?.label}
                        </Badge>
                        <span>{task.due_date ? format(parseISO(task.due_date), 'dd/MM') : ''}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Calendar */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl uppercase tracking-wider">CALENDARIO</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="font-medium min-w-[120px] text-center">
                        {format(currentMonth, 'MMMM yyyy', { locale: es })}
                      </span>
                      <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Days Header */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SÁB', 'DOM'].map(day => (
                      <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Empty cells for offset */}
                    {Array.from({ length: startDayOfWeek === 0 ? 6 : startDayOfWeek - 1 }).map((_, i) => (
                      <div key={`empty-${i}`} className="h-24 bg-muted/30 rounded" />
                    ))}
                    
                    {daysInMonth.map(day => {
                      const dayTasks = getTasksForDay(day);
                      const isCurrentDay = isToday(day);
                      const isWeekend = getDay(day) === 0 || getDay(day) === 6;
                      
                      return (
                        <div 
                          key={day.toISOString()}
                          className={`h-24 p-1 rounded border overflow-hidden ${
                            isCurrentDay ? 'bg-primary/10 border-primary' :
                            isWeekend ? 'bg-rose-50 dark:bg-rose-900/10' : 'bg-background'
                          }`}
                        >
                          <div className={`text-xs font-medium mb-1 ${isWeekend ? 'text-rose-500' : ''}`}>
                            {format(day, 'd')}
                          </div>
                          <div className="space-y-0.5 overflow-y-auto max-h-16">
                            {dayTasks.slice(0, 3).map(task => (
                              <div 
                                key={task.id}
                                className={`text-[10px] px-1 py-0.5 rounded truncate ${
                                  task.status === 'completed' ? 'bg-success/20 text-success line-through' :
                                  task.status === 'in_progress' ? 'bg-info/20 text-info' :
                                  task.status === 'cancelled' ? 'bg-destructive/20 text-destructive line-through' :
                                  'bg-warning/20 text-warning-foreground'
                                }`}
                                title={task.title}
                              >
                                {task.title}
                              </div>
                            ))}
                            {dayTasks.length > 3 && (
                              <div className="text-[10px] text-muted-foreground">+{dayTasks.length - 3} más</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Sidebar - Today's Tasks */}
              <Card className="lg:col-span-1">
                <CardHeader className="bg-rose-100 dark:bg-rose-900/20 rounded-t-lg">
                  <CardTitle className="text-sm uppercase tracking-wider">
                    TAREAS DE HOY
                    <span className="block text-xs text-muted-foreground mt-1">
                      {format(new Date(), 'MMM dd', { locale: es })}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-2 max-h-[400px] overflow-y-auto">
                  {todayTasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay tareas para hoy
                    </p>
                  ) : (
                    todayTasks.map(task => (
                      <div key={task.id} className="p-2 bg-muted/50 rounded border text-xs">
                        <p className="font-medium">{task.title}</p>
                        <div className="flex justify-between mt-1">
                          <Badge className={PRIORITY_CONFIG[task.priority]?.color + ' text-[10px]'}>
                            {PRIORITY_CONFIG[task.priority]?.label}
                          </Badge>
                          <span className="text-muted-foreground">{task.assigned_to}</span>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
                <div className="p-4 border-t">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setActiveTab('seguimiento')}
                  >
                    VIEW TASK TRACKER
                  </Button>
                </div>
                <div className="p-4 bg-success/20 rounded-b-lg">
                  <p className="text-xs font-semibold uppercase tracking-wider text-center text-success">
                    NOTES
                  </p>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Task Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Editar Tarea</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Actividad</Label>
                <Input 
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                />
              </div>
              <div>
                <Label>Notas</Label>
                <Textarea 
                  value={editForm.notes || ''}
                  onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fecha Límite</Label>
                  <Input 
                    type="date"
                    value={editForm.due_date || ''}
                    onChange={(e) => setEditForm({...editForm, due_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Prioridad</Label>
                  <Select value={editForm.priority || 'medium'} onValueChange={(v) => setEditForm({...editForm, priority: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Categoría</Label>
                  <Select value={editForm.category || 'general'} onValueChange={(v) => setEditForm({...editForm, category: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map(c => (
                        <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Enlace</Label>
                  <Input 
                    value={editForm.link || ''}
                    onChange={(e) => setEditForm({...editForm, link: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
              <Button onClick={handleEditTask}>Guardar Cambios</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
