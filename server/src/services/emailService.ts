import nodemailer from 'nodemailer';

// Create reusable transporter using SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  });
};

interface ContactEmailData {
  patientName: string;
  email: string;
  phone?: string;
  serviceName?: string;
  message?: string;
}

/**
 * Send a confirmation email to the user after form submission.
 * Also sends a notification to the clinic email.
 */
export const sendConfirmationEmail = async (data: ContactEmailData): Promise<void> => {
  const smtpUser = process.env.SMTP_USER;
  if (!smtpUser) {
    console.log('SMTP not configured, skipping email notification');
    return;
  }

  const transporter = createTransporter();
  const clinicName = 'Kayal Dental Tourism';
  const clinicEmail = process.env.CLINIC_EMAIL || smtpUser;

  const phoneRow = data.phone
    ? `<p style="margin: 5px 0; color: #374151;"><strong>Phone:</strong> ${data.phone}</p>`
    : '';
  const serviceRow = data.serviceName
    ? `<p style="margin: 5px 0; color: #374151;"><strong>Service:</strong> ${data.serviceName}</p>`
    : '';
  const messageRow = data.message
    ? `<p style="margin: 5px 0; color: #374151;"><strong>Message:</strong> ${data.message}</p>`
    : '';

  const userHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #240840, #451271); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: #24E0E1; margin: 0; font-size: 24px;">Kayal Dental Tourism</h1>
      </div>
      <div style="padding: 30px; background: #ffffff; border: 1px solid #e5e7eb;">
        <h2 style="color: #451271; margin-top: 0;">Hello ${data.patientName},</h2>
        <p style="color: #4b5563; line-height: 1.6;">Thank you for reaching out to us! We have received your inquiry and our team will get back to you within 24 hours.</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0; color: #374151;"><strong>Name:</strong> ${data.patientName}</p>
          <p style="margin: 5px 0; color: #374151;"><strong>Email:</strong> ${data.email}</p>
          ${phoneRow}
          ${serviceRow}
          ${messageRow}
        </div>
        <p style="color: #4b5563; line-height: 1.6;">If you have any urgent queries, feel free to reach us on WhatsApp at <a href="https://wa.me/919876543210" style="color: #451271;">+91 98765 43210</a>.</p>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">This is an automated email from Kayal Dental Tourism. Please do not reply directly to this email.</p>
      </div>
    </div>
  `;

  const clinicPhoneRow = data.phone
    ? `<tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Phone</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.phone}</td></tr>`
    : '';
  const clinicServiceRow = data.serviceName
    ? `<tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Service</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.serviceName}</td></tr>`
    : '';
  const clinicMessageRow = data.message
    ? `<tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Message</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.message}</td></tr>`
    : '';

  const clinicHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2 style="color: #451271;">New Patient Inquiry</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Name</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.patientName}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Email</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.email}</td></tr>
        ${clinicPhoneRow}
        ${clinicServiceRow}
        ${clinicMessageRow}
      </table>
    </div>
  `;

  const userMailOptions = {
    from: `"${clinicName}" <${smtpUser}>`,
    to: data.email,
    subject: `Thank you for contacting ${clinicName}!`,
    html: userHtml,
  };

  const clinicMailOptions = {
    from: `"${clinicName} Website" <${smtpUser}>`,
    to: clinicEmail,
    subject: `New Inquiry from ${data.patientName} - ${data.serviceName || 'General'}`,
    html: clinicHtml,
  };

  try {
    await Promise.all([
      transporter.sendMail(userMailOptions),
      transporter.sendMail(clinicMailOptions),
    ]);
    console.log(`Confirmation email sent to ${data.email}`);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
};
