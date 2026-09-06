import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import prisma from './config/prisma';

dotenv.config();

const seed = async () => {
  console.log('🌱 Connecting to MySQL via Prisma...');

  // Clear existing data (in reverse relation order)
  await prisma.appointment.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.service.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.fAQ.deleteMany();
  await prisma.user.deleteMany();
  console.log('🗑️  Cleared existing MySQL data');

  // Seed Admin
  const hashedPassword = await bcrypt.hash('Admin@1234', 12);
  await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@kayaldental.com',
      password: hashedPassword,
      role: 'admin',
    },
  });
  console.log('👤 Admin user created: admin@kayaldental.com / Admin@1234');

  // Seed Doctors
  const doctorsData = [
    {
      name: 'Dr. Priya Sharma',
      qualification: 'BDS, MDS',
      specialization: 'General & Cosmetic Dentist',
      experience: 12,
      description:
        'Dr. Priya is a highly experienced general and cosmetic dentist passionate about creating beautiful smiles with personalized patient care.',
      availability: JSON.stringify(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
      status: 'active' as const,
    },
    {
      name: 'Dr. Ramesh Kumar',
      qualification: 'BDS, MDS (Orthodontics)',
      specialization: 'Orthodontist',
      experience: 10,
      description:
        'Dr. Ramesh specializes in braces and clear aligners, helping patients achieve straighter smiles with modern orthodontic techniques.',
      availability: JSON.stringify(['Monday', 'Wednesday', 'Friday', 'Saturday']),
      status: 'active' as const,
    },
    {
      name: 'Dr. Anitha Rao',
      qualification: 'BDS, MDS (Implantology)',
      specialization: 'Implantologist',
      experience: 8,
      description:
        'Dr. Anitha is an expert in dental implants, offering patients a permanent solution for missing teeth with natural-looking results.',
      availability: JSON.stringify(['Tuesday', 'Thursday', 'Saturday']),
      status: 'active' as const,
    },
    {
      name: 'Dr. Karthik Nair',
      qualification: 'BDS, MDS (Pediatric Dentistry)',
      specialization: 'Pediatric Dentist',
      experience: 7,
      description:
        "Dr. Karthik specializes in children's dentistry, creating a fun and comfortable environment to build healthy dental habits from an early age.",
      availability: JSON.stringify(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']),
      status: 'active' as const,
    },
  ];

  for (const doc of doctorsData) {
    await prisma.doctor.create({ data: doc });
  }
  console.log('👨‍⚕️ Doctors seeded');

  // Seed Services
  const servicesData = [
    {
      name: 'Teeth Alignment',
      slug: 'teeth-alignment',
      shortDescription: 'Correct misaligned teeth with braces or modern orthodontic solutions.',
      description:
        "Teeth alignment treatments help correct misaligned, crowded, or spaced teeth to improve both dental health and aesthetics. We offer traditional metal braces, ceramic braces, and invisible aligners tailored to each patient's needs.",
      benefits: JSON.stringify([
        'Improved bite function',
        'Enhanced smile aesthetics',
        'Better oral hygiene',
        'Boosted self-confidence',
        'Reduced risk of dental decay',
      ]),
      treatmentProcess:
        'Consultation → X-ray & Dental Scan → Custom Treatment Plan → Brace/Aligner Fitting → Regular Adjustments → Retainer Phase',
      whoNeeds: 'Suitable for patients with crowded, spaced, or misaligned teeth of all ages.',
      duration: '12–24 months depending on severity',
      status: 'active' as const,
    },
    {
      name: 'Teeth Replacement',
      slug: 'teeth-replacement',
      shortDescription: 'Restore missing teeth with comfortable and natural-looking solutions.',
      description:
        'We provide comprehensive teeth replacement options including dental implants, bridges, and dentures. Our specialists recommend the best solution based on your dental health, bone structure, and lifestyle.',
      benefits: JSON.stringify([
        'Restore chewing ability',
        'Prevent bone loss',
        'Improve speech',
        'Natural appearance',
        'Long-lasting results',
      ]),
      treatmentProcess: 'Assessment → Treatment Selection → Preparation → Placement → Healing & Adjustment',
      whoNeeds: 'Patients with one or more missing teeth due to injury, decay, or gum disease.',
      duration: 'Varies: Implants 3–6 months, Bridges 2–3 weeks',
      status: 'active' as const,
    },
    {
      name: 'Smile Designing',
      slug: 'smile-designing',
      shortDescription: 'Enhance your smile with personalized cosmetic dental treatments.',
      description:
        'Smile designing is a comprehensive cosmetic dental process that combines multiple treatments like veneers, teeth whitening, bonding, and reshaping to create your perfect smile tailored to your facial features.',
      benefits: JSON.stringify([
        'Complete smile transformation',
        'Boosts confidence',
        'Personalized results',
        'Minimal invasive options',
        'Long-lasting aesthetic improvement',
      ]),
      treatmentProcess: 'Smile Analysis → Digital Preview → Treatment Planning → Execution → Final Reveal',
      whoNeeds: 'Anyone unhappy with the color, shape, size, or alignment of their teeth.',
      duration: '2–8 weeks depending on treatments involved',
      status: 'active' as const,
    },
    {
      name: 'Dental Implants',
      slug: 'dental-implants',
      shortDescription: 'Restore missing teeth with permanent titanium implants.',
      description:
        'Dental implants are titanium posts surgically placed into the jawbone to act as artificial tooth roots. They provide a strong foundation for fixed or removable replacement teeth that match your natural teeth.',
      benefits: JSON.stringify([
        'Permanent solution',
        'Looks and feels natural',
        'Preserves jawbone',
        'No impact on adjacent teeth',
        'Easy maintenance',
      ]),
      treatmentProcess:
        'Consultation → X-ray & Scan → Implant Placement → Healing Period (osseointegration) → Crown Placement',
      whoNeeds: 'Adults with one or more missing teeth who have sufficient jawbone density.',
      duration: '3–6 months total treatment',
      status: 'active' as const,
    },
    {
      name: 'Root Canal Treatment',
      slug: 'root-canal-treatment',
      shortDescription: 'Save infected teeth with painless root canal therapy.',
      description:
        'Root canal treatment removes infected or damaged pulp from inside the tooth, cleans and disinfects the root canals, and seals the tooth to prevent future infection. Modern techniques make the procedure virtually painless.',
      benefits: JSON.stringify([
        'Saves natural tooth',
        'Eliminates severe toothache',
        'Prevents infection spread',
        'Cost-effective vs extraction',
        'Quick recovery',
      ]),
      treatmentProcess:
        'Diagnosis → Local Anesthesia → Pulp Removal → Canal Cleaning → Filling & Sealing → Crown Placement',
      whoNeeds: 'Patients with severe tooth pain, deep decay, cracked teeth, or infected pulp.',
      duration: '1–3 appointments over 1–2 weeks',
      status: 'active' as const,
    },
    {
      name: 'Teeth Whitening',
      slug: 'teeth-whitening',
      shortDescription: 'Brighten your smile with professional whitening treatments.',
      description:
        'Professional teeth whitening uses medical-grade bleaching agents to remove stains and discoloration, making your teeth several shades whiter. We offer in-office and take-home whitening options.',
      benefits: JSON.stringify([
        'Noticeably whiter teeth',
        'Safe & supervised',
        'Quick results',
        'Boosts confidence',
        'Long-lasting with care',
      ]),
      treatmentProcess:
        'Shade Assessment → Gum Protection → Whitening Gel Application → Light Activation → Results Evaluation',
      whoNeeds: 'Anyone with stained or discolored teeth due to coffee, tea, tobacco, or aging.',
      duration: '1 hour in-office or 2 weeks take-home',
      status: 'active' as const,
    },
    {
      name: 'Braces',
      slug: 'braces',
      shortDescription: 'Traditional and ceramic braces for effective teeth straightening.',
      description:
        'Braces are orthodontic devices that correct misaligned teeth and bite issues. We offer metal braces and aesthetic ceramic braces that blend with your tooth color for a discreet appearance.',
      benefits: JSON.stringify([
        'Proven effective',
        'Works for complex cases',
        'Durable',
        'Customizable',
        'Cost-effective orthodontic option',
      ]),
      treatmentProcess: 'Orthodontic Assessment → Brace Selection → Fitting → Monthly Adjustments → Removal & Retainer',
      whoNeeds: 'Children, teens, and adults with crowded, gapped, or misaligned teeth.',
      duration: '12–24 months',
      status: 'active' as const,
    },
    {
      name: 'Pediatric Dentistry',
      slug: 'pediatric-dentistry',
      shortDescription: 'Gentle, fun dental care specially designed for children.',
      description:
        'Our pediatric dental services focus on preventive care and early intervention for children from 1 year of age. We create a positive, fun dental experience to help children build healthy oral habits for life.',
      benefits: JSON.stringify([
        'Child-friendly environment',
        'Preventive approach',
        'Early problem detection',
        'Fun & stress-free visits',
        'Builds healthy habits',
      ]),
      treatmentProcess: 'Friendly Check-up → Cleaning → Fluoride Treatment → Guidance for Parents → Follow-up',
      whoNeeds: 'Children from 1 year through teenage years.',
      duration: '30–60 minute check-up appointments',
      status: 'active' as const,
    },
  ];

  for (const svc of servicesData) {
    await prisma.service.create({ data: svc });
  }
  console.log('🦷 Services seeded');

  // Seed Testimonials
  const testimonialsData = [
    {
      patientName: 'Priya S.',
      review:
        'I visited Kayal Dental Tourism for teeth replacement, and I am extremely happy with the treatment. The clinic is very clean, modern, and equipped with the latest technology. The doctors are patient, friendly, and truly care about your comfort.',
      rating: 5,
      status: 'active' as const,
    },
    {
      patientName: 'Karthik R.',
      review:
        'KAYAL Dental Care made me feel comfortable from the moment I walked in. The doctors explained everything clearly, and my smile makeover results were better than I expected. Highly recommend!',
      rating: 5,
      status: 'active' as const,
    },
    {
      patientName: 'Meena L.',
      review:
        'Best dental clinic in Chennai! My daughter was very nervous about her first dental visit, but the pediatric dentist at KAYAL made her feel at ease immediately. Great experience overall.',
      rating: 5,
      status: 'active' as const,
    },
    {
      patientName: 'Suresh M.',
      review:
        'I got dental implants done here. The procedure was explained in detail and the post-treatment care was excellent. The implants look and feel completely natural. Very satisfied.',
      rating: 5,
      status: 'active' as const,
    },
    {
      patientName: 'Deepa K.',
      review:
        'Professional team, modern equipment, and a very hygienic clinic. The teeth whitening treatment gave me amazing results. I feel so much more confident now!',
      rating: 5,
      status: 'active' as const,
    },
  ];

  for (const t of testimonialsData) {
    await prisma.testimonial.create({ data: t });
  }
  console.log('⭐ Testimonials seeded');

  // Seed FAQs
  const faqsData = [
    {
      question: 'How often should I visit the dentist?',
      answer:
        'We recommend a dental check-up every 6 months to maintain healthy teeth and gums. Regular visits help detect problems early and prevent costly treatments.',
      displayOrder: 1,
      status: 'active' as const,
    },
    {
      question: 'Do dental treatments cause pain?',
      answer:
        'Most treatments are performed using modern techniques and appropriate anesthesia to ensure patient comfort. At KAYAL, we prioritize pain-free dentistry in a calm, reassuring environment.',
      displayOrder: 2,
      status: 'active' as const,
    },
    {
      question: 'Do you offer braces and clear aligners?',
      answer:
        'Yes. We provide comprehensive orthodontic solutions including traditional metal braces, ceramic braces, and clear aligners based on individual patient requirements and lifestyle preferences.',
      displayOrder: 3,
      status: 'active' as const,
    },
    {
      question: 'How long does a dental implant procedure take?',
      answer:
        'The full dental implant process typically takes 3–6 months. This includes the implant placement, healing period (osseointegration), and crown fitting. The dentist will provide a personalized timeline after examination.',
      displayOrder: 4,
      status: 'active' as const,
    },
    {
      question: 'Is teeth whitening safe?',
      answer:
        'Professional teeth whitening performed under dental supervision is safe and effective for most patients. Our dental team assesses your suitability before treatment and uses only medical-grade whitening products.',
      displayOrder: 5,
      status: 'active' as const,
    },
    {
      question: 'Do you provide emergency dental care?',
      answer:
        'Yes. We provide emergency dental care for urgent dental problems such as severe toothache, broken teeth, or dental trauma. Contact our clinic immediately and we will prioritize your appointment.',
      displayOrder: 6,
      status: 'active' as const,
    },
    {
      question: 'What age should my child first visit the dentist?',
      answer:
        'We recommend bringing your child for their first dental visit when their first tooth appears, or by their first birthday. Early visits help establish healthy habits and prevent future problems.',
      displayOrder: 7,
      status: 'active' as const,
    },
    {
      question: 'How do I take care of dental implants?',
      answer:
        'Dental implants require the same care as natural teeth — brushing twice daily, flossing, and regular dental check-ups. With proper care, implants can last a lifetime.',
      displayOrder: 8,
      status: 'active' as const,
    },
  ];

  for (const f of faqsData) {
    await prisma.fAQ.create({ data: f });
  }
  console.log('❓ FAQs seeded');

  console.log('\n✅ MySQL Database seeded successfully via Prisma!');
  console.log('📧 Admin login: admin@kayaldental.com');
  console.log('🔑 Password: Admin@1234');
  await prisma.$disconnect();
  process.exit(0);
};

seed().catch(async (err) => {
  console.error('❌ Seed error:', err);
  await prisma.$disconnect();
  process.exit(1);
});
