import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, DollarSign, Briefcase, Clock, Calendar, Gift } from 'lucide-react';
import { Employee, ContractAddendum, AddendumType } from '@/types/attendance';
import { ADDENDUM_TYPES } from '@/data/mockData';

interface AddendumFormProps {
  employee: Employee;
  onSubmit: (addendum: Omit<ContractAddendum, 'id'>) => void;
  onCancel: () => void;
}

const iconMap: Record<string, any> = {
  'dollar-sign': DollarSign,
  'briefcase': Briefcase,
  'clock': Clock,
  'calendar': Calendar,
  'gift': Gift,
  'file-text': FileText,
};

export function AddendumForm({ employee, onSubmit, onCancel }: AddendumFormProps) {
  const [type, setType] = useState<AddendumType>('salary_increase');
  const [description, setDescription] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [previousValue, setPreviousValue] = useState('');
  const [newValue, setNewValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      contractId: `c-${employee.id}`,
      employeeId: employee.id,
      type,
      description,
      effectiveDate,
      previousValue,
      newValue,
      createdAt: new Date().toISOString(),
      createdBy: 'RRHH',
      status: 'pending',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Nueva Adenda para {employee.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Adenda *</Label>
              <Select value={type} onValueChange={(v) => setType(v as AddendumType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ADDENDUM_TYPES).map(([key, value]) => {
                    const Icon = iconMap[value.icon] || FileText;
                    return (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {value.name}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fecha de Vigencia *</Label>
              <Input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor Anterior</Label>
                <Input
                  placeholder="Ej: S/. 2,500"
                  value={previousValue}
                  onChange={(e) => setPreviousValue(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Valor Nuevo</Label>
                <Input
                  placeholder="Ej: S/. 3,000"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descripción *</Label>
              <Textarea
                placeholder="Describe el motivo y detalles de la adenda..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1 gradient-primary">
                Registrar Adenda
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
