const EMAILJS_SERVICE_ID = 'service_c49qxvc';
const EMAILJS_TEMPLATE_ID = 'template_f75v6qf';
const EMAILJS_PUBLIC_KEY = 'H-u-QwubXMw-kWy1J';

export interface EmailParams {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

/**
 * Send real-time confirmation email to the user via EmailJS
 */
export const sendRealtimeEmail = async (params: EmailParams): Promise<boolean> => {
  const templateParams = {
    name: params.name,
    user_name: params.name,
    to_name: params.name,
    email: params.email,
    user_email: params.email,
    to_email: params.email,
    reply_to: params.email,
    phone: params.phone || '',
    subject: params.subject || 'Kayal Dental Tourism Inquiry',
    message: params.message,
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
      console.log('[EmailJS] Real-time email sent successfully to:', params.email);
      return true;
    } else {
      const errorText = await res.text();
      console.warn('[EmailJS] Response:', res.status, errorText);
    }
  } catch (err) {
    console.error('[EmailJS] fetch error:', err);
  }

  // Fallback to @emailjs/browser if available
  try {
    const emailjs = await import('@emailjs/browser');
    await emailjs.default.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );
    console.log('[EmailJS] Sent via library to:', params.email);
    return true;
  } catch (err) {
    console.error('[EmailJS] Library error:', err);
    return false;
  }
};
