import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import prisma, { isDbOnline } from '../config/prisma';

const SERVICES_DATA_FILE = path.join(__dirname, '../../data/services.json');

const INITIAL_SERVICES = [
  {
    id: 1,
    _id: '1',
    name: 'Teeth Alignment',
    slug: 'teeth-alignment',
    shortDescription: 'Correct misaligned teeth with braces or modern orthodontic solutions.',
    description: "Teeth alignment treatments help correct misaligned, crowded, or spaced teeth to improve both dental health and aesthetics. We offer traditional metal braces, ceramic braces, and invisible aligners tailored to each patient's needs.",
    benefits: ['Improved bite function', 'Enhanced smile aesthetics', 'Better oral hygiene', 'Boosted self-confidence', 'Reduced risk of dental decay'],
    treatmentProcess: 'Consultation → X-ray & Dental Scan → Custom Treatment Plan → Brace/Aligner Fitting → Regular Adjustments → Retainer Phase',
    whoNeeds: 'Suitable for patients with crowded, spaced, or misaligned teeth of all ages.',
    duration: '12–24 months depending on severity',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    _id: '2',
    name: 'Teeth Replacement',
    slug: 'teeth-replacement',
    shortDescription: 'Restore missing teeth with comfortable and natural-looking solutions.',
    description: 'We provide comprehensive teeth replacement options including dental implants, bridges, and dentures. Our specialists recommend the best solution based on your dental health, bone structure, and lifestyle.',
    benefits: ['Restore chewing ability', 'Prevent bone loss', 'Improve speech', 'Natural appearance', 'Long-lasting results'],
    treatmentProcess: 'Assessment → Treatment Selection → Preparation → Placement → Healing & Adjustment',
    whoNeeds: 'Patients with one or more missing teeth due to injury, decay, or gum disease.',
    duration: 'Varies: Implants 3–6 months, Bridges 2–3 weeks',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    _id: '3',
    name: 'Smile Designing',
    slug: 'smile-designing',
    shortDescription: 'Enhance your smile with personalized cosmetic dental treatments.',
    description: 'Smile designing is a comprehensive cosmetic dental process that combines multiple treatments like veneers, teeth whitening, bonding, and reshaping to create your perfect smile tailored to your facial features.',
    benefits: ['Complete smile transformation', 'Boosts confidence', 'Personalized results', 'Minimal invasive options', 'Long-lasting aesthetic improvement'],
    treatmentProcess: 'Smile Analysis → Digital Preview → Treatment Planning → Execution → Final Reveal',
    whoNeeds: 'Anyone unhappy with the color, shape, size, or alignment of their teeth.',
    duration: '2–8 weeks depending on treatments involved',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    _id: '4',
    name: 'Dental Implants',
    slug: 'dental-implants',
    shortDescription: 'Restore missing teeth with permanent titanium implants.',
    description: 'Dental implants are titanium posts surgically placed into the jawbone to act as artificial tooth roots. They provide a strong foundation for fixed or removable replacement teeth that match your natural teeth.',
    benefits: ['Permanent solution', 'Looks and feels natural', 'Preserves jawbone', 'No impact on adjacent teeth', 'Easy maintenance'],
    treatmentProcess: 'Consultation → X-ray & Scan → Implant Placement → Healing Period (osseointegration) → Crown Placement',
    whoNeeds: 'Adults with one or more missing teeth who have sufficient jawbone density.',
    duration: '3–6 months total treatment',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 5,
    _id: '5',
    name: 'Root Canal Treatment',
    slug: 'root-canal-treatment',
    shortDescription: 'Save infected teeth with painless root canal therapy.',
    description: 'Root canal treatment removes infected or damaged pulp from inside the tooth, cleans and disinfects the root canals, and seals the tooth to prevent future infection. Modern techniques make the procedure virtually painless.',
    benefits: ['Saves natural tooth', 'Eliminates severe toothache', 'Prevents infection spread', 'Cost-effective vs extraction', 'Quick recovery'],
    treatmentProcess: 'Diagnosis → Local Anesthesia → Pulp Removal → Canal Cleaning → Filling & Sealing → Crown Placement',
    whoNeeds: 'Patients with severe tooth pain, deep decay, cracked teeth, or infected pulp.',
    duration: '1–3 appointments over 1–2 weeks',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 6,
    _id: '6',
    name: 'Teeth Whitening',
    slug: 'teeth-whitening',
    shortDescription: 'Brighten your smile with professional whitening treatments.',
    description: 'Professional teeth whitening uses medical-grade bleaching agents to remove stains and discoloration, making your teeth several shades whiter. We offer in-office and take-home whitening options.',
    benefits: ['Noticeably whiter teeth', 'Safe & supervised', 'Quick results', 'Boosts confidence', 'Long-lasting with care'],
    treatmentProcess: 'Shade Assessment → Gum Protection → Whitening Gel Application → Light Activation → Results Evaluation',
    whoNeeds: 'Anyone with stained or discolored teeth due to coffee, tea, tobacco, or aging.',
    duration: '1 hour in-office or 2 weeks take-home',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 7,
    _id: '7',
    name: 'Braces',
    slug: 'braces',
    shortDescription: 'Traditional and ceramic braces for effective teeth straightening.',
    description: 'Braces are orthodontic devices that correct misaligned teeth and bite issues. We offer metal braces and aesthetic ceramic braces that blend with your tooth color for a discreet appearance.',
    benefits: ['Proven effective', 'Works for complex cases', 'Durable', 'Customizable', 'Cost-effective orthodontic option'],
    treatmentProcess: 'Orthodontic Assessment → Brace Selection → Fitting → Monthly Adjustments → Removal & Retainer',
    whoNeeds: 'Children, teens, and adults with crowded, gapped, or misaligned teeth.',
    duration: '12–24 months',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 8,
    _id: '8',
    name: 'Pediatric Dentistry',
    slug: 'pediatric-dentistry',
    shortDescription: 'Gentle, fun dental care specially designed for children.',
    description: 'Our pediatric dental services focus on preventive care and early intervention for children from 1 year of age. We create a positive, fun dental experience to help children build healthy oral habits for life.',
    benefits: ['Child-friendly environment', 'Pain-free approach', 'Preventive focus', 'Builds positive dental habits', 'Early problem detection'],
    treatmentProcess: 'Friendly Introduction → Gentle Examination → Preventive Cleaning/Treatment → Education & Tips → Reward & Praise',
    whoNeeds: 'Children and teens from age 1 to 18 years.',
    duration: '30–45 minutes per visit',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 9,
    _id: '9',
    name: 'Emergency Dental Care',
    slug: 'emergency-dental-care',
    shortDescription: 'Prompt care for dental emergencies including toothache, trauma, and broken teeth.',
    description: 'Immediate compassionate dental care for severe toothaches, chipped or knocked-out teeth, broken restorations, and dental trauma.',
    benefits: ['Same-day consultation', 'Rapid pain relief', 'Emergency extractions', 'Fractured tooth repair', 'Infection management'],
    treatmentProcess: 'Immediate Triage → Digital X-Ray → Pain Relief Anesthesia → Emergency Intervention → Aftercare Plan',
    whoNeeds: 'Anyone experiencing sudden unbearable toothache, oral trauma, broken teeth, or dental emergencies.',
    duration: 'Immediate same-day care (45–60 mins)',
    status: 'active',
    createdAt: new Date().toISOString(),
  }
];

function loadServicesFromDisk(): any[] {
  try {
    if (fs.existsSync(SERVICES_DATA_FILE)) {
      const raw = fs.readFileSync(SERVICES_DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    fs.mkdirSync(path.dirname(SERVICES_DATA_FILE), { recursive: true });
    fs.writeFileSync(SERVICES_DATA_FILE, JSON.stringify(INITIAL_SERVICES, null, 2), 'utf-8');
    return INITIAL_SERVICES;
  } catch (err) {
    console.error('Error reading services.json:', err);
    return INITIAL_SERVICES;
  }
}

function saveServicesToDisk(list: any[]) {
  try {
    fs.mkdirSync(path.dirname(SERVICES_DATA_FILE), { recursive: true });
    fs.writeFileSync(SERVICES_DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing services.json:', err);
  }
}

const slugify = (name: string): string =>
  name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

const formatService = (s: any) => {
  let benefits = s.benefits;
  if (typeof benefits === 'string') {
    try {
      benefits = JSON.parse(benefits);
    } catch {
      benefits = benefits ? [benefits] : [];
    }
  }
  return {
    ...s,
    id: s.id,
    _id: String(s.id),
    benefits: Array.isArray(benefits) ? benefits : [],
  };
};

export const getServices = async (_req: Request, res: Response): Promise<void> => {
  if (!isDbOnline()) {
    const list = loadServicesFromDisk().filter((s) => s.status === 'active');
    res.json({ success: true, data: list.map(formatService) });
    return;
  }

  try {
    const services = await prisma.service.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: services.map(formatService) });
  } catch (error: any) {
    const list = loadServicesFromDisk().filter((s) => s.status === 'active');
    res.json({ success: true, data: list.map(formatService) });
  }
};

export const getAllServices = async (_req: Request, res: Response): Promise<void> => {
  if (!isDbOnline()) {
    const list = loadServicesFromDisk();
    res.json({ success: true, data: list.map(formatService) });
    return;
  }

  try {
    const services = await prisma.service.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: services.map(formatService) });
  } catch (error: any) {
    const list = loadServicesFromDisk();
    res.json({ success: true, data: list.map(formatService) });
  }
};

export const getServiceBySlug = async (req: Request, res: Response): Promise<void> => {
  const slug = req.params.slug;

  if (!isDbOnline()) {
    const list = loadServicesFromDisk();
    const service = list.find((s) => s.slug === slug);
    if (!service || service.status !== 'active') {
      res.status(404).json({ success: false, message: 'Service not found' });
      return;
    }
    res.json({ success: true, data: formatService(service) });
    return;
  }

  try {
    const service = await prisma.service.findUnique({
      where: { slug },
    });
    if (!service || service.status !== 'active') {
      res.status(404).json({ success: false, message: 'Service not found' });
      return;
    }
    res.json({ success: true, data: formatService(service) });
  } catch (error: any) {
    const list = loadServicesFromDisk();
    const service = list.find((s) => s.slug === slug);
    if (service && service.status === 'active') {
      res.json({ success: true, data: formatService(service) });
      return;
    }
    res.status(404).json({ success: false, message: 'Service not found' });
  }
};

export const createService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, shortDescription, description, duration, status, treatmentProcess, whoNeeds } = req.body;
    const slug = req.body.slug || slugify(name || '');

    let benefitsArr: string[] = [];
    if (Array.isArray(req.body.benefits)) {
      benefitsArr = req.body.benefits;
    } else if (typeof req.body.benefits === 'string') {
      try {
        const p = JSON.parse(req.body.benefits);
        benefitsArr = Array.isArray(p) ? p : [req.body.benefits];
      } catch {
        benefitsArr = [req.body.benefits];
      }
    }

    const newId = Date.now();
    const newService = {
      id: newId,
      _id: String(newId),
      name: String(name || '').trim(),
      slug,
      image: req.file ? `/uploads/${req.file.filename}` : req.body.image || '',
      shortDescription: String(shortDescription || '').trim(),
      description: String(description || '').trim(),
      benefits: benefitsArr,
      treatmentProcess: treatmentProcess ? String(treatmentProcess).trim() : null,
      whoNeeds: whoNeeds ? String(whoNeeds).trim() : null,
      duration: duration ? String(duration).trim() : '',
      status: status === 'inactive' ? 'inactive' : 'active',
      createdAt: new Date().toISOString(),
    };

    const list = loadServicesFromDisk();
    saveServicesToDisk([newService, ...list]);

    if (isDbOnline()) {
      try {
        const dbService = await prisma.service.create({
          data: {
            name: newService.name,
            slug: newService.slug,
            image: newService.image,
            shortDescription: newService.shortDescription,
            description: newService.description,
            benefits: JSON.stringify(benefitsArr),
            treatmentProcess: newService.treatmentProcess,
            whoNeeds: newService.whoNeeds,
            duration: newService.duration,
            status: newService.status as any,
          },
        });
        newService.id = dbService.id;
        newService._id = String(dbService.id);
      } catch {
        // ignore DB offline
      }
    }

    res.status(201).json({ success: true, data: formatService(newService) });
  } catch (error: any) {
    console.error('createService error:', error);
    res.status(400).json({ success: false, message: 'Failed to create service', error: error?.message || String(error) });
  }
};

export const updateService = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = req.params.id;
    const id = parseInt(rawId);

    const list = loadServicesFromDisk();
    const index = list.findIndex((s) => s._id === rawId || s.id === id);

    if (index === -1) {
      res.status(404).json({ success: false, message: 'Service not found' });
      return;
    }

    const existing = list[index];
    const updateData: any = {};
    if (req.body.name !== undefined) {
      updateData.name = String(req.body.name).trim();
      if (!req.body.slug) updateData.slug = slugify(req.body.name);
    }
    if (req.body.slug !== undefined) updateData.slug = slugify(req.body.slug);
    if (req.body.shortDescription !== undefined) updateData.shortDescription = String(req.body.shortDescription).trim();
    if (req.body.description !== undefined) updateData.description = String(req.body.description).trim();
    if (req.body.duration !== undefined) updateData.duration = String(req.body.duration).trim();
    if (req.body.status !== undefined) updateData.status = req.body.status === 'inactive' ? 'inactive' : 'active';
    if (req.body.treatmentProcess !== undefined) updateData.treatmentProcess = req.body.treatmentProcess ? String(req.body.treatmentProcess).trim() : null;
    if (req.body.whoNeeds !== undefined) updateData.whoNeeds = req.body.whoNeeds ? String(req.body.whoNeeds).trim() : null;
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;
    else if (req.body.image !== undefined) updateData.image = req.body.image;

    if (req.body.benefits !== undefined) {
      if (Array.isArray(req.body.benefits)) {
        updateData.benefits = req.body.benefits;
      } else if (typeof req.body.benefits === 'string') {
        try {
          updateData.benefits = JSON.parse(req.body.benefits);
        } catch {
          updateData.benefits = [req.body.benefits];
        }
      }
    }

    const updated = { ...existing, ...updateData };
    list[index] = updated;
    saveServicesToDisk(list);

    if (isDbOnline() && !isNaN(id)) {
      try {
        await prisma.service.update({
          where: { id },
          data: {
            ...updateData,
            benefits: updateData.benefits ? JSON.stringify(updateData.benefits) : undefined,
          },
        });
      } catch {
        // ignore DB offline
      }
    }

    res.json({ success: true, data: formatService(updated) });
  } catch (error: any) {
    console.error('updateService error:', error);
    res.status(400).json({ success: false, message: 'Failed to update service', error: error?.message || String(error) });
  }
};

export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = req.params.id;
    const id = parseInt(rawId);

    const list = loadServicesFromDisk();
    const updated = list.filter((s) => s._id !== rawId && s.id !== id);
    saveServicesToDisk(updated);

    if (isDbOnline() && !isNaN(id)) {
      try {
        await prisma.service.delete({ where: { id } });
      } catch {
        // ignore DB offline
      }
    }

    res.json({ success: true, message: 'Service deleted' });
  } catch (error: any) {
    console.error('deleteService error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error?.message || String(error) });
  }
};
