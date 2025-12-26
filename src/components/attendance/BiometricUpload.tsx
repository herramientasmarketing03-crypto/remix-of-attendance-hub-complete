import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, FileSpreadsheet, Clock, AlertTriangle, Check, Users, UserCheck, UserX, Calendar, Loader2, AlertCircle, Save, X, UserPlus, FileText, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { parseBiometricFile, formatMinutesToTime } from '@/services/biometricParser';
import { ParsedBiometricReport, DuplicateCheckResult, UploadConflictAction } from '@/types/payroll';
import { useAttendanceUpload } from '@/hooks/useAttendanceUpload';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AddUnmatchedEmployeesDialog } from './AddUnmatchedEmployeesDialog';
import { calculateDeductions, DeductionSummary, formatCurrency } from '@/services/deductionCalculator';
import { downloadAttendancePdf } from '@/services/attendanceReportPdf';

interface BiometricUploadProps {
  onProcessComplete?: (result: ParsedBiometricReport) => void;
}

type UploadStep = 'upload' | 'preview' | 'confirm' | 'saving' | 'complete';

export function BiometricUpload({ onProcessComplete }: BiometricUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<UploadStep>('upload');
  const [report, setReport] = useState<ParsedBiometricReport | null>(null);
  const [duplicateCheck, setDuplicateCheck] = useState<DuplicateCheckResult | null>(null);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [saveResult, setSaveResult] = useState<{ saved: number; skipped: number } | null>(null);
  const [showAddEmployeesDialog, setShowAddEmployeesDialog] = useState(false);
  const [deductions, setDeductions] = useState<DeductionSummary | null>(null);

  const { checkForDuplicates, saveAttendanceRecords, isChecking, isSaving } = useAttendanceUpload();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.xls') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.csv')) {
        toast.error('Solo se permiten archivos Excel (.xls, .xlsx) o CSV');
        return;
      }
      setSelectedFile(file);
      setReport(null);
      setStep('upload');
      setDuplicateCheck(null);
      setSaveResult(null);
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    try {
      const parsedReport = await parseBiometricFile(selectedFile);
      setReport(parsedReport);
      setStep('preview');
      
      // Calculate deductions
      const calculatedDeductions = calculateDeductions(parsedReport);
      setDeductions(calculatedDeductions);
      
      // Check for duplicates
      const duplicates = await checkForDuplicates(parsedReport);
      setDuplicateCheck(duplicates);
      
      toast.success(`Archivo procesado: ${parsedReport.matchedEmployees} empleados encontrados`);
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Error al procesar el archivo');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmSave = async () => {
    if (!report) return;
    
    // If there are duplicates, show conflict dialog
    if (duplicateCheck?.hasDuplicates) {
      setShowConflictDialog(true);
      return;
    }
    
    // No duplicates, proceed directly
    await handleSave('skip');
  };

  const handleSave = async (action: UploadConflictAction) => {
    if (!report) return;
    
    setShowConflictDialog(false);
    setStep('saving');
    
    const result = await saveAttendanceRecords(report, action);
    
    setSaveResult({ saved: result.recordsSaved, skipped: result.recordsSkipped });
    setStep('complete');
    onProcessComplete?.(report);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setReport(null);
    setStep('upload');
    setDuplicateCheck(null);
    setSaveResult(null);
    setDeductions(null);
  };

  const handleDownloadPdf = () => {
    if (!report || !deductions) return;
    downloadAttendancePdf(report, deductions, {
      companyName: 'Empresa',
      reportTitle: 'Reporte de Asistencia',
      showDeductions: true
    });
    toast.success('PDF generado correctamente');
  };

  const handleEmployeesAdded = async () => {
    // Re-process the file to update matches
    if (selectedFile) {
      await handleProcess();
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Card */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Procesar Archivo de Huellero
          </CardTitle>
          <CardDescription>
            Sube el archivo Excel del sistema biométrico para actualizar la asistencia de los colaboradores
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'upload' && (
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
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Procesar Archivo
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
                    Archivo Excel del sistema de control de asistencia
                  </p>
                  <Button variant="outline">
                    Seleccionar Archivo
                  </Button>
                  <Input
                    type="file"
                    accept=".xls,.xlsx,.csv"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
          )}

          {step === 'saving' && (
            <div className="text-center py-12">
              <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
              <p className="text-lg font-medium">Guardando registros...</p>
              <p className="text-muted-foreground">Por favor espere</p>
            </div>
          )}

          {step === 'complete' && saveResult && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-success" />
              </div>
              <p className="text-lg font-medium mb-2">¡Carga Completada!</p>
              <p className="text-muted-foreground mb-4">
                {saveResult.saved} registros guardados
                {saveResult.skipped > 0 && `, ${saveResult.skipped} omitidos`}
              </p>
              <Button onClick={handleReset}>
                Cargar Otro Archivo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Section */}
      <AnimatePresence>
        {report && step === 'preview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Period Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Período del Reporte</p>
                    <p className="text-muted-foreground">
                      {report.period.start} al {report.period.end}
                    </p>
                  </div>
                </div>

                {duplicateCheck?.hasDuplicates && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Registros Existentes Detectados</AlertTitle>
                    <AlertDescription>
                      Se encontraron {duplicateCheck.existingCount} registros existentes para este período.
                      Al guardar, podrá elegir sobrescribir o mantener los existentes.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{report.totalEmployees}</p>
                      <p className="text-sm text-muted-foreground">Total en reporte</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-success/10">
                      <UserCheck className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{report.matchedEmployees}</p>
                      <p className="text-sm text-muted-foreground">Empleados encontrados</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-warning/10">
                      <UserX className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{report.unmatchedEmployees}</p>
                      <p className="text-sm text-muted-foreground">No encontrados</p>
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
                      <p className="text-2xl font-bold">{report.summary.totalTardyMinutes} min</p>
                      <p className="text-sm text-muted-foreground">Tardanzas totales</p>
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
                      <p className="text-2xl font-bold">{report.summary.totalAbsences}</p>
                      <p className="text-sm text-muted-foreground">Faltas totales</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Records Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Vista Previa de Datos</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleReset}>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button 
                    className="gradient-primary" 
                    onClick={handleConfirmSave}
                    disabled={report.matchedEmployees === 0 || isChecking}
                  >
                    {isChecking ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Aceptar y Guardar
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow className="bg-muted/50">
                        <TableHead>Estado</TableHead>
                        <TableHead>Empleado</TableHead>
                        <TableHead>DNI</TableHead>
                        <TableHead>Área</TableHead>
                        <TableHead>Horas Programadas</TableHead>
                        <TableHead>Horas Reales</TableHead>
                        <TableHead>Tardanzas</TableHead>
                        <TableHead>Min. Tardanza</TableHead>
                        <TableHead>Días Asistidos</TableHead>
                        <TableHead>Faltas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.records.map((record, index) => (
                        <TableRow 
                          key={index}
                          className={!record.isMatched ? 'bg-warning/5' : ''}
                        >
                          <TableCell>
                            {record.isMatched ? (
                              <Badge className="bg-success/10 text-success">
                                <UserCheck className="w-3 h-3 mr-1" />
                                Encontrado
                              </Badge>
                            ) : (
                              <Badge className="bg-warning/10 text-warning">
                                <UserX className="w-3 h-3 mr-1" />
                                No encontrado
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{record.employeeName}</TableCell>
                          <TableCell>{record.documentId}</TableCell>
                          <TableCell>{record.department}</TableCell>
                          <TableCell>{formatMinutesToTime(record.scheduledHours)}</TableCell>
                          <TableCell>{formatMinutesToTime(record.actualHours)}</TableCell>
                          <TableCell>
                            {record.tardyCount > 0 ? (
                              <span className="text-warning font-medium">{record.tardyCount}</span>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            {record.tardyMinutes > 0 ? (
                              <span className="text-warning font-medium">{record.tardyMinutes} min</span>
                            ) : '-'}
                          </TableCell>
                          <TableCell>{record.daysAttended}/{record.daysScheduled}</TableCell>
                          <TableCell>
                            {record.absences > 0 ? (
                              <span className="text-destructive font-medium">{record.absences}</span>
                            ) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {report.unmatchedEmployees > 0 && (
                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Empleados No Encontrados</AlertTitle>
                    <AlertDescription>
                      {report.unmatchedEmployees} empleados del reporte no tienen coincidencia en el sistema.
                      Verifique que el DNI esté registrado correctamente en la base de datos de empleados.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conflict Dialog */}
      <Dialog open={showConflictDialog} onOpenChange={setShowConflictDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registros Existentes Detectados</DialogTitle>
            <DialogDescription>
              Se encontraron {duplicateCheck?.existingCount} registros existentes para el período seleccionado.
              ¿Cómo desea proceder?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-2">
              Período: {report?.period.start} al {report?.period.end}
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowConflictDialog(false)}>
              Cancelar
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => handleSave('skip')}
            >
              Solo Agregar Nuevos
            </Button>
            <Button 
              className="gradient-primary"
              onClick={() => handleSave('overwrite')}
            >
              Sobrescribir Todos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
