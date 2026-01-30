import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail({
  to,
  fullName,
  tempPassword,
  loginUrl,
}: {
  to: string;
  fullName: string;
  tempPassword: string;
  loginUrl: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'PharmSync <noreply@pharmsync.ca>',
      to: [to],
      subject: 'Welcome to PharmSync - Your Account Details',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to PharmSync</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to PharmSync</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Pharmacy Inventory Management</p>
            </div>
            
            <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi <strong>${fullName}</strong>,</p>
              
              <p style="margin-bottom: 20px;">Your PharmSync account has been created. Here are your login credentials:</p>
              
              <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <p style="margin: 0 0 10px 0;">
                  <span style="color: #64748b; font-size: 14px;">Email:</span><br>
                  <strong style="font-size: 16px;">${to}</strong>
                </p>
                <p style="margin: 0;">
                  <span style="color: #64748b; font-size: 14px;">Temporary Password:</span><br>
                  <strong style="font-size: 18px; font-family: monospace; background: #fef3c7; padding: 4px 8px; border-radius: 4px;">${tempPassword}</strong>
                </p>
              </div>
              
              <div style="background: #fff7ed; border-left: 4px solid #f97316; padding: 15px; margin-bottom: 20px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; color: #c2410c; font-weight: 500;">
                  ⚠️ Important: You will be required to change your password when you first log in.
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${loginUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Log In to PharmSync →
                </a>
              </div>
              
              <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
                If you have any questions, please contact your store administrator.
              </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
              <p style="margin: 0;">PharmSync Inventory Management System</p>
              <p style="margin: 5px 0 0 0;">This is an automated message. Please do not reply.</p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Email send exception:', error);
    return { success: false, error: error.message };
  }
}
