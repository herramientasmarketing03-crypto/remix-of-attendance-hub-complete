import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserPlus, Check, AlertCircle } from 'lucide-react';
import { BiometricStatRecord } from '@/types/payroll';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AddUnmatchedEmployeesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unmatchedRecords: BiometricStatRecord[];
  onEmployeesAdded: () => void;
}

interface EmployeeToAdd {
  documentId: string;
  name: string;
  department: string;
  selected: boolean;
}

const DEPARTMENTS = [
  'rrhh',
  'administracion',
  'comercial',
  'operaciones',
  'finanzas',
  'tecnologia',
  'legal',
  'marketing'
];

export function AddUnmatchedEmployeesDialog({
  open,
  onOpenChange,
  unmatchedRecords,
  onEmployeesAdded
}: AddUnmatchedEmployeesDialogProps) {
  const [employees, setEmployees] = useState<EmployeeToAdd[]>(() => 
    unmatchedRecords.map(r => ({
      documentId: r.documentId,
      name: r.employeeName,
      department: r.department === 'Empresa' ? 'operaciones' : r.department.toLowerCase(),
      selected: true
    }))
  );
  const [isAdding, setIsAdding] = useState(false);
  const [addedCount, setAddedCount] = useState(0);

  const handleToggleSelect = (documentId: string) => {
    setEmployees(prev => prev.map(e => 
      e.documentId === documentId ? { ...e, selected: !e.selected } : e
    ));
  };

  const handleToggleAll = (selected: boolean) => {
    setEmployees(prev => prev.map(e => ({ ...e, selected })));
  };

  const handleChangeName = (documentId: string, name: string) => {
    setEmployees(prev => prev.map(e => 
      e.documentId === documentId ? { ...e, name } : e
    ));
  };

  const handleChangeDepartment = (documentId: string, department: string) => {
    setEmployees(prev => prev.map(e => 
      e.documentId === documentId ? { ...e, department } : e
    ));
  };

  const handleAddEmployees = async () => {
    const selectedEmployees = employees.filter(e => e.selected);
    if (selectedEmployees.length === 0) {
      toast.error('Seleccione al menos un empleado');
      return;
    }

    setIsAdding(true);
    let added = 0;

    try {
      for (const emp of selectedEmployees) {
        const { error } = await supabase
          .from('employees')
          .insert({
            document_id: emp.documentId,
            name: emp.name,
            department: emp.department,
            status: 'active',
            contract_type: 'indefinido'
          });

        if (error) {
          console.error('Error adding employee:', emp.name, error);
          // Check if it's a duplicate
          if (error.code === '23505') {
            toast.error(`DNI ${emp.documentId} ya existe en el sistema`);
          }
        } else {
          added++;
        }
      }

      setAddedCount(added);
      
      if (added > 0) {
        toast.success(`${added} empleados agregados correctamente`);
        onEmployeesAdded();
      }

      if (added === selectedEmployees.length) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error adding employees:', error);
      toast.error('Error al agregar empleados');
    } finally {
      setIsAdding(false);
    }
  };

  const selectedCount = employees.filter(e => e.selected).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Agregar Empleados No Encontrados
          </DialogTitle>
          <DialogDescription>
            {unmatchedRecords.length} empleados del reporte no fueron encontrados en el sistema.
            Seleccione los que desea agregar y complete su información.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedCount === employees.length}
                      onCheckedChange={(checked) => handleToggleAll(!!checked)}
                    />
                  </TableHead>
                  <TableHead>DNI</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Departamento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp) => (
                  <TableRow key={emp.documentId}>
                    <TableCell>
                      <Checkbox
                        checked={emp.selected}
                        onCheckedChange={() => handleToggleSelect(emp.documentId)}
                      />
                    </TableCell>
                    <TableCell className="font-mono">{emp.documentId}</TableCell>
                    <TableCell>
                      <Input
                        value={emp.name}
                        onChange={(e) => handleChangeName(emp.documentId, e.target.value)}
                        className="h-8"
                        disabled={!emp.selected}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={emp.department}
                        onValueChange={(value) => handleChangeDepartment(emp.documentId, value)}
                        disabled={!emp.selected}
                      >
                        <SelectTrigger className="h-8 w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DEPARTMENTS.map(dept => (
                            <SelectItem key={dept} value={dept}>
                              {dept.charAt(0).toUpperCase() + dept.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            {selectedCount} de {employees.length} seleccionados
          </div>
          
          {addedCount > 0 && (
            <Badge className="bg-success/10 text-success">
              <Check className="w-3 h-3 mr-1" />
              {addedCount} agregados
            </Badge>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            className="gradient-primary"
            onClick={handleAddEmployees}
            disabled={isAdding || selectedCount === 0}
          >
            {isAdding ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Agregando...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Agregar {selectedCount} Empleados
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
