-- Create employee_tasks table for task tracking
CREATE TABLE public.employee_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  assigned_to TEXT NOT NULL,
  assigned_by TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'on_hold')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT NOT NULL DEFAULT 'general',
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  link TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employee_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage all tasks"
ON public.employee_tasks FOR ALL
USING (has_role(auth.uid(), 'admin_rrhh'));

CREATE POLICY "Jefes can manage tasks in their department"
ON public.employee_tasks FOR ALL
USING (
  has_role(auth.uid(), 'jefe_area') AND 
  (employee_id IN (SELECT id FROM employees WHERE department = get_user_area(auth.uid())))
);

CREATE POLICY "Employees can view their own tasks"
ON public.employee_tasks FOR SELECT
USING (employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()));

CREATE POLICY "Employees can update their own tasks"
ON public.employee_tasks FOR UPDATE
USING (employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_employee_tasks_updated_at
BEFORE UPDATE ON public.employee_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.employee_tasks;