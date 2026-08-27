-- ==============================================================================
-- SMART DENTAL CLINIC - SUPABASE BACKEND SCHEMA & MIGRATION SCRIPT
-- ==============================================================================

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  role TEXT CHECK (role IN ('patient', 'doctor')) DEFAULT 'patient',
  has_diabetes BOOLEAN DEFAULT false,
  has_hypertension BOOLEAN DEFAULT false,
  has_penicillin_allergy BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Consultations / Complaints Triage Table
CREATE TABLE IF NOT EXISTS public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  affected_teeth INTEGER[] DEFAULT '{}',
  symptoms TEXT[] DEFAULT '{}',
  pain_level INTEGER CHECK (pain_level >= 1 AND pain_level <= 10) DEFAULT 5,
  description TEXT NOT NULL,
  image_urls TEXT[] DEFAULT '{}',
  audio_url TEXT,
  medical_alerts TEXT[] DEFAULT '{}',
  urgency_level TEXT CHECK (urgency_level IN ('emergency', 'urgent', 'moderate', 'routine')) DEFAULT 'moderate',
  status TEXT CHECK (status IN ('pending', 'diagnosed', 'appointment_booked')) DEFAULT 'pending',
  diagnosis_text TEXT,
  first_aid_instructions TEXT,
  recommended_medications TEXT,
  suggested_service_id TEXT,
  diagnosed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Appointments Table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  price INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('confirmed', 'cancelled', 'completed')) DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Messages Table (Medical Consultation Chat)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  sender_role TEXT CHECK (sender_role IN ('patient', 'doctor')) NOT NULL,
  sender_name TEXT NOT NULL,
  text TEXT DEFAULT '',
  image_url TEXT,
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. Indexes for High Performance
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON public.consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON public.consultations(status);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_messages_consultation_id ON public.messages(consultation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- ==============================================================================
-- 7. Automated Trigger for New User Profile Creation
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'مستخدم جديد'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 8. Row Level Security (RLS) Policies
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is a doctor
CREATE OR REPLACE FUNCTION public.is_doctor()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'doctor'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Consultations Policies
CREATE POLICY "Patients can view their own consultations"
  ON public.consultations FOR SELECT
  TO authenticated
  USING (auth.uid() = patient_id OR public.is_doctor());

CREATE POLICY "Patients can insert their own consultations"
  ON public.consultations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Doctors and owners can update consultations"
  ON public.consultations FOR UPDATE
  TO authenticated
  USING (auth.uid() = patient_id OR public.is_doctor());

-- Appointments Policies
CREATE POLICY "Patients view own appointments and doctors view all"
  ON public.appointments FOR SELECT
  TO authenticated
  USING (auth.uid() = patient_id OR public.is_doctor());

CREATE POLICY "Patients can create appointments"
  ON public.appointments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Doctors and owners can modify appointments"
  ON public.appointments FOR UPDATE
  TO authenticated
  USING (auth.uid() = patient_id OR public.is_doctor());

-- Messages Policies
CREATE POLICY "Participants in consultation can view messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    public.is_doctor() OR
    EXISTS (
      SELECT 1 FROM public.consultations
      WHERE consultations.id = messages.consultation_id
      AND consultations.patient_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can insert messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- ==============================================================================
-- 9. Storage Bucket Policies (dental-media)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('dental-media', 'dental-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access to Dental Media"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'dental-media');

CREATE POLICY "Authenticated Users can upload media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'dental-media');

-- ==============================================================================
-- 10. Enable Realtime Replication
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.consultations;
