import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, FileText, Scale } from 'lucide-react';
import { Employee, Sanction, SanctionType, InfractionLevel } from '@/types/attendance';
import { mockRegulations } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';

interface SanctionFormProps {
  employee: Employee;
  onSubmit: (sanction: Omit<Sanction, 'id'>) => void;
  onCancel: () => void;
}

const sanctionTypes: { value: SanctionType; label: string; description: string }[] = [
  { value: 'verbal_warning', label: 'Amonestación Verbal', description: 'Para faltas leves y primarias' },
  { value: 'written_warning', label: 'Amonestación Escrita', description: 'Para faltas graves o reincidencia' },
  { value: 'suspension', label: 'Suspensión sin Goce', description: 'Para faltas muy graves' },
  { value: 'dismissal', label: 'Despido', description: 'Solo para faltas gravísimas comprobadas' },
];

const infractionLevels: { value: InfractionLevel; label: string }[] = [
  { value: 'leve', label: 'Leve' },
  { value: 'grave', label: 'Grave' },
  { value: 'muy_grave', label: 'Muy Grave' },
];

export function SanctionForm({ employee, onSubmit, onCancel }: SanctionFormProps) {
  const { user } = useAuth();
  const [type, setType] = useState<SanctionType>('verbal_warning');
  const [infractionLevel, setInfractionLevel] = useState<InfractionLevel>('leve');
  const [description, setDescription] = useState('');
  const [regulationArticle, setRegulationArticle] = useState('Art. 50');
  const [daysOfSuspension, setDaysOfSuspension] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      employeeId: employee.id,
      type,
      infractionLevel,
      description,
      regulationArticle,
      date: new Date().toISOString().split('T')[0],
      appliedBy: user ? `${user.nombres} ${user.apellidos}` : 'RRHH',
      daysOfSuspension: type === 'suspension' ? daysOfSuspension : undefined,
      status: 'active',
    });
  };

  const applicableArticles = mockRegulations.filter(r => r.category === 'faltas_sanciones');

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-warning/30 bg-warning/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            Aplicando sanción a: {employee.name}
          </CardTitle>
          <CardDescription>
            Las sanciones deben estar fundamentadas en el Reglamento Interno de Trabajo
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tipo de Sanción</Label>
          <Select value={type} onValueChange={(v) => setType(v as SanctionType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sanctionTypes.map(st => (
                <SelectItem key={st.value} value={st.value}>
                  <div>
                    <p className="font-medium">{st.label}</p>
                    <p className="text-xs text-muted-foreground">{st.description}</p>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Nivel de Infracción</Label>
          <Select value={infractionLevel} onValueChange={(v) => setInfractionLevel(v as InfractionLevel)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {infractionLevels.map(il => (
                <SelectItem key={il.value} value={il.value}>{il.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Artículo del Reglamento</Label>
        <Select value={regulationArticle} onValueChange={setRegulationArticle}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {applicableArticles.map(art => (
              <SelectItem key={art.number} value={art.number}>
                <div className="flex items-center gap-2">
                  <FileText className="w-3 h-3" />
                  <span>{art.number} - {art.title}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {type === 'suspension' && (
        <div className="space-y-2">
          <Label>Días de Suspensión</Label>
          <Select value={String(daysOfSuspension)} onValueChange={(v) => setDaysOfSuspension(Number(v))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 5, 7, 15, 30].map(d => (
                <SelectItem key={d} value={String(d)}>{d} día{d > 1 ? 's' : ''}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label>Descripción de la Falta</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describa detalladamente la falta cometida y las circunstancias..."
          rows={4}
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="destructive">
          <Scale className="w-4 h-4 mr-2" />
          Registrar Sanción
        </Button>
      </div>
    </form>
  );
}
