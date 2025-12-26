-- Create attendance_records table for storing attendance data
CREATE TABLE public.attendance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  check_in TIME WITHOUT TIME ZONE,
  check_out TIME WITHOUT TIME ZONE,
  worked_hours NUMERIC DEFAULT 0,
  tardy_minutes INTEGER DEFAULT 0,
  tardy_count INTEGER DEFAULT 0,
  absences INTEGER DEFAULT 0,
  overtime_weekday NUMERIC DEFAULT 0,
  overtime_holiday NUMERIC DEFAULT 0,
  days_attended INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'rejected', 'justified')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(employee_id, date)
);

-- Enable RLS
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for attendance_records
CREATE POLICY "Admins can manage all attendance"
ON public.attendance_records FOR ALL
USING (has_role(auth.uid(), 'admin_rrhh'));

CREATE POLICY "Employees can view their own attendance"
ON public.attendance_records FOR SELECT
USING (employee_id IN (
  SELECT id FROM public.employees WHERE user_id = auth.uid()
));

CREATE POLICY "Jefes can view attendance in their department"
ON public.attendance_records FOR SELECT
USING (
  has_role(auth.uid(), 'jefe_area') 
  AND employee_id IN (
    SELECT id FROM public.employees WHERE department = get_user_area(auth.uid())
  )
);

-- Create performance_evaluations table
CREATE TABLE public.performance_evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  period TEXT NOT NULL,
  classification TEXT NOT NULL CHECK (classification IN ('A', 'B', 'C', 'D')),
  overall_score INTEGER DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
  kpis JSONB DEFAULT '[]'::jsonb,
  observations TEXT,
  evaluated_by TEXT,
  evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  bonus_condition TEXT DEFAULT 'not_eligible' CHECK (bonus_condition IN ('eligible', 'pending_review', 'not_eligible')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.performance_evaluations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for performance_evaluations
CREATE POLICY "Admins can manage all evaluations"
ON public.performance_evaluations FOR ALL
USING (has_role(auth.uid(), 'admin_rrhh'));

CREATE POLICY "Employees can view their own evaluations"
ON public.performance_evaluations FOR SELECT
USING (employee_id IN (
  SELECT id FROM public.employees WHERE user_id = auth.uid()
));

CREATE POLICY "Jefes can manage evaluations in their department"
ON public.performance_evaluations FOR ALL
USING (
  has_role(auth.uid(), 'jefe_area') 
  AND employee_id IN (
    SELECT id FROM public.employees WHERE department = get_user_area(auth.uid())
  )
);

-- Add triggers for updated_at
CREATE TRIGGER update_attendance_records_updated_at
BEFORE UPDATE ON public.attendance_records
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_performance_evaluations_updated_at
BEFORE UPDATE ON public.performance_evaluations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();