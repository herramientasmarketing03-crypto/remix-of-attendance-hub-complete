-- Tabla para notificaciones reales por usuario
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'general',
  title text NOT NULL,
  message text NOT NULL,
  link text,
  priority text DEFAULT 'medium',
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  read_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- Política: usuarios solo ven sus propias notificaciones
CREATE POLICY "Users can view their own notifications"
ON public.user_notifications FOR SELECT
USING (auth.uid() = user_id);

-- Política: usuarios pueden actualizar sus propias notificaciones (marcar como leído)
CREATE POLICY "Users can update their own notifications"
ON public.user_notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Política: usuarios pueden eliminar sus propias notificaciones
CREATE POLICY "Users can delete their own notifications"
ON public.user_notifications FOR DELETE
USING (auth.uid() = user_id);

-- Política: admins pueden insertar notificaciones para cualquier usuario
CREATE POLICY "Admins can insert notifications"
ON public.user_notifications FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin_rrhh'::app_role) OR 
  has_role(auth.uid(), 'jefe_area'::app_role) OR
  auth.uid() = user_id
);

-- Habilitar realtime para notificaciones
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_notifications;