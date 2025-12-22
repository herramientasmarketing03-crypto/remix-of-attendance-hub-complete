import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Task } from '@/types/hrm';
import { 
  TASK_STATUSES, 
  TASK_PRIORITIES, 
  TASK_RESPONSIBLES 
} from '@/data/hrmData';
import { 
  ChevronLeft, 
  ChevronRight,
  LayoutGrid,
  Calendar as CalendarIcon
} from 'lucide-react';
import { 
  format, 
  parseISO, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
  getDay
} from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

interface TrackerCalendarProps {
  tasks: Task[];
  isAdmin: boolean;
  currentUserId: string;
  onViewTracker: () => void;
}

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const START_DAY_OPTIONS = [
  { value: '1', label: 'Lunes' },
  { value: '0', label: 'Domingo' },
];

export function TrackerCalendar({ tasks, isAdmin, currentUserId, onViewTracker }: TrackerCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());
  const [startDay, setStartDay] = useState<number>(1); // 1 = Monday
  const [filterResponsible, setFilterResponsible] = useState<string>('all');

  // Filtrar tareas por usuario si no es admin
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];
    if (!isAdmin) {
      filtered = filtered.filter(t => t.assignedTo === currentUserId || t.assignedTo === 'yo');
    } else if (filterResponsible !== 'all') {
      filtered = filtered.filter(t => t.assignedTo === filterResponsible);
    }
    return filtered;
  }, [tasks, isAdmin, currentUserId, filterResponsible]);

  // Generar días del mes
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const monthStart = startOfWeek(start, { weekStartsOn: startDay as 0 | 1 });
    const monthEnd = endOfWeek(end, { weekStartsOn: startDay as 0 | 1 });
    
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  }, [currentDate, startDay]);

  // Tareas por día
  const getTasksForDay = (day: Date) => {
    return filteredTasks.filter(t => t.dueDate && isSameDay(parseISO(t.dueDate), day));
  };

  // Prioridad más alta del día
  const getHighestPriority = (dayTasks: Task[]) => {
    const priorities = ['urgent', 'important', 'medium', 'low', 'optional'];
    for (const p of priorities) {
      if (dayTasks.some(t => t.priorityId === p && !t.isCompleted)) {
        return TASK_PRIORITIES.find(pr => pr.id === p);
      }
    }
    return null;
  };

  // Tareas del día seleccionado
  const selectedDayTasks = useMemo(() => {
    if (!selectedDay) return [];
    return getTasksForDay(selectedDay);
  }, [selectedDay, filteredTasks]);

  // Datos para gráfico mensual
  const monthlyChartData = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });
    
    const completed = filteredTasks.filter(t => 
      t.dueDate && t.isCompleted && 
      parseISO(t.dueDate) >= start && parseISO(t.dueDate) <= end
    ).length;
    
    const pending = filteredTasks.filter(t => 
      t.dueDate && !t.isCompleted && 
      parseISO(t.dueDate) >= start && parseISO(t.dueDate) <= end
    ).length;

    return [
      { name: 'Completado', value: completed },
      { name: 'Pendiente', value: pending },
    ];
  }, [filteredTasks, currentDate]);

  // Fechas límite específicas
  const upcomingDeadlines = useMemo(() => {
    return filteredTasks
      .filter(t => t.dueDate && !t.isCompleted)
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 8);
  }, [filteredTasks]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const getStatus = (statusId: string) => TASK_STATUSES.find(s => s.id === statusId);
  const getPriority = (priorityId: string) => TASK_PRIORITIES.find(p => p.id === priorityId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Columna izquierda - Fechas límite */}
      <div className="lg:col-span-3 space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">FECHAS LÍMITES ESPECÍFICAS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingDeadlines.map(task => {
                const status = getStatus(task.statusId);
                return (
                  <div key={task.id} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                    <Checkbox 
                      checked={task.isCompleted}
                      disabled
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.dueDate && format(parseISO(task.dueDate), 'dd MMM', { locale: es })}
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                      style={{ borderColor: status?.color, color: status?.color }}
                    >
                      {status?.emoji}
                    </Badge>
                  </div>
                );
              })}
              {upcomingDeadlines.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Sin fechas límite próximas
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Columna central - Calendario */}
      <div className="lg:col-span-6 space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">CALENDARIO DIARIO</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Empieza:</span>
                <Select 
                  value={String(startDay)} 
                  onValueChange={(v) => setStartDay(Number(v))}
                >
                  <SelectTrigger className="w-[100px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {START_DAY_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Navegación del mes */}
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-center">
                <span className="font-semibold text-lg">
                  {format(currentDate, 'MMMM yyyy', { locale: es })}
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Filtro por responsable (solo admin) */}
            {isAdmin && (
              <div className="mb-4">
                <Select value={filterResponsible} onValueChange={setFilterResponsible}>
                  <SelectTrigger className="w-full h-8">
                    <SelectValue placeholder="Filtrar por responsable" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {TASK_RESPONSIBLES.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS_OF_WEEK.map((day, i) => {
                const index = (i + startDay) % 7;
                return (
                  <div key={i} className="text-center text-xs font-medium text-muted-foreground py-2">
                    {DAYS_OF_WEEK[index === 0 ? 6 : index - 1]}
                  </div>
                );
              })}
            </div>

            {/* Calendario grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const dayTasks = getTasksForDay(day);
                const highestPriority = getHighestPriority(dayTasks);
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                const isSelected = selectedDay && isSameDay(day, selectedDay);
                
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDay(day)}
                    className={`
                      relative p-2 h-20 rounded-lg border text-left transition-all
                      ${isCurrentMonth ? 'bg-card' : 'bg-muted/30 opacity-50'}
                      ${isSelected ? 'ring-2 ring-primary' : 'hover:bg-muted/50'}
                      ${isToday(day) ? 'border-primary' : 'border-border'}
                    `}
                  >
                    <span className={`
                      text-sm font-medium
                      ${isToday(day) ? 'text-primary' : ''}
                    `}>
                      {format(day, 'd')}
                    </span>
                    
                    {dayTasks.length > 0 && (
                      <div className="mt-1 space-y-1">
                        {highestPriority && (
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: highestPriority.color }}
                          />
                        )}
                        <p className="text-xs text-muted-foreground">
                          {dayTasks.length} tarea{dayTasks.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mini gráfico */}
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium mb-2">Completado vs En progreso</p>
              <ResponsiveContainer width="100%" height={60}>
                <BarChart data={monthlyChartData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={80} fontSize={10} />
                  <Bar dataKey="value" fill="#4299E1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Columna derecha - Tareas del día */}
      <div className="lg:col-span-3 space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              TAREAS HOY - {selectedDay ? format(selectedDay, 'dd MMM', { locale: es }) : 'Selecciona un día'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedDayTasks.length > 0 ? (
              selectedDayTasks.map(task => {
                const priority = getPriority(task.priorityId);
                const status = getStatus(task.statusId);
                return (
                  <div key={task.id} className="p-3 rounded-lg bg-muted/50 space-y-2">
                    <Badge 
                      variant="outline"
                      style={{ borderColor: priority?.color, color: priority?.color }}
                      className="text-xs"
                    >
                      {priority?.emoji} {priority?.name}
                    </Badge>
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.assignedToName}</p>
                    <Badge 
                      variant="outline"
                      style={{ borderColor: status?.color, color: status?.color }}
                      className="text-xs"
                    >
                      {status?.emoji} {status?.name}
                    </Badge>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay tareas para este día
              </p>
            )}

            <div className="pt-4 border-t">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full gap-2"
                onClick={onViewTracker}
              >
                <LayoutGrid className="w-4 h-4" />
                View Task Tracker
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">NOTES</p>
              <textarea 
                className="w-full h-20 p-2 text-sm rounded-md border bg-background resize-none"
                placeholder="Agregar notas..."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}