import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { mockTasks, mockWorkPlans, TASK_STATUS } from '@/data/hrmData';
import { mockEmployees } from '@/data/mockData';
import { Task, WorkPlan } from '@/types/hrm';
import { 
  ListTodo, 
  Plus, 
  Clock, 
  CheckCircle2, 
  Circle,
  Target,
  Calendar,
  User,
  Flag,
  MoreHorizontal,
  Play,
  Pause
} from 'lucide-react';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function TaskTrackerPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [workPlans] = useState<WorkPlan[]>(mockWorkPlans);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'media' as Task['priority'],
    dueDate: '',
    assignedTo: '',
  });

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const handleCreateTask = () => {
    if (!newTask.title) {
      toast.error('El título es requerido');
      return;
    }

    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      assignedTo: newTask.assignedTo || 'Sin asignar',
      assignedBy: 'Usuario actual',
      priority: newTask.priority,
      status: 'pending',
      dueDate: newTask.dueDate,
      createdAt: new Date().toISOString(),
    };

    setTasks([task, ...tasks]);
    setIsNewTaskOpen(false);
    setNewTask({ title: '', description: '', priority: 'media', dueDate: '', assignedTo: '' });
    toast.success('Tarea creada');
  };

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { 
        ...t, 
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
      } : t
    ));
    toast.success(`Tarea ${newStatus === 'completed' ? 'completada' : 'actualizada'}`);
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'alta': return 'text-destructive';
      case 'media': return 'text-warning';
      case 'baja': return 'text-success';
    }
  };

  const TaskCard = ({ task }: { task: Task }) => {
    const isOverdue = task.dueDate && isPast(parseISO(task.dueDate)) && task.status !== 'completed';
    const isDueToday = task.dueDate && isToday(parseISO(task.dueDate));

    return (
      <div className={`p-4 rounded-xl border bg-card hover:shadow-md transition-all ${isOverdue ? 'border-destructive/50' : ''}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1">
            <button 
              onClick={() => handleStatusChange(task.id, task.status === 'completed' ? 'pending' : 'completed')}
              className="mt-1"
            >
              {task.status === 'completed' ? (
                <CheckCircle2 className="w-5 h-5 text-success" />
              ) : task.status === 'in_progress' ? (
                <Play className="w-5 h-5 text-info" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
              </h4>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                {task.dueDate && (
                  <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-destructive' : isDueToday ? 'text-warning' : 'text-muted-foreground'}`}>
                    <Calendar className="w-3 h-3" />
                    {format(parseISO(task.dueDate), 'dd MMM', { locale: es })}
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="w-3 h-3" />
                  {task.assignedTo}
                </span>
                <Flag className={`w-3 h-3 ${getPriorityColor(task.priority)}`} />
              </div>
              {task.tags && task.tags.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {task.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {task.status !== 'in_progress' && (
                <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'in_progress')}>
                  <Play className="w-4 h-4 mr-2" />
                  En Progreso
                </DropdownMenuItem>
              )}
              {task.status !== 'pending' && task.status !== 'completed' && (
                <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'pending')}>
                  <Pause className="w-4 h-4 mr-2" />
                  Pausar
                </DropdownMenuItem>
              )}
              {task.status !== 'completed' && (
                <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'completed')}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Completar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
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
            <h1 className="text-3xl font-bold text-foreground">Tracker de Tareas</h1>
            <p className="text-muted-foreground">Gestiona tareas y planes de trabajo</p>
          </div>
          <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nueva Tarea
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nueva Tarea</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Título *</Label>
                  <Input 
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    placeholder="Título de la tarea"
                  />
                </div>
                <div>
                  <Label>Descripción</Label>
                  <Textarea 
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    placeholder="Descripción de la tarea"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Fecha Límite</Label>
                    <Input 
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Prioridad</Label>
                    <Select value={newTask.priority} onValueChange={(v) => setNewTask({...newTask, priority: v as Task['priority']})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="media">Media</SelectItem>
                        <SelectItem value="baja">Baja</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Asignar a</Label>
                  <Select value={newTask.assignedTo} onValueChange={(v) => setNewTask({...newTask, assignedTo: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar empleado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RRHH">RRHH</SelectItem>
                      {mockEmployees.slice(0, 10).map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={handleCreateTask}>
                  Crear Tarea
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-muted">
                  <Circle className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingTasks.length}</p>
                  <p className="text-sm text-muted-foreground">Pendientes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-info/10">
                  <Play className="w-6 h-6 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{inProgressTasks.length}</p>
                  <p className="text-sm text-muted-foreground">En Progreso</p>
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
                  <p className="text-2xl font-bold">{completedTasks.length}</p>
                  <p className="text-sm text-muted-foreground">Completadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-destructive/10">
                  <Clock className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {tasks.filter(t => t.dueDate && isPast(parseISO(t.dueDate)) && t.status !== 'completed').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Vencidas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tasks">
          <TabsList>
            <TabsTrigger value="tasks" className="gap-2">
              <ListTodo className="w-4 h-4" />
              Tareas
            </TabsTrigger>
            <TabsTrigger value="workplans" className="gap-2">
              <Target className="w-4 h-4" />
              Planes de Trabajo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pendientes */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Circle className="w-4 h-4 text-muted-foreground" />
                    Pendientes
                    <Badge variant="secondary">{pendingTasks.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pendingTasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                  {pendingTasks.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No hay tareas pendientes</p>
                  )}
                </CardContent>
              </Card>

              {/* En Progreso */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Play className="w-4 h-4 text-info" />
                    En Progreso
                    <Badge variant="secondary">{inProgressTasks.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {inProgressTasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                  {inProgressTasks.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No hay tareas en progreso</p>
                  )}
                </CardContent>
              </Card>

              {/* Completadas */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    Completadas
                    <Badge variant="secondary">{completedTasks.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {completedTasks.slice(0, 5).map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                  {completedTasks.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No hay tareas completadas</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="workplans" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {workPlans.map(plan => {
                const completedObjectives = plan.objectives.filter(o => o.status === 'completed').length;
                const progress = (completedObjectives / plan.objectives.length) * 100;

                return (
                  <Card key={plan.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{plan.title}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                        </div>
                        <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                          {plan.status === 'active' ? 'Activo' : plan.status === 'draft' ? 'Borrador' : 'Completado'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(parseISO(plan.startDate), 'dd MMM', { locale: es })} - {format(parseISO(plan.endDate), 'dd MMM yyyy', { locale: es })}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progreso</span>
                          <span className="font-medium">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Objetivos</Label>
                        {plan.objectives.map(objective => (
                          <div key={objective.id} className="flex items-center gap-2 text-sm">
                            {objective.status === 'completed' ? (
                              <CheckCircle2 className="w-4 h-4 text-success" />
                            ) : objective.status === 'in_progress' ? (
                              <Play className="w-4 h-4 text-info" />
                            ) : (
                              <Circle className="w-4 h-4 text-muted-foreground" />
                            )}
                            <span className={objective.status === 'completed' ? 'line-through text-muted-foreground' : ''}>
                              {objective.description}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
