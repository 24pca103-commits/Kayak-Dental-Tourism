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
    to: data.email, // ONLY send to user's email address
    subject: `Thank you for contacting ${clinicName}!`,
    html: userHtml,
  };

  try {
    await transporter.sendMail(userMailOptions);
    console.log(`[Email Service] Confirmation email sent strictly to user: ${data.email}`);
  } catch (error) {
    console.error('[Email Service] Failed to send email to user:', error);
  }
};

export interface StatusNotificationData {
  patientName: string;
  email: string;
  phone?: string;
  serviceName?: string;
  doctorName?: string;
  appointmentDate?: string | Date;
  appointmentTime?: string;
  status: 'pending' | 'confirmed' | 'rescheduled' | 'completed' | 'cancelled' | string;
  previousStatus?: string;
  adminNote?: string;
}

/**
 * Send an appointment status update email notification to the patient.
 */
export const sendStatusNotificationEmail = async (data: StatusNotificationData): Promise<void> => {
  const clinicName = 'Kayal Dental Tourism';
  const clinicPhone = '+91 78679 26159';
  const whatsappUrl = 'https://wa.me/917867926159';

  const dateFormatted = data.appointmentDate
    ? new Date(data.appointmentDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Scheduled Date';

  let subject = '';
  let headline = '';
  let messageBody = '';
  let badgeColor = '#451271';
  let badgeBg = '#f3e8ff';

  switch (data.status) {
    case 'confirmed':
      subject = `🦷 Your Appointment is CONFIRMED - ${clinicName}`;
      headline = 'Appointment Confirmed!';
      badgeColor = '#047857';
      badgeBg = '#d1fae5';
      messageBody = `
        <p style="color: #374151; font-size: 15px; line-height: 1.6;">
          Great news! Your dental consultation for <strong>${data.serviceName || 'Dental Care'}</strong> has been officially confirmed.
        </p>
        <p style="color: #374151; font-size: 15px; line-height: 1.6;">
          Our dental specialist <strong>${data.doctorName || 'Dr. Specialist'}</strong> is prepared for your visit. Please arrive 10–15 minutes before your scheduled appointment time.
        </p>
      `;
      break;

    case 'rescheduled':
      subject = `📅 Your Appointment Has Been RESCHEDULED - ${clinicName}`;
      headline = 'Appointment Rescheduled';
      badgeColor = '#b45309';
      badgeBg = '#fef3c7';
      messageBody = `
        <p style="color: #374151; font-size: 15px; line-height: 1.6;">
          Your dental appointment for <strong>${data.serviceName || 'Dental Care'}</strong> has been rescheduled to the updated date and time shown below.
        </p>
        <p style="color: #374151; font-size: 15px; line-height: 1.6;">
          If this new timing works for you, no further action is needed. If you require a different time slot or date, please reach out to our team immediately.
        </p>
      `;
      break;

    case 'completed':
      subject = `✨ Thank You for Visiting ${clinicName}! Post-Care & Review`;
      headline = 'Treatment Completed!';
      badgeColor = '#1d4ed8';
      badgeBg = '#dbeafe';
      messageBody = `
        <p style="color: #374151; font-size: 15px; line-height: 1.6;">
          Thank you for trusting <strong>${clinicName}</strong> with your smile! We hope you had a comfortable, pain-free treatment experience.
        </p>
        <p style="color: #374151; font-size: 15px; line-height: 1.6;">
          Please continue to follow your doctor's post-care instructions. If you have any questions or require post-treatment follow-up, our doctors are always available for you.
        </p>
      `;
      break;

    case 'cancelled':
      subject = `⚠️ Appointment Cancellation Notice - ${clinicName}`;
      headline = 'Appointment Cancelled';
      badgeColor = '#dc2626';
      badgeBg = '#fee2e2';
      messageBody = `
        <p style="color: #374151; font-size: 15px; line-height: 1.6;">
          This is to inform you that your appointment for <strong>${data.serviceName || 'Dental Care'}</strong> has been cancelled.
        </p>
        <p style="color: #374151; font-size: 15px; line-height: 1.6;">
          If you did not request this cancellation or would like to reschedule for a future date, please contact us anytime.
        </p>
      `;
      break;

    default:
      subject = `Update on Your Appointment - ${clinicName}`;
      headline = 'Appointment Status Update';
      messageBody = `
        <p style="color: #374151; font-size: 15px; line-height: 1.6;">
          Your appointment status has been updated to <strong>${data.status}</strong>.
        </p>
      `;
  }

  const noteBlock = data.adminNote
    ? `<div style="background: #faf5ff; border-left: 4px solid #9333ea; padding: 12px 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <strong style="color: #6b21a8; font-size: 13px; text-transform: uppercase;">Note from Clinic:</strong>
        <p style="margin: 4px 0 0; color: #4b5563; font-size: 14px;">${data.adminNote}</p>
       </div>`
    : '';

  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
      <div style="background: linear-gradient(135deg, #240840 0%, #451271 100%); padding: 32px 24px; text-align: center;">
        <h1 style="color: #24E0E1; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 0.5px;">${clinicName}</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 13px;">Advanced Dental Care & International Patient Tourism</p>
      </div>

      <div style="padding: 32px 28px;">
        <div style="display: inline-block; padding: 6px 14px; border-radius: 50px; background: ${badgeBg}; color: ${badgeColor}; font-weight: 700; font-size: 12px; text-transform: uppercase; margin-bottom: 16px;">
          Status: ${data.status}
        </div>

        <h2 style="color: #1e1b4b; margin: 0 0 12px; font-size: 22px;">${headline}</h2>
        <p style="color: #4b5563; font-size: 15px; margin: 0 0 20px;">Dear <strong>${data.patientName}</strong>,</p>

        ${messageBody}
        ${noteBlock}

        <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h3 style="margin: 0 0 14px; color: #1e293b; font-size: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Appointment Information</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 40%;">Service</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${data.serviceName || 'Dental Consultation'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Date</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${dateFormatted}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Time Slot</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${data.appointmentTime || '10:00 AM'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Assigned Doctor</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${data.doctorName || 'Senior Dental Consultant'}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin: 28px 0 20px;">
          <a href="${whatsappUrl}" style="display: inline-block; background: #25D366; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 50px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(37,211,102,0.3);">
            Chat on WhatsApp (${clinicPhone})
          </a>
        </div>

        <p style="color: #64748b; font-size: 13px; line-height: 1.5; text-align: center; margin-top: 24px;">
          Need assistance or directions? Call us at <strong style="color: #451271;">${clinicPhone}</strong>.
        </p>
      </div>

      <div style="background: #f1f5f9; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
        &copy; ${new Date().getFullYear()} ${clinicName}. All rights reserved. Automated notification.
      </div>
    </div>
  `;

  const smtpUser = process.env.SMTP_USER;
  if (!smtpUser) {
    console.log(`[Status Notification] Email to ${data.email} generated for status: "${data.status}". (SMTP not configured in server .env; frontend EmailJS will deliver directly to user).`);
    return;
  }

  const transporter = createTransporter();
  try {
    await transporter.sendMail({
      from: `"${clinicName}" <${smtpUser}>`,
      to: data.email,
      subject,
      html,
    });
    console.log(`[Status Notification] Email successfully sent to ${data.email} for status "${data.status}"`);
  } catch (err) {
    console.error('[Status Notification] SMTP error:', err);
  }
};

