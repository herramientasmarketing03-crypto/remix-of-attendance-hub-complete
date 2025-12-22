import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  TaskStatus, 
  TaskPriority, 
  TaskCategory, 
  TaskResponsible 
} from '@/types/hrm';
import { 
  TASK_STATUSES, 
  TASK_PRIORITIES, 
  TASK_CATEGORIES,
  TASK_RESPONSIBLES
} from '@/data/hrmData';
import { 
  Plus, 
  GripVertical,
  Pencil,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

const EMOJI_OPTIONS = [
  '✅', '⏸️', '❌', '⛔', '📈', '⏱️', '💤', '🚀', '🔘', '💡',
  '🔴', '🟠', '🟡', '🟢', '⚪', '🔵', '🟣', '🚩', '👎', '⚡'
];

interface TrackerConfigProps {
  onSave: () => void;
}

export function TrackerConfig({ onSave }: TrackerConfigProps) {
  const [statuses, setStatuses] = useState<TaskStatus[]>(TASK_STATUSES);
  const [priorities, setPriorities] = useState<TaskPriority[]>(TASK_PRIORITIES);
  const [categories, setCategories] = useState<TaskCategory[]>(TASK_CATEGORIES);
  const [responsibles, setResponsibles] = useState<TaskResponsible[]>(TASK_RESPONSIBLES);

  const [isAddStatusOpen, setIsAddStatusOpen] = useState(false);
  const [isAddPriorityOpen, setIsAddPriorityOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddResponsibleOpen, setIsAddResponsibleOpen] = useState(false);

  const [newStatus, setNewStatus] = useState({ name: '', emoji: '✅', color: '#48BB78' });
  const [newPriority, setNewPriority] = useState({ name: '', emoji: '🟢', color: '#48BB78' });
  const [newCategory, setNewCategory] = useState({ name: '', color: '#4299E1' });
  const [newResponsible, setNewResponsible] = useState({ name: '' });

  const handleAddStatus = () => {
    if (!newStatus.name) {
      toast.error('El nombre es requerido');
      return;
    }
    const status: TaskStatus = {
      id: `status-${Date.now()}`,
      name: newStatus.name,
      emoji: newStatus.emoji,
      color: newStatus.color,
      order: statuses.length + 1,
    };
    setStatuses([...statuses, status]);
    setNewStatus({ name: '', emoji: '✅', color: '#48BB78' });
    setIsAddStatusOpen(false);
    toast.success('Estado agregado');
  };

  const handleAddPriority = () => {
    if (!newPriority.name) {
      toast.error('El nombre es requerido');
      return;
    }
    const priority: TaskPriority = {
      id: `priority-${Date.now()}`,
      name: newPriority.name,
      emoji: newPriority.emoji,
      color: newPriority.color,
      order: priorities.length + 1,
    };
    setPriorities([...priorities, priority]);
    setNewPriority({ name: '', emoji: '🟢', color: '#48BB78' });
    setIsAddPriorityOpen(false);
    toast.success('Prioridad agregada');
  };

  const handleAddCategory = () => {
    if (!newCategory.name) {
      toast.error('El nombre es requerido');
      return;
    }
    const category: TaskCategory = {
      id: `category-${Date.now()}`,
      name: newCategory.name.toUpperCase(),
      color: newCategory.color,
      order: categories.length + 1,
    };
    setCategories([...categories, category]);
    setNewCategory({ name: '', color: '#4299E1' });
    setIsAddCategoryOpen(false);
    toast.success('Categoría agregada');
  };

  const handleAddResponsible = () => {
    if (!newResponsible.name) {
      toast.error('El nombre es requerido');
      return;
    }
    const responsible: TaskResponsible = {
      id: `responsible-${Date.now()}`,
      name: newResponsible.name,
    };
    setResponsibles([...responsibles, responsible]);
    setNewResponsible({ name: '' });
    setIsAddResponsibleOpen(false);
    toast.success('Responsable agregado');
  };

  const handleDeleteStatus = (id: string) => {
    setStatuses(statuses.filter(s => s.id !== id));
    toast.success('Estado eliminado');
  };

  const handleDeletePriority = (id: string) => {
    setPriorities(priorities.filter(p => p.id !== id));
    toast.success('Prioridad eliminada');
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
    toast.success('Categoría eliminada');
  };

  const handleDeleteResponsible = (id: string) => {
    setResponsibles(responsibles.filter(r => r.id !== id));
    toast.success('Responsable eliminado');
  };

  return (
    <div className="space-y-6">
      <div className="text-center pb-4 border-b">
        <h2 className="text-2xl font-bold tracking-wide">CONFIGURACIÓN - INICIAL</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Emojis */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">EMOJIS</CardTitle>
            <p className="text-xs text-muted-foreground">Conjunto</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2">
              {EMOJI_OPTIONS.map((emoji, index) => (
                <button 
                  key={index}
                  className="p-2 text-lg hover:bg-muted rounded transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Prioridades */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">PRIORIDADES TAREAS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {priorities.map(priority => (
              <div 
                key={priority.id} 
                className="flex items-center justify-between p-2 rounded bg-muted/50 group"
              >
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  <span>{priority.emoji}</span>
                  <span 
                    className="text-sm font-medium"
                    style={{ color: priority.color }}
                  >
                    {priority.name}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={() => handleDeletePriority(priority.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
            <Dialog open={isAddPriorityOpen} onOpenChange={setIsAddPriorityOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full gap-1 mt-2">
                  <Plus className="w-3 h-3" />
                  Agregar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nueva Prioridad</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Nombre</Label>
                    <Input 
                      value={newPriority.name}
                      onChange={(e) => setNewPriority({...newPriority, name: e.target.value})}
                      placeholder="Ej: Crítica"
                    />
                  </div>
                  <div>
                    <Label>Emoji</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {['🔴', '🟠', '🟡', '🟢', '⚪', '🔵', '🟣'].map(emoji => (
                        <button
                          key={emoji}
                          className={`p-2 rounded ${newPriority.emoji === emoji ? 'bg-primary/20 ring-2 ring-primary' : 'hover:bg-muted'}`}
                          onClick={() => setNewPriority({...newPriority, emoji})}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Color</Label>
                    <Input 
                      type="color"
                      value={newPriority.color}
                      onChange={(e) => setNewPriority({...newPriority, color: e.target.value})}
                      className="h-10"
                    />
                  </div>
                  <Button className="w-full" onClick={handleAddPriority}>
                    Agregar Prioridad
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Estados */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">ESTADO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
            {statuses.map(status => (
              <div 
                key={status.id} 
                className="flex items-center justify-between p-2 rounded bg-muted/50 group"
              >
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  <span>{status.emoji}</span>
                  <span 
                    className="text-sm font-medium"
                    style={{ color: status.color }}
                  >
                    {status.name}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={() => handleDeleteStatus(status.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
            <Dialog open={isAddStatusOpen} onOpenChange={setIsAddStatusOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full gap-1 mt-2">
                  <Plus className="w-3 h-3" />
                  Agregar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nuevo Estado</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Nombre</Label>
                    <Input 
                      value={newStatus.name}
                      onChange={(e) => setNewStatus({...newStatus, name: e.target.value})}
                      placeholder="Ej: En revisión"
                    />
                  </div>
                  <div>
                    <Label>Emoji</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {EMOJI_OPTIONS.slice(0, 10).map(emoji => (
                        <button
                          key={emoji}
                          className={`p-2 rounded ${newStatus.emoji === emoji ? 'bg-primary/20 ring-2 ring-primary' : 'hover:bg-muted'}`}
                          onClick={() => setNewStatus({...newStatus, emoji})}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Color</Label>
                    <Input 
                      type="color"
                      value={newStatus.color}
                      onChange={(e) => setNewStatus({...newStatus, color: e.target.value})}
                      className="h-10"
                    />
                  </div>
                  <Button className="w-full" onClick={handleAddStatus}>
                    Agregar Estado
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Categorías */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">CATEGORÍA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
            {categories.map(category => (
              <div 
                key={category.id} 
                className="flex items-center justify-between p-2 rounded group"
                style={{ backgroundColor: `${category.color}20` }}
              >
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  <Badge style={{ backgroundColor: category.color }} className="text-white text-xs">
                    {category.name}
                  </Badge>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
            <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full gap-1 mt-2">
                  <Plus className="w-3 h-3" />
                  Agregar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nueva Categoría</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Nombre</Label>
                    <Input 
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                      placeholder="Ej: FINANZAS"
                    />
                  </div>
                  <div>
                    <Label>Color</Label>
                    <Input 
                      type="color"
                      value={newCategory.color}
                      onChange={(e) => setNewCategory({...newCategory, color: e.target.value})}
                      className="h-10"
                    />
                  </div>
                  <Button className="w-full" onClick={handleAddCategory}>
                    Agregar Categoría
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Responsables */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">RESPONSABLES</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
            {responsibles.map(responsible => (
              <div 
                key={responsible.id} 
                className="flex items-center justify-between p-2 rounded bg-muted/50 group"
              >
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  <span className="text-sm font-medium">{responsible.name}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={() => handleDeleteResponsible(responsible.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
            <Dialog open={isAddResponsibleOpen} onOpenChange={setIsAddResponsibleOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full gap-1 mt-2">
                  <Plus className="w-3 h-3" />
                  Agregar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nuevo Responsable</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Nombre</Label>
                    <Input 
                      value={newResponsible.name}
                      onChange={(e) => setNewResponsible({...newResponsible, name: e.target.value})}
                      placeholder="Ej: María García"
                    />
                  </div>
                  <Button className="w-full" onClick={handleAddResponsible}>
                    Agregar Responsable
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={onSave} className="gap-2">
          Guardar Configuración
        </Button>
      </div>
    </div>
  );
}