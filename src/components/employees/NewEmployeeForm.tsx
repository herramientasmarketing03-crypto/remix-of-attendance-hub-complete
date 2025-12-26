import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DEPARTMENTS, Department, ContractType, Employee } from '@/types/attendance';
import { toast } from 'sonner';

const employeeSchema = z.object({
  name: z.string().trim().min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'El nombre es muy largo'),
  documentId: z.string().trim().min(8, 'DNI debe tener 8 dígitos').max(12, 'Documento inválido'),
  email: z.string().trim().email('Email inválido').max(255, 'Email muy largo').optional().or(z.literal('')),
  phone: z.string().trim().max(20, 'Teléfono muy largo').optional().or(z.literal('')),
  department: z.enum(['comercial', 'soporte', 'marketing', 'campanas', 'ti', 'digitalcollege'] as const),
  position: z.string().trim().min(2, 'El cargo debe tener al menos 2 caracteres').max(100, 'Cargo muy largo'),
  hireDate: z.string().min(1, 'La fecha de ingreso es requerida'),
  contractType: z.enum(['indefinido', 'plazo_fijo', 'tiempo_parcial', 'practicas', 'locacion'] as const),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface NewEmployeeFormProps {
  onSubmit: (employee: Employee) => void;
  onCancel: () => void;
}

const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  indefinido: 'Indefinido',
  plazo_fijo: 'Plazo Fijo',
  tiempo_parcial: 'Tiempo Parcial',
  practicas: 'Prácticas',
  locacion: 'Locación de Servicios',
};

export function NewEmployeeForm({ onSubmit, onCancel }: NewEmployeeFormProps) {
  const [formData, setFormData] = useState<Partial<EmployeeFormData>>({
    name: '',
    documentId: '',
    email: '',
    phone: '',
    department: undefined,
    position: '',
    hireDate: '',
    contractType: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof EmployeeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is modified
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = employeeSchema.safeParse(formData);
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error('Por favor corrige los errores del formulario');
      return;
    }

    const newEmployee: Employee = {
      id: `emp-${Date.now()}`,
      name: result.data.name,
      documentId: result.data.documentId,
      email: result.data.email || undefined,
      phone: result.data.phone || undefined,
      department: result.data.department,
      position: result.data.position,
      hireDate: result.data.hireDate,
      contractType: result.data.contractType,
      status: 'active',
    };

    onSubmit(newEmployee);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Datos Personales */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Datos Personales</h3>
        
        <div className="space-y-2">
          <Label htmlFor="name">Nombre Completo *</Label>
          <Input
            id="name"
            placeholder="Ej: Juan Carlos Pérez López"
            value={formData.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="documentId">DNI / Documento *</Label>
            <Input
              id="documentId"
              placeholder="12345678"
              value={formData.documentId || ''}
              onChange={(e) => handleChange('documentId', e.target.value)}
              className={errors.documentId ? 'border-destructive' : ''}
            />
            {errors.documentId && <p className="text-xs text-destructive">{errors.documentId}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              placeholder="987654321"
              value={formData.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              className={errors.phone ? 'border-destructive' : ''}
            />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Correo Electrónico</Label>
          <Input
            id="email"
            type="email"
            placeholder="correo@empresa.com"
            value={formData.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>
      </div>

      {/* Datos Laborales */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Datos Laborales</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Departamento *</Label>
            <Select 
              value={formData.department} 
              onValueChange={(value) => handleChange('department', value)}
            >
              <SelectTrigger className={errors.department ? 'border-destructive' : ''}>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DEPARTMENTS).map(([key, dept]) => (
                  <SelectItem key={key} value={key}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.department && <p className="text-xs text-destructive">{errors.department}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Cargo *</Label>
            <Input
              id="position"
              placeholder="Ej: Analista Senior"
              value={formData.position || ''}
              onChange={(e) => handleChange('position', e.target.value)}
              className={errors.position ? 'border-destructive' : ''}
            />
            {errors.position && <p className="text-xs text-destructive">{errors.position}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hireDate">Fecha de Ingreso *</Label>
            <Input
              id="hireDate"
              type="date"
              value={formData.hireDate || ''}
              onChange={(e) => handleChange('hireDate', e.target.value)}
              className={errors.hireDate ? 'border-destructive' : ''}
            />
            {errors.hireDate && <p className="text-xs text-destructive">{errors.hireDate}</p>}
          </div>
          <div className="space-y-2">
            <Label>Tipo de Contrato *</Label>
            <Select 
              value={formData.contractType} 
              onValueChange={(value) => handleChange('contractType', value)}
            >
              <SelectTrigger className={errors.contractType ? 'border-destructive' : ''}>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CONTRACT_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.contractType && <p className="text-xs text-destructive">{errors.contractType}</p>}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1 gradient-primary">
          Crear Empleado
        </Button>
      </div>
    </form>
  );
}
