import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import './Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();

  const handleLinkClick = (path: string) => {
    if (path.includes('#')) {
      const [basePath, hash] = path.split('#');
      if (location.pathname === basePath) {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__grid">
          {/* Column 1 – Brand & About Stories */}
          <div className="footer__col footer__col--brand">
            <Link to="/" className="footer__logo" onClick={() => handleLinkClick('/')}>
              <img src="/assets/kayal-brand-logo.png" alt="KAYAL Dental Care" style={{ height: '56px', width: 'auto', objectFit: 'contain' }} />
            </Link>
            <p className="footer__tagline">
              World-class dental care at a fraction of the cost. Trusted by 5,000+ international patients from 20+ countries. Your trusted dental tourism partner.
            </p>
            <div className="footer__social">
              <a
                href="https://wa.me/917867926159?text=Hello%20Kayal%20Dental%20Care"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="footer__social-link"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="#25D366" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
              <a
                href="https://www.instagram.com/kayal_dentalcare/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="footer__social-link"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>

            <h4 className="footer__heading" style={{ marginTop: '1.5rem', marginBottom: '0.75rem' }}>About &amp; Stories</h4>
            <ul className="footer__links">
              <li><Link to="/about" className="footer__link" onClick={() => handleLinkClick('/about')}>About Us</Link></li>
              <li><Link to="/team" className="footer__link" onClick={() => handleLinkClick('/team')}>Our Doctors</Link></li>
              <li><Link to="/about#facilities" className="footer__link" onClick={() => handleLinkClick('/about#facilities')}>Clinic Facilities</Link></li>
              <li><Link to="/about#mission" className="footer__link" onClick={() => handleLinkClick('/about#mission')}>Mission &amp; Vision</Link></li>
              <li><Link to="/testimonials#reviews" className="footer__link" onClick={() => handleLinkClick('/testimonials#reviews')}>Patient Reviews</Link></li>
              <li><Link to="/testimonials#feedback" className="footer__link" onClick={() => handleLinkClick('/testimonials#feedback')}>Patient Feedback</Link></li>
              <li><Link to="/testimonials#videos" className="footer__link" onClick={() => handleLinkClick('/testimonials#videos')}>Review Videos</Link></li>
            </ul>
          </div>

          {/* Column 2 – Treatments (All 12 Submenus) */}
          <div className="footer__col">
            <h4 className="footer__heading">Treatments</h4>
            <ul className="footer__links">
              <li><Link to="/services/dental-implants" className="footer__link" onClick={() => handleLinkClick('/services/dental-implants')}>Dental Implants</Link></li>
              <li><Link to="/services/teeth-alignment" className="footer__link" onClick={() => handleLinkClick('/services/teeth-alignment')}>Teeth Alignment</Link></li>
              <li><Link to="/services/smile-designing" className="footer__link" onClick={() => handleLinkClick('/services/smile-designing')}>Smile Designing</Link></li>
              <li><Link to="/services/teeth-replacement" className="footer__link" onClick={() => handleLinkClick('/services/teeth-replacement')}>Teeth Replacement</Link></li>
              <li><Link to="/services/root-canal-treatment" className="footer__link" onClick={() => handleLinkClick('/services/root-canal-treatment')}>Root Canal Treatment</Link></li>
              <li><Link to="/services/teeth-whitening" className="footer__link" onClick={() => handleLinkClick('/services/teeth-whitening')}>Teeth Whitening</Link></li>
              <li><Link to="/services/braces" className="footer__link" onClick={() => handleLinkClick('/services/braces')}>Braces</Link></li>
              <li><Link to="/services/clear-aligners" className="footer__link" onClick={() => handleLinkClick('/services/clear-aligners')}>Clear Aligners</Link></li>
              <li><Link to="/services/pediatric-dentistry" className="footer__link" onClick={() => handleLinkClick('/services/pediatric-dentistry')}>Pediatric Dentistry</Link></li>
              <li><Link to="/services/preventive-dentistry" className="footer__link" onClick={() => handleLinkClick('/services/preventive-dentistry')}>Preventive Dentistry</Link></li>
              <li><Link to="/services/cosmetic-dentistry" className="footer__link" onClick={() => handleLinkClick('/services/cosmetic-dentistry')}>Cosmetic Dentistry</Link></li>
              <li><Link to="/services/emergency-dental-care" className="footer__link" onClick={() => handleLinkClick('/services/emergency-dental-care')}>Emergency Dental Care</Link></li>
            </ul>
          </div>

          {/* Column 3 – Dental Tourism */}
          <div className="footer__col">
            <h4 className="footer__heading">Dental Tourism</h4>
            <ul className="footer__links">
              <li><Link to="/dental-tourism#why-india" className="footer__link" onClick={() => handleLinkClick('/dental-tourism#why-india')}>Why Choose India</Link></li>
              <li><Link to="/dental-tourism#cost-comparison" className="footer__link" onClick={() => handleLinkClick('/dental-tourism#cost-comparison')}>Cost Comparison</Link></li>
              <li><Link to="/dental-tourism#journey" className="footer__link" onClick={() => handleLinkClick('/dental-tourism#journey')}>Patient Journey</Link></li>
              <li><Link to="/dental-tourism#safety" className="footer__link" onClick={() => handleLinkClick('/dental-tourism#safety')}>Quality &amp; Safety</Link></li>
              <li><Link to="/dental-tourism#testimonials" className="footer__link" onClick={() => handleLinkClick('/dental-tourism#testimonials')}>Patient Testimonials</Link></li>
              <li><Link to="/online-consultation" className="footer__link" onClick={() => handleLinkClick('/online-consultation')}>Online Consultation</Link></li>
            </ul>
          </div>

          {/* Column 4 – Patient Resources */}
          <div className="footer__col">
            <h4 className="footer__heading">Patient Resources</h4>
            <ul className="footer__links">
              <li><Link to="/patient-resources#checklist" className="footer__link" onClick={() => handleLinkClick('/patient-resources#checklist')}>Pre-Treatment Checklist</Link></li>
              <li><Link to="/patient-resources#care-guide" className="footer__link" onClick={() => handleLinkClick('/patient-resources#care-guide')}>Post-Treatment Care Guide</Link></li>
              <li><Link to="/patient-resources#visa" className="footer__link" onClick={() => handleLinkClick('/patient-resources#visa')}>Medical Visa Guide</Link></li>
              <li><Link to="/patient-resources#invitation" className="footer__link" onClick={() => handleLinkClick('/patient-resources#invitation')}>Visa Invitation</Link></li>
              <li><Link to="/patient-resources#pickup" className="footer__link" onClick={() => handleLinkClick('/patient-resources#pickup')}>Airport Pickup &amp; Transport</Link></li>
              <li><Link to="/patient-resources#hotels" className="footer__link" onClick={() => handleLinkClick('/patient-resources#hotels')}>Accommodation</Link></li>
              <li><Link to="/patient-resources#tips" className="footer__link" onClick={() => handleLinkClick('/patient-resources#tips')}>Local Travel Tips</Link></li>
              <li><Link to="/patient-resources#faqs" className="footer__link" onClick={() => handleLinkClick('/patient-resources#faqs')}>FAQs</Link></li>
            </ul>
          </div>

          {/* Column 5 – Contact & Reach Us */}
          <div className="footer__col">
            <h4 className="footer__heading">Contact Us</h4>
            <ul className="footer__contact-list">
              <li>
                <MapPin size={14} />
                <span>123 Seaside Road, Chennai, Tamil Nadu</span>
              </li>
              <li>
                <Phone size={14} />
                <a href="tel:+917867926159">+91 78679 26159</a>
              </li>
              <li>
                <Mail size={14} />
                <a href="mailto:hello@kayaldental.com">hello@kayaldental.com</a>
              </li>
            </ul>

            <h4 className="footer__heading" style={{ marginTop: '1.25rem', marginBottom: '0.6rem', fontSize: '0.9rem' }}>Reach Us</h4>
            <ul className="footer__links">
              <li><Link to="/contact#enquiry" className="footer__link" onClick={() => handleLinkClick('/contact#enquiry')}>Enquiry Form</Link></li>
              <li><a href="https://wa.me/917867926159" target="_blank" rel="noopener noreferrer" className="footer__link">WhatsApp Chat</a></li>
              <li><Link to="/contact#details" className="footer__link" onClick={() => handleLinkClick('/contact#details')}>Phone &amp; Email</Link></li>
              <li><Link to="/contact#map" className="footer__link" onClick={() => handleLinkClick('/contact#map')}>Map / Location</Link></li>
            </ul>

            <a
              href="https://wa.me/917867926159?text=Hello%20Kayal%20Dental%20Care,%20I%20need%20emergency%20dental%20assistance."
              target="_blank"
              rel="noopener noreferrer"
              className="footer__emergency footer__emergency--clickable"
              title="Click for Emergency Care on WhatsApp (+91 78679 26159)"
            >
              <span className="footer__emergency-dot" />
              <span className="footer__emergency-text">Emergency care available</span>
            </a>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© {currentYear} Kayal Dental Tourism. All Rights Reserved.</p>
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
