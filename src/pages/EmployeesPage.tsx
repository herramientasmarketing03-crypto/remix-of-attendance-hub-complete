import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Download } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { EmployeeTable } from '@/components/employees/EmployeeTable';
import { EmployeeDetailDialog } from '@/components/employees/EmployeeDetailDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { mockEmployees } from '@/data/mockData';
import { toast } from 'sonner';
import { Employee, EmployeeContract } from '@/types/attendance';

const EmployeesPage = () => {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDialogOpen(true);
  };

  const handleContactEmployee = (employee: Employee) => {
    toast.info(`Contactando a ${employee.name}`);
  };

  const handleEmployeeUpdate = (updatedEmployee: Employee) => {
    setEmployees(prev => prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
    setSelectedEmployee(updatedEmployee);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Gestión de Empleados</h1>
            <p className="text-muted-foreground">Administra la información de los colaboradores</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline"><Download className="w-4 h-4 mr-2" />Exportar</Button>
            <Button className="gradient-primary"><UserPlus className="w-4 h-4 mr-2" />Nuevo Empleado</Button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-card">
            <CardContent className="p-6">
              <EmployeeTable employees={employees} onViewEmployee={handleViewEmployee} onContactEmployee={handleContactEmployee} />
            </CardContent>
          </Card>
        </motion.div>

        <EmployeeDetailDialog employee={selectedEmployee} open={dialogOpen} onOpenChange={setDialogOpen} onEmployeeUpdate={handleEmployeeUpdate} />
      </div>
    </MainLayout>
  );
};

export default EmployeesPage;
