-- ============================================
-- TABLA: applicants (Postulantes)
-- ============================================
CREATE TABLE public.applicants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  document_id TEXT,
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  experience_years INTEGER DEFAULT 0,
  source TEXT DEFAULT 'directo',
  salary_expectation NUMERIC,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'interviewing', 'selected', 'rejected', 'hired')),
  resume_url TEXT,
  notes TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.applicants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all applicants" ON public.applicants
FOR ALL USING (has_role(auth.uid(), 'admin_rrhh'));

CREATE POLICY "Jefes can view applicants for their department" ON public.applicants
FOR SELECT USING (has_role(auth.uid(), 'jefe_area') AND department = get_user_area(auth.uid()));

-- ============================================
-- TABLA: terminations (Procesos de Retiro)
-- ============================================
CREATE TABLE public.terminations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  department TEXT NOT NULL,
  position TEXT,
  termination_type TEXT NOT NULL CHECK (termination_type IN ('voluntary', 'dismissal', 'contract_end', 'retirement', 'mutual_agreement')),
  reason TEXT,
  requested_date DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_date DATE,
  last_working_day DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'clearance', 'completed', 'cancelled')),
  clearance_checklist JSONB DEFAULT '{"equipment_returned": false, "access_revoked": false, "documentation_complete": false, "exit_interview": false, "final_payment": false}'::jsonb,
  settlement_amount NUMERIC,
  notes TEXT,
  processed_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.terminations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all terminations" ON public.terminations
FOR ALL USING (has_role(auth.uid(), 'admin_rrhh'));

CREATE POLICY "Jefes can view terminations in their department" ON public.terminations
FOR SELECT USING (has_role(auth.uid(), 'jefe_area') AND department = get_user_area(auth.uid()));

-- ============================================
-- TABLA: personnel_requirements (Requerimientos de Personal)
-- ============================================
CREATE TABLE public.personnel_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  position TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  department TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  contract_type TEXT DEFAULT 'indefinido',
  salary_min NUMERIC,
  salary_max NUMERIC,
  justification TEXT,
  requirements JSONB DEFAULT '[]'::jsonb,
  responsibilities JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in_process', 'filled', 'cancelled')),
  requested_by TEXT NOT NULL,
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  filled_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.personnel_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all requirements" ON public.personnel_requirements
FOR ALL USING (has_role(auth.uid(), 'admin_rrhh'));

CREATE POLICY "Jefes can manage requirements in their department" ON public.personnel_requirements
FOR ALL USING (has_role(auth.uid(), 'jefe_area') AND department = get_user_area(auth.uid()));

-- ============================================
-- TABLA: inventory_items (Inventario)
-- ============================================
CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('equipment', 'furniture', 'technology', 'software', 'supplies', 'vehicle', 'other')),
  description TEXT,
  quantity INTEGER DEFAULT 1,
  unit TEXT DEFAULT 'unidad',
  location TEXT,
  serial_number TEXT,
  purchase_date DATE,
  purchase_value NUMERIC,
  current_value NUMERIC,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'damaged', 'disposed')),
  assigned_to_employee UUID REFERENCES public.employees(id),
  assigned_to_department TEXT,
  warranty_until DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all inventory" ON public.inventory_items
FOR ALL USING (has_role(auth.uid(), 'admin_rrhh'));

CREATE POLICY "Jefes can view inventory in their department" ON public.inventory_items
FOR SELECT USING (has_role(auth.uid(), 'jefe_area') AND assigned_to_department = get_user_area(auth.uid()));

CREATE POLICY "Employees can view inventory assigned to them" ON public.inventory_items
FOR SELECT USING (assigned_to_employee IN (SELECT id FROM employees WHERE user_id = auth.uid()));

-- ============================================
-- TABLA: area_requirements (Requerimientos por Área)
-- ============================================
CREATE TABLE public.area_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  department TEXT NOT NULL,
  expense_type TEXT NOT NULL CHECK (expense_type IN ('fixed', 'variable')),
  category TEXT NOT NULL CHECK (category IN ('software', 'hardware', 'service', 'subscription', 'training', 'infrastructure', 'other')),
  estimated_cost NUMERIC NOT NULL,
  recurring BOOLEAN DEFAULT false,
  recurring_period TEXT CHECK (recurring_period IN ('monthly', 'quarterly', 'yearly')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  justification TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'purchased', 'cancelled')),
  requested_by TEXT NOT NULL,
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  purchase_date DATE,
  actual_cost NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.area_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all area requirements" ON public.area_requirements
FOR ALL USING (has_role(auth.uid(), 'admin_rrhh'));

CREATE POLICY "Jefes can manage area requirements in their department" ON public.area_requirements
FOR ALL USING (has_role(auth.uid(), 'jefe_area') AND department = get_user_area(auth.uid()));

-- ============================================
-- TABLA: activities (Agenda de Actividades)
-- ============================================
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME,
  end_time TIME,
  type TEXT NOT NULL CHECK (type IN ('meeting', 'training', 'event', 'deadline', 'reminder', 'birthday', 'other')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  location TEXT,
  department TEXT,
  participants JSONB DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_by_name TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  recurrence TEXT CHECK (recurrence IN ('none', 'daily', 'weekly', 'monthly', 'yearly')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all activities" ON public.activities
FOR ALL USING (has_role(auth.uid(), 'admin_rrhh'));

CREATE POLICY "Jefes can manage activities in their department" ON public.activities
FOR ALL USING (has_role(auth.uid(), 'jefe_area') AND (department = get_user_area(auth.uid()) OR department IS NULL));

CREATE POLICY "Users can view activities they're part of or public" ON public.activities
FOR SELECT USING (
  created_by = auth.uid() OR 
  department IS NULL OR
  has_role(auth.uid(), 'admin_rrhh') OR
  (has_role(auth.uid(), 'jefe_area') AND department = get_user_area(auth.uid()))
);

CREATE POLICY "Users can create activities" ON public.activities
FOR INSERT WITH CHECK (created_by = auth.uid());

-- ============================================
-- TABLA: department_positions (Puestos por Departamento)
-- ============================================
CREATE TABLE public.department_positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  department TEXT NOT NULL,
  position_name TEXT NOT NULL,
  description TEXT,
  responsibilities JSONB DEFAULT '[]'::jsonb,
  requirements TEXT,
  current_count INTEGER DEFAULT 0,
  max_positions INTEGER DEFAULT 1,
  is_leadership BOOLEAN DEFAULT false,
  reports_to TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(department, position_name)
);

ALTER TABLE public.department_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view department positions" ON public.department_positions
FOR SELECT USING (true);

CREATE POLICY "Admins can manage department positions" ON public.department_positions
FOR ALL USING (has_role(auth.uid(), 'admin_rrhh'));

-- ============================================
-- TABLA: audit_logs (Registro de Auditoría)
-- ============================================
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT NOT NULL,
  user_email TEXT,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
FOR SELECT USING (has_role(auth.uid(), 'admin_rrhh'));

CREATE POLICY "Admins can insert audit logs" ON public.audit_logs
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin_rrhh') OR has_role(auth.uid(), 'jefe_area') OR auth.uid() IS NOT NULL);

-- ============================================
-- TABLA: system_settings (Configuración del Sistema)
-- ============================================
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('company', 'schedule', 'notifications', 'security', 'general')),
  description TEXT,
  updated_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view settings" ON public.system_settings
FOR SELECT USING (true);

CREATE POLICY "Admins can manage settings" ON public.system_settings
FOR ALL USING (has_role(auth.uid(), 'admin_rrhh'));

-- ============================================
-- TRIGGERS para updated_at
-- ============================================
CREATE TRIGGER update_applicants_updated_at BEFORE UPDATE ON public.applicants
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_terminations_updated_at BEFORE UPDATE ON public.terminations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_personnel_requirements_updated_at BEFORE UPDATE ON public.personnel_requirements
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_area_requirements_updated_at BEFORE UPDATE ON public.area_requirements
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON public.activities
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_department_positions_updated_at BEFORE UPDATE ON public.department_positions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- DATOS INICIALES: department_positions
-- ============================================
INSERT INTO public.department_positions (department, position_name, description, max_positions, is_leadership, reports_to) VALUES
('rrhh', 'Jefe de RRHH', 'Responsable de la gestión integral de recursos humanos', 1, true, 'Gerencia General'),
('rrhh', 'Analista de RRHH', 'Apoyo en procesos de selección, nómina y desarrollo', 3, false, 'Jefe de RRHH'),
('rrhh', 'Asistente de RRHH', 'Soporte administrativo del área', 2, false, 'Analista de RRHH'),
('comercial', 'Jefe Comercial', 'Responsable de ventas y desarrollo comercial', 1, true, 'Gerencia General'),
('comercial', 'Asesor Comercial Senior', 'Gestión de cuentas clave y cierre de ventas', 5, false, 'Jefe Comercial'),
('comercial', 'Asesor Comercial Junior', 'Prospección y atención al cliente', 10, false, 'Asesor Comercial Senior'),
('marketing', 'Jefe de Marketing', 'Estrategia y gestión de marketing', 1, true, 'Gerencia General'),
('marketing', 'Diseñador Gráfico', 'Creación de material visual', 2, false, 'Jefe de Marketing'),
('marketing', 'Community Manager', 'Gestión de redes sociales', 1, false, 'Jefe de Marketing'),
('operaciones', 'Jefe de Operaciones', 'Gestión operativa y logística', 1, true, 'Gerencia General'),
('operaciones', 'Coordinador de Operaciones', 'Coordinación de procesos operativos', 2, false, 'Jefe de Operaciones'),
('operaciones', 'Operador', 'Ejecución de tareas operativas', 8, false, 'Coordinador de Operaciones'),
('finanzas', 'Jefe de Finanzas', 'Gestión financiera y contable', 1, true, 'Gerencia General'),
('finanzas', 'Contador', 'Contabilidad y reportes financieros', 2, false, 'Jefe de Finanzas'),
('finanzas', 'Asistente Contable', 'Soporte en tareas contables', 2, false, 'Contador'),
('ti', 'Jefe de TI', 'Gestión de tecnología e infraestructura', 1, true, 'Gerencia General'),
('ti', 'Desarrollador', 'Desarrollo y mantenimiento de sistemas', 3, false, 'Jefe de TI'),
('ti', 'Soporte Técnico', 'Atención y soporte a usuarios', 2, false, 'Jefe de TI');

-- ============================================
-- DATOS INICIALES: system_settings
-- ============================================
INSERT INTO public.system_settings (key, value, category, description) VALUES
('company_name', '"Empresa Demo S.A."', 'company', 'Nombre de la empresa'),
('company_ruc', '"20123456789"', 'company', 'RUC de la empresa'),
('company_address', '"Av. Principal 123, Lima"', 'company', 'Dirección de la empresa'),
('work_start_time', '"08:00"', 'schedule', 'Hora de inicio de jornada'),
('work_end_time', '"18:00"', 'schedule', 'Hora de fin de jornada'),
('lunch_duration_minutes', '60', 'schedule', 'Duración del almuerzo en minutos'),
('tolerance_minutes', '10', 'schedule', 'Tolerancia para marcación en minutos'),
('notify_absences', 'true', 'notifications', 'Notificar ausencias'),
('notify_birthdays', 'true', 'notifications', 'Notificar cumpleaños'),
('notify_contract_expiry', 'true', 'notifications', 'Notificar vencimiento de contratos'),
('contract_expiry_days', '30', 'notifications', 'Días antes de vencimiento para notificar'),
('session_timeout_minutes', '30', 'security', 'Tiempo de sesión en minutos'),
('password_min_length', '8', 'security', 'Longitud mínima de contraseña'),
('require_password_change_days', '90', 'security', 'Días para cambio obligatorio de contraseña');