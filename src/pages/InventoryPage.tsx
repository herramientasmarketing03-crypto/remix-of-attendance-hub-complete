import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useInventory, InventoryItem } from '@/hooks/useInventory';
import { useAreaRequirements } from '@/hooks/useAreaRequirements';
import { useAuth } from '@/contexts/AuthContext';
import { DEPARTMENTS } from '@/types/attendance';
import { 
  Package, 
  Search, 
  Plus, 
  Monitor,
  Armchair,
  FileBox,
  Key,
  Car,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

const getCategoryIcon = (category: InventoryItem['category']) => {
  switch (category) {
    case 'equipment': return <Monitor className="w-4 h-4" />;
    case 'furniture': return <Armchair className="w-4 h-4" />;
    case 'supplies': return <FileBox className="w-4 h-4" />;
    case 'software': return <Key className="w-4 h-4" />;
    case 'vehicle': return <Car className="w-4 h-4" />;
    default: return <Package className="w-4 h-4" />;
  }
};

const getCategoryName = (category: InventoryItem['category']) => {
  switch (category) {
    case 'equipment': return 'Equipos';
    case 'furniture': return 'Mobiliario';
    case 'supplies': return 'Suministros';
    case 'software': return 'Software';
    case 'technology': return 'Tecnología';
    case 'vehicle': return 'Vehículos';
    default: return 'Otros';
  }
};

export default function InventoryPage() {
  const { inventory, loading: loadingInventory, createItem } = useInventory();
  const { areaRequirements, loading: loadingReqs, createAreaRequirement, approveAreaRequirement, rejectAreaRequirement } = useAreaRequirements();
  const { profile } = useAuth();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedRequirement, setSelectedRequirement] = useState<any>(null);
  const [isNewItemOpen, setIsNewItemOpen] = useState(false);
  const [isNewReqOpen, setIsNewReqOpen] = useState(false);
  
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'equipment' as InventoryItem['category'],
    quantity: 1,
    location: '',
    serial_number: '',
    purchase_value: '',
  });

  const [newReq, setNewReq] = useState({
    title: '',
    description: '',
    department: '',
    expense_type: 'variable' as const,
    category: 'other' as const,
    estimated_cost: '',
    priority: 'medium' as const,
    justification: '',
  });

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalValue = inventory.reduce((sum, item) => sum + (Number(item.current_value || item.purchase_value || 0) * item.quantity), 0);
  const equipmentCount = inventory.filter(i => i.category === 'equipment' || i.category === 'technology').reduce((sum, i) => sum + i.quantity, 0);
  const softwareCount = inventory.filter(i => i.category === 'software').reduce((sum, i) => sum + i.quantity, 0);

  const handleCreateItem = async () => {
    if (!newItem.name || !newItem.category) return;
    
    await createItem({
      name: newItem.name,
      category: newItem.category,
      quantity: newItem.quantity,
      location: newItem.location || undefined,
      serial_number: newItem.serial_number || undefined,
      purchase_value: newItem.purchase_value ? Number(newItem.purchase_value) : undefined,
    });
    
    setIsNewItemOpen(false);
    setNewItem({ name: '', category: 'equipment', quantity: 1, location: '', serial_number: '', purchase_value: '' });
  };

  const handleCreateReq = async () => {
    if (!newReq.title || !newReq.department || !newReq.estimated_cost) return;
    
    const requestedBy = profile ? `${profile.nombres} ${profile.apellidos}` : 'Usuario';
    await createAreaRequirement({
      title: newReq.title,
      description: newReq.description || undefined,
      department: newReq.department,
      expense_type: newReq.expense_type,
      category: newReq.category,
      estimated_cost: Number(newReq.estimated_cost),
      priority: newReq.priority,
      justification: newReq.justification || undefined,
      requested_by: requestedBy,
    });
    
    setIsNewReqOpen(false);
    setNewReq({ title: '', description: '', department: '', expense_type: 'variable', category: 'other', estimated_cost: '', priority: 'medium', justification: '' });
  };

  const handleApproveRequirement = async () => {
    if (!selectedRequirement) return;
    const approverName = profile ? `${profile.nombres} ${profile.apellidos}` : 'Admin';
    await approveAreaRequirement(selectedRequirement.id, approverName);
    setSelectedRequirement(null);
  };

  const handleRejectRequirement = async () => {
    if (!selectedRequirement) return;
    const approverName = profile ? `${profile.nombres} ${profile.apellidos}` : 'Admin';
    await rejectAreaRequirement(selectedRequirement.id, approverName);
    setSelectedRequirement(null);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Inventario y Logística</h1>
            <p className="text-muted-foreground">Gestión de activos y requerimientos de área</p>
          </div>
          <Dialog open={isNewItemOpen} onOpenChange={setIsNewItemOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nuevo Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Item al Inventario</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Nombre *</Label>
                  <Input value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} placeholder="Nombre del item" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Categoría *</Label>
                    <Select value={newItem.category} onValueChange={(v: any) => setNewItem({...newItem, category: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equipment">Equipos</SelectItem>
                        <SelectItem value="furniture">Mobiliario</SelectItem>
                        <SelectItem value="technology">Tecnología</SelectItem>
                        <SelectItem value="software">Software</SelectItem>
                        <SelectItem value="supplies">Suministros</SelectItem>
                        <SelectItem value="vehicle">Vehículos</SelectItem>
                        <SelectItem value="other">Otros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Cantidad</Label>
                    <Input type="number" min={1} value={newItem.quantity} onChange={(e) => setNewItem({...newItem, quantity: Number(e.target.value)})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Ubicación</Label>
                    <Input value={newItem.location} onChange={(e) => setNewItem({...newItem, location: e.target.value})} placeholder="Ubicación" />
                  </div>
                  <div>
                    <Label>Número de Serie</Label>
                    <Input value={newItem.serial_number} onChange={(e) => setNewItem({...newItem, serial_number: e.target.value})} placeholder="S/N" />
                  </div>
                </div>
                <div>
                  <Label>Valor de Compra (S/.)</Label>
                  <Input type="number" value={newItem.purchase_value} onChange={(e) => setNewItem({...newItem, purchase_value: e.target.value})} placeholder="0.00" />
                </div>
                <Button className="w-full" onClick={handleCreateItem}>Agregar Item</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  {loadingInventory ? <Skeleton className="h-8 w-12" /> : (
                    <p className="text-2xl font-bold">{inventory.length}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Tipos de Items</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-info/10">
                  <Monitor className="w-6 h-6 text-info" />
                </div>
                <div>
                  {loadingInventory ? <Skeleton className="h-8 w-12" /> : (
                    <p className="text-2xl font-bold">{equipmentCount}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Equipos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-success/10">
                  <Key className="w-6 h-6 text-success" />
                </div>
                <div>
                  {loadingInventory ? <Skeleton className="h-8 w-12" /> : (
                    <p className="text-2xl font-bold">{softwareCount}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Licencias</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-warning/10">
                  <DollarSign className="w-6 h-6 text-warning" />
                </div>
                <div>
                  {loadingInventory ? <Skeleton className="h-8 w-20" /> : (
                    <p className="text-2xl font-bold">S/. {totalValue.toLocaleString()}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="inventory">
          <TabsList>
            <TabsTrigger value="inventory" className="gap-2">
              <Package className="w-4 h-4" />
              Inventario
            </TabsTrigger>
            <TabsTrigger value="requirements" className="gap-2">
              <FileBox className="w-4 h-4" />
              Requerimientos de Área
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="mt-6 space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Buscar item..." 
                      className="pl-9"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      <SelectItem value="equipment">Equipos</SelectItem>
                      <SelectItem value="furniture">Mobiliario</SelectItem>
                      <SelectItem value="technology">Tecnología</SelectItem>
                      <SelectItem value="software">Software</SelectItem>
                      <SelectItem value="supplies">Suministros</SelectItem>
                      <SelectItem value="vehicle">Vehículos</SelectItem>
                      <SelectItem value="other">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Table */}
            <Card>
              <CardContent className="pt-6">
                {loadingInventory ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Ubicación</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Valor Unit.</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInventory.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No hay items en el inventario
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredInventory.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-muted">
                                  {getCategoryIcon(item.category)}
                                </div>
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  {item.serial_number && (
                                    <p className="text-xs text-muted-foreground">S/N: {item.serial_number}</p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{getCategoryName(item.category)}</Badge>
                            </TableCell>
                            <TableCell>{item.quantity} {item.unit}</TableCell>
                            <TableCell>{item.location || '-'}</TableCell>
                            <TableCell>
                              <Badge className={
                                item.status === 'available' ? 'bg-success/10 text-success' :
                                item.status === 'in_use' ? 'bg-info/10 text-info' :
                                item.status === 'maintenance' ? 'bg-warning/10 text-warning' :
                                'bg-muted text-muted-foreground'
                              }>
                                {item.status === 'available' && 'Disponible'}
                                {item.status === 'in_use' && 'En Uso'}
                                {item.status === 'maintenance' && 'Mantenimiento'}
                                {item.status === 'damaged' && 'Dañado'}
                                {item.status === 'disposed' && 'Dado de Baja'}
                              </Badge>
                            </TableCell>
                            <TableCell>S/. {(item.current_value || item.purchase_value || 0).toLocaleString()}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requirements" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Requerimientos de Área (Fijos y Variables)</CardTitle>
                  <Dialog open={isNewReqOpen} onOpenChange={setIsNewReqOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Nuevo Requerimiento
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Nuevo Requerimiento de Área</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div>
                          <Label>Título *</Label>
                          <Input value={newReq.title} onChange={(e) => setNewReq({...newReq, title: e.target.value})} placeholder="Nombre del requerimiento" />
                        </div>
                        <div>
                          <Label>Descripción</Label>
                          <Textarea value={newReq.description} onChange={(e) => setNewReq({...newReq, description: e.target.value})} placeholder="Descripción detallada" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Departamento *</Label>
                            <Select value={newReq.department} onValueChange={(v) => setNewReq({...newReq, department: v})}>
                              <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                              <SelectContent>
                                {Object.entries(DEPARTMENTS).map(([key, dept]) => (
                                  <SelectItem key={key} value={key}>{dept.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Tipo de Gasto</Label>
                            <Select value={newReq.expense_type} onValueChange={(v: any) => setNewReq({...newReq, expense_type: v})}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="fixed">Fijo</SelectItem>
                                <SelectItem value="variable">Variable</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Categoría</Label>
                            <Select value={newReq.category} onValueChange={(v: any) => setNewReq({...newReq, category: v})}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="software">Software</SelectItem>
                                <SelectItem value="hardware">Hardware</SelectItem>
                                <SelectItem value="service">Servicio</SelectItem>
                                <SelectItem value="subscription">Suscripción</SelectItem>
                                <SelectItem value="training">Capacitación</SelectItem>
                                <SelectItem value="infrastructure">Infraestructura</SelectItem>
                                <SelectItem value="other">Otro</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Costo Estimado (S/.) *</Label>
                            <Input type="number" value={newReq.estimated_cost} onChange={(e) => setNewReq({...newReq, estimated_cost: e.target.value})} placeholder="0.00" />
                          </div>
                        </div>
                        <div>
                          <Label>Prioridad</Label>
                          <Select value={newReq.priority} onValueChange={(v: any) => setNewReq({...newReq, priority: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Baja</SelectItem>
                              <SelectItem value="medium">Media</SelectItem>
                              <SelectItem value="high">Alta</SelectItem>
                              <SelectItem value="urgent">Urgente</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Justificación</Label>
                          <Textarea value={newReq.justification} onChange={(e) => setNewReq({...newReq, justification: e.target.value})} placeholder="¿Por qué se necesita?" />
                        </div>
                        <Button className="w-full" onClick={handleCreateReq}>Enviar Requerimiento</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {loadingReqs ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Requerimiento</TableHead>
                        <TableHead>Departamento</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Costo Est.</TableHead>
                        <TableHead>Prioridad</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {areaRequirements.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            No hay requerimientos de área
                          </TableCell>
                        </TableRow>
                      ) : (
                        areaRequirements.map((req) => (
                          <TableRow key={req.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{req.title}</p>
                                {req.description && (
                                  <p className="text-xs text-muted-foreground truncate max-w-xs">{req.description}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{DEPARTMENTS[req.department]?.name || req.department}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={req.expense_type === 'fixed' ? 'default' : 'secondary'}>
                                {req.expense_type === 'fixed' ? 'Fijo' : 'Variable'}
                              </Badge>
                            </TableCell>
                            <TableCell className="capitalize">{req.category}</TableCell>
                            <TableCell>S/. {Number(req.estimated_cost).toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge className={
                                req.priority === 'urgent' ? 'bg-destructive text-destructive-foreground' :
                                req.priority === 'high' ? 'bg-destructive/10 text-destructive' :
                                req.priority === 'medium' ? 'bg-warning/10 text-warning' :
                                'bg-success/10 text-success'
                              }>
                                {req.priority === 'urgent' ? 'Urgente' : req.priority === 'high' ? 'Alta' : req.priority === 'medium' ? 'Media' : 'Baja'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                req.status === 'approved' ? 'bg-success/10 text-success' :
                                req.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                                req.status === 'purchased' ? 'bg-info/10 text-info' :
                                'bg-warning/10 text-warning'
                              }>
                                {req.status === 'approved' && 'Aprobado'}
                                {req.status === 'rejected' && 'Rechazado'}
                                {req.status === 'purchased' && 'Comprado'}
                                {req.status === 'pending' && 'Pendiente'}
                                {req.status === 'cancelled' && 'Cancelado'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" onClick={() => setSelectedRequirement(req)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog Requirement Detail */}
        <Dialog open={!!selectedRequirement} onOpenChange={() => setSelectedRequirement(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalle del Requerimiento</DialogTitle>
            </DialogHeader>
            {selectedRequirement && (
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{selectedRequirement.title}</h3>
                    <p className="text-muted-foreground">{selectedRequirement.description}</p>
                  </div>
                  <Badge className={
                    selectedRequirement.status === 'approved' ? 'bg-success/10 text-success' :
                    selectedRequirement.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                    'bg-warning/10 text-warning'
                  }>
                    {selectedRequirement.status === 'approved' ? 'Aprobado' :
                     selectedRequirement.status === 'rejected' ? 'Rechazado' :
                     selectedRequirement.status === 'purchased' ? 'Comprado' : 'Pendiente'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Departamento</Label>
                    <p className="font-medium">{DEPARTMENTS[selectedRequirement.department]?.name || selectedRequirement.department}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Solicitado por</Label>
                    <p className="font-medium">{selectedRequirement.requested_by}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Tipo de Gasto</Label>
                    <Badge variant={selectedRequirement.expense_type === 'fixed' ? 'default' : 'secondary'}>
                      {selectedRequirement.expense_type === 'fixed' ? 'Gasto Fijo' : 'Gasto Variable'}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Categoría</Label>
                    <p className="font-medium capitalize">{selectedRequirement.category}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Costo Estimado</Label>
                    <p className="font-medium text-lg">S/. {Number(selectedRequirement.estimated_cost).toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Prioridad</Label>
                    <Badge className={
                      selectedRequirement.priority === 'urgent' ? 'bg-destructive text-destructive-foreground' :
                      selectedRequirement.priority === 'high' ? 'bg-destructive/10 text-destructive' :
                      selectedRequirement.priority === 'medium' ? 'bg-warning/10 text-warning' :
                      'bg-success/10 text-success'
                    }>
                      {selectedRequirement.priority === 'urgent' ? 'Urgente' : 
                       selectedRequirement.priority === 'high' ? 'Alta' : 
                       selectedRequirement.priority === 'medium' ? 'Media' : 'Baja'}
                    </Badge>
                  </div>
                </div>

                {selectedRequirement.justification && (
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Justificación</Label>
                    <p className="text-sm">{selectedRequirement.justification}</p>
                  </div>
                )}

                {selectedRequirement.status === 'pending' && (
                  <div className="flex gap-3 pt-4">
                    <Button className="flex-1 bg-success hover:bg-success/90" onClick={handleApproveRequirement}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Aprobar
                    </Button>
                    <Button variant="destructive" className="flex-1" onClick={handleRejectRequirement}>
                      <XCircle className="w-4 h-4 mr-2" />
                      Rechazar
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
