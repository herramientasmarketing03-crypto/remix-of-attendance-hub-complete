import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Wallet, Download, FileText, DollarSign, Clock, Users, Calculator } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockEmployees, mockAttendanceRecords } from '@/data/mockData';
import { Payslip } from '@/types/payroll';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Calculate payslip based on attendance data
function calculatePayslip(employeeId: string, period: string, baseSalary: number): Payslip {
  const records = mockAttendanceRecords.filter(r => r.employeeId === employeeId);
  
  const totalTardyMinutes = records.reduce((acc, r) => acc + r.tardyMinutes, 0);
  const totalAbsences = records.reduce((acc, r) => acc + r.absences, 0);
  const totalOvertime = records.reduce((acc, r) => acc + r.overtimeWeekday + r.overtimeHoliday, 0);
  
  // Calculate deductions
  const hourlyRate = baseSalary / 240; // 240 hours per month
  const minuteRate = hourlyRate / 60;
  
  const tardyDeduction = totalTardyMinutes * minuteRate;
  const absenceDeduction = totalAbsences * (baseSalary / 30);
  const afpDeduction = baseSalary * 0.13;
  const overtimePay = totalOvertime * hourlyRate * 1.25;
  
  // Income tax calculation (simplified)
  const incomeTaxDeduction = baseSalary > 4000 ? (baseSalary - 4000) * 0.08 : 0;
  
  const totalDeductions = tardyDeduction + absenceDeduction + afpDeduction + incomeTaxDeduction;
  const totalBonuses = overtimePay;
  const netSalary = baseSalary - totalDeductions + totalBonuses;

  return {
    id: `${employeeId}-${period}`,
    employeeId,
    period,
    date: new Date().toISOString().split('T')[0],
    grossSalary: baseSalary,
    tardyMinutes: totalTardyMinutes,
    tardyDeduction,
    absenceDays: totalAbsences,
    absenceDeduction,
    overtimeHours: totalOvertime,
    overtimePay,
    afpDeduction,
    incomeTaxDeduction,
    otherDeductions: [],
    totalDeductions,
    totalBonuses,
    netSalary,
    status: 'generated'
  };
}

const PayrollPage = () => {
  const { isAdmin, userRole } = useAuth();
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedMonth, setSelectedMonth] = useState('12');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  // Get current employee for empleado view
  const currentEmployeeId = userRole?.employeeId || '4';
  const currentEmployee = mockEmployees.find(e => e.id === currentEmployeeId);

  // Generate payslips for all employees (admin) or current employee
  const payslips = useMemo(() => {
    const period = `${selectedMonth}/${selectedYear}`;
    const employees = isAdmin ? mockEmployees : [currentEmployee].filter(Boolean);
    
    return employees.map(emp => {
      if (!emp) return null;
      const baseSalary = 4500; // Default salary, should come from contracts
      return { payslip: calculatePayslip(emp.id, period, baseSalary), employee: emp };
    }).filter(Boolean) as { payslip: Payslip; employee: typeof mockEmployees[0] }[];
  }, [isAdmin, currentEmployee, selectedMonth, selectedYear]);

  const selectedPayslipData = selectedEmployee 
    ? payslips.find(p => p.employee.id === selectedEmployee) 
    : payslips[0];

  // Summary stats for admin
  const totalGross = payslips.reduce((acc, p) => acc + p.payslip.grossSalary, 0);
  const totalDeductions = payslips.reduce((acc, p) => acc + p.payslip.totalDeductions, 0);
  const totalNet = payslips.reduce((acc, p) => acc + p.payslip.netSalary, 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold">Boletas de Pago</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Gestiona las boletas de pago de todos los empleados' : 'Consulta y descarga tus boletas de pago'}
          </p>
        </motion.div>

        {/* Period selector */}
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Período:</span>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                        {new Date(2024, i).toLocaleDateString('es', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {isAdmin && (
                <Button className="gradient-primary ml-auto">
                  <Calculator className="w-4 h-4 mr-2" />
                  Generar Boletas del Período
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Admin Summary */}
        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{payslips.length}</p>
                    <p className="text-sm text-muted-foreground">Empleados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-success/10">
                    <DollarSign className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">S/. {totalGross.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Bruto</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-destructive/10">
                    <Wallet className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">S/. {totalDeductions.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Descuentos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-info/10">
                    <DollarSign className="w-6 h-6 text-info" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">S/. {totalNet.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Neto</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Employee/Payslip List */}
          <div className="lg:col-span-1">
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  {isAdmin ? 'Empleados' : 'Historial'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
                {payslips.map((data, index) => (
                  <motion.div
                    key={data.employee.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      selectedEmployee === data.employee.id || (!selectedEmployee && index === 0)
                        ? 'bg-primary/10 border-2 border-primary' 
                        : 'bg-muted/30 hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedEmployee(data.employee.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {data.employee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{data.employee.name}</p>
                        <p className="text-sm text-muted-foreground">S/. {data.payslip.netSalary.toLocaleString()}</p>
                      </div>
                      {data.payslip.tardyMinutes > 0 && (
                        <Badge variant="warning" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {data.payslip.tardyMinutes}m
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Payslip Detail */}
          <div className="lg:col-span-2">
            {selectedPayslipData ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="glass-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Boleta de Pago - {selectedPayslipData.payslip.period}</CardTitle>
                        <CardDescription>{selectedPayslipData.employee.name} · {selectedPayslipData.employee.position}</CardDescription>
                      </div>
                      <Button className="gradient-primary">
                        <Download className="w-4 h-4 mr-2" />
                        Descargar PDF
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-success/10">
                              <DollarSign className="w-5 h-5 text-success" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Sueldo Bruto</p>
                              <p className="text-xl font-bold">S/. {selectedPayslipData.payslip.grossSalary.toLocaleString()}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-destructive/10">
                              <Wallet className="w-5 h-5 text-destructive" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Total Descuentos</p>
                              <p className="text-xl font-bold text-destructive">-S/. {selectedPayslipData.payslip.totalDeductions.toFixed(2)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="bg-primary/5 border-primary/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Wallet className="w-5 h-5 text-primary" />
                            </div>
                            <p className="font-medium">Sueldo Neto a Recibir</p>
                          </div>
                          <p className="text-2xl font-bold text-primary">S/. {selectedPayslipData.payslip.netSalary.toFixed(2)}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="rounded-xl border">
                      <div className="p-4 border-b bg-muted/30">
                        <h4 className="font-semibold">Detalle de Descuentos</h4>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">AFP (13%)</span>
                          <span>S/. {selectedPayslipData.payslip.afpDeduction.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Impuesto a la Renta</span>
                          <span>S/. {selectedPayslipData.payslip.incomeTaxDeduction.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Tardanzas ({selectedPayslipData.payslip.tardyMinutes} min)
                          </span>
                          <span className={selectedPayslipData.payslip.tardyDeduction > 0 ? 'text-warning' : ''}>
                            S/. {selectedPayslipData.payslip.tardyDeduction.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Ausencias ({selectedPayslipData.payslip.absenceDays} días)</span>
                          <span className={selectedPayslipData.payslip.absenceDeduction > 0 ? 'text-destructive' : ''}>
                            S/. {selectedPayslipData.payslip.absenceDeduction.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {selectedPayslipData.payslip.overtimePay > 0 && (
                      <div className="rounded-xl border border-success/20 bg-success/5">
                        <div className="p-4 border-b border-success/20 bg-success/10">
                          <h4 className="font-semibold text-success">Bonificaciones</h4>
                        </div>
                        <div className="p-4 space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Horas Extra ({selectedPayslipData.payslip.overtimeHours.toFixed(1)}h)</span>
                            <span className="text-success">+S/. {selectedPayslipData.payslip.overtimePay.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Card className="glass-card h-full flex items-center justify-center min-h-[400px]">
                <div className="text-center text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>Selecciona un empleado para ver los detalles</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PayrollPage;
