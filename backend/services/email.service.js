const nodemailer = require('nodemailer');

// Create transporter for Mailpit (Laragon)
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.MAIL_HOST || 'localhost',
        port: parseInt(process.env.MAIL_PORT) || 1025,
        secure: false, // Mailpit doesn't use SSL
        ignoreTLS: true, // Ignore TLS for local development
        auth: null, // Mailpit doesn't require authentication
        tls: {
            rejectUnauthorized: false
        },
        debug: true, // Enable debug output
        logger: true // Log information
    });
};

// Send verification email
const sendVerificationEmail = async (email, name, verificationToken) => {
    try {
        const transporter = createTransporter();
        const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

        const mailOptions = {
            from: process.env.MAIL_FROM || 'DentalCare System <noreply@dentalcare.com>',
            to: email,
            subject: 'Verify Your Email - DentalCare System',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            background: #f9f9f9;
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 30px;
                            text-align: center;
                            border-radius: 10px 10px 0 0;
                        }
                        .content {
                            background: white;
                            padding: 30px;
                            border-radius: 0 0 10px 10px;
                        }
                        .button {
                            display: inline-block;
                            padding: 15px 40px;
                            background: #667eea;
                            color: white !important;
                            text-decoration: none;
                            border-radius: 5px;
                            margin: 20px 0;
                            font-weight: bold;
                        }
                        .note {
                            background: #fff3cd;
                            border-left: 4px solid #ffc107;
                            padding: 15px;
                            margin: 20px 0;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 20px;
                            color: #666;
                            font-size: 12px;
                        }
                        ul {
                            padding-left: 20px;
                        }
                        li {
                            margin: 10px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Welcome to DentalCare</h1>
                        </div>
                        <div class="content">
                            <h2>Hi ${name}!</h2>
                            
                            <p>Thank you for registering with DentalCare System. We're excited to have you on board!</p>
                            
                            <p>To complete your registration and access all features, please verify your email address by clicking the button below:</p>
                            
                            <center>
                                <a href="${verificationLink}" class="button">Verify Your Email</a>
                            </center>
                            
                            <div class="note">
                                <strong>Important:</strong> You need to verify your email before you can log in to your account.
                            </div>
                            
                            <p>Once verified, you'll be able to:</p>
                            <ul>
                                <li>Book dental appointments online</li>
                                <li>Browse our comprehensive dental services</li>
                                <li>Choose from our expert dentists</li>
                                <li>Track your appointment history</li>
                                <li>Manage payments securely</li>
                            </ul>
                            
                            <p>If you didn't create this account, you can safely ignore this email.</p>
                            
                            <p>Best regards,<br>
                            The DentalCare Team</p>
                        </div>
                        <div class="footer">
                            <p>© 2025 DentalCare System. All rights reserved.</p>
                            <p>This email was sent to ${email}</p>
                            <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
                            <p style="margin-top: 10px;">
                                <small>If the button doesn't work, copy and paste this link into your browser:</small><br>
                                <small style="word-break: break-all;">${verificationLink}</small>
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
Hi ${name}!

Welcome to DentalCare System!

Thank you for registering. To complete your registration, please verify your email address by visiting this link:

${verificationLink}

Important: You need to verify your email before you can log in to your account.

Once verified, you'll be able to:
- Book dental appointments online
- Browse our dental services
- Choose from expert dentists
- Track your appointment history
- Manage payments securely

If you didn't create this account, you can safely ignore this email.

Best regards,
The DentalCare Team

---
© 2025 DentalCare System. All rights reserved.
This email was sent to ${email}
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Verification email sent:', info.messageId);
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
        return info;
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
    }
};

// Send welcome email (after verification)
const sendWelcomeEmail = async (email, name) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.MAIL_FROM || 'DentalCare System <noreply@dentalcare.com>',
            to: email,
            subject: 'Welcome to DentalCare - Email Verified',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
                        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; }
                        .button { display: inline-block; padding: 15px 40px; background: #10b981; color: white !important; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>✅ Email Verified Successfully!</h1>
                        </div>
                        <div class="content">
                            <h2>Welcome aboard, ${name}!</h2>
                            
                            <p>Your email has been successfully verified! You now have full access to all DentalCare features.</p>
                            
                            <center>
                                <a href="${process.env.FRONTEND_URL}/login" class="button">Login to Your Account</a>
                            </center>
                            
                            <p>Start managing your dental health today:</p>
                            <ul>
                                <li>Book your first appointment</li>
                                <li>Explore our services and pricing</li>
                                <li>Meet our experienced dental team</li>
                            </ul>
                            
                            <p>If you have any questions, feel free to contact our support team.</p>
                            
                            <p>Best regards,<br>The DentalCare Team</p>
                        </div>
                        <div class="footer">
                            <p>© 2025 DentalCare System. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending welcome email:', error);
        // Don't throw - welcome email is not critical
    }
};

module.exports = {
    sendVerificationEmail,
    sendWelcomeEmail
};
