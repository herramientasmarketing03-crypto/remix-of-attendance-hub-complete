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
import { mockInventory, mockAreaRequirements } from '@/data/hrmData';
import { InventoryItem, AreaRequirement } from '@/types/hrm';
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
  Clock,
  DollarSign
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

const getCategoryIcon = (category: InventoryItem['category']) => {
  switch (category) {
    case 'equipment': return <Monitor className="w-4 h-4" />;
    case 'furniture': return <Armchair className="w-4 h-4" />;
    case 'supplies': return <FileBox className="w-4 h-4" />;
    case 'software_license': return <Key className="w-4 h-4" />;
    case 'vehicle': return <Car className="w-4 h-4" />;
    default: return <Package className="w-4 h-4" />;
  }
};

const getCategoryName = (category: InventoryItem['category']) => {
  switch (category) {
    case 'equipment': return 'Equipos';
    case 'furniture': return 'Mobiliario';
    case 'supplies': return 'Suministros';
    case 'software_license': return 'Licencias';
    case 'vehicle': return 'Vehículos';
    default: return 'Otros';
  }
};

export default function InventoryPage() {
  const [inventory] = useState<InventoryItem[]>(mockInventory);
  const [requirements, setRequirements] = useState<AreaRequirement[]>(mockAreaRequirements);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedRequirement, setSelectedRequirement] = useState<AreaRequirement | null>(null);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalValue = inventory.reduce((sum, item) => sum + (item.value * item.quantity), 0);
  const equipmentCount = inventory.filter(i => i.category === 'equipment').reduce((sum, i) => sum + i.quantity, 0);
  const licenseCount = inventory.filter(i => i.category === 'software_license').reduce((sum, i) => sum + i.quantity, 0);

  const handleApproveRequirement = (id: string) => {
    setRequirements(prev => prev.map(r => 
      r.id === id ? { ...r, status: 'approved' as const, approvedBy: 'Gerencia', approvedAt: new Date().toISOString() } : r
    ));
    toast.success('Requerimiento aprobado');
    setSelectedRequirement(null);
  };

  const handleRejectRequirement = (id: string) => {
    setRequirements(prev => prev.map(r => 
      r.id === id ? { ...r, status: 'rejected' as const } : r
    ));
    toast.info('Requerimiento rechazado');
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
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Item
          </Button>
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
                  <p className="text-2xl font-bold">{inventory.length}</p>
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
                  <p className="text-2xl font-bold">{equipmentCount}</p>
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
                  <p className="text-2xl font-bold">{licenseCount}</p>
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
                  <p className="text-2xl font-bold">S/. {totalValue.toLocaleString()}</p>
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
                      <SelectItem value="supplies">Suministros</SelectItem>
                      <SelectItem value="software_license">Licencias</SelectItem>
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
                    {filteredInventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-muted">
                              {getCategoryIcon(item.category)}
                            </div>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              {item.serialNumber && (
                                <p className="text-xs text-muted-foreground">S/N: {item.serialNumber}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getCategoryName(item.category)}</Badge>
                        </TableCell>
                        <TableCell>{item.quantity} {item.unit}</TableCell>
                        <TableCell>{item.location}</TableCell>
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
                            {item.status === 'disposed' && 'Dado de Baja'}
                          </Badge>
                        </TableCell>
                        <TableCell>S/. {item.value.toLocaleString()}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requirements" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Requerimientos de Área (Fijos y Variables)</CardTitle>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nuevo Requerimiento
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
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
                    {requirements.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{req.title}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-xs">{req.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{DEPARTMENTS[req.department].name}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={req.type === 'fijo' ? 'default' : 'secondary'}>
                            {req.type === 'fijo' ? 'Fijo' : 'Variable'}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">{req.category}</TableCell>
                        <TableCell>S/. {req.estimatedCost.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={
                            req.priority === 'alta' ? 'bg-destructive/10 text-destructive' :
                            req.priority === 'media' ? 'bg-warning/10 text-warning' :
                            'bg-success/10 text-success'
                          }>
                            {req.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            req.status === 'approved' ? 'bg-success/10 text-success' :
                            req.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                            req.status === 'in_evaluation' ? 'bg-info/10 text-info' :
                            'bg-warning/10 text-warning'
                          }>
                            {req.status === 'approved' && 'Aprobado'}
                            {req.status === 'rejected' && 'Rechazado'}
                            {req.status === 'in_evaluation' && 'En Evaluación'}
                            {req.status === 'pending' && 'Pendiente'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedRequirement(req)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                    selectedRequirement.status === 'in_evaluation' ? 'bg-info/10 text-info' :
                    'bg-warning/10 text-warning'
                  }>
                    {selectedRequirement.status === 'approved' && 'Aprobado'}
                    {selectedRequirement.status === 'rejected' && 'Rechazado'}
                    {selectedRequirement.status === 'in_evaluation' && 'En Evaluación'}
                    {selectedRequirement.status === 'pending' && 'Pendiente'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Departamento</Label>
                    <p className="font-medium">{DEPARTMENTS[selectedRequirement.department].name}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Solicitado por</Label>
                    <p className="font-medium">{selectedRequirement.requestedBy}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Tipo de Gasto</Label>
                    <Badge variant={selectedRequirement.type === 'fijo' ? 'default' : 'secondary'}>
                      {selectedRequirement.type === 'fijo' ? 'Gasto Fijo' : 'Gasto Variable'}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Categoría</Label>
                    <p className="font-medium capitalize">{selectedRequirement.category}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Costo Estimado</Label>
                    <p className="text-xl font-bold text-primary">S/. {selectedRequirement.estimatedCost.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Frecuencia</Label>
                    <p className="font-medium capitalize">{selectedRequirement.frequency === 'one_time' ? 'Único' : selectedRequirement.frequency}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-muted-foreground">Justificación</Label>
                  <p className="p-3 rounded-lg bg-muted/50">{selectedRequirement.justification}</p>
                </div>

                {selectedRequirement.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button className="flex-1 gap-2" onClick={() => handleApproveRequirement(selectedRequirement.id)}>
                      <CheckCircle className="w-4 h-4" />
                      Aprobar
                    </Button>
                    <Button variant="destructive" className="gap-2" onClick={() => handleRejectRequirement(selectedRequirement.id)}>
                      <XCircle className="w-4 h-4" />
                      Rechazar
                    </Button>
                  </div>
                )}

                {selectedRequirement.approvedBy && (
                  <div className="p-4 rounded-xl bg-success/5 border border-success/20">
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Aprobado por {selectedRequirement.approvedBy}</span>
                    </div>
                    {selectedRequirement.approvedAt && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(parseISO(selectedRequirement.approvedAt), 'PPP', { locale: es })}
                      </p>
                    )}
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
