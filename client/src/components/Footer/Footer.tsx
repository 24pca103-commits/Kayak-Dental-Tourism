import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react';
import './Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__grid">
          {/* Column 1 – Brand */}
          <div className="footer__col footer__col--brand">
            <Link to="/" className="footer__logo">
              <img src="/assets/kayal-brand-logo.png" alt="KAYAL Dental Care" style={{ height: '56px', width: 'auto', objectFit: 'contain' }} />
            </Link>
            <p className="footer__tagline">
              Your trusted dental partner for complete family dentistry — gentle care, modern technology, and experienced specialists.
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
                { label: 'About', to: '/about' },
                { label: 'Services', to: '/services' },
                { label: 'Our Team', to: '/team' },
                { label: 'Testimonials', to: '/testimonials' },
                { label: 'Contact', to: '/contact' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="footer__link">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 – Services */}
          <div className="footer__col">
            <h4 className="footer__heading">Our Services</h4>
            <ul className="footer__links">
              {[
                { label: 'Teeth Alignment', slug: 'teeth-alignment' },
                { label: 'Teeth Replacement', slug: 'teeth-replacement' },
                { label: 'Smile Designing', slug: 'smile-designing' },
                { label: 'Dental Implants', slug: 'dental-implants' },
                { label: 'Teeth Whitening', slug: 'teeth-whitening' },
                { label: 'Root Canal', slug: 'root-canal-treatment' },
              ].map((s) => (
                <li key={s.slug}>
                  <Link to={`/services/${s.slug}`} className="footer__link">{s.label}</Link>
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
              <li>
                <Clock size={14} />
                <span>Mon–Sat: 9:00 AM – 7:00 PM</span>
              </li>
            </ul>
            <div className="footer__emergency">
              <span className="footer__emergency-dot" />
              Emergency care available
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© {currentYear} KAYAL Multispeciality Dental Care. All Rights Reserved.</p>
          <p className="footer__bottom-links">
            <Link to="/admin/login">Admin</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
