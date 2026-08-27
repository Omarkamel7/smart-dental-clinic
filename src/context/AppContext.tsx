import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UserProfile,
  UserRole,
  Language,
  DentalComplaint,
  Appointment,
  BeforeAfterCase,
  ChatMessage,
  PreliminaryDiagnosis,
  ClinicSettings,
  DentalService,
} from '../types';
import { translations } from '../constants/translations';
import {
  INITIAL_BEFORE_AFTER_CASES,
  DEFAULT_SERVICES,
  DEFAULT_CLINIC_SETTINGS,
} from '../constants/dentalData';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  complaints: DentalComplaint[];
  addComplaint: (complaint: Omit<DentalComplaint, 'id' | 'createdAt' | 'status'>) => Promise<DentalComplaint>;
  submitDiagnosis: (complaintId: string, diagnosis: PreliminaryDiagnosis) => Promise<void>;
  appointments: Appointment[];
  bookAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => Promise<Appointment>;
  cancelAppointment: (appointmentId: string) => Promise<void>;
  clinicSettings: ClinicSettings;
  updateClinicSettings: (settings: Partial<ClinicSettings>) => Promise<void>;
  services: DentalService[];
  addService: (service: Omit<DentalService, 'id'>) => Promise<DentalService>;
  updateService: (service: DentalService) => Promise<void>;
  deleteService: (serviceId: string) => Promise<void>;
  portfolioCases: BeforeAfterCase[];
  addPortfolioCase: (caseItem: Omit<BeforeAfterCase, 'id'>) => Promise<BeforeAfterCase>;
  deletePortfolioCase: (caseId: string) => Promise<void>;
  messages: ChatMessage[];
  sendMessage: (consultationId: string, text: string, audioUri?: string, imageUri?: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  t: typeof translations.ar;
  isRTL: boolean;
}

const DEFAULT_PATIENT: UserProfile = {
  id: '',
  fullName: '',
  phone: '',
  email: '',
  role: 'patient',
  gender: 'male',
  age: 0,
  medicalHistory: {
    hasDiabetes: false,
    hasHypertension: false,
    hasHeartDisease: false,
    hasBleedingDisorder: false,
    hasPenicillinAllergy: false,
    isPregnant: false,
    otherAllergies: '',
    notes: '',
  },
};

const INITIAL_COMPLAINTS: DentalComplaint[] = [];
const INITIAL_APPOINTMENTS: Appointment[] = [];
const INITIAL_MESSAGES: ChatMessage[] = [];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('ar');
  const [role, setRoleState] = useState<UserRole>('patient');
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_PATIENT);
  const [complaints, setComplaints] = useState<DentalComplaint[]>(INITIAL_COMPLAINTS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings>(DEFAULT_CLINIC_SETTINGS);
  const [services, setServices] = useState<DentalService[]>(DEFAULT_SERVICES);
  const [portfolioCases, setPortfolioCases] = useState<BeforeAfterCase[]>(INITIAL_BEFORE_AFTER_CASES);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    loadSavedData();
    initSupabase();
  }, []);

  const loadSavedData = async () => {
    try {
      const savedLang = await AsyncStorage.getItem('@dental_app_lang');
      if (savedLang === 'ar' || savedLang === 'en') {
        setLanguageState(savedLang);
      }
      const savedSettings = await AsyncStorage.getItem('@dental_app_clinic_settings');
      if (savedSettings) {
        setClinicSettings(JSON.parse(savedSettings));
      }
      const savedServices = await AsyncStorage.getItem('@dental_app_services');
      if (savedServices) {
        setServices(JSON.parse(savedServices));
      }
      const savedPortfolio = await AsyncStorage.getItem('@dental_app_portfolio');
      if (savedPortfolio) {
        setPortfolioCases(JSON.parse(savedPortfolio));
      }
      const savedComplaints = await AsyncStorage.getItem('@dental_app_complaints');
      if (savedComplaints) {
        setComplaints(JSON.parse(savedComplaints));
      }
      const savedAppointments = await AsyncStorage.getItem('@dental_app_appointments');
      if (savedAppointments) {
        setAppointments(JSON.parse(savedAppointments));
      }
      const savedMessages = await AsyncStorage.getItem('@dental_app_messages');
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    } catch (e) {
      console.warn('Error loading storage data:', e);
    }
  };

  const initSupabase = () => {
    if (!isSupabaseConfigured) return;

    // Fetch Initial Remote Data (Settings, Services, Portfolio)
    fetchClinicSettings();
    fetchServices();
    fetchPortfolio();

    // Check existing auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsAuthenticated(true);
        fetchRemoteProfile(session.user.id);
        fetchRemoteUserData();
      }
    });

    // Listen to Auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        fetchRemoteProfile(session.user.id);
        fetchRemoteUserData();
      } else {
        setIsAuthenticated(false);
      }
    });

    // Setup Realtime Channels for Clinic Data
    const realtimeChannel = supabase
      .channel('clinic_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clinic_settings' },
        () => fetchClinicSettings()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'services' },
        () => fetchServices()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'portfolio_cases' },
        () => fetchPortfolio()
      )
      .subscribe();

    return () => {
      authListener?.subscription.unsubscribe();
      supabase.removeChannel(realtimeChannel);
    };
  };

  const fetchClinicSettings = async () => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('clinic_settings')
        .select('*')
        .eq('id', 'main')
        .single();

      if (data && !error) {
        const formatted: ClinicSettings = {
          id: data.id,
          doctorName: data.doctor_name,
          doctorTitle: data.doctor_title,
          doctorBio: data.doctor_bio,
          avatarUrl: data.avatar_url || '',
          coverImageUrl: data.cover_image_url || '',
          yearsExperience: data.years_experience,
          patientsCount: data.patients_count,
          rating: Number(data.rating),
          phoneNumber: data.phone_number,
          whatsappNumber: data.whatsapp_number,
          locationAddress: data.location_address,
          locationMapsUrl: data.location_maps_url,
          workingHours: data.working_hours,
        };
        setClinicSettings(formatted);
        AsyncStorage.setItem('@dental_app_clinic_settings', JSON.stringify(formatted));
      }
    } catch (err) {
      console.warn('Error fetching clinic settings:', err);
    }
  };

  const fetchServices = async () => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('sort_order', { ascending: true });

      if (data && !error && data.length > 0) {
        const formatted: DentalService[] = data.map((s) => ({
          id: s.id,
          nameAr: s.name_ar,
          nameEn: s.name_en,
          descriptionAr: s.description_ar,
          descriptionEn: s.description_en,
          durationMinutes: s.duration_minutes,
          estimatedPrice: s.price,
          iconName: s.icon_name || 'Sparkles',
          category: (s.category as any) || 'restoration',
        }));
        setServices(formatted);
        AsyncStorage.setItem('@dental_app_services', JSON.stringify(formatted));
      }
    } catch (err) {
      console.warn('Error fetching services:', err);
    }
  };

  const fetchPortfolio = async () => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('portfolio_cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && !error && data.length > 0) {
        const formatted: BeforeAfterCase[] = data.map((p) => ({
          id: p.id,
          titleAr: p.title_ar,
          titleEn: p.title_en,
          categoryAr: p.category_ar,
          categoryEn: p.category_en,
          descriptionAr: p.description_ar,
          descriptionEn: p.description_en,
          beforeImageUrl: p.before_image_url,
          afterImageUrl: p.after_image_url,
          durationWeeks: p.duration_weeks,
          createdAt: p.created_at,
        }));
        setPortfolioCases(formatted);
        AsyncStorage.setItem('@dental_app_portfolio', JSON.stringify(formatted));
      }
    } catch (err) {
      console.warn('Error fetching portfolio:', err);
    }
  };

  const fetchRemoteProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        setRoleState(data.role as UserRole);
        setCurrentUser((prev) => ({
          ...prev,
          id: data.id,
          fullName: data.full_name,
          phone: data.phone,
          role: data.role as UserRole,
          medicalHistory: {
            ...prev.medicalHistory,
            hasDiabetes: data.has_diabetes,
            hasHypertension: data.has_hypertension,
            hasPenicillinAllergy: data.has_penicillin_allergy,
          },
        }));
      }
    } catch (e) {
      console.warn('Fetch remote profile error:', e);
    }
  };

  const fetchRemoteUserData = async () => {
    if (!isSupabaseConfigured) return;
    try {
      // Fetch Consultations
      const { data: remoteComplaints, error: compErr } = await supabase
        .from('consultations')
        .select('*')
        .order('created_at', { ascending: false });

      if (remoteComplaints && !compErr) {
        const formatted: DentalComplaint[] = remoteComplaints.map((c) => ({
          id: c.id,
          patientId: c.patient_id,
          patientName: currentUser.fullName || 'مريض',
          patientPhone: currentUser.phone || '',
          selectedTeeth: c.affected_teeth || [],
          symptoms: c.symptoms || [],
          painLevel: c.pain_level || 5,
          description: c.description || '',
          photoUris: c.image_urls || [],
          xrayUris: [],
          medicalAlerts: c.medical_alerts || [],
          urgencyLevel: c.urgency_level || 'routine',
          status: c.status || 'pending',
          createdAt: c.created_at,
          diagnosis: c.diagnosis_text
            ? {
                diagnosedAt: c.diagnosed_at || c.created_at,
                doctorName: 'د. كريم أبو بكر',
                provisionalConditionAr: c.diagnosis_text,
                provisionalConditionEn: c.diagnosis_text,
                urgencyLevel: c.urgency_level || 'routine',
                firstAidInstructionsAr: c.first_aid_instructions || '',
                firstAidInstructionsEn: c.first_aid_instructions || '',
                recommendedMedicationsAr: c.recommended_medications || '',
                recommendedMedicationsEn: c.recommended_medications || '',
                suggestedServiceId: c.suggested_service_id || undefined,
                requireClinicVisit: true,
              }
            : undefined,
        }));
        setComplaints(formatted);
      } else {
        setComplaints([]);
      }

      // Fetch Appointments
      const { data: remoteAppointments, error: aptErr } = await supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false });

      if (remoteAppointments && !aptErr) {
        const formattedApts: Appointment[] = remoteAppointments.map((a) => ({
          id: a.id,
          patientId: a.patient_id,
          patientName: currentUser.fullName || 'مريض',
          patientPhone: currentUser.phone || '',
          serviceId: a.service_id,
          serviceNameAr: a.service_name || 'كشف واستشارة طبية',
          serviceNameEn: a.service_name || 'Dental Consultation',
          date: a.appointment_date,
          timeSlot: a.time_slot,
          status: a.status || 'confirmed',
          price: a.price || 0,
          complaintId: a.consultation_id || undefined,
          createdAt: a.created_at,
        }));
        setAppointments(formattedApts);
      } else {
        setAppointments([]);
      }

      // Fetch Chat Messages
      const { data: remoteMessages, error: msgErr } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (remoteMessages && !msgErr) {
        const formattedMsgs: ChatMessage[] = remoteMessages.map((m) => ({
          id: m.id,
          consultationId: m.consultation_id || 'general',
          senderId: m.sender_id,
          senderName: m.sender_name || (m.sender_role === 'doctor' ? 'د. كريم أبو بكر' : 'مريض'),
          senderRole: m.sender_role || 'patient',
          text: m.text || '',
          audioUri: m.audio_url || undefined,
          imageUri: m.image_url || undefined,
          timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));
        setMessages(formattedMsgs);
      } else {
        setMessages([]);
      }
    } catch (e) {
      console.warn('Error fetching remote user data:', e);
    }
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem('@dental_app_lang', lang);
    } catch (e) {
      console.warn('Error saving language:', e);
    }
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
  };

  const updateUserProfile = async (profileUpdate: Partial<UserProfile>) => {
    const updated = { ...currentUser, ...profileUpdate };
    setCurrentUser(updated);

    if (isSupabaseConfigured && isAuthenticated) {
      try {
        await supabase
          .from('profiles')
          .update({
            full_name: updated.fullName,
            phone: updated.phone,
            has_diabetes: updated.medicalHistory.hasDiabetes,
            has_hypertension: updated.medicalHistory.hasHypertension,
            has_penicillin_allergy: updated.medicalHistory.hasPenicillinAllergy,
          })
          .eq('id', currentUser.id);
      } catch (err) {
        console.warn('Supabase update profile error:', err);
      }
    }
  };

  const updateClinicSettings = async (settingsUpdate: Partial<ClinicSettings>) => {
    const updated = { ...clinicSettings, ...settingsUpdate };
    setClinicSettings(updated);
    await AsyncStorage.setItem('@dental_app_clinic_settings', JSON.stringify(updated));

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('clinic_settings')
          .update({
            doctor_name: updated.doctorName,
            doctor_title: updated.doctorTitle,
            doctor_bio: updated.doctorBio,
            avatar_url: updated.avatarUrl,
            cover_image_url: updated.coverImageUrl,
            years_experience: updated.yearsExperience,
            patients_count: updated.patientsCount,
            rating: updated.rating,
            phone_number: updated.phoneNumber,
            whatsapp_number: updated.whatsappNumber,
            location_address: updated.locationAddress,
            location_maps_url: updated.locationMapsUrl,
            working_hours: updated.workingHours,
            updated_at: new Date().toISOString(),
          })
          .eq('id', 'main');
      } catch (err) {
        console.warn('Supabase update clinic settings error:', err);
      }
    }
  };

  const addService = async (newService: Omit<DentalService, 'id'>): Promise<DentalService> => {
    const id = `srv_${Date.now()}`;
    const serviceWithId: DentalService = { ...newService, id };
    const updated = [...services, serviceWithId];
    setServices(updated);
    await AsyncStorage.setItem('@dental_app_services', JSON.stringify(updated));

    if (isSupabaseConfigured) {
      try {
        await supabase.from('services').insert({
          id,
          name_ar: newService.nameAr,
          name_en: newService.nameEn,
          description_ar: newService.descriptionAr,
          description_en: newService.descriptionEn,
          price: newService.estimatedPrice,
          duration_minutes: newService.durationMinutes,
          icon_name: newService.iconName,
          category: newService.category,
          is_active: true,
          sort_order: updated.length,
        });
      } catch (err) {
        console.warn('Supabase add service error:', err);
      }
    }

    return serviceWithId;
  };

  const updateService = async (service: DentalService) => {
    const updated = services.map((s) => (s.id === service.id ? service : s));
    setServices(updated);
    await AsyncStorage.setItem('@dental_app_services', JSON.stringify(updated));

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('services')
          .update({
            name_ar: service.nameAr,
            name_en: service.nameEn,
            description_ar: service.descriptionAr,
            description_en: service.descriptionEn,
            price: service.estimatedPrice,
            duration_minutes: service.durationMinutes,
            icon_name: service.iconName,
            category: service.category,
          })
          .eq('id', service.id);
      } catch (err) {
        console.warn('Supabase update service error:', err);
      }
    }
  };

  const deleteService = async (serviceId: string) => {
    const updated = services.filter((s) => s.id !== serviceId);
    setServices(updated);
    await AsyncStorage.setItem('@dental_app_services', JSON.stringify(updated));

    if (isSupabaseConfigured) {
      try {
        await supabase.from('services').delete().eq('id', serviceId);
      } catch (err) {
        console.warn('Supabase delete service error:', err);
      }
    }
  };

  const addPortfolioCase = async (
    caseItem: Omit<BeforeAfterCase, 'id'>
  ): Promise<BeforeAfterCase> => {
    const id = `case_${Date.now()}`;
    const newCase: BeforeAfterCase = { ...caseItem, id, createdAt: new Date().toISOString() };
    const updated = [newCase, ...portfolioCases];
    setPortfolioCases(updated);
    await AsyncStorage.setItem('@dental_app_portfolio', JSON.stringify(updated));

    if (isSupabaseConfigured) {
      try {
        await supabase.from('portfolio_cases').insert({
          id,
          title_ar: caseItem.titleAr,
          title_en: caseItem.titleEn,
          category_ar: caseItem.categoryAr,
          category_en: caseItem.categoryEn,
          description_ar: caseItem.descriptionAr,
          description_en: caseItem.descriptionEn,
          before_image_url: caseItem.beforeImageUrl,
          after_image_url: caseItem.afterImageUrl,
          duration_weeks: caseItem.durationWeeks || 2,
        });
      } catch (err) {
        console.warn('Supabase add portfolio case error:', err);
      }
    }

    return newCase;
  };

  const deletePortfolioCase = async (caseId: string) => {
    const updated = portfolioCases.filter((p) => p.id !== caseId);
    setPortfolioCases(updated);
    await AsyncStorage.setItem('@dental_app_portfolio', JSON.stringify(updated));

    if (isSupabaseConfigured) {
      try {
        await supabase.from('portfolio_cases').delete().eq('id', caseId);
      } catch (err) {
        console.warn('Supabase delete portfolio error:', err);
      }
    }
  };

  const addComplaint = async (
    complaintData: Omit<DentalComplaint, 'id' | 'createdAt' | 'status'>
  ): Promise<DentalComplaint> => {
    const newId = `comp_${Date.now()}`;
    const newComplaint: DentalComplaint = {
      ...complaintData,
      id: newId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const updated = [newComplaint, ...complaints];
    setComplaints(updated);
    await AsyncStorage.setItem('@dental_app_complaints', JSON.stringify(updated));
    return newComplaint;
  };

  const submitDiagnosis = async (complaintId: string, diagnosis: PreliminaryDiagnosis) => {
    const updated = complaints.map((c) => {
      if (c.id === complaintId) {
        return {
          ...c,
          status: 'diagnosed' as const,
          diagnosis,
        };
      }
      return c;
    });
    setComplaints(updated);
    await AsyncStorage.setItem('@dental_app_complaints', JSON.stringify(updated));

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('consultations')
          .update({
            status: 'diagnosed',
            diagnosis_text: diagnosis.provisionalConditionAr,
            first_aid_instructions: diagnosis.firstAidInstructionsAr,
            recommended_medications: diagnosis.recommendedMedicationsAr,
            suggested_service_id: diagnosis.suggestedServiceId || null,
            diagnosed_at: new Date().toISOString(),
          })
          .eq('id', complaintId);
      } catch (err) {
        console.warn('Supabase submit diagnosis error:', err);
      }
    }
  };

  const bookAppointment = async (
    appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'status'>
  ): Promise<Appointment> => {
    const newId = `apt_${Date.now()}`;
    const newAppointment: Appointment = {
      ...appointmentData,
      id: newId,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    const updated = [newAppointment, ...appointments];
    setAppointments(updated);
    await AsyncStorage.setItem('@dental_app_appointments', JSON.stringify(updated));
    return newAppointment;
  };

  const cancelAppointment = async (appointmentId: string) => {
    const updated = appointments.map((a) =>
      a.id === appointmentId ? { ...a, status: 'cancelled' as const } : a
    );
    setAppointments(updated);
    await AsyncStorage.setItem('@dental_app_appointments', JSON.stringify(updated));

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('appointments')
          .update({ status: 'cancelled' })
          .eq('id', appointmentId);
      } catch (err) {
        console.warn('Supabase cancel appointment error:', err);
      }
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
    setRoleState('patient');
    setCurrentUser(DEFAULT_PATIENT);
  };

  const sendMessage = async (
    consultationId: string,
    text: string,
    audioUri?: string,
    imageUri?: string
  ) => {
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      consultationId: consultationId || 'general',
      senderId: role === 'doctor' ? 'doctor' : currentUser.id,
      senderName: role === 'doctor' ? 'د. كريم أبو بكر' : currentUser.fullName,
      senderRole: role,
      text,
      audioUri,
      imageUri,
      timestamp: new Date().toISOString(),
    };
    const updated = [...messages, newMsg];
    setMessages(updated);
    await AsyncStorage.setItem('@dental_app_messages', JSON.stringify(updated));

    if (isSupabaseConfigured) {
      try {
        await supabase.from('messages').insert({
          consultation_id: consultationId || 'comp_01',
          sender_id: currentUser.id,
          sender_role: role,
          sender_name: role === 'doctor' ? 'د. كريم أبو بكر' : currentUser.fullName,
          text,
          image_url: imageUri || null,
          audio_url: audioUri || null,
        });
      } catch (err) {
        console.warn('Supabase send message error:', err);
      }
    }
  };

  const t = translations[language];
  const isRTL = language === 'ar';

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        role,
        setRole,
        currentUser,
        updateUserProfile,
        complaints,
        addComplaint,
        submitDiagnosis,
        appointments,
        bookAppointment,
        cancelAppointment,
        clinicSettings,
        updateClinicSettings,
        services,
        addService,
        updateService,
        deleteService,
        portfolioCases,
        addPortfolioCase,
        deletePortfolioCase,
        messages,
        sendMessage,
        signOut,
        isAuthenticated,
        t,
        isRTL,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
