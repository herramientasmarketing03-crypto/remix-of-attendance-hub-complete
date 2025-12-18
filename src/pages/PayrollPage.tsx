import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Wallet, Download, Calendar, FileText, DollarSign, Eye, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const mockPayslips = [
  { id: '1', period: 'Diciembre 2024', grossSalary: 4500, deductions: 450, netSalary: 4050, date: '2024-12-15', status: 'disponible' },
  { id: '2', period: 'Noviembre 2024', grossSalary: 4500, deductions: 450, netSalary: 4050, date: '2024-11-15', status: 'disponible' },
  { id: '3', period: 'Octubre 2024', grossSalary: 4500, deductions: 450, netSalary: 4050, date: '2024-10-15', status: 'disponible' },
  { id: '4', period: 'Septiembre 2024', grossSalary: 4200, deductions: 420, netSalary: 3780, date: '2024-09-15', status: 'disponible' },
  { id: '5', period: 'Agosto 2024', grossSalary: 4200, deductions: 420, netSalary: 3780, date: '2024-08-15', status: 'disponible' },
];

const PayrollPage = () => {
  const { isAdmin } = useAuth();
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedPayslip, setSelectedPayslip] = useState<typeof mockPayslips[0] | null>(null);

  return (
    <MainLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold">Boletas de Pago</h1>
          <p className="text-muted-foreground">Consulta y descarga tus boletas de pago</p>
        </motion.div>

        {/* Summary Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-card overflow-hidden">
            <div className="gradient-primary p-6 text-primary-foreground">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">Último Sueldo Neto</p>
                  <h2 className="text-3xl font-bold mt-1">S/. 4,050.00</h2>
                  <p className="text-sm opacity-80 mt-1">Diciembre 2024</p>
                </div>
                <Wallet className="w-16 h-16 opacity-30" />
              </div>
            </div>
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Sueldo Bruto</p>
                  <p className="font-semibold">S/. 4,500.00</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Descuentos</p>
                  <p className="font-semibold text-destructive">-S/. 450.00</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Boletas {selectedYear}</p>
                  <p className="font-semibold">{mockPayslips.filter(p => p.date.includes(selectedYear)).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payslip List */}
          <div className="lg:col-span-1">
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Historial
                  </CardTitle>
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
              </CardHeader>
              <CardContent className="space-y-2">
                {mockPayslips.filter(p => p.date.includes(selectedYear)).map((payslip, index) => (
                  <motion.div
                    key={payslip.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${selectedPayslip?.id === payslip.id ? 'bg-primary/10 border-2 border-primary' : 'bg-muted/30 hover:bg-muted/50'}`}
                    onClick={() => setSelectedPayslip(payslip)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{payslip.period}</p>
                        <p className="text-sm text-muted-foreground">S/. {payslip.netSalary.toLocaleString()}</p>
                      </div>
                      <Badge variant="secondary" className="bg-success/10 text-success">
                        {payslip.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Payslip Detail */}
          <div className="lg:col-span-2">
            {selectedPayslip ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="glass-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Boleta de Pago - {selectedPayslip.period}</CardTitle>
                        <CardDescription>Emitida el {selectedPayslip.date}</CardDescription>
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
                              <p className="text-xl font-bold">S/. {selectedPayslip.grossSalary.toLocaleString()}</p>
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
                              <p className="text-sm text-muted-foreground">Descuentos</p>
                              <p className="text-xl font-bold text-destructive">-S/. {selectedPayslip.deductions.toLocaleString()}</p>
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
                          <p className="text-2xl font-bold text-primary">S/. {selectedPayslip.netSalary.toLocaleString()}</p>
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
                          <span>S/. {(selectedPayslip.grossSalary * 0.13).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Impuesto a la Renta</span>
                          <span>S/. 0.00</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tardanzas</span>
                          <span>S/. 0.00</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Otros descuentos</span>
                          <span>S/. 0.00</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Card className="glass-card h-full flex items-center justify-center min-h-[400px]">
                <div className="text-center text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>Selecciona una boleta para ver los detalles</p>
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
