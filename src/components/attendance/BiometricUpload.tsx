import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, FileSpreadsheet, Clock, AlertTriangle, Check, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { processBiometricData, generateSampleBiometricData } from '@/services/attendanceCalculator';
import { BiometricUploadResult, BiometricRecord } from '@/types/payroll';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BiometricUploadProps {
  onProcessComplete?: (result: BiometricUploadResult) => void;
}

export function BiometricUpload({ onProcessComplete }: BiometricUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<BiometricUploadResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.xls') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.csv')) {
        toast.error('Solo se permiten archivos Excel (.xls, .xlsx) o CSV');
        return;
      }
      setSelectedFile(file);
      setResult(null);
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);

    // Simulate processing (in real app, would parse the file)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Use sample data for demo
    const sampleData = generateSampleBiometricData();
    const processedResult = processBiometricData(sampleData);
    
    setResult(processedResult);
    setIsProcessing(false);
    onProcessComplete?.(processedResult);
    toast.success('Archivo procesado correctamente');
  };

  const handleLoadSample = () => {
    const sampleData = generateSampleBiometricData();
    const processedResult = processBiometricData(sampleData);
    setResult(processedResult);
    onProcessComplete?.(processedResult);
    toast.success('Datos de ejemplo cargados');
  };

  const getStatusBadge = (status: BiometricRecord['status']) => {
    const config = {
      normal: { label: 'Normal', className: 'bg-success/10 text-success' },
      tardy: { label: 'Tardanza', className: 'bg-warning/10 text-warning' },
      absent: { label: 'Ausencia', className: 'bg-destructive/10 text-destructive' },
      early_leave: { label: 'Salida Temprana', className: 'bg-info/10 text-info' },
    };
    const { label, className } = config[status];
    return <Badge className={className}>{label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Procesar Archivo de Huellero
          </CardTitle>
          <CardDescription>
            Sube el archivo Excel/CSV del sistema de control biométrico para calcular tardanzas y ausencias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
            {selectedFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <FileSpreadsheet className="w-12 h-12 text-success" />
                  <div className="text-left">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2 justify-center">
                  <Button 
                    className="gradient-primary" 
                    onClick={handleProcess}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>Procesando...</>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Procesar y Calcular
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedFile(null)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">
                  Arrastra el archivo aquí o haz clic para seleccionar
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Archivo Excel o CSV del sistema de control de asistencia
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline">
                    Seleccionar Archivo
                  </Button>
                  <Button variant="ghost" onClick={(e) => { e.preventDefault(); handleLoadSample(); }}>
                    Cargar Ejemplo
                  </Button>
                </div>
                <Input
                  type="file"
                  accept=".xls,.xlsx,.csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>
        </CardContent>
      </Card>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{result.processedRecords}</p>
                    <p className="text-sm text-muted-foreground">Registros procesados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <Clock className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{result.tardiesDetected}</p>
                    <p className="text-sm text-muted-foreground">Tardanzas detectadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <Clock className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{result.totalTardyMinutes} min</p>
                    <p className="text-sm text-muted-foreground">Minutos de tardanza</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">S/. {result.estimatedDeduction.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Descuento estimado</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Records Table */}
          <Card>
            <CardHeader>
              <CardTitle>Registros Procesados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Empleado</TableHead>
                      <TableHead>DNI</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Entrada</TableHead>
                      <TableHead>Salida</TableHead>
                      <TableHead>Tardanza</TableHead>
                      <TableHead>Horas Trabajadas</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.records.map((record, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{record.employeeName}</TableCell>
                        <TableCell>{record.documentId}</TableCell>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>
                          <span className={cn(
                            record.tardyMinutes > 0 && "text-warning font-medium"
                          )}>
                            {record.entryTime}
                          </span>
                        </TableCell>
                        <TableCell>{record.exitTime}</TableCell>
                        <TableCell>
                          {record.tardyMinutes > 0 ? (
                            <span className="text-warning font-medium">{record.tardyMinutes} min</span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>{record.workedHours.toFixed(1)}h</TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
