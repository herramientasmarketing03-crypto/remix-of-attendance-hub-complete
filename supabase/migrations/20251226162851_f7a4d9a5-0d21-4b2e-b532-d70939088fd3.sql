-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin_rrhh', 'jefe_area', 'empleado');

-- Create enum for contract types
CREATE TYPE public.contract_type AS ENUM ('indefinido', 'plazo_fijo', 'por_obra', 'honorarios', 'practica');

-- Create enum for employee status
CREATE TYPE public.employee_status AS ENUM ('active', 'inactive', 'on_leave', 'terminated');

-- Create enum for justification types
CREATE TYPE public.justification_type AS ENUM ('tardanza', 'inasistencia', 'salida_temprana', 'permiso_medico', 'emergencia_familiar');

-- Create enum for sanction types
CREATE TYPE public.sanction_type AS ENUM ('verbal', 'written', 'suspension', 'termination');

-- Create enum for request status
CREATE TYPE public.request_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');

-- Create enum for approval flow
CREATE TYPE public.approval_flow AS ENUM ('pending', 'jefe_approved', 'rrhh_approved', 'completed', 'rejected');

-- Create profiles table linked to auth.users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT,
  nombres TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'empleado',
  area_id TEXT,
  employee_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Create employees table
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  document_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  department TEXT NOT NULL,
  position TEXT,
  hire_date DATE,
  contract_type contract_type DEFAULT 'indefinido',
  contract_end_date DATE,
  avatar_url TEXT,
  status employee_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create contracts table
CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  type contract_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  salary DECIMAL(10,2),
  position TEXT,
  department TEXT,
  status TEXT DEFAULT 'active',
  documents_complete BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL,
  from_user_name TEXT NOT NULL,
  to_user_type TEXT NOT NULL,
  to_user_id TEXT,
  to_user_name TEXT NOT NULL,
  department TEXT,
  category TEXT DEFAULT 'general',
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  attachment_url TEXT,
  attachment_name TEXT,
  read_at TIMESTAMPTZ,
  replied BOOLEAN DEFAULT false,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create vacation_requests table
CREATE TABLE public.vacation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INTEGER NOT NULL,
  reason TEXT,
  status request_status DEFAULT 'pending',
  approval_flow approval_flow DEFAULT 'pending',
  jefe_approved_by TEXT,
  jefe_approved_at TIMESTAMPTZ,
  rrhh_approved_by TEXT,
  rrhh_approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create permission_requests table
CREATE TABLE public.permission_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  type TEXT NOT NULL,
  reason TEXT,
  status request_status DEFAULT 'pending',
  approval_flow approval_flow DEFAULT 'pending',
  evidence_url TEXT,
  jefe_approved_by TEXT,
  jefe_approved_at TIMESTAMPTZ,
  rrhh_approved_by TEXT,
  rrhh_approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sanctions table
CREATE TABLE public.sanctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  type sanction_type NOT NULL,
  infraction_level TEXT NOT NULL,
  description TEXT NOT NULL,
  regulation_article TEXT,
  date DATE NOT NULL,
  applied_by TEXT,
  days_of_suspension INTEGER,
  status TEXT DEFAULT 'active',
  notes TEXT,
  evidence_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create justifications table
CREATE TABLE public.justifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  employee_name TEXT NOT NULL,
  type justification_type NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  evidence_url TEXT,
  evidence_type TEXT,
  status request_status DEFAULT 'pending',
  dcts_validated BOOLEAN DEFAULT false,
  dcts_validated_at TIMESTAMPTZ,
  dcts_validated_by TEXT,
  jefe_approved BOOLEAN,
  jefe_approved_at TIMESTAMPTZ,
  jefe_approved_by TEXT,
  rrhh_approved BOOLEAN,
  rrhh_approved_at TIMESTAMPTZ,
  rrhh_approved_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sanctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.justifications ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Create function to get user area
CREATE OR REPLACE FUNCTION public.get_user_area(_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT area_id FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin_rrhh'));

-- User roles policies
CREATE POLICY "Users can view their own role"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin_rrhh'));

-- Employees policies
CREATE POLICY "Admins can do everything with employees"
ON public.employees FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin_rrhh'));

CREATE POLICY "Jefes can view employees in their department"
ON public.employees FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'jefe_area') AND 
  department = public.get_user_area(auth.uid())
);

CREATE POLICY "Employees can view their own record"
ON public.employees FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Contracts policies
CREATE POLICY "Admins can do everything with contracts"
ON public.contracts FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin_rrhh'));

CREATE POLICY "Employees can view their own contracts"
ON public.contracts FOR SELECT
TO authenticated
USING (
  employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
);

-- Messages policies
CREATE POLICY "Users can view messages they sent or received"
ON public.messages FOR SELECT
TO authenticated
USING (
  from_user_id = auth.uid() OR 
  to_user_id = auth.uid()::text OR
  to_user_type = 'rrhh' AND public.has_role(auth.uid(), 'admin_rrhh') OR
  to_user_type = 'jefe' AND public.has_role(auth.uid(), 'jefe_area')
);

CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (from_user_id = auth.uid());

CREATE POLICY "Users can update their own messages"
ON public.messages FOR UPDATE
TO authenticated
USING (from_user_id = auth.uid() OR to_user_id = auth.uid()::text);

-- Vacation requests policies
CREATE POLICY "Admins can do everything with vacations"
ON public.vacation_requests FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin_rrhh'));

CREATE POLICY "Jefes can view and update vacations in their department"
ON public.vacation_requests FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'jefe_area') AND 
  employee_id IN (
    SELECT id FROM public.employees WHERE department = public.get_user_area(auth.uid())
  )
);

CREATE POLICY "Employees can view and create their own vacations"
ON public.vacation_requests FOR SELECT
TO authenticated
USING (
  employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
);

CREATE POLICY "Employees can create vacations"
ON public.vacation_requests FOR INSERT
TO authenticated
WITH CHECK (
  employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
);

-- Permission requests policies
CREATE POLICY "Admins can do everything with permissions"
ON public.permission_requests FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin_rrhh'));

CREATE POLICY "Jefes can manage permissions in their department"
ON public.permission_requests FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'jefe_area') AND 
  employee_id IN (
    SELECT id FROM public.employees WHERE department = public.get_user_area(auth.uid())
  )
);

CREATE POLICY "Employees can view and create their own permissions"
ON public.permission_requests FOR SELECT
TO authenticated
USING (
  employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
);

CREATE POLICY "Employees can create permissions"
ON public.permission_requests FOR INSERT
TO authenticated
WITH CHECK (
  employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
);

-- Sanctions policies
CREATE POLICY "Admins can do everything with sanctions"
ON public.sanctions FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin_rrhh'));

CREATE POLICY "Jefes can view and create sanctions in their department"
ON public.sanctions FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'jefe_area') AND 
  employee_id IN (
    SELECT id FROM public.employees WHERE department = public.get_user_area(auth.uid())
  )
);

CREATE POLICY "Employees can view their own sanctions"
ON public.sanctions FOR SELECT
TO authenticated
USING (
  employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
);

-- Justifications policies
CREATE POLICY "Admins can do everything with justifications"
ON public.justifications FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin_rrhh'));

CREATE POLICY "Jefes can manage justifications in their department"
ON public.justifications FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'jefe_area') AND 
  employee_id IN (
    SELECT id FROM public.employees WHERE department = public.get_user_area(auth.uid())
  )
);

CREATE POLICY "Employees can view and create their own justifications"
ON public.justifications FOR SELECT
TO authenticated
USING (
  employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
);

CREATE POLICY "Employees can create justifications"
ON public.justifications FOR INSERT
TO authenticated
WITH CHECK (
  employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, email, nombres, apellidos)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'nombres', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data ->> 'apellidos', 'Nuevo')
  );
  
  -- Create default role (empleado)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'empleado');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vacation_requests_updated_at
  BEFORE UPDATE ON public.vacation_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_permission_requests_updated_at
  BEFORE UPDATE ON public.permission_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sanctions_updated_at
  BEFORE UPDATE ON public.sanctions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_justifications_updated_at
  BEFORE UPDATE ON public.justifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;