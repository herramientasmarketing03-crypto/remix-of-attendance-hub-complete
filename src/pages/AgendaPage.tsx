import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { useActivities, Activity } from '@/hooks/useActivities';
import { useEmployees } from '@/hooks/useEmployees';
import { format, isToday, isTomorrow, isThisWeek, parseISO, differenceInDays, isSameMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Cake, 
  Users, 
  GraduationCap, 
  Clock, 
  PartyPopper,
  Bell,
  Filter
} from 'lucide-react';

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'birthday': return <Cake className="w-4 h-4" />;
    case 'meeting': return <Users className="w-4 h-4" />;
    case 'training': return <GraduationCap className="w-4 h-4" />;
    case 'deadline': return <Clock className="w-4 h-4" />;
    case 'event': return <PartyPopper className="w-4 h-4" />;
    case 'reminder': return <Bell className="w-4 h-4" />;
    default: return <CalendarIcon className="w-4 h-4" />;
  }
};

const getActivityColor = (type: Activity['type']) => {
  switch (type) {
    case 'birthday': return 'bg-pink-500/10 text-pink-500 border-pink-500/20';
    case 'meeting': return 'bg-primary/10 text-primary border-primary/20';
    case 'training': return 'bg-info/10 text-info border-info/20';
    case 'deadline': return 'bg-destructive/10 text-destructive border-destructive/20';
    case 'event': return 'bg-success/10 text-success border-success/20';
    case 'reminder': return 'bg-warning/10 text-warning border-warning/20';
    default: return 'bg-muted text-muted-foreground';
  }
};

export default function AgendaPage() {
  const { activities, loading, createActivity } = useActivities();
  const { employees } = useEmployees();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filterType, setFilterType] = useState<string>('all');
  const [isNewActivityOpen, setIsNewActivityOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    type: 'meeting' as Activity['type'],
    priority: 'medium' as Activity['priority'],
  });

  // Generate birthdays from employees
  const today = new Date();
  const employeeBirthdays = employees
    .filter(e => e.hire_date && isSameMonth(parseISO(e.hire_date), today))
    .map(e => ({
      id: `birthday-${e.id}`,
      title: `Cumpleaños de ${e.name}`,
      date: e.hire_date!,
      type: 'birthday' as const,
      priority: 'medium' as const,
    }));

  const allActivities = [...activities, ...employeeBirthdays.map(b => ({
    ...b,
    description: null,
    time: null,
    end_time: null,
    location: null,
    department: null,
    participants: [],
    created_by: null,
    created_by_name: null,
    status: 'scheduled' as const,
    recurrence: null,
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))];

  // Filter birthdays for the week
  const upcomingBirthdays = allActivities.filter(a => 
    a.type === 'birthday' && isThisWeek(parseISO(a.date))
  );

  // Filter activities
  const filteredActivities = allActivities.filter(a => {
    if (filterType === 'all') return a.type !== 'birthday';
    return a.type === filterType;
  });

  // Group by date
  const todayActivities = filteredActivities.filter(a => isToday(parseISO(a.date)));
  const tomorrowActivities = filteredActivities.filter(a => isTomorrow(parseISO(a.date)));
  const weekActivities = filteredActivities.filter(a => {
    const date = parseISO(a.date);
    return isThisWeek(date) && !isToday(date) && !isTomorrow(date);
  });

  const handleCreateActivity = async () => {
    if (!newActivity.title || !newActivity.date) return;

    await createActivity({
      title: newActivity.title,
      description: newActivity.description || undefined,
      date: newActivity.date,
      time: newActivity.time || undefined,
      type: newActivity.type,
      priority: newActivity.priority,
    });

    setIsNewActivityOpen(false);
    setNewActivity({
      title: '',
      description: '',
      date: '',
      time: '',
      type: 'meeting',
      priority: 'medium',
    });
  };

  const ActivityCard = ({ activity }: { activity: typeof allActivities[0] }) => {
    return (
      <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border hover:shadow-md transition-shadow">
        <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
          {getActivityIcon(activity.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-foreground">{activity.title}</h4>
            {activity.priority && (
              <Badge variant="outline" className={
                activity.priority === 'high' ? 'border-destructive/30 text-destructive' :
                activity.priority === 'medium' ? 'border-warning/30 text-warning' :
                'border-muted text-muted-foreground'
              }>
                {activity.priority === 'high' ? 'alta' : activity.priority === 'medium' ? 'media' : 'baja'}
              </Badge>
            )}
          </div>
          {activity.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{activity.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarIcon className="w-3 h-3" />
              {format(parseISO(activity.date), 'PPP', { locale: es })}
            </span>
            {activity.time && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {activity.time}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Agenda de Actividades</h1>
            <p className="text-muted-foreground">Gestiona eventos, reuniones y fechas importantes</p>
          </div>
          <Dialog open={isNewActivityOpen} onOpenChange={setIsNewActivityOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nueva Actividad
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nueva Actividad</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Título *</Label>
                  <Input 
                    value={newActivity.title}
                    onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                    placeholder="Título de la actividad"
                  />
                </div>
                <div>
                  <Label>Descripción</Label>
                  <Textarea 
                    value={newActivity.description}
                    onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                    placeholder="Descripción de la actividad"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Fecha *</Label>
                    <Input 
                      type="date"
                      value={newActivity.date}
                      onChange={(e) => setNewActivity({...newActivity, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Hora</Label>
                    <Input 
                      type="time"
                      value={newActivity.time}
                      onChange={(e) => setNewActivity({...newActivity, time: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo</Label>
                    <Select value={newActivity.type} onValueChange={(v) => setNewActivity({...newActivity, type: v as Activity['type']})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="meeting">Reunión</SelectItem>
                        <SelectItem value="training">Capacitación</SelectItem>
                        <SelectItem value="event">Evento</SelectItem>
                        <SelectItem value="deadline">Fecha límite</SelectItem>
                        <SelectItem value="reminder">Recordatorio</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Prioridad</Label>
                    <Select value={newActivity.priority} onValueChange={(v) => setNewActivity({...newActivity, priority: v as Activity['priority']})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="low">Baja</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="w-full" onClick={handleCreateActivity}>
                  Crear Actividad
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Cumpleaños de la semana */}
        {upcomingBirthdays.length > 0 && (
          <Card className="border-pink-200 dark:border-pink-800 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-pink-700 dark:text-pink-300">
                <Cake className="w-5 h-5" />
                Cumpleaños Esta Semana
                <Badge variant="secondary" className="ml-2">{upcomingBirthdays.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {upcomingBirthdays.map((birthday) => {
                  const daysUntil = differenceInDays(parseISO(birthday.date), new Date());
                  return (
                    <div 
                      key={birthday.id}
                      className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/60 dark:bg-background/40 border border-pink-200 dark:border-pink-800"
                    >
                      <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white">
                        <Cake className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{birthday.title.replace('Cumpleaños de ', '')}</p>
                        <p className="text-xs text-muted-foreground">
                          {daysUntil === 0 ? '¡Hoy!' : daysUntil === 1 ? 'Mañana' : `En ${daysUntil} días`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendario */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Calendario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md"
                modifiers={{
                  hasActivity: allActivities.map(a => parseISO(a.date)),
                }}
                modifiersStyles={{
                  hasActivity: { 
                    backgroundColor: 'hsl(var(--primary) / 0.1)',
                    color: 'hsl(var(--primary))',
                    fontWeight: 'bold'
                  }
                }}
              />
            </CardContent>
          </Card>

          {/* Lista de actividades */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Actividades</CardTitle>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filtrar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="meeting">Reuniones</SelectItem>
                    <SelectItem value="training">Capacitaciones</SelectItem>
                    <SelectItem value="deadline">Fechas límite</SelectItem>
                    <SelectItem value="event">Eventos</SelectItem>
                    <SelectItem value="birthday">Cumpleaños</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : (
                <Tabs defaultValue="today">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="today">
                      Hoy <Badge variant="secondary" className="ml-1">{todayActivities.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="tomorrow">
                      Mañana <Badge variant="secondary" className="ml-1">{tomorrowActivities.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="week">
                      Esta Semana <Badge variant="secondary" className="ml-1">{weekActivities.length}</Badge>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="today" className="mt-4 space-y-3">
                    {todayActivities.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No hay actividades para hoy</p>
                    ) : (
                      todayActivities.map(activity => (
                        <ActivityCard key={activity.id} activity={activity} />
                      ))
                    )}
                  </TabsContent>
                  
                  <TabsContent value="tomorrow" className="mt-4 space-y-3">
                    {tomorrowActivities.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No hay actividades para mañana</p>
                    ) : (
                      tomorrowActivities.map(activity => (
                        <ActivityCard key={activity.id} activity={activity} />
                      ))
                    )}
                  </TabsContent>
                  
                  <TabsContent value="week" className="mt-4 space-y-3">
                    {weekActivities.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No hay más actividades esta semana</p>
                    ) : (
                      weekActivities.map(activity => (
                        <ActivityCard key={activity.id} activity={activity} />
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
