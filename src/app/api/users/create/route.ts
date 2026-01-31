import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  // Admin client with service role for user creation
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const body = await request.json();
    const { email, fullName, role, storeId, createdBy } = body;

    // Validate required fields
    if (!email || !fullName || !role) {
      return NextResponse.json(
        { error: 'Email, name, and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['associate', 'admin', 'regular', 'driver'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Generate a temporary password
    const tempPassword = `PharmSync${Math.random().toString(36).slice(-8)}!`;

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email
    });

    if (authError) {
      console.error('Auth error:', authError);
      if (authError.message.includes('already been registered')) {
        return NextResponse.json(
          { error: 'A user with this email already exists' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    // Update the profile with must_change_password flag
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name: fullName,
        role,
        store_id: storeId || null,
        created_by: createdBy,
        must_change_password: true, // Force password change on first login
      })
      .eq('id', authData.user.id)
      .select()
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      // Try to clean up the auth user if profile fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      );
    }

    // Send welcome email with credentials
    const loginUrl = process.env.NEXT_PUBLIC_APP_URL 
      ? `${process.env.NEXT_PUBLIC_APP_URL}/login`
      : 'https://pharmsync.vercel.app/login';

    // Temporarily disable email sending
    // const emailResult = await sendWelcomeEmail({
    //   to: email,
    //   fullName,
    //   tempPassword,
    //   loginUrl,
    // });

    // if (!emailResult.success) {
    //   console.warn('Failed to send welcome email:', emailResult.error);
    //   // Don't fail user creation if email fails - just log it
    // }
    const emailResult = { success: false, error: 'Email disabled temporarily' };

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email,
        fullName,
        role,
        storeId,
      },
      tempPassword, // Still return for admin to see/copy if email fails
      emailSent: emailResult.success,
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
