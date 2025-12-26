-- Agregar columnas de break a attendance_records
ALTER TABLE public.attendance_records 
ADD COLUMN IF NOT EXISTS break_start TIME,
ADD COLUMN IF NOT EXISTS break_end TIME,
ADD COLUMN IF NOT EXISTS break_minutes INTEGER DEFAULT 0;

-- Agregar código de empleado a employees
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS employee_code TEXT;

-- Agregar created_by_user_id a employee_tasks para control de permisos
ALTER TABLE public.employee_tasks 
ADD COLUMN IF NOT EXISTS created_by_user_id UUID;

-- Crear tabla de manuales de funciones por puesto
CREATE TABLE IF NOT EXISTS public.position_manuals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  responsibilities JSONB DEFAULT '[]'::jsonb,
  requirements TEXT,
  created_by TEXT,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS en position_manuals
ALTER TABLE public.position_manuals ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para position_manuals
CREATE POLICY "Admins can manage all manuals"
ON public.position_manuals
FOR ALL
USING (has_role(auth.uid(), 'admin_rrhh'::app_role));

CREATE POLICY "Jefes can manage manuals in their department"
ON public.position_manuals
FOR ALL
USING (
  has_role(auth.uid(), 'jefe_area'::app_role) 
  AND department = get_user_area(auth.uid())
);

CREATE POLICY "Employees can view manuals for their position"
ON public.position_manuals
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM employees 
    WHERE employees.user_id = auth.uid() 
    AND employees.department = position_manuals.department
    AND employees.position = position_manuals.position
  )
);

-- Trigger para updated_at en position_manuals
CREATE TRIGGER update_position_manuals_updated_at
BEFORE UPDATE ON public.position_manuals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();