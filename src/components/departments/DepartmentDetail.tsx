import { DepartmentInfo } from '@/types/organization';
import { Employee } from '@/types/attendance';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DepartmentOrgChart } from './DepartmentOrgChart';
import { PositionCard } from './PositionCard';
import { 
  Users, 
  Target, 
  ListChecks, 
  GitBranch,
  Briefcase,
  Calendar,
  Clock,
  UserCheck,
  UserX
} from 'lucide-react';
import { motion } from 'framer-motion';
import { mockDepartmentStats } from '@/data/mockData';

interface DepartmentDetailProps {
  department: DepartmentInfo;
  employees: Employee[];
}

export const DepartmentDetail = ({ department, employees }: DepartmentDetailProps) => {
  const stats = mockDepartmentStats.find(s => s.department === department.department);
  const totalPositions = department.positions.reduce((acc, p) => acc + p.employeeCount + p.vacant, 0);
  const totalVacant = department.positions.reduce((acc, p) => acc + p.vacant, 0);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Descripción</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{department.description}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Misión</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{department.mission}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${department.color}20` }}>
                <Users className="w-5 h-5" style={{ color: department.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalPositions}</p>
                <p className="text-xs text-muted-foreground">Total plazas</p>
              </div>
            </div>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-warning/10">
                <Briefcase className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalVacant}</p>
                <p className="text-xs text-muted-foreground">Vacantes</p>
              </div>
            </div>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-success/10">
                <UserCheck className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.presentToday || 0}</p>
                <p className="text-xs text-muted-foreground">Presentes hoy</p>
              </div>
            </div>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-destructive/10">
                <UserX className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.absences || 0}</p>
                <p className="text-xs text-muted-foreground">Ausentes</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="organigrama" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="organigrama" className="flex items-center gap-1.5">
            <GitBranch className="w-4 h-4" />
            <span className="hidden sm:inline">Organigrama</span>
          </TabsTrigger>
          <TabsTrigger value="personal" className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Personal</span>
          </TabsTrigger>
          <TabsTrigger value="puestos" className="flex items-center gap-1.5">
            <Briefcase className="w-4 h-4" />
            <span className="hidden sm:inline">Puestos</span>
          </TabsTrigger>
          <TabsTrigger value="funciones" className="flex items-center gap-1.5">
            <ListChecks className="w-4 h-4" />
            <span className="hidden sm:inline">Funciones</span>
          </TabsTrigger>
          <TabsTrigger value="objetivos" className="flex items-center gap-1.5">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Objetivos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organigrama" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Estructura Organizacional - {department.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <DepartmentOrgChart department={department} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personal" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Empleados del Área</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map(emp => (
                    <TableRow key={emp.id}>
                      <TableCell className="font-medium">{emp.name}</TableCell>
                      <TableCell>{emp.position}</TableCell>
                      <TableCell className="text-muted-foreground">{emp.email}</TableCell>
                      <TableCell>
                        <Badge variant={emp.status === 'active' ? 'success' : 'secondary'}>
                          {emp.status === 'active' ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {employees.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No hay empleados en este departamento
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="puestos" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {department.positions.map((pos, index) => (
              <PositionCard 
                key={pos.positionId} 
                position={pos} 
                color={department.color}
                index={index}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="funciones" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ListChecks className="w-5 h-5" style={{ color: department.color }} />
                Funciones del Área
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {department.functions.map((func, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white"
                      style={{ backgroundColor: department.color }}
                    >
                      {index + 1}
                    </div>
                    <span>{func}</span>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="objetivos" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-5 h-5" style={{ color: department.color }} />
                Objetivos del Área
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {department.objectives.map((obj, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg border-l-4"
                    style={{ borderColor: department.color, backgroundColor: `${department.color}10` }}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${department.color}20` }}
                      >
                        <Target className="w-4 h-4" style={{ color: department.color }} />
                      </div>
                      <p className="text-sm">{obj}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
