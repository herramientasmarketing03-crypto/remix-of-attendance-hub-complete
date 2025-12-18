import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Camera, Upload, CheckCircle, MapPin, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface AttendanceEntry {
  id: string;
  type: 'entrada' | 'salida';
  timestamp: string;
  photoUrl: string;
  location?: string;
  notes?: string;
}

export function VirtualAttendance() {
  const { user } = useAuth();
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [todayEntries, setTodayEntries] = useState<AttendanceEntry[]>(() => {
    const saved = localStorage.getItem('virtual_attendance_today');
    return saved ? JSON.parse(saved) : [];
  });

  const hasEntrada = todayEntries.some(e => e.type === 'entrada');
  const hasSalida = todayEntries.some(e => e.type === 'salida');
  const currentTime = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  const currentDate = new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (type: 'entrada' | 'salida') => {
    if (!selectedPhoto) {
      toast.error('Debes subir una foto como evidencia');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newEntry: AttendanceEntry = {
      id: Date.now().toString(),
      type,
      timestamp: new Date().toISOString(),
      photoUrl: photoPreview || '',
      notes,
    };

    const updatedEntries = [...todayEntries, newEntry];
    setTodayEntries(updatedEntries);
    localStorage.setItem('virtual_attendance_today', JSON.stringify(updatedEntries));

    setSelectedPhoto(null);
    setPhotoPreview(null);
    setNotes('');
    setIsSubmitting(false);

    toast.success(`${type === 'entrada' ? 'Entrada' : 'Salida'} registrada exitosamente`);
  };

  return (
    <div className="space-y-6">
      {/* Current Time Display */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass-card overflow-hidden">
          <div className="gradient-primary p-6 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80 capitalize">{currentDate}</p>
                <h2 className="text-4xl font-bold tracking-tight mt-1">{currentTime}</h2>
              </div>
              <Clock className="w-16 h-16 opacity-30" />
            </div>
          </div>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>Trabajo Remoto - {user?.email}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Today's Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Estado de Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className={`flex-1 p-4 rounded-xl ${hasEntrada ? 'bg-success/10' : 'bg-muted/50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {hasEntrada ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-muted-foreground" />
                  )}
                  <span className="font-medium">Entrada</span>
                </div>
                {hasEntrada ? (
                  <p className="text-sm text-success">
                    {new Date(todayEntries.find(e => e.type === 'entrada')!.timestamp).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Pendiente</p>
                )}
              </div>
              <div className={`flex-1 p-4 rounded-xl ${hasSalida ? 'bg-success/10' : 'bg-muted/50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {hasSalida ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-muted-foreground" />
                  )}
                  <span className="font-medium">Salida</span>
                </div>
                {hasSalida ? (
                  <p className="text-sm text-success">
                    {new Date(todayEntries.find(e => e.type === 'salida')!.timestamp).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Pendiente</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Registration Form */}
      {(!hasEntrada || !hasSalida) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                Registrar {!hasEntrada ? 'Entrada' : 'Salida'}
              </CardTitle>
              <CardDescription>
                Sube una foto como evidencia de tu {!hasEntrada ? 'inicio' : 'fin'} de jornada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Photo Upload */}
              <div className="space-y-2">
                <Label>Foto de Evidencia *</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                  {photoPreview ? (
                    <div className="space-y-4">
                      <img 
                        src={photoPreview} 
                        alt="Preview" 
                        className="max-h-48 mx-auto rounded-lg object-cover"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => { setSelectedPhoto(null); setPhotoPreview(null); }}
                      >
                        Cambiar foto
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Haz clic para subir una foto
                      </p>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG hasta 5MB
                      </p>
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoChange}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Notas (opcional)</Label>
                <Textarea
                  placeholder="Agrega observaciones si es necesario..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Submit Button */}
              <Button
                className="w-full gradient-primary text-primary-foreground"
                size="lg"
                onClick={() => handleSubmit(!hasEntrada ? 'entrada' : 'salida')}
                disabled={isSubmitting || !selectedPhoto}
              >
                {isSubmitting ? (
                  <>Registrando...</>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Registrar {!hasEntrada ? 'Entrada' : 'Salida'}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Completed Message */}
      {hasEntrada && hasSalida && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="glass-card border-success/20 bg-success/5">
            <CardContent className="py-8 text-center">
              <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
              <h3 className="text-xl font-bold text-success mb-2">Jornada Completa</h3>
              <p className="text-muted-foreground">
                Has registrado tu entrada y salida del día de hoy
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* History */}
      {todayEntries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base">Registros de Hoy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30">
                    <img 
                      src={entry.photoUrl} 
                      alt={entry.type} 
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={entry.type === 'entrada' ? 'default' : 'secondary'}>
                          {entry.type === 'entrada' ? 'Entrada' : 'Salida'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleTimeString('es-PE')}
                        </span>
                      </div>
                      {entry.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{entry.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
