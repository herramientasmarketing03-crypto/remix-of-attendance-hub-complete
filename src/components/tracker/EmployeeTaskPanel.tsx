import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Task } from '@/types/hrm';
import { 
  TASK_STATUSES, 
  TASK_PRIORITIES, 
  TASK_CATEGORIES 
} from '@/data/hrmData';
import { 
  Calendar as CalendarIcon, 
  ExternalLink,
  Clock,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { format, parseISO, isPast, isToday, differenceInDays, startOfMonth, endOfMonth, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface EmployeeTaskPanelProps {
  tasks: Task[];
  onStatusChange: (taskId: string, statusId: string) => void;
  onToggleComplete: (taskId: string) => void;
  currentUserId: string;
}

export function EmployeeTaskPanel({ tasks, onStatusChange, onToggleComplete, currentUserId }: EmployeeTaskPanelProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority'>('dueDate');

  // Filtrar tareas del usuario
  const myTasks = useMemo(() => {
    return tasks.filter(t => t.assignedTo === currentUserId || t.assignedTo === 'yo');
  }, [tasks, currentUserId]);

  // Estadísticas
  const stats = useMemo(() => {
    const completed = myTasks.filter(t => t.isCompleted).length;
    const pending = myTasks.filter(t => !t.isCompleted).length;
    const overdue = myTasks.filter(t => t.dueDate && isPast(parseISO(t.dueDate)) && !t.isCompleted).length;
    const today = myTasks.filter(t => t.dueDate && isToday(parseISO(t.dueDate))).length;
    const thisWeek = myTasks.filter(t => {
      if (!t.dueDate || t.isCompleted) return false;
      const days = differenceInDays(parseISO(t.dueDate), new Date());
      return days >= 0 && days <= 7;
    }).length;
    const progress = myTasks.length > 0 ? Math.round((completed / myTasks.length) * 100) : 0;
    return { completed, pending, overdue, today, thisWeek, progress };
  }, [myTasks]);

  // Filtrar y ordenar tareas
  const filteredTasks = useMemo(() => {
    let filtered = [...myTasks];
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.statusId === filterStatus);
    }
    if (filterPriority !== 'all') {
      filtered = filtered.filter(t => t.priorityId === filterPriority);
    }

    filtered.sort((a, b) => {
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else {
        const priorityOrder = { urgent: 0, important: 1, medium: 2, low: 3, optional: 4 };
        return (priorityOrder[a.priorityId as keyof typeof priorityOrder] || 5) - 
               (priorityOrder[b.priorityId as keyof typeof priorityOrder] || 5);
      }
    });

    return filtered;
  }, [myTasks, filterStatus, filterPriority, sortBy]);

  // Tareas de hoy
  const todayTasks = useMemo(() => {
    return myTasks.filter(t => t.dueDate && isToday(parseISO(t.dueDate)));
  }, [myTasks]);

  // Días con tareas para el calendario
  const daysWithTasks = useMemo(() => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    return myTasks
      .filter(t => t.dueDate)
      .map(t => parseISO(t.dueDate!))
      .filter(d => d >= start && d <= end);
  }, [myTasks, selectedDate]);

  const getStatus = (statusId: string) => TASK_STATUSES.find(s => s.id === statusId);
  const getPriority = (priorityId: string) => TASK_PRIORITIES.find(p => p.id === priorityId);
  const getCategory = (categoryId: string) => TASK_CATEGORIES.find(c => c.id === categoryId);

  const getDaysRemaining = (dueDate: string) => {
    const days = differenceInDays(parseISO(dueDate), new Date());
    if (days < 0) return { text: `${Math.abs(days)} días vencida`, color: 'text-destructive' };
    if (days === 0) return { text: 'Hoy', color: 'text-warning' };
    if (days === 1) return { text: 'Mañana', color: 'text-warning' };
    return { text: `${days} días`, color: 'text-muted-foreground' };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Columna izquierda - Resumen personal */}
      <div className="lg:col-span-3 space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold tracking-wide">MI PROGRESO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Completado</span>
                <span className="font-semibold">{stats.progress}%</span>
              </div>
              <Progress value={stats.progress} className="h-3" />
            </div>
            
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-sm">
                <span>Completadas</span>
                <span className="font-semibold text-success">{stats.completed}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Pendientes</span>
                <span className="font-semibold">{stats.pending}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-destructive">Vencidas</span>
                <span className="font-semibold text-destructive">{stats.overdue}</span>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-warning" />
                <span className="text-sm font-medium">TAREAS HOY: {stats.today}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Vencen esta semana: <span className="font-medium">{stats.thisWeek}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Columna central - Lista de tareas */}
      <div className="lg:col-span-6 space-y-4">
        {/* Filtros */}
        <Card>
          <CardContent className="py-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[140px] h-8">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {TASK_STATUSES.map(status => (
                      <SelectItem key={status.id} value={status.id}>
                        {status.emoji} {status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-[140px] h-8">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {TASK_PRIORITIES.map(priority => (
                    <SelectItem key={priority.id} value={priority.id}>
                      {priority.emoji} {priority.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1"
                onClick={() => setSortBy(sortBy === 'dueDate' ? 'priority' : 'dueDate')}
              >
                <ArrowUpDown className="w-3 h-3" />
                {sortBy === 'dueDate' ? 'Por fecha' : 'Por prioridad'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de tareas */}
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredTasks.map(task => {
                const status = getStatus(task.statusId);
                const priority = getPriority(task.priorityId);
                const category = getCategory(task.categoryId);
                const daysInfo = task.dueDate ? getDaysRemaining(task.dueDate) : null;

                return (
                  <div 
                    key={task.id} 
                    className={`p-4 hover:bg-muted/50 transition-colors ${task.isCompleted ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        checked={task.isCompleted}
                        onCheckedChange={() => onToggleComplete(task.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-medium ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                            {task.title}
                          </span>
                          {task.link && (
                            <a href={task.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{task.description}</p>
                        
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Select 
                            value={task.statusId} 
                            onValueChange={(v) => onStatusChange(task.id, v)}
                          >
                            <SelectTrigger className="h-7 w-auto text-xs gap-1 px-2">
                              <span>{status?.emoji}</span>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TASK_STATUSES.map(s => (
                                <SelectItem key={s.id} value={s.id}>
                                  {s.emoji} {s.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {task.dueDate && (
                            <span className={`flex items-center gap-1 text-xs ${daysInfo?.color}`}>
                              <CalendarIcon className="w-3 h-3" />
                              {format(parseISO(task.dueDate), 'dd MMM', { locale: es })}
                              <span className="text-muted-foreground">({daysInfo?.text})</span>
                            </span>
                          )}

                          <Badge 
                            variant="outline" 
                            className="text-xs"
                            style={{ 
                              borderColor: priority?.color, 
                              color: priority?.color 
                            }}
                          >
                            {priority?.emoji} {priority?.name}
                          </Badge>

                          {category && (
                            <Badge 
                              className="text-xs"
                              style={{ backgroundColor: category.color }}
                            >
                              {category.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredTasks.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  No hay tareas que coincidan con los filtros
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Columna derecha - Calendario y tareas de hoy */}
      <div className="lg:col-span-3 space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              CALENDARIO
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={es}
              className="rounded-md"
              modifiers={{
                hasTask: daysWithTasks,
              }}
              modifiersStyles={{
                hasTask: { fontWeight: 'bold', textDecoration: 'underline' }
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">TAREAS DE HOY</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayTasks.length > 0 ? (
              todayTasks.map(task => {
                const priority = getPriority(task.priorityId);
                return (
                  <div key={task.id} className="p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline"
                        style={{ borderColor: priority?.color, color: priority?.color }}
                        className="text-xs"
                      >
                        {priority?.emoji} {priority?.name}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium mt-1">{task.title}</p>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay tareas para hoy
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}