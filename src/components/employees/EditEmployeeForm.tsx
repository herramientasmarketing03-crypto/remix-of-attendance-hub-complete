import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { z } from 'zod';
import { toast } from 'sonner';
import type { Employee, EmployeeUpdate } from '@/hooks/useEmployees';

const employeeSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  document_id: z.string().min(8, 'Documento debe tener al menos 8 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  department: z.string().min(1, 'Departamento es requerido'),
  position: z.string().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive', 'on_leave', 'terminated']),
  contract_type: z.enum(['indefinido', 'plazo_fijo', 'por_obra', 'honorarios', 'practica']),
});

type FormData = z.infer<typeof employeeSchema>;

interface EditEmployeeFormProps {
  employee: Employee;
  onSubmit: (id: string, data: EmployeeUpdate) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const DEPARTMENTS = [
  { value: 'gerencia', label: 'Gerencia' },
  { value: 'rrhh', label: 'Recursos Humanos' },
  { value: 'ti', label: 'Tecnología' },
  { value: 'finanzas', label: 'Finanzas' },
  { value: 'operaciones', label: 'Operaciones' },
  { value: 'ventas', label: 'Ventas' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'legal', label: 'Legal' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
  { value: 'on_leave', label: 'Con Permiso' },
  { value: 'terminated', label: 'Cesado' },
];

const CONTRACT_TYPES = [
  { value: 'indefinido', label: 'Indefinido' },
  { value: 'plazo_fijo', label: 'Plazo Fijo' },
  { value: 'por_obra', label: 'Por Obra' },
  { value: 'honorarios', label: 'Honorarios' },
  { value: 'practica', label: 'Prácticas' },
];

export function EditEmployeeForm({ employee, onSubmit, onCancel, loading }: EditEmployeeFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: employee.name,
    document_id: employee.document_id,
    email: employee.email || '',
    phone: employee.phone || '',
    department: employee.department,
    position: employee.position || '',
    status: employee.status || 'active',
    contract_type: employee.contract_type || 'indefinido',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = employeeSchema.safeParse(formData);
    
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
      toast.error('Por favor corrija los errores del formulario');
      return;
    }

    try {
      await onSubmit(employee.id, {
        name: formData.name,
        document_id: formData.document_id,
        email: formData.email || null,
        phone: formData.phone || null,
        department: formData.department,
        position: formData.position || null,
        status: formData.status,
        contract_type: formData.contract_type,
      });
    } catch (err) {
      // Error handled in hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre */}
        <div className="space-y-2">
          <Label htmlFor="name">Nombre Completo *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Juan Pérez"
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

        {/* Documento */}
        <div className="space-y-2">
          <Label htmlFor="document_id">Documento *</Label>
          <Input
            id="document_id"
            value={formData.document_id}
            onChange={(e) => handleChange('document_id', e.target.value)}
            placeholder="12345678"
          />
          {errors.document_id && <p className="text-xs text-destructive">{errors.document_id}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="juan@empresa.com"
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>

        {/* Teléfono */}
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+51 999 999 999"
          />
        </div>

        {/* Departamento */}
        <div className="space-y-2">
          <Label htmlFor="department">Departamento *</Label>
          <Select value={formData.department} onValueChange={(v) => handleChange('department', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar departamento" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map(dept => (
                <SelectItem key={dept.value} value={dept.value}>{dept.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.department && <p className="text-xs text-destructive">{errors.department}</p>}
        </div>

        {/* Cargo */}
        <div className="space-y-2">
          <Label htmlFor="position">Cargo</Label>
          <Input
            id="position"
            value={formData.position}
            onChange={(e) => handleChange('position', e.target.value)}
            placeholder="Desarrollador"
          />
        </div>

        {/* Estado */}
        <div className="space-y-2">
          <Label htmlFor="status">Estado *</Label>
          <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tipo de Contrato */}
        <div className="space-y-2">
          <Label htmlFor="contract_type">Tipo de Contrato *</Label>
          <Select value={formData.contract_type} onValueChange={(v) => handleChange('contract_type', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              {CONTRACT_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </form>
  );
}
