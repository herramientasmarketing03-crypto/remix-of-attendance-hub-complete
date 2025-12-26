-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('justifications', 'justifications', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('message-attachments', 'message-attachments', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('contracts', 'contracts', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies for justifications bucket
CREATE POLICY "Authenticated users can upload justification files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'justifications');

CREATE POLICY "Users can view justification files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'justifications');

CREATE POLICY "Users can update their own justification files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'justifications');

CREATE POLICY "Users can delete their own justification files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'justifications');

-- Storage policies for message-attachments bucket
CREATE POLICY "Authenticated users can upload message attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'message-attachments');

CREATE POLICY "Users can view message attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'message-attachments');

CREATE POLICY "Users can delete their own message attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'message-attachments');

-- Storage policies for contracts bucket
CREATE POLICY "Admins can upload contract files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'contracts');

CREATE POLICY "Authenticated users can view contract files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'contracts');

CREATE POLICY "Admins can delete contract files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'contracts');

-- Storage policies for avatars bucket (public)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');