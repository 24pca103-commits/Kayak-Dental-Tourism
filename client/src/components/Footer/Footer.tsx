import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, ExternalLink } from 'lucide-react';
import './Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__grid">
          {/* Column 1 – Brand */}
          <div className="footer__col footer__col--brand">
            <Link to="/" className="footer__logo" onClick={() => window.scrollTo(0, 0)}>
              <img src="/assets/kayal-brand-logo.png" alt="KAYAL Dental Care" style={{ height: '56px', width: 'auto', objectFit: 'contain' }} />
            </Link>
            <p className="footer__tagline">
              World-class dental care at a fraction of the cost. Trusted by 5,000+ international patients from 20+ countries. Your trusted dental tourism partner.
            </p>
            <div className="footer__social">
              <a href="#" aria-label="Facebook" className="footer__social-link"><ExternalLink size={16} /></a>
              <a href="#" aria-label="Instagram" className="footer__social-link"><ExternalLink size={16} /></a>
              <a href="#" aria-label="Twitter" className="footer__social-link"><ExternalLink size={16} /></a>
              <a href="#" aria-label="Youtube" className="footer__social-link"><ExternalLink size={16} /></a>
            </div>
          </div>

          {/* Column 2 – Quick Links */}
          <div className="footer__col">
            <h4 className="footer__heading">Quick Links</h4>
            <ul className="footer__links">
              {[
                { label: 'Home', to: '/' },
                { label: 'About Us', to: '/about' },
                { label: 'Services', to: '/services' },
                { label: 'Dental Tourism', to: '/dental-tourism' },
                { label: 'Our Team', to: '/team' },
                { label: 'Online Consultation', to: '/online-consultation' },
                { label: 'Contact', to: '/contact' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="footer__link" onClick={() => window.scrollTo(0, 0)}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 – Services */}
          <div className="footer__col">
            <h4 className="footer__heading">Our Services</h4>
            <ul className="footer__links">
              {[
                { label: 'Dental Implants', slug: 'dental-implants' },
                { label: 'Full Mouth Rehab', slug: 'full-mouth-rehabilitation' },
                { label: 'Cosmetic Dentistry', slug: 'cosmetic-dentistry' },
                { label: 'Crowns & Bridges', slug: 'crowns-and-bridges' },
                { label: 'Orthodontics', slug: 'orthodontics' },
                { label: 'Root Canal', slug: 'root-canal-treatment' },
              ].map((s) => (
                <li key={s.slug}>
                  <Link to={`/services/${s.slug}`} className="footer__link">{s.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3b – For Tourists */}
          <div className="footer__col">
            <h4 className="footer__heading">For Tourists</h4>
            <ul className="footer__links">
              {[
                { label: 'Why India?', to: '/dental-tourism' },
                { label: 'Travel & Visa Info', to: '/travel-visa' },
                { label: 'Patient Resources', to: '/patient-resources' },
                { label: 'FAQs', to: '/faqs' },
                { label: 'Testimonials', to: '/testimonials' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="footer__link">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 – Contact */}
          <div className="footer__col">
            <h4 className="footer__heading">Contact Us</h4>
            <ul className="footer__contact-list">
              <li>
                <MapPin size={14} />
                <span>123 Seaside Road, Chennai, Tamil Nadu</span>
              </li>
              <li>
                <Phone size={14} />
                <a href="tel:+919876543210">+91 98765 43210</a>
              </li>
              <li>
                <Mail size={14} />
                <a href="mailto:hello@kayaldental.com">hello@kayaldental.com</a>
              </li>
            </ul>
            <a
              href="https://wa.me/919876543210?text=Hello%20Kayal%20Dental%20Care,%20I%20need%20emergency%20dental%20assistance."
              target="_blank"
              rel="noopener noreferrer"
              className="footer__emergency footer__emergency--clickable"
              title="Click for Emergency Care on WhatsApp (+91 98765 43210)"
            >
              <span className="footer__emergency-dot" />
              Emergency care available
            </a>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© {currentYear} KAYAL Multispeciality Dental Care. All Rights Reserved.</p>
          <div className="footer__bottom-links">
            <Link to="/privacy-policy" className="footer__bottom-link">Privacy Policy</Link>
            <Link to="/terms" className="footer__bottom-link">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
