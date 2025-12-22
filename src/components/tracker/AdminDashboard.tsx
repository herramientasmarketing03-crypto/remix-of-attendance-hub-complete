import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Task } from '@/types/hrm';
import { 
  TASK_STATUSES, 
  TASK_PRIORITIES, 
  TASK_CATEGORIES,
  TASK_RESPONSIBLES
} from '@/data/hrmData';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  ListTodo, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Calendar as CalendarIcon,
  LayoutGrid
} from 'lucide-react';
import { format, parseISO, isPast, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface AdminDashboardProps {
  tasks: Task[];
  onViewTracker: () => void;
  onViewCalendar: () => void;
}

export function AdminDashboard({ tasks, onViewTracker, onViewCalendar }: AdminDashboardProps) {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  // Estadísticas generales
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.isCompleted).length;
    const inProgress = tasks.filter(t => t.statusId === 'in_progress').length;
    const overdue = tasks.filter(t => t.dueDate && isPast(parseISO(t.dueDate)) && !t.isCompleted).length;
    
    return {
      total,
      completed,
      completedPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
      inProgress,
      inProgressPercent: total > 0 ? Math.round((inProgress / total) * 100) : 0,
      overdue,
      overduePercent: total > 0 ? Math.round((overdue / total) * 100) : 0,
    };
  }, [tasks]);

  // Datos para gráfico de barras horizontal (progreso general)
  const progressData = useMemo(() => {
    return [
      { name: 'Completado', value: stats.completed, color: '#48BB78' },
      { name: 'En progreso', value: stats.inProgress, color: '#4299E1' },
      { name: 'Pendiente', value: stats.total - stats.completed - stats.inProgress, color: '#A0AEC0' },
    ];
  }, [stats]);

  // Datos para gráfico mensual
  const monthlyData = useMemo(() => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    const days = eachDayOfInterval({ start, end });
    
    return days.slice(0, 15).map(day => {
      const dayTasks = tasks.filter(t => t.dueDate && isSameDay(parseISO(t.dueDate), day));
      const completed = dayTasks.filter(t => t.isCompleted).length;
      const pending = dayTasks.filter(t => !t.isCompleted).length;
      
      return {
        day: format(day, 'd'),
        Completado: completed,
        Pendiente: pending,
      };
    });
  }, [tasks, selectedMonth]);

  // Datos para pie charts
  const priorityData = useMemo(() => {
    return TASK_PRIORITIES.map(p => ({
      name: p.name,
      value: tasks.filter(t => t.priorityId === p.id).length,
      color: p.color,
    })).filter(d => d.value > 0);
  }, [tasks]);

  const statusData = useMemo(() => {
    return TASK_STATUSES.slice(0, 5).map(s => ({
      name: s.name,
      value: tasks.filter(t => t.statusId === s.id).length,
      color: s.color,
    })).filter(d => d.value > 0);
  }, [tasks]);

  const categoryData = useMemo(() => {
    return TASK_CATEGORIES.map(c => ({
      name: c.name,
      value: tasks.filter(t => t.categoryId === c.id).length,
      color: c.color,
    })).filter(d => d.value > 0);
  }, [tasks]);

  const responsibleData = useMemo(() => {
    return TASK_RESPONSIBLES.map(r => ({
      name: r.name,
      value: tasks.filter(t => t.assignedTo === r.id).length,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
    })).filter(d => d.value > 0);
  }, [tasks]);

  // Tareas del mes
  const monthProgress = useMemo(() => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    const monthTasks = tasks.filter(t => {
      if (!t.dueDate) return false;
      const date = parseISO(t.dueDate);
      return date >= start && date <= end;
    });
    const completed = monthTasks.filter(t => t.isCompleted).length;
    return monthTasks.length > 0 ? Math.round((completed / monthTasks.length) * 100) : 0;
  }, [tasks, selectedMonth]);

  // Tareas vencidas del mes
  const overdueThisMonth = useMemo(() => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    return tasks.filter(t => {
      if (!t.dueDate || t.isCompleted) return false;
      const date = parseISO(t.dueDate);
      return date >= start && date <= end && isPast(date);
    });
  }, [tasks, selectedMonth]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Panel izquierdo */}
      <div className="lg:col-span-3 space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              CALENDARIO
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Calendar
              mode="single"
              selected={selectedMonth}
              onSelect={(date) => date && setSelectedMonth(date)}
              locale={es}
              className="rounded-md"
            />
            
            <div className="space-y-2">
              <p className="text-sm font-medium">PROGRESO DEL MES</p>
              <Progress value={monthProgress} className="h-3" />
              <p className="text-xs text-muted-foreground text-right">{monthProgress}%</p>
            </div>

            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full gap-2" onClick={onViewTracker}>
                <LayoutGrid className="w-4 h-4" />
                Vista Tracker
              </Button>
              <Button variant="outline" size="sm" className="w-full gap-2" onClick={onViewCalendar}>
                <CalendarIcon className="w-4 h-4" />
                Vista Calendario
              </Button>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium text-destructive">TAREAS VENCIDAS DEL MES</p>
              <p className="text-xs text-muted-foreground mt-1">
                {format(selectedMonth, 'MMMM yyyy', { locale: es })}
              </p>
              <div className="mt-2 space-y-1">
                {overdueThisMonth.slice(0, 3).map(task => (
                  <div key={task.id} className="text-xs p-2 bg-destructive/10 rounded">
                    {task.title}
                  </div>
                ))}
                {overdueThisMonth.length === 0 && (
                  <p className="text-xs text-muted-foreground">Sin tareas vencidas</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panel principal */}
      <div className="lg:col-span-9 space-y-6">
        {/* Métricas generales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <ListTodo className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Tareas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-success/10">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{stats.completed}</p>
                  <p className="text-sm text-muted-foreground">{stats.completedPercent}% Completadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-info/10">
                  <Clock className="w-6 h-6 text-info" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{stats.inProgress}</p>
                  <p className="text-sm text-muted-foreground">{stats.inProgressPercent}% En Progreso</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-destructive/10">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{stats.overdue}</p>
                  <p className="text-sm text-muted-foreground">{stats.overduePercent}% Vencidas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">PROGRESO GENERAL</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {progressData.map(item => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{item.name}</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                    <div className="h-6 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${(item.value / stats.total) * 100}%`,
                          backgroundColor: item.color 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">PROGRESO DEL MES</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={monthlyData}>
                  <XAxis dataKey="day" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="Completado" stackId="a" fill="#48BB78" />
                  <Bar dataKey="Pendiente" stackId="a" fill="#A0AEC0" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Distribución */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">PRIORIDAD</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={45}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-1 mt-2">
                {priorityData.map(p => (
                  <Badge 
                    key={p.name} 
                    variant="outline" 
                    className="text-xs"
                    style={{ borderColor: p.color, color: p.color }}
                  >
                    {p.name} {Math.round((p.value / stats.total) * 100)}%
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">ESTADO</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={45}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-1 mt-2">
                {statusData.slice(0, 3).map(s => (
                  <Badge 
                    key={s.name} 
                    variant="outline" 
                    className="text-xs"
                    style={{ borderColor: s.color, color: s.color }}
                  >
                    {s.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">CATEGORÍA</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={45}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-1 mt-2">
                {categoryData.slice(0, 3).map(c => (
                  <Badge 
                    key={c.name} 
                    className="text-xs text-white"
                    style={{ backgroundColor: c.color }}
                  >
                    {c.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">RESPONSABLE</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {responsibleData.slice(0, 5).map(r => {
                  const percent = Math.round((r.value / stats.total) * 100);
                  return (
                    <div key={r.name} className="flex items-center gap-2">
                      <span className="text-xs w-16 truncate">{r.name}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium w-8">{percent}%</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}