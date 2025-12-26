-- Update messages RLS policy for truly private messaging
DROP POLICY IF EXISTS "Users can view messages they sent or received" ON public.messages;

-- Create new private messaging policy
CREATE POLICY "Private messaging between sender and receiver"
ON public.messages FOR SELECT USING (
  -- Sender can see their own messages
  (from_user_id = auth.uid()) OR 
  -- Direct recipient can see messages sent to them
  (to_user_id = (auth.uid())::text) OR
  -- RRHH admin can see messages specifically sent to RRHH (not to specific users)
  ((to_user_type = 'rrhh') AND (to_user_id = 'rrhh') AND has_role(auth.uid(), 'admin_rrhh'::app_role)) OR
  -- Jefe can see messages from employees in their department who sent to 'jefe'
  ((to_user_type = 'jefe') AND (to_user_id = 'jefe') AND has_role(auth.uid(), 'jefe_area'::app_role) AND 
   EXISTS (
     SELECT 1 FROM employees e 
     WHERE e.user_id = messages.from_user_id 
     AND e.department = get_user_area(auth.uid())
   ))
);