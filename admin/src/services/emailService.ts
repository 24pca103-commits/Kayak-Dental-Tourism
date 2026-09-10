const EMAILJS_SERVICE_ID = 'service_c49qxvc';
const EMAILJS_TEMPLATE_ID = 'template_f75v6qf';
const EMAILJS_PUBLIC_KEY = 'H-u-QwubXMw-kWy1J';

export interface StatusEmailParams {
  name: string;
  email: string;
  phone?: string;
  serviceName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  status: 'pending' | 'confirmed' | 'rescheduled' | 'completed' | 'cancelled' | string;
  previousStatus?: string;
  adminNote?: string;
}

/**
 * Sends a real-time status update notification email to the patient via EmailJS
 */
export const sendStatusEmailNotification = async (params: StatusEmailParams): Promise<boolean> => {
  const clinicName = 'Kayal Dental Tourism';
  const clinicPhone = '+91 78679 26159';
  const whatsappUrl = 'https://wa.me/917867926159';

  const dateFormatted = params.appointmentDate
    ? new Date(params.appointmentDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Scheduled Date';

  let subject = '';
  let statusMessage = '';

  switch (params.status) {
    case 'confirmed':
      subject = `🦷 Your Appointment is CONFIRMED - ${clinicName}`;
      statusMessage = `Hello ${params.name}, your dental appointment for ${params.serviceName || 'Dental Care'} on ${dateFormatted} at ${params.appointmentTime || '10:00 AM'} has been CONFIRMED by our clinic team! Our dental specialists are prepared for your consultation. Please arrive 10-15 minutes early.`;
      break;

    case 'rescheduled':
      subject = `📅 Your Appointment Has Been RESCHEDULED - ${clinicName}`;
      statusMessage = `Hello ${params.name}, your dental appointment for ${params.serviceName || 'Dental Care'} has been RESCHEDULED to ${dateFormatted} at ${params.appointmentTime || '10:00 AM'}. If this new timing suits you, no further action is required. If you need a different time, please reply or message us on WhatsApp.`;
      break;

    case 'completed':
      subject = `✨ Thank You for Visiting ${clinicName}! Post-Care & Review`;
      statusMessage = `Hello ${params.name}, thank you for visiting ${clinicName} for your ${params.serviceName || 'Dental Care'} treatment! Your care has been successfully marked as COMPLETED. Please remember to follow your doctor's post-treatment guidelines. We wish you a healthy, radiant smile!`;
      break;

    case 'cancelled':
      subject = `⚠️ Appointment Cancellation Notice - ${clinicName}`;
      statusMessage = `Hello ${params.name}, this is to inform you that your appointment for ${params.serviceName || 'Dental Care'} has been CANCELLED. If you did not request this cancellation or would like to book for another day, please contact us anytime.`;
      break;

    default:
      subject = `Appointment Status Update: ${params.status.toUpperCase()} - ${clinicName}`;
      statusMessage = `Hello ${params.name}, your dental appointment status has been updated to "${params.status}".`;
  }

  if (params.adminNote) {
    statusMessage += `\n\nDoctor / Clinic Note: "${params.adminNote}"`;
  }

  statusMessage += `\n\nFor any questions or travel assistance, please contact us at ${clinicPhone} or chat on WhatsApp: ${whatsappUrl}`;

  const templateParams = {
    name: params.name,
    user_name: params.name,
    to_name: params.name,
    email: params.email,
    user_email: params.email,
    to_email: params.email,
    reply_to: params.email,
    phone: params.phone || 'Not provided',
    subject,
    message: statusMessage,
    service_name: params.serviceName || 'Dental Consultation',
    appointment_date: dateFormatted,
    appointment_time: params.appointmentTime || '10:00 AM',
    appointment_status: params.status.toUpperCase(),
    clinic_phone: clinicPhone,
    whatsapp_url: whatsappUrl,
    logo_url: 'https://raw.githubusercontent.com/24pca103-commits/Kayak-Dental-Tourism/main/client/public/assets/kayal-brand-logo.png',
    current_year: new Date().getFullYear().toString(),
  };

  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: templateParams,
      }),
    });

    if (res.ok) {
      console.log(`[EmailJS Notification] Status update email ("${params.status}") sent to ${params.email}`);
      return true;
    } else {
      const errText = await res.text();
      console.warn('[EmailJS Notification] Status email failed:', res.status, errText);
      return false;
    }
  } catch (err) {
    console.error('[EmailJS Notification] Network error:', err);
    return false;
  }
};
