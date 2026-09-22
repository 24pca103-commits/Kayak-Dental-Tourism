import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, Users, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import WhatsAppIcon from '../components/icons/WhatsAppIcon';
import { servicesAPI, doctorsAPI } from '../services/api';
import type { Service, Doctor } from '../types';
import AppointmentModal from '../components/AppointmentModal/AppointmentModal';
import '../styles/ServiceDetailPage.css';

const SLUG_DATA: Record<string, Partial<Service>> = {
  'dental-implants': {
    name: 'Dental Implants',
    shortDescription: 'Restore missing teeth with permanent titanium implants for a long-lasting natural smile.',
    description: 'Dental implants are titanium posts surgically placed into the jawbone to act as artificial tooth roots. They provide a strong, permanent foundation for fixed replacement teeth that look, feel, and function just like natural teeth.',
    benefits: [
      'Permanent, lifetime solution for missing teeth',
      'Looks, feels, and functions completely natural',
      'Preserves jawbone density and facial aesthetics',
      'Protects adjacent healthy teeth from damage',
      'Easy to maintain with regular brushing and flossing',
      'Restores full chewing power and natural speech'
    ],
    treatmentProcess: 'Step 1: Comprehensive digital 3D CBCT scan & diagnosis → Step 2: Jawbone evaluation & surgical plan → Step 3: Painless titanium implant placement surgery → Step 4: Osseointegration healing period (2 - 4 months) → Step 5: Precision abutment placement → Step 6: Custom zirconia or ceramic crown fitting',
    whoNeeds: 'Adults with one or more missing teeth, failing bridge work, loose dentures, or severe tooth decay who want a permanent, natural-looking replacement.',
    duration: '3 - 6 months total treatment time',
  },
  'teeth-alignment': {
    name: 'Teeth Alignment',
    shortDescription: 'Correct misaligned teeth with braces or modern orthodontic solutions for a healthier, confident smile.',
    description: 'Teeth alignment corrects crooked, crowded, spaced, or overlapping teeth using modern orthodontic techniques. From aesthetic ceramic braces to advanced digital alignment, we craft a balanced bite and harmonious smile.',
    benefits: [
      'Proper bite alignment and improved chewing function',
      'Enhanced facial aesthetics and confident smile',
      'Easier cleaning with straighter teeth, reducing decay risk',
      'Prevents abnormal wear on tooth enamel',
      'Relieves jaw joint tension and headaches',
      'Long-lasting results with custom retainers'
    ],
    treatmentProcess: 'Step 1: Consultation & digital orthodontic assessment → Step 2: 3D intraoral digital scans & cephalometric analysis → Step 3: Customized orthodontic treatment plan → Step 4: Bracket or aligner fitting → Step 5: Routine check-ups & adjustments every 4 - 6 weeks → Step 6: Appliance removal & custom retention phase',
    whoNeeds: 'Children, teens, and adults with crooked, crowded, spaced teeth, overbites, underbites, or crossbites seeking functional and aesthetic correction.',
    duration: '12 - 18 months depending on case complexity',
  },
  'smile-designing': {
    name: 'Smile Designing',
    shortDescription: 'Enhance your smile with personalized cosmetic dental treatments designed around your facial features.',
    description: 'Digital Smile Designing (DSD) is a revolutionary dental planning procedure that uses computer simulation to design a customized, harmonious smile that perfectly complements your facial proportions, lips, and personality.',
    benefits: [
      'Personalized digital preview of your new smile before treatment',
      'Fixes chipped, uneven, discolored, or worn-down teeth',
      'Harmonious tooth proportions aligned with facial symmetry',
      'Minimally invasive cosmetic enhancements',
      'Dramatic boost in self-confidence and appearance',
      'Long-lasting, radiant results with premium porcelain'
    ],
    treatmentProcess: 'Step 1: High-definition facial & smile photography → Step 2: 3D digital smile simulation & mock-up trial → Step 3: Patient approval & custom shade selection → Step 4: Minimal tooth preparation → Step 5: Artisan fabrication of ultra-thin veneers or crowns → Step 6: Permanent bonding and finishing polish',
    whoNeeds: 'Anyone dissatisfied with tooth shape, color, gaps, alignment, or gummy smiles wanting a radiant, camera-ready aesthetic smile.',
    duration: '1 - 2 weeks (2 - 3 comfortable visits)',
  },
  'teeth-replacement': {
    name: 'Teeth Replacement',
    shortDescription: 'Restore missing teeth with comfortable and natural-looking dental replacement solutions.',
    description: 'Teeth replacement restores oral function, chewing ability, and aesthetics using advanced prosthodontics such as fixed dental bridges, precision crowns, flexible partial dentures, and full mouth rehabilitations.',
    benefits: [
      'Restores effortless chewing and clear speech',
      'Prevents surrounding teeth from shifting out of place',
      'Maintains natural facial contours and lip support',
      'Custom color-matched to natural teeth',
      'Durable, high-strength materials (Zirconia, Ceramic)',
      'Comfortable fit tailored to your unique oral anatomy'
    ],
    treatmentProcess: 'Step 1: Oral examination & bite evaluation → Step 2: Digital impression & shade matching → Step 3: Preparation of support teeth or implant sites → Step 4: Temporary prosthesis placement → Step 5: Precision custom fabrication → Step 6: Final cementation, bite check, and polishing',
    whoNeeds: 'Individuals with missing, broken, or extracted teeth seeking fixed or removable solutions for restored chewing and complete smile integrity.',
    duration: '1 - 2 weeks',
  },
  'root-canal-treatment': {
    name: 'Root Canal Treatment',
    shortDescription: 'Save infected teeth with painless modern root canal therapy using advanced techniques.',
    description: 'Root Canal Treatment (RCT) removes infected, inflamed pulp tissue from deep inside the tooth, sterilizes the canal system, and seals it permanently. Utilizing rotary endodontics and apex locators, our procedure is virtually painless and saves your natural tooth.',
    benefits: [
      'Complete and immediate relief from persistent toothache',
      'Saves the natural tooth and prevents extraction',
      'Painless procedure with modern anesthesia & rotary tools',
      'Single-sitting completion available for suitable cases',
      'Prevents infection from spreading to jawbone or adjacent teeth',
      'Restores normal biting and chewing comfort'
    ],
    treatmentProcess: 'Step 1: Digital X-ray diagnosis & local anesthesia → Step 2: Gentle access to infected pulp chamber → Step 3: Precision canal cleaning & shaping with rotary instruments → Step 4: Antimicrobial irrigation & thorough sterilization → Step 5: Biocompatible gutta-percha canal sealing → Step 6: Tooth reconstruction with permanent crown protection',
    whoNeeds: 'Patients suffering from severe tooth pain, sensitivity to hot/cold, pain while chewing, deep cavities, or visible abscess/swelling near the gums.',
    duration: '1 - 2 appointments (approx. 45 - 60 mins each)',
  },
  'teeth-whitening': {
    name: 'Teeth Whitening',
    shortDescription: 'Brighten your smile several shades with professional in-office whitening treatments.',
    description: 'Professional in-office laser teeth whitening effectively lifts stubborn stains caused by coffee, tea, smoking, aging, or dietary habits. Safe, gentle, and fast, our clinical whitening yields up to 6 - 8 shades whiter smiles in under an hour.',
    benefits: [
      'Noticeably whiter smile in just 45 - 60 minutes',
      'Safe on enamel under direct specialist supervision',
      'Lifts deep-set stains that regular toothpaste cannot remove',
      'Includes gum barrier protection for zero irritation',
      'Long-lasting results with proper home oral hygiene',
      'Instant confidence boost for photos, events, and daily life'
    ],
    treatmentProcess: 'Step 1: Shade assessment & pre-treatment polishing → Step 2: Application of protective gum barrier → Step 3: Professional whitening gel application → Step 4: LED/Laser light activation (15-min cycles) → Step 5: Rinse & post-treatment enamel fluoride treatment → Step 6: Final shade comparison and home-care guidance',
    whoNeeds: 'Anyone with discolored, yellowed, or stained teeth seeking a brighter, sparkling smile for weddings, interviews, or personal confidence.',
    duration: '45 - 60 minutes (single visit)',
  },
  'braces': {
    name: 'Braces',
    shortDescription: 'Traditional and ceramic braces for effective, reliable teeth straightening at any age.',
    description: 'Orthodontic braces use precision brackets and memory archwires to gently guide teeth into optimal alignment. We offer classic stainless steel braces, aesthetic tooth-colored ceramic braces, and self-ligating friction-free systems.',
    benefits: [
      'Proven, reliable correction for even the most complex dental cases',
      'Choice between discreet ceramic brackets and durable metal',
      'Improves bite mechanics and overall digestive health',
      'Prevents premature tooth wear and gum recession',
      'Self-ligating options offer faster movement with fewer visits',
      'Lifetime value with permanent retainer follow-up'
    ],
    treatmentProcess: 'Step 1: Orthodontic consultation & digital records → Step 2: Customized bracket placement & archwire fitting → Step 3: Scheduled adjustments every 4 - 6 weeks → Step 4: Progressive alignment, leveling, and bite detailing → Step 5: De-bonding and thorough enamel polishing → Step 6: Custom retainer fitting to preserve results',
    whoNeeds: 'Children, teenagers, and adults with moderate to severe misalignment, irregular bites, or rotated teeth seeking dependable orthodontic treatment.',
    duration: '12 - 24 months depending on individual severity',
  },
  'clear-aligners': {
    name: 'Clear Aligners',
    shortDescription: 'Nearly invisible aligners for discreet, comfortable orthodontic treatment.',
    description: 'Clear aligners are custom-molded, medical-grade transparent plastic trays that gently shift your teeth into proper alignment without metal wires or brackets. Virtually invisible, removable for eating, and exceptionally comfortable.',
    benefits: [
      'Virtually invisible — straighten your teeth without anyone noticing',
      'Removable for eating, brushing, flossing, and special occasions',
      'No dietary restrictions — enjoy your favorite foods freely',
      'Smooth, comfortable plastic with no sharp metal wires to poke gums',
      'Digital 3D simulation shows your completed smile before starting',
      'Fewer clinic visits required compared to traditional braces'
    ],
    treatmentProcess: 'Step 1: High-precision 3D digital intraoral scanning → Step 2: Digital treatment simulation & step-by-step 3D movement plan → Step 3: Custom fabrication of aligner series using biocompatible polymers → Step 4: Delivery of aligner sets with simple wear instructions → Step 5: Switching to new aligner tray every 1 - 2 weeks → Step 6: Final outcome evaluation & clear nighttime retainer',
    whoNeeds: 'Teens and working professionals with mild to moderate crowding, spacing, or relapse from past braces who prefer discreet orthodontic correction.',
    duration: '6 - 14 months',
  },
  'pediatric-dentistry': {
    name: 'Pediatric Dentistry',
    shortDescription: 'Gentle, fun dental care specially designed for children from toddlers to teens.',
    description: 'Pediatric dentistry focuses on the oral health of infants, children, and adolescents. Our compassionate pediatric specialists ensure a calm, friendly, and fear-free environment while safeguarding developing teeth.',
    benefits: [
      'Child-friendly, fear-free environment with gentle pediatric dentists',
      'Early cavity detection and painless preventive treatments',
      'Fluoride varnish & dental sealants protect tooth grooves',
      'Habit correction for thumb-sucking and mouth breathing',
      'Space maintainers ensure proper adult tooth eruption',
      'Instills positive, lifelong dental hygiene habits'
    ],
    treatmentProcess: 'Step 1: Friendly greeting, tour & interactive chair orientation → Step 2: Gentle clinical examination & digital low-radiation imaging if needed → Step 3: Fun teeth cleaning & plaque removal → Step 4: Fluoride application or protective fissure sealants → Step 5: Preventive counsel and dietary advice → Step 6: Reward token and happy smile celebration',
    whoNeeds: 'Infants, toddlers, school-aged children, and teenagers needing preventive care, cavity treatments, fluoride applications, or orthodontic evaluations.',
    duration: '30 - 45 minutes per visit',
  },
  'preventive-dentistry': {
    name: 'Preventive Dentistry',
    shortDescription: 'Regular check-ups, cleaning, and preventive care to maintain optimal oral health.',
    description: 'Preventive dentistry is the foundation of lifelong oral wellness. Through routine professional ultrasonic scaling, air polishing, dental sealants, and comprehensive oral cancer screenings, we catch issues before they start, protecting your teeth, gums, and overall health.',
    benefits: [
      'Stops dental problems like cavities and gum disease before they develop',
      'Ultrasonic scaling removes calcified tartar that brushing cannot budge',
      'Fresh breath and stain-free, smooth tooth surfaces',
      'Protects tooth enamel from acid erosion with fluoride therapy',
      'Saves money and time by avoiding complex emergency dental surgeries',
      'Comprehensive digital screening for teeth, gums, and oral tissue'
    ],
    treatmentProcess: 'Step 1: Comprehensive oral examination & digital low-dose radiography → Step 2: Gentle ultrasonic scaling to eliminate calculus and plaque → Step 3: Air-flow polishing for surface stain removal → Step 4: Deep gum pocket depth measurement & health assessment → Step 5: Enamel-strengthening fluoride treatment or fissure sealants → Step 6: Tailored home oral care and nutrition recommendations',
    whoNeeds: 'Every individual, child and adult, recommended every 6 months to maintain disease-free gums, strong enamel, and fresh oral hygiene.',
    duration: '30 - 45 minutes',
  },
  'cosmetic-dentistry': {
    name: 'Cosmetic Dentistry',
    shortDescription: 'Complete cosmetic solutions including veneers, bonding, and aesthetic enhancements.',
    description: 'Cosmetic dentistry combines science and artistry to enhance the beauty of your smile. We provide premium porcelain veneers, composite tooth bonding, gum depigmentation, and complete aesthetic smile makeovers designed to complement your unique facial features.',
    benefits: [
      'Fixes chipped, cracked, uneven, or discolored teeth effortlessly',
      'Custom-crafted ultra-thin porcelain veneers matching natural translucency',
      'Minimally invasive composite bonding completed in a single session',
      'Gingival contouring for beautifully balanced gum-to-tooth ratio',
      'High durability with stain-resistant, biocompatible materials',
      'Youthful, radiant smile that boosts personal and professional confidence'
    ],
    treatmentProcess: 'Step 1: Aesthetic consultation, facial analysis & digital photographic records → Step 2: 3D smile design mock-up for personalized preview → Step 3: Micro-conservative preparation of tooth surfaces → Step 4: Digital impression capturing exact micro-contours → Step 5: Handcrafted porcelain veneer fabrication in partner dental lab → Step 6: Permanent aesthetic bonding, bite equilibration, and shine polishing',
    whoNeeds: 'Anyone with chipped enamel, permanent tetracycline stains, unsightly gaps, worn edges, or asymmetric smiles looking for a flawless, natural appearance.',
    duration: '1 - 2 visits over 5 - 10 days',
  },
  'emergency-dental-care': {
    name: 'Emergency Dental Care',
    shortDescription: 'Prompt care for dental emergencies including toothache, trauma, and broken teeth.',
    description: 'Dental emergencies require immediate expert intervention. Whether you are experiencing severe, unbearable toothache, a knocked-out tooth, broken crowns, sudden swelling, or sports-related dental trauma, our priority emergency team is equipped to provide rapid, pain-relieving care.',
    benefits: [
      'Same-day emergency consultation and rapid pain management',
      'Immediate treatment for knocked-out or fractured teeth',
      'Management of acute facial swelling and severe oral infections',
      'Emergency repair or re-cementation of lost crowns and broken bridges',
      'Gentle emergency tooth extraction when teeth cannot be preserved',
      'Compassionate, calming care when you need it most'
    ],
    treatmentProcess: 'Step 1: Rapid triage, vital checks & immediate pain relief anesthesia → Step 2: Quick digital X-ray to determine exact cause of trauma or infection → Step 3: Immediate intervention (pulp extirpation, stabilization, or drainage) → Step 4: Temporary or permanent tooth repair → Step 5: Prescription of targeted antibiotics and pain medication → Step 6: Clear post-emergency recovery protocol and scheduled follow-up',
    whoNeeds: 'Patients experiencing acute, throbbing toothache, knocked-out teeth from accidents, cracked or dislodged restorations, bleeding gums, or sudden jaw pain.',
    duration: 'Immediate same-day emergency appointment (approx. 45 - 60 mins)',
  },
  'full-mouth-rehabilitation': {
    name: 'Full Mouth Rehabilitation',
    shortDescription: 'Complete smile restoration combining implants, crowns, and digital 3D smile design.',
    description: 'Full mouth rehabilitation restores the health, function, and aesthetics of your entire mouth. It rebuilds severely worn, damaged, or missing teeth using custom implants, crowns, bridges, and neuromuscular bite alignment for lifelong chewing comfort.',
    benefits: [
      'Comprehensive restoration of entire upper and lower dentition',
      'Restores optimal chewing efficiency, bite force, and speech clarity',
      'Alleviates chronic jaw joint (TMJ) discomfort, stiffness, and headaches',
      'Revitalizes facial support, lip posture, and youthful facial contours',
      'Custom 3D engineered smile harmony tailored to your features',
      'Durable, permanent restorations using premium monolithic zirconia'
    ],
    treatmentProcess: 'Step 1: 3D CBCT imaging, digital jaw joint & bite analysis → Step 2: Diagnostic wax-up & full mouth smile simulation → Step 3: Foundation treatments (implants, bone grafting, or endodontics) → Step 4: Staged temporary restorations for bite adaptation → Step 5: High-precision fabrication of permanent crowns & bridges → Step 6: Final bonding, bite equilibration, and nightguard protection',
    whoNeeds: 'Patients with severe tooth wear from grinding, multiple broken or missing teeth, collapsed bite, or chronic bite-related pain seeking complete mouth renewal.',
    duration: '2 - 4 months (staged comfortably across visits)',
  },
  'crowns-and-bridges': {
    name: 'Crowns & Bridges',
    shortDescription: 'Premium Zirconia and PFM restorations engineered for maximum strength and natural aesthetics.',
    description: 'Dental crowns and bridges are precision fixed prosthetics designed to repair damaged teeth or replace missing teeth seamlessly. Crafted with medical-grade zirconia and layered ceramics, they match the exact shade, translucency, and contour of your natural teeth.',
    benefits: [
      'Restores strength, structure, and integrity to fractured or treated teeth',
      'Seamlessly replaces one or more missing teeth without removable plates',
      'Prevents adjacent teeth from drifting and altering your natural bite',
      'Premium biocompatible zirconia with exceptional fracture resistance',
      'Color-matched to blend invisibly with your neighboring teeth',
      'Long-lasting longevity backed by clinical warranty'
    ],
    treatmentProcess: 'Step 1: Clinical evaluation & digital 3D intraoral scan → Step 2: Minimal tooth preparation & precision shaping → Step 3: Immediate aesthetic temporary crown/bridge placement → Step 4: Precision milling & custom shading → Step 5: Try-in, contour, and bite check → Step 6: Permanent bonding with dual-cure dental resin cement',
    whoNeeds: 'Anyone with root canal treated teeth, broken or cracked teeth, heavy fillings, or missing teeth between healthy neighbors needing reliable fixed restoration.',
    duration: '3 - 5 days (2 comfortable visits)',
  },
  'orthodontics': {
    name: 'Orthodontics',
    shortDescription: 'Straighten teeth discreetly using clear aligners or traditional ceramic braces.',
    description: 'Orthodontic therapy gently repositions misaligned, crooked, or crowded teeth into their ideal alignment. We provide modern aesthetic options including invisible clear aligners, tooth-colored ceramic braces, and self-ligating systems for all ages.',
    benefits: [
      'Delivers a beautifully aligned, symmetric, and confident smile',
      'Corrects deep bites, open bites, crossbites, and severe crowding',
      'Discreet treatment options with crystal-clear removable aligners',
      'Reduces risk of plaque accumulation, gum disease, and uneven enamel wear',
      'Improves bite mechanics and overall jaw joint health',
      'Custom retention protocol to preserve straight teeth for a lifetime'
    ],
    treatmentProcess: 'Step 1: Orthodontic smile consultation & digital 3D scans → Step 2: Computerized 3D tooth movement simulation and roadmap → Step 3: Customized aligner delivery or aesthetic bracket placement → Step 4: Scheduled progress evaluations every 4 - 6 weeks → Step 5: Fine-tuning bite alignment and smile aesthetics → Step 6: Treatment completion and fitting of clear retention appliances',
    whoNeeds: 'Children, teenagers, and adults with crooked teeth, gaps, crossbites, overbites, or relapsed alignment from childhood braces.',
    duration: '6 - 18 months depending on case complexity',
  },
  'oral-surgery': {
    name: 'Oral & Maxillofacial Surgery',
    shortDescription: 'Expert surgical solutions for complex wisdom teeth, jaw, and facial conditions.',
    description: 'Oral and maxillofacial surgery provides advanced surgical management of impacted wisdom teeth, bone loss, facial trauma, corrective jaw conditions, and oral cysts. Performed under gentle local anesthesia or conscious sedation by our chief MDS maxillofacial surgeons.',
    benefits: [
      'Immediate relief from wisdom tooth impaction, infection, and pericoronitis',
      'Painless surgical extractions using minimally invasive piezo surgery',
      'Advanced bone grafting and sinus lift techniques for future implants',
      'Corrects structural jaw discrepancies and improves airway / bite harmony',
      'Conscious sedation options for completely relaxed, anxiety-free care',
      'Fast-track recovery protocols with dedicated surgical post-care'
    ],
    treatmentProcess: 'Step 1: High-resolution 3D CBCT nerve mapping and clinical exam → Step 2: Personalized surgical plan and pre-procedure medical clearance → Step 3: Administration of gentle anesthesia/sedation for 100% pain control → Step 4: Atraumatic surgical intervention with minimal tissue disruption → Step 5: Application of PRF (Platelet-Rich Fibrin) for rapid healing → Step 6: Post-op instruction, cold compression, and follow-up review',
    whoNeeds: 'Patients with impacted or painful wisdom teeth, severe jawbone resorption needing grafting, facial cysts, or jaw misalignment requiring specialized surgical care.',
    duration: 'Single visit procedure (approx. 45 - 75 mins)',
  },
};

const parseTreatmentSteps = (processStr: string) => {
  if (!processStr) return [];
  let rawSteps: string[] = [];
  if (/[→\n\r]|->/.test(processStr)) {
    rawSteps = processStr.split(/[→\n\r]+|\s*->\s*/);
  } else if (/Step\s*\d+/i.test(processStr)) {
    rawSteps = processStr.split(/(?=Step\s*\d+)/i);
  } else {
    rawSteps = [processStr];
  }

  return rawSteps
    .map(s => s.trim())
    .filter(Boolean)
    .map((step, idx) => {
      const match = step.match(/^Step\s*(\d+)[\s:-]*(.*)$/i);
      if (match) {
        return {
          stepNum: match[1],
          content: match[2].trim() || step,
        };
      }
      const numMatch = step.match(/^(\d+)[\s.:-]+(.*)$/);
      if (numMatch) {
        return {
          stepNum: numMatch[1],
          content: numMatch[2].trim() || step,
        };
      }
      return {
        stepNum: String(idx + 1),
        content: step,
      };
    });
};

const ServiceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    const demo = SLUG_DATA[slug];

    Promise.all([
      servicesAPI.getBySlug(slug),
      doctorsAPI.getAll(),
    ]).then(([s, d]) => {
      const apiService = s.data?.data;
      if (apiService && apiService.name) {
        setService({
          ...demo,
          ...apiService,
          // If the API returned empty benefits or treatmentProcess, fall back to rich demo content
          benefits: (apiService.benefits && apiService.benefits.length > 0) ? apiService.benefits : demo?.benefits,
          treatmentProcess: apiService.treatmentProcess || demo?.treatmentProcess,
          whoNeeds: apiService.whoNeeds || demo?.whoNeeds,
          description: apiService.description || demo?.description,
          duration: apiService.duration || demo?.duration,
        } as Service);
      } else if (demo) {
        setService({ _id: slug, slug, image: '', status: 'active', createdAt: '', ...demo } as Service);
      }
      setDoctors(d.data?.data || []);
    }).catch(() => {
      if (demo) {
        setService({ _id: slug, slug, image: '', status: 'active', createdAt: '', ...demo } as Service);
      }
    }).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div style={{ paddingTop: 120, textAlign: 'center', color: 'var(--gray-400)', fontSize: '1rem' }}>Loading...</div>;
  if (!service) return (
    <div style={{ paddingTop: 120, textAlign: 'center' }}>
      <p>Service not found.</p>
      <button className="btn btn-purple" onClick={() => navigate('/services')} style={{ marginTop: '1rem' }}>Back to Services</button>
    </div>
  );

  const faqs = [
    { q: `Is ${service.name} painful?`, a: 'Our treatments are performed using modern techniques and appropriate anesthesia to ensure maximum comfort throughout the procedure.' },
    { q: `How long does ${service.name} take?`, a: service.duration || 'The duration varies by individual case. Our specialist will provide a personalized timeline after your initial consultation.' },
    { q: `How much does ${service.name} cost?`, a: 'Treatment costs vary based on individual requirements. We offer transparent pricing and flexible payment options. Contact us for a detailed quote.' },
    { q: `What is the recovery time?`, a: 'Recovery varies by treatment. Our team will provide detailed post-treatment care instructions to ensure smooth and quick healing.' },
  ];

  return (
    <div className="service-detail-page">
      {/* Header / Hero Section */}
      <div className="service-detail-hero">
        <div className="service-detail-hero-bg" />
        <div className="container">
          <button
            className="service-detail-back-btn"
            onClick={() => navigate('/services')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#24E0E1', background: 'rgba(36,224,225,0.1)', padding: '0.35rem 0.85rem', borderRadius: '20px', border: '1px solid rgba(36,224,225,0.3)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.25rem' }}
          >
            <ArrowLeft size={15} /> Back to Services
          </button>
          <h1 className="section-title text-white" style={{ textAlign: 'left', margin: '0 0 0.6rem 0' }}>{service.name}</h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', marginTop: '0', maxWidth: '620px', textAlign: 'left', fontSize: '1.05rem', lineHeight: 1.6 }}>{service.shortDescription}</p>
          <button className="btn btn-primary btn-lg" style={{ marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => setShowModal(true)}>
            Book Appointment <ArrowRight size={16} color="currentColor" style={{ color: 'currentColor', stroke: 'currentColor', flexShrink: 0 }} />
          </button>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="service-detail-grid">
            <div className="service-detail-main">
              {/* Description */}
              <h2 className="service-detail__heading">What is {service.name}?</h2>
              <p className="service-detail__desc">
                {service.description || service.shortDescription}
              </p>

              {/* Benefits */}
              {service.benefits && service.benefits.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                  <h2 className="service-detail__heading">Key Benefits</h2>
                  <ul className="service-detail__benefits-list">
                    {service.benefits.map((b, i) => (
                      <li key={i} className="service-detail__benefit-item">
                        <CheckCircle size={16} style={{ color: 'var(--cyan-500)', flexShrink: 0, marginTop: 2 }} />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Treatment Process */}
              {service.treatmentProcess && (
                <div style={{ marginTop: '2rem' }}>
                  <h2 className="service-detail__heading">Treatment Process</h2>
                  <div className="service-detail__steps-wrap">
                    {parseTreatmentSteps(service.treatmentProcess).map((step, idx) => (
                      <div key={idx} className="service-detail__step-card">
                        <strong className="service-detail__step-badge">
                          Step {step.stepNum}:
                        </strong>
                        <span className="service-detail__step-text">
                          {step.content}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Who Needs */}
              {service.whoNeeds && (
                <div style={{ marginTop: '2rem' }}>
                  <h2 className="service-detail__heading">Who Needs This?</h2>
                  <div className="service-detail__who-needs">
                    <Users size={18} style={{ color: 'var(--purple-600)', flexShrink: 0, marginTop: 2 }} />
                    <p style={{ color: 'var(--gray-700)', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>{service.whoNeeds}</p>
                  </div>
                </div>
              )}

              {/* FAQ */}
              <div style={{ marginTop: '2rem' }}>
                <h2 className="service-detail__heading">Frequently Asked Questions</h2>
                <div className="service-detail__faqs-wrap">
                  {faqs.map((faq, i) => (
                    <div key={i} className="service-detail__faq-card">
                      <button
                        className={`service-detail__faq-btn ${openFaq === i ? 'active' : ''}`}
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        style={{
                          width: '100%',
                          display: 'grid',
                          gridTemplateColumns: 'minmax(0, 1fr) 30px',
                          alignItems: 'center',
                          gap: '0.85rem',
                          padding: '0.95rem 1.15rem',
                          border: 'none',
                          cursor: 'pointer',
                          background: openFaq === i ? 'var(--purple-50)' : 'transparent',
                          color: openFaq === i ? 'var(--purple-700)' : 'var(--gray-800)',
                          textAlign: 'left',
                          boxSizing: 'border-box',
                        }}
                      >
                        <span
                          className="service-detail__faq-title"
                          style={{
                            display: 'block',
                            width: '100%',
                            minWidth: 0,
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            lineHeight: 1.45,
                            fontSize: '0.92rem',
                            fontWeight: 600,
                            textAlign: 'left',
                            margin: 0,
                            padding: 0,
                          }}
                        >
                          {faq.q}
                        </span>
                        <span
                          className="service-detail__faq-icon"
                          style={{
                            width: '28px',
                            height: '28px',
                            minWidth: '28px',
                            minHeight: '28px',
                            borderRadius: '50%',
                            background: 'rgba(69, 18, 113, 0.08)',
                            color: 'var(--purple-700)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            justifySelf: 'end',
                            flexShrink: 0,
                          }}
                        >
                          {openFaq === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </span>
                      </button>
                      {openFaq === i && (
                        <div className="service-detail__faq-answer">{faq.a}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="service-detail-sidebar">
              <div className="service-detail__book-card">
                <h3 className="service-detail__book-title">Book This Treatment</h3>
                <p className="service-detail__book-text">Ready to get started? Book your consultation with our specialist today.</p>
                <button className="btn btn-primary w-full service-detail__book-btn" onClick={() => setShowModal(true)}>
                  Book Appointment <ArrowRight size={16} color="currentColor" style={{ color: 'currentColor', stroke: 'currentColor', flexShrink: 0 }} />
                </button>
              </div>

              {service.duration && (
                <div style={{ background: 'white', border: '1.5px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                    <Clock size={16} style={{ color: 'var(--cyan-500)' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--gray-700)' }}>Treatment Duration</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', margin: 0 }}>{service.duration}</p>
                </div>
              )}

              <div className="service-detail__whatsapp-card">
                <p className="service-detail__whatsapp-title">Need help deciding?</p>
                <p className="service-detail__whatsapp-text">Chat with us on WhatsApp to speak to a dental expert.</p>
                <a
                  href="https://wa.me/917867926159?text=Hi%20Kayal%20Dental%20Care%2C%20I%20would%20like%20more%20information%20about%20dental%20treatments."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="service-detail__whatsapp-btn"
                >
                  <WhatsAppIcon size={16} color="#ffffff" /> WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showModal && <AppointmentModal onClose={() => setShowModal(false)} services={[]} doctors={doctors} preselectedService={service.name} />}
    </div>
  );
};

export default ServiceDetailPage;
