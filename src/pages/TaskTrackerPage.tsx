import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockTasks, TASK_STATUSES, TASK_PRIORITIES, TASK_CATEGORIES, TASK_RESPONSIBLES } from '@/data/hrmData';
import { Task } from '@/types/hrm';
import { useAuth } from '@/contexts/AuthContext';
import { EmployeeTaskPanel } from '@/components/tracker/EmployeeTaskPanel';
import { AdminDashboard } from '@/components/tracker/AdminDashboard';
import { TrackerCalendar } from '@/components/tracker/TrackerCalendar';
import { TrackerConfig } from '@/components/tracker/TrackerConfig';
import { 
  ListTodo, 
  LayoutDashboard, 
  Calendar, 
  Settings,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

export default function TaskTrackerPage() {
  const { isAdmin, isJefe, user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [activeTab, setActiveTab] = useState('mi-panel');
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priorityId: 'medium',
    statusId: 'pending',
    categoryId: 'rrhh',
    assignedTo: 'yo',
    dueDate: '',
    link: '',
  });

  const canManage = isAdmin || isJefe;
  const currentUserId = user?.id || 'yo';

  const handleCreateTask = () => {
    if (!newTask.title) {
      toast.error('El título es requerido');
      return;
    }

    const responsible = TASK_RESPONSIBLES.find(r => r.id === newTask.assignedTo);
    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      assignedTo: newTask.assignedTo,
      assignedToName: responsible?.name || 'Sin asignar',
      assignedBy: user?.nombres || 'Usuario',
      priorityId: newTask.priorityId,
      statusId: newTask.statusId,
      categoryId: newTask.categoryId,
      dueDate: newTask.dueDate || undefined,
      link: newTask.link || undefined,
      createdAt: new Date().toISOString(),
      isCompleted: false,
    };

    setTasks([task, ...tasks]);
    setIsNewTaskOpen(false);
    setNewTask({
      title: '',
      description: '',
      priorityId: 'medium',
      statusId: 'pending',
      categoryId: 'rrhh',
      assignedTo: 'yo',
      dueDate: '',
      link: '',
    });
    toast.success('Tarea creada');
  };

  const handleStatusChange = (taskId: string, statusId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { 
        ...t, 
        statusId,
        isCompleted: statusId === 'completed',
        completedAt: statusId === 'completed' ? new Date().toISOString() : undefined
      } : t
    ));
  };

  const handleToggleComplete = (taskId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { 
        ...t, 
        isCompleted: !t.isCompleted,
        statusId: !t.isCompleted ? 'completed' : 'pending',
        completedAt: !t.isCompleted ? new Date().toISOString() : undefined
      } : t
    ));
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <ListTodo className="w-8 h-8" />
              {activeTab === 'mi-panel' ? 'MIS TAREAS' : 
               activeTab === 'dashboard' ? 'DASHBOARD' :
               activeTab === 'calendario' ? 'CALENDARIO' : 'CONFIGURACIÓN'}
            </h1>
            <p className="text-muted-foreground">
              Fecha: {format(new Date(), "MMMM dd, yyyy", { locale: es })}
            </p>
          </div>
          
          {canManage && (
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
                      <Select value={newTask.priorityId} onValueChange={(v) => setNewTask({...newTask, priorityId: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {TASK_PRIORITIES.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.emoji} {p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Categoría</Label>
                      <Select value={newTask.categoryId} onValueChange={(v) => setNewTask({...newTask, categoryId: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {TASK_CATEGORIES.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Asignar a</Label>
                      <Select value={newTask.assignedTo} onValueChange={(v) => setNewTask({...newTask, assignedTo: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {TASK_RESPONSIBLES.map(r => (
                            <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
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
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="mi-panel" className="gap-2">
              <ListTodo className="w-4 h-4" />
              Mi Panel
            </TabsTrigger>
            {canManage && (
              <TabsTrigger value="dashboard" className="gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
            )}
            <TabsTrigger value="calendario" className="gap-2">
              <Calendar className="w-4 h-4" />
              Calendario
            </TabsTrigger>
            {canManage && (
              <TabsTrigger value="config" className="gap-2">
                <Settings className="w-4 h-4" />
                Configuración
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="mi-panel" className="mt-6">
            <EmployeeTaskPanel 
              tasks={tasks}
              onStatusChange={handleStatusChange}
              onToggleComplete={handleToggleComplete}
              currentUserId={currentUserId}
            />
          </TabsContent>

          {canManage && (
            <TabsContent value="dashboard" className="mt-6">
              <AdminDashboard 
                tasks={tasks}
                onViewTracker={() => setActiveTab('mi-panel')}
                onViewCalendar={() => setActiveTab('calendario')}
              />
            </TabsContent>
          )}

          <TabsContent value="calendario" className="mt-6">
            <TrackerCalendar 
              tasks={tasks}
              isAdmin={canManage}
              currentUserId={currentUserId}
              onViewTracker={() => setActiveTab('mi-panel')}
            />
          </TabsContent>

          {canManage && (
            <TabsContent value="config" className="mt-6">
              <TrackerConfig onSave={() => toast.success('Configuración guardada')} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </MainLayout>
  );
}