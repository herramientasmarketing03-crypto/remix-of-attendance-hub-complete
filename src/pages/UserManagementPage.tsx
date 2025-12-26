import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Search, UserCog, Shield, Users, Link2, RefreshCw, Edit, Unlink } from 'lucide-react';
import type { AppRole } from '@/contexts/AuthContext';

interface UserWithRole {
  id: string;
  user_id: string;
  email: string;
  nombres: string;
  apellidos: string;
  role: AppRole;
  area_id: string | null;
  employee_id: string | null;
  employee_name: string | null;
  created_at: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  user_id: string | null;
}

const DEPARTMENTS = [
  { value: 'rrhh', label: 'RRHH' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'soporte', label: 'Soporte' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'campanas', label: 'Campañas' },
  { value: 'ti', label: 'TI' },
  { value: 'digitalcollege', label: 'Digital College' },
  { value: 'finanzas', label: 'Finanzas' },
];

const ROLES: { value: AppRole; label: string; color: string }[] = [
  { value: 'admin_rrhh', label: 'Admin RRHH', color: 'bg-primary text-primary-foreground' },
  { value: 'jefe_area', label: 'Jefe de Área', color: 'bg-accent text-accent-foreground' },
  { value: 'empleado', label: 'Empleado', color: 'bg-muted text-muted-foreground' },
];

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [editForm, setEditForm] = useState({
    role: '' as AppRole,
    area_id: '',
  });
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch users with their roles and linked employees
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*');

      if (employeesError) throw employeesError;

      // Combine data
      const combinedUsers: UserWithRole[] = profilesData.map(profile => {
        const role = rolesData.find(r => r.user_id === profile.user_id);
        const employee = role?.employee_id 
          ? employeesData.find(e => e.id === role.employee_id)
          : null;

        return {
          id: role?.id || profile.id,
          user_id: profile.user_id,
          email: profile.email || '',
          nombres: profile.nombres,
          apellidos: profile.apellidos,
          role: (role?.role as AppRole) || 'empleado',
          area_id: role?.area_id || null,
          employee_id: role?.employee_id || null,
          employee_name: employee?.name || null,
          created_at: profile.created_at || '',
        };
      });

      setUsers(combinedUsers);
      setEmployees(employeesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = (user: UserWithRole) => {
    setSelectedUser(user);
    setEditForm({
      role: user.role,
      area_id: user.area_id || '',
    });
    setEditDialogOpen(true);
  };

  const handleLinkEmployee = (user: UserWithRole) => {
    setSelectedUser(user);
    setSelectedEmployeeId(user.employee_id || '');
    setLinkDialogOpen(true);
  };

  const saveRoleChanges = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .update({
          role: editForm.role,
          area_id: editForm.role === 'jefe_area' ? editForm.area_id : null,
        })
        .eq('user_id', selectedUser.user_id);

      if (error) throw error;

      toast.success('Rol actualizado correctamente');
      setEditDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Error al actualizar el rol');
    }
  };

  const saveLinkEmployee = async () => {
    if (!selectedUser) return;

    try {
      // Update user_roles with employee_id
      const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);
      
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({
          employee_id: selectedEmployeeId || null,
          area_id: selectedEmployee?.department || null,
        })
        .eq('user_id', selectedUser.user_id);

      if (roleError) throw roleError;

      // Update employee with user_id
      if (selectedEmployeeId) {
        // First, unlink any previous employee
        if (selectedUser.employee_id && selectedUser.employee_id !== selectedEmployeeId) {
          await supabase
            .from('employees')
            .update({ user_id: null })
            .eq('id', selectedUser.employee_id);
        }

        const { error: empError } = await supabase
          .from('employees')
          .update({ user_id: selectedUser.user_id })
          .eq('id', selectedEmployeeId);

        if (empError) throw empError;
      } else if (selectedUser.employee_id) {
        // Unlink employee
        await supabase
          .from('employees')
          .update({ user_id: null })
          .eq('id', selectedUser.employee_id);
      }

      toast.success('Empleado vinculado correctamente');
      setLinkDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error linking employee:', error);
      toast.error('Error al vincular empleado');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.apellidos.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const unlinkedEmployees = employees.filter(e => !e.user_id || e.id === selectedUser?.employee_id);

  const getRoleBadge = (role: AppRole) => {
    const roleConfig = ROLES.find(r => r.value === role);
    return (
      <Badge className={roleConfig?.color}>
        {roleConfig?.label || role}
      </Badge>
    );
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin_rrhh').length,
    jefes: users.filter(u => u.role === 'jefe_area').length,
    empleados: users.filter(u => u.role === 'empleado').length,
    linked: users.filter(u => u.employee_id).length,
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestión de Usuarios</h1>
            <p className="text-muted-foreground mt-1">Administrar roles y vincular empleados</p>
          </div>
          <Button onClick={fetchData} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Usuarios</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.admins}</p>
                  <p className="text-xs text-muted-foreground">Admins</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <UserCog className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.jefes}</p>
                  <p className="text-xs text-muted-foreground">Jefes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Users className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.empleados}</p>
                  <p className="text-xs text-muted-foreground">Empleados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Link2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.linked}</p>
                  <p className="text-xs text-muted-foreground">Vinculados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Usuarios Registrados</CardTitle>
            <CardDescription>Lista de usuarios con sus roles y empleados vinculados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  {ROLES.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Usuario</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Área</TableHead>
                      <TableHead>Empleado Vinculado</TableHead>
                      <TableHead>Registro</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No se encontraron usuarios
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.user_id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                  {user.nombres?.[0]}{user.apellidos?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.nombres} {user.apellidos}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell>
                            {user.area_id ? (
                              <Badge variant="outline">
                                {DEPARTMENTS.find(d => d.value === user.area_id)?.label || user.area_id}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.employee_name ? (
                              <div className="flex items-center gap-2">
                                <Link2 className="w-4 h-4 text-green-600" />
                                <span className="text-sm">{user.employee_name}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">Sin vincular</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString('es-PE')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditRole(user)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleLinkEmployee(user)}
                              >
                                <Link2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Role Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Rol de Usuario</DialogTitle>
              <DialogDescription>
                Modificar el rol y permisos de {selectedUser?.nombres} {selectedUser?.apellidos}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Rol</Label>
                <Select
                  value={editForm.role}
                  onValueChange={(value: AppRole) => setEditForm({ ...editForm, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {editForm.role === 'jefe_area' && (
                <div className="space-y-2">
                  <Label>Área a cargo</Label>
                  <Select
                    value={editForm.area_id}
                    onValueChange={(value) => setEditForm({ ...editForm, area_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar área" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map(dept => (
                        <SelectItem key={dept.value} value={dept.value}>
                          {dept.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={saveRoleChanges}>
                Guardar Cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Link Employee Dialog */}
        <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Vincular Empleado</DialogTitle>
              <DialogDescription>
                Vincular un registro de empleado a {selectedUser?.nombres} {selectedUser?.apellidos}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Empleado</Label>
                <Select
                  value={selectedEmployeeId}
                  onValueChange={setSelectedEmployeeId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar empleado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin vincular</SelectItem>
                    {unlinkedEmployees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name} - {emp.position} ({emp.department})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedEmployeeId && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Empleado seleccionado:</p>
                  {(() => {
                    const emp = employees.find(e => e.id === selectedEmployeeId);
                    return emp ? (
                      <div className="mt-2 space-y-1 text-sm">
                        <p><span className="text-muted-foreground">Nombre:</span> {emp.name}</p>
                        <p><span className="text-muted-foreground">Email:</span> {emp.email}</p>
                        <p><span className="text-muted-foreground">Puesto:</span> {emp.position}</p>
                        <p><span className="text-muted-foreground">Departamento:</span> {emp.department}</p>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={saveLinkEmployee}>
                {selectedEmployeeId ? 'Vincular' : 'Desvincular'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
