import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Upload, FileSpreadsheet, Check, Loader2, Trash2, Fingerprint } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { mockUploadedReports } from '@/data/mockData';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BiometricUpload } from '@/components/attendance/BiometricUpload';

const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.xls') && !file.name.endsWith('.xlsx')) {
        toast.error('Solo se permiten archivos Excel (.xls, .xlsx)');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    setTimeout(() => {
      setIsUploading(false);
      setSelectedFile(null);
      setUploadProgress(0);
      toast.success('Archivo cargado y procesado exitosamente');
    }, 3500);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold">Cargar Reportes</h1>
          <p className="text-muted-foreground">Sube archivos del reloj biométrico o reportes de asistencia</p>
        </motion.div>

        <Tabs defaultValue="biometric" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="biometric" className="flex items-center gap-2">
              <Fingerprint className="w-4 h-4" />
              Huellero Biométrico
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Reporte General
            </TabsTrigger>
          </TabsList>

          <TabsContent value="biometric" className="mt-6">
            <BiometricUpload />
          </TabsContent>

          <TabsContent value="general" className="mt-6 space-y-6">
            {/* Upload Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-primary" />
                    Subir Archivo
                  </CardTitle>
                  <CardDescription>
                    Formatos aceptados: Excel (.xls, .xlsx) exportado del sistema de control de asistencia
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
                        
                        {isUploading ? (
                          <div className="space-y-2">
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {uploadProgress < 50 ? 'Subiendo archivo...' : 
                               uploadProgress < 100 ? 'Procesando datos...' : 'Completado'}
                            </p>
                          </div>
                        ) : (
                          <div className="flex gap-2 justify-center">
                            <Button className="gradient-primary" onClick={handleUpload}>
                              <Upload className="w-4 h-4 mr-2" />
                              Procesar Archivo
                            </Button>
                            <Button variant="outline" onClick={() => setSelectedFile(null)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Cancelar
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-lg font-medium mb-2">
                          Arrastra el archivo aquí o haz clic para seleccionar
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Archivos Excel del sistema de control de asistencia
                        </p>
                        <Button variant="outline">
                          Seleccionar Archivo
                        </Button>
                        <Input
                          type="file"
                          accept=".xls,.xlsx"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Uploads */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-primary" />
                    Archivos Recientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockUploadedReports.map((report, index) => (
                      <motion.div
                        key={report.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <FileSpreadsheet className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{report.fileName}</p>
                            <p className="text-sm text-muted-foreground">
                              Período: {report.periodStart} al {report.periodEnd}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">{report.recordCount} registros</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(report.uploadedAt), "d MMM yyyy, HH:mm", { locale: es })}
                            </p>
                          </div>
                          <Badge className={report.status === 'completed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}>
                            {report.status === 'completed' ? (
                              <><Check className="w-3 h-3 mr-1" /> Procesado</>
                            ) : (
                              <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Procesando</>
                            )}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default UploadPage;
