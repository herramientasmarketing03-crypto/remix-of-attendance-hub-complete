-- Drop the existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update the handle_new_user function to auto-link employees
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _employee_id uuid;
  _position text;
  _department text;
  _role app_role;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, email, nombres, apellidos)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'nombres', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data ->> 'apellidos', 'Nuevo')
  );
  
  -- Check if email exists in employees table
  SELECT id, position, department INTO _employee_id, _position, _department
  FROM public.employees
  WHERE LOWER(email) = LOWER(NEW.email);
  
  -- If employee found, link them
  IF _employee_id IS NOT NULL THEN
    -- Update employee with user_id
    UPDATE public.employees
    SET user_id = NEW.id
    WHERE id = _employee_id;
    
    -- Determine role based on position
    IF _position ILIKE '%Jefe%' OR _position ILIKE '%Gerente%' OR _position ILIKE '%Coordinador%' OR _position ILIKE '%Supervisor%' THEN
      -- Check if it's admin RRHH
      IF _department = 'rrhh' AND (_position ILIKE '%Jefe%' OR _position ILIKE '%Administrador%') THEN
        _role := 'admin_rrhh';
      ELSE
        _role := 'jefe_area';
      END IF;
    ELSE
      _role := 'empleado';
    END IF;
    
    -- Create role with employee link
    INSERT INTO public.user_roles (user_id, role, employee_id, area_id)
    VALUES (NEW.id, _role, _employee_id, _department);
  ELSE
    -- Default role for non-employees
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'empleado');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();