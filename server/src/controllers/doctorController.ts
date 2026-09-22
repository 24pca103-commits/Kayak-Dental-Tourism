import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import prisma, { isDbOnline } from '../config/prisma';

const DOCTORS_DATA_FILE = path.join(__dirname, '../../data/doctors.json');

const INITIAL_DOCTORS = [
  {
    id: 1,
    _id: '1',
    name: 'Dr. Priya Sharma',
    qualification: 'BDS, MDS',
    specialization: 'General & Cosmetic Dentist',
    experience: 12,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
    description: 'Dr. Priya is a highly experienced general and cosmetic dentist passionate about creating beautiful smiles with personalized patient care.',
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    _id: '2',
    name: 'Dr. Ramesh Kumar',
    qualification: 'BDS, MDS (Orthodontics)',
    specialization: 'Orthodontist',
    experience: 10,
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    description: 'Dr. Ramesh specializes in braces and clear aligners, helping patients achieve straighter smiles with modern orthodontic techniques.',
    availability: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    _id: '3',
    name: 'Dr. Anitha Rao',
    qualification: 'BDS, MDS (Implantology)',
    specialization: 'Implantologist',
    experience: 8,
    image: 'https://images.unsplash.com/photo-1594824813689-f52914101e4a?auto=format&fit=crop&q=80&w=400',
    description: 'Dr. Anitha is an expert in dental implants, offering patients a permanent solution for missing teeth with natural-looking results.',
    availability: ['Tuesday', 'Thursday', 'Saturday'],
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    _id: '4',
    name: 'Dr. Karthik Nair',
    qualification: 'BDS, MDS (Pediatric Dentistry)',
    specialization: 'Pediatric Dentist',
    experience: 7,
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400',
    description: "Dr. Karthik specializes in children's dentistry, creating a fun and comfortable environment to build healthy dental habits from an early age.",
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    status: 'active',
    createdAt: new Date().toISOString(),
  },
];

function loadDoctorsFromDisk(): any[] {
  try {
    if (fs.existsSync(DOCTORS_DATA_FILE)) {
      const raw = fs.readFileSync(DOCTORS_DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    fs.mkdirSync(path.dirname(DOCTORS_DATA_FILE), { recursive: true });
    fs.writeFileSync(DOCTORS_DATA_FILE, JSON.stringify(INITIAL_DOCTORS, null, 2), 'utf-8');
    return INITIAL_DOCTORS;
  } catch (err) {
    console.error('Error reading doctors.json:', err);
    return INITIAL_DOCTORS;
  }
}

function saveDoctorsToDisk(list: any[]) {
  try {
    fs.mkdirSync(path.dirname(DOCTORS_DATA_FILE), { recursive: true });
    fs.writeFileSync(DOCTORS_DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing doctors.json:', err);
  }
}

const formatDoctor = (d: any) => {
  let availability = d.availability;
  if (typeof availability === 'string') {
    try {
      availability = JSON.parse(availability);
    } catch {
      availability = [availability];
    }
  }
  return {
    ...d,
    id: d.id,
    _id: String(d.id),
    availability: Array.isArray(availability) ? availability : [],
  };
};

export const getDoctors = async (_req: Request, res: Response): Promise<void> => {
  if (!isDbOnline()) {
    const list = loadDoctorsFromDisk().filter((d) => d.status === 'active');
    res.json({ success: true, data: list.map(formatDoctor) });
    return;
  }

  try {
    const doctors = await prisma.doctor.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: doctors.map(formatDoctor) });
  } catch (error: any) {
    const list = loadDoctorsFromDisk().filter((d) => d.status === 'active');
    res.json({ success: true, data: list.map(formatDoctor) });
  }
};

export const getAllDoctors = async (_req: Request, res: Response): Promise<void> => {
  if (!isDbOnline()) {
    const list = loadDoctorsFromDisk();
    res.json({ success: true, data: list.map(formatDoctor) });
    return;
  }

  try {
    const doctors = await prisma.doctor.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: doctors.map(formatDoctor) });
  } catch (error: any) {
    const list = loadDoctorsFromDisk();
    res.json({ success: true, data: list.map(formatDoctor) });
  }
};

export const getDoctorById = async (req: Request, res: Response): Promise<void> => {
  const rawId = req.params.id;
  const id = parseInt(rawId);

  if (isNaN(id) && !rawId) {
    res.status(400).json({ success: false, message: 'Invalid doctor ID' });
    return;
  }

  if (!isDbOnline()) {
    const list = loadDoctorsFromDisk();
    const doc = list.find((d) => d._id === rawId || d.id === id);
    if (!doc) {
      res.status(404).json({ success: false, message: 'Doctor not found' });
      return;
    }
    res.json({ success: true, data: formatDoctor(doc) });
    return;
  }

  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id },
    });
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor not found' });
      return;
    }
    res.json({ success: true, data: formatDoctor(doctor) });
  } catch (error: any) {
    const list = loadDoctorsFromDisk();
    const doc = list.find((d) => d._id === rawId || d.id === id);
    if (doc) {
      res.json({ success: true, data: formatDoctor(doc) });
      return;
    }
    res.status(404).json({ success: false, message: 'Doctor not found' });
  }
};

export const createDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, qualification, specialization, experience, description, availability, status } = req.body;
    let availabilityArr: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if (Array.isArray(availability)) {
      availabilityArr = availability;
    } else if (typeof availability === 'string') {
      try {
        const p = JSON.parse(availability);
        availabilityArr = Array.isArray(p) ? p : [availability];
      } catch {
        availabilityArr = [availability];
      }
    }

    const newId = Date.now();
    const newDoc = {
      id: newId,
      _id: String(newId),
      name: String(name || '').trim(),
      qualification: String(qualification || '').trim(),
      specialization: String(specialization || '').trim(),
      experience: parseInt(experience || '0'),
      image: req.file ? `/uploads/${req.file.filename}` : req.body.image || '',
      description: String(description || '').trim(),
      availability: availabilityArr,
      status: status === 'inactive' ? 'inactive' : 'active',
      createdAt: new Date().toISOString(),
    };

    const list = loadDoctorsFromDisk();
    saveDoctorsToDisk([newDoc, ...list]);

    if (isDbOnline()) {
      try {
        const dbDoc = await prisma.doctor.create({
          data: {
            name: newDoc.name,
            qualification: newDoc.qualification,
            specialization: newDoc.specialization,
            experience: newDoc.experience,
            image: newDoc.image,
            description: newDoc.description,
            availability: JSON.stringify(availabilityArr),
            status: newDoc.status as any,
          },
        });
        newDoc.id = dbDoc.id;
        newDoc._id = String(dbDoc.id);
      } catch {
        // ignore DB offline
      }
    }

    res.status(201).json({ success: true, data: formatDoctor(newDoc) });
  } catch (error: any) {
    console.error('createDoctor error:', error);
    res.status(400).json({ success: false, message: 'Failed to create doctor', error: error?.message || String(error) });
  }
};

export const updateDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = req.params.id;
    const id = parseInt(rawId);

    const list = loadDoctorsFromDisk();
    const index = list.findIndex((d) => d._id === rawId || d.id === id);

    if (index === -1) {
      res.status(404).json({ success: false, message: 'Doctor not found' });
      return;
    }

    const existing = list[index];
    const updateData: any = {};
    if (req.body.name !== undefined) updateData.name = String(req.body.name).trim();
    if (req.body.qualification !== undefined) updateData.qualification = String(req.body.qualification).trim();
    if (req.body.specialization !== undefined) updateData.specialization = String(req.body.specialization).trim();
    if (req.body.experience !== undefined) updateData.experience = parseInt(req.body.experience);
    if (req.body.description !== undefined) updateData.description = String(req.body.description).trim();
    if (req.body.status !== undefined) updateData.status = req.body.status === 'inactive' ? 'inactive' : 'active';
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;
    else if (req.body.image !== undefined) updateData.image = req.body.image;

    if (req.body.availability !== undefined) {
      if (Array.isArray(req.body.availability)) {
        updateData.availability = req.body.availability;
      } else if (typeof req.body.availability === 'string') {
        try {
          updateData.availability = JSON.parse(req.body.availability);
        } catch {
          updateData.availability = [req.body.availability];
        }
      }
    }

    const updated = { ...existing, ...updateData };
    list[index] = updated;
    saveDoctorsToDisk(list);

    if (isDbOnline() && !isNaN(id)) {
      try {
        await prisma.doctor.update({
          where: { id },
          data: {
            ...updateData,
            availability: updateData.availability ? JSON.stringify(updateData.availability) : undefined,
          },
        });
      } catch {
        // ignore
      }
    }

    res.json({ success: true, data: formatDoctor(updated) });
  } catch (error: any) {
    console.error('updateDoctor error:', error);
    res.status(400).json({ success: false, message: 'Failed to update doctor', error: error?.message || String(error) });
  }
};

export const deleteDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = req.params.id;
    const id = parseInt(rawId);

    const list = loadDoctorsFromDisk();
    const updated = list.filter((d) => d._id !== rawId && d.id !== id);
    saveDoctorsToDisk(updated);

    if (isDbOnline() && !isNaN(id)) {
      try {
        await prisma.doctor.delete({ where: { id } });
      } catch {
        // ignore
      }
    }

    res.json({ success: true, message: 'Doctor deleted' });
  } catch (error: any) {
    console.error('deleteDoctor error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error?.message || String(error) });
  }
};
