import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, Camera, Upload, CheckCircle, MapPin, AlertCircle, Coffee, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type MarkingType = 'check_in' | 'break_start' | 'break_end' | 'check_out';

interface TodayRecord {
  id?: string;
  check_in: string | null;
  break_start: string | null;
  break_end: string | null;
  check_out: string | null;
  notes: string | null;
  break_minutes: number;
  worked_hours: number;
}

const MARKING_CONFIG: Record<MarkingType, { label: string; icon: typeof LogIn; color: string; bgColor: string }> = {
  check_in: { label: 'Entrada', icon: LogIn, color: 'text-success', bgColor: 'bg-success/10' },
  break_start: { label: 'Inicio Break', icon: Coffee, color: 'text-warning', bgColor: 'bg-warning/10' },
  break_end: { label: 'Fin Break', icon: Coffee, color: 'text-info', bgColor: 'bg-info/10' },
  check_out: { label: 'Salida', icon: LogOut, color: 'text-destructive', bgColor: 'bg-destructive/10' },
};

export function VirtualAttendance() {
  const { user, userRole } = useAuth();
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [todayRecord, setTodayRecord] = useState<TodayRecord>({
    check_in: null,
    break_start: null,
    break_end: null,
    check_out: null,
    notes: null,
    break_minutes: 0,
    worked_hours: 0,
  });
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch employee ID and today's record
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      // Get employee ID linked to user
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (employee) {
        setEmployeeId(employee.id);
        
        // Fetch today's attendance record
        const today = format(new Date(), 'yyyy-MM-dd');
        const { data: record } = await supabase
          .from('attendance_records')
          .select('*')
          .eq('employee_id', employee.id)
          .eq('date', today)
          .maybeSingle();

        if (record) {
          setTodayRecord({
            id: record.id,
            check_in: record.check_in,
            break_start: record.break_start,
            break_end: record.break_end,
            check_out: record.check_out,
            notes: record.notes,
            break_minutes: record.break_minutes || 0,
            worked_hours: record.worked_hours || 0,
          });
        }
      }
    };

    fetchData();
  }, [user?.id]);

  // Determine next action
  const nextAction = useMemo((): MarkingType | null => {
    if (!todayRecord.check_in) return 'check_in';
    if (!todayRecord.break_start) return 'break_start';
    if (!todayRecord.break_end) return 'break_end';
    if (!todayRecord.check_out) return 'check_out';
    return null;
  }, [todayRecord]);

  const isComplete = nextAction === null;

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

  const calculateBreakMinutes = (breakStart: string, breakEnd: string): number => {
    const [startH, startM] = breakStart.split(':').map(Number);
    const [endH, endM] = breakEnd.split(':').map(Number);
    return ((endH * 60 + endM) - (startH * 60 + startM));
  };

  const calculateWorkedHours = (checkIn: string, checkOut: string, breakMinutes: number): number => {
    const [inH, inM] = checkIn.split(':').map(Number);
    const [outH, outM] = checkOut.split(':').map(Number);
    const totalMinutes = ((outH * 60 + outM) - (inH * 60 + inM)) - breakMinutes;
    return Math.max(0, totalMinutes / 60);
  };

  const handleSubmit = async () => {
    if (!nextAction) return;
    if (!selectedPhoto) {
      toast.error('Debes subir una foto como evidencia');
      return;
    }

    setIsSubmitting(true);
    const currentTimeStr = format(currentTime, 'HH:mm:ss');
    const today = format(new Date(), 'yyyy-MM-dd');

    try {
      // Upload photo to storage
      let photoUrl: string | null = null;
      if (selectedPhoto) {
        const fileName = `${user?.id}/${today}/${nextAction}_${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('justifications')
          .upload(fileName, selectedPhoto);

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('justifications')
            .getPublicUrl(fileName);
          photoUrl = urlData.publicUrl;
        }
      }

      // Prepare update data
      const updateData: Record<string, unknown> = {
        [nextAction]: currentTimeStr,
        notes: notes || todayRecord.notes,
      };

      // Calculate break_minutes when break_end is marked
      if (nextAction === 'break_end' && todayRecord.break_start) {
        updateData.break_minutes = calculateBreakMinutes(todayRecord.break_start, currentTimeStr);
      }

      // Calculate worked_hours when check_out is marked
      if (nextAction === 'check_out' && todayRecord.check_in) {
        const breakMins = todayRecord.break_minutes || 0;
        updateData.worked_hours = calculateWorkedHours(todayRecord.check_in, currentTimeStr, breakMins);
        updateData.days_attended = 1;
        updateData.status = 'validated';
      }

      if (todayRecord.id) {
        // Update existing record
        const { error } = await supabase
          .from('attendance_records')
          .update(updateData)
          .eq('id', todayRecord.id);

        if (error) throw error;
      } else if (employeeId) {
        // Create new record
        const { data: newRecord, error } = await supabase
          .from('attendance_records')
          .insert({
            employee_id: employeeId,
            date: today,
            ...updateData,
            status: 'pending',
          })
          .select()
          .single();

        if (error) throw error;
        if (newRecord) {
          setTodayRecord(prev => ({ ...prev, id: newRecord.id }));
        }
      }

      // Update local state
      setTodayRecord(prev => ({
        ...prev,
        [nextAction]: currentTimeStr,
        notes: notes || prev.notes,
        break_minutes: updateData.break_minutes !== undefined ? updateData.break_minutes as number : prev.break_minutes,
        worked_hours: updateData.worked_hours !== undefined ? updateData.worked_hours as number : prev.worked_hours,
      }));

      setSelectedPhoto(null);
      setPhotoPreview(null);
      setNotes('');

      toast.success(`${MARKING_CONFIG[nextAction].label} registrada exitosamente`);
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error('Error al registrar asistencia');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '--:--';
    return timeStr.substring(0, 5);
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
                <p className="text-sm opacity-80 capitalize">
                  {format(currentTime, "EEEE, d 'de' MMMM yyyy", { locale: es })}
                </p>
                <h2 className="text-4xl font-bold tracking-tight mt-1">
                  {format(currentTime, 'HH:mm:ss')}
                </h2>
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

      {/* Today's Status - 4 Cards */}
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(Object.entries(MARKING_CONFIG) as [MarkingType, typeof MARKING_CONFIG[MarkingType]][]).map(([key, config]) => {
                const isMarked = !!todayRecord[key];
                const isNext = nextAction === key;
                const Icon = config.icon;

                return (
                  <div 
                    key={key}
                    className={`p-4 rounded-xl transition-all ${
                      isMarked ? config.bgColor : isNext ? 'bg-muted/50 ring-2 ring-primary' : 'bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {isMarked ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : (
                        <Icon className={`w-5 h-5 ${isNext ? 'text-primary' : 'text-muted-foreground'}`} />
                      )}
                      <span className="font-medium text-sm">{config.label}</span>
                    </div>
                    {isMarked ? (
                      <p className={`text-lg font-semibold ${config.color}`}>
                        {formatTime(todayRecord[key])}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {isNext ? 'Siguiente' : 'Pendiente'}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Break and work summary */}
            {(todayRecord.break_minutes > 0 || todayRecord.worked_hours > 0) && (
              <div className="flex gap-4 mt-4 pt-4 border-t">
                {todayRecord.break_minutes > 0 && (
                  <Badge variant="outline" className="text-warning">
                    <Coffee className="w-3 h-3 mr-1" />
                    Break: {todayRecord.break_minutes} min
                  </Badge>
                )}
                {todayRecord.worked_hours > 0 && (
                  <Badge variant="outline" className="text-success">
                    <Clock className="w-3 h-3 mr-1" />
                    Trabajado: {todayRecord.worked_hours.toFixed(2)}h
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Registration Form */}
      {!isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                Registrar {nextAction && MARKING_CONFIG[nextAction].label}
              </CardTitle>
              <CardDescription>
                Sube una foto como evidencia de tu {nextAction && MARKING_CONFIG[nextAction].label.toLowerCase()}
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
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedPhoto || !employeeId}
              >
                {isSubmitting ? (
                  <>Registrando...</>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Registrar {nextAction && MARKING_CONFIG[nextAction].label}
                  </>
                )}
              </Button>

              {!employeeId && (
                <p className="text-xs text-destructive text-center">
                  Tu usuario no está vinculado a un empleado. Contacta a RRHH.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Completed Message */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="glass-card border-success/20 bg-success/5">
            <CardContent className="py-8 text-center">
              <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
              <h3 className="text-xl font-bold text-success mb-2">Jornada Completa</h3>
              <p className="text-muted-foreground mb-4">
                Has registrado todas tus marcaciones del día
              </p>
              <div className="flex justify-center gap-4">
                {todayRecord.break_minutes > 0 && (
                  <Badge variant="outline">
                    <Coffee className="w-3 h-3 mr-1" />
                    Break: {todayRecord.break_minutes} min
                  </Badge>
                )}
                {todayRecord.worked_hours > 0 && (
                  <Badge variant="outline" className="text-success border-success">
                    <Clock className="w-3 h-3 mr-1" />
                    Total: {todayRecord.worked_hours.toFixed(2)}h
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
