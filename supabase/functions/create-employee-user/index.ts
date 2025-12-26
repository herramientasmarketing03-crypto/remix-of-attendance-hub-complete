import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { employeeId, email } = await req.json();

    if (!employeeId || !email) {
      return new Response(
        JSON.stringify({ error: 'Se requiere employeeId y email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Creating user account for employee: ${employeeId}, email: ${email}`);

    // Check if user with this email already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      // User already exists, just link the employee if not already linked
      const { error: updateError } = await supabaseAdmin
        .from('employees')
        .update({ user_id: existingUser.id })
        .eq('id', employeeId);

      if (updateError) {
        console.error('Error linking existing user:', updateError);
        throw updateError;
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Usuario existente vinculado al empleado',
          userId: existingUser.id,
          isExisting: true
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create new user with temporary password
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: '123456',
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        employee_id: employeeId,
      },
    });

    if (createError) {
      console.error('Error creating user:', createError);
      throw createError;
    }

    if (!newUser?.user) {
      throw new Error('No se pudo crear el usuario');
    }

    console.log(`User created successfully: ${newUser.user.id}`);

    // The trigger handle_new_user should automatically link the employee,
    // but let's ensure the link is made
    const { error: updateError } = await supabaseAdmin
      .from('employees')
      .update({ user_id: newUser.user.id })
      .eq('id', employeeId);

    if (updateError) {
      console.error('Error linking employee:', updateError);
      // Don't throw, user is created
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Usuario creado con contraseña temporal: 123456',
        userId: newUser.user.id,
        isExisting: false
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-employee-user:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
