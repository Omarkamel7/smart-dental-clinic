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
} from '../types';
import { translations } from '../constants/translations';
import { INITIAL_BEFORE_AFTER_CASES } from '../constants/dentalData';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  complaints: DentalComplaint[];
  addComplaint: (complaint: Omit<DentalComplaint, 'id' | 'createdAt' | 'status'>) => Promise<DentalComplaint>;
  submitDiagnosis: (complaintId: string, diagnosis: PreliminaryDiagnosis) => void;
  appointments: Appointment[];
  bookAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => Promise<Appointment>;
  cancelAppointment: (appointmentId: string) => void;
  beforeAfterCases: BeforeAfterCase[];
  messages: ChatMessage[];
  sendMessage: (consultationId: string, text: string, audioUri?: string, imageUri?: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  t: typeof translations.ar;
  isRTL: boolean;
}

const DEFAULT_PATIENT: UserProfile = {
  id: 'patient_01',
  fullName: 'أحمد محمود سليمان',
  phone: '+20 111 234 5678',
  email: 'ahmed.m@example.com',
  role: 'patient',
  gender: 'male',
  age: 32,
  medicalHistory: {
    hasDiabetes: false,
    hasHypertension: false,
    hasHeartDisease: false,
    hasBleedingDisorder: false,
    hasPenicillinAllergy: false,
    isPregnant: false,
    otherAllergies: 'لا يوجد',
    notes: '',
  },
};

const INITIAL_COMPLAINTS: DentalComplaint[] = [
  {
    id: 'comp_01',
    patientId: 'patient_01',
    patientName: 'أحمد محمود سليمان',
    patientPhone: '+20 111 234 5678',
    selectedTeeth: [16],
    symptoms: ['throbbing_pain', 'cold_sensitivity', 'night_pain'],
    painLevel: 8,
    description: 'ألم حاد ومفاجئ في الضرس العلوي الأيمن، يزداد جداً مع الماء البارد ويصحيني من النوم.',
    photoUris: ['https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=500&q=80'],
    xrayUris: [],
    medicalAlerts: [],
    urgencyLevel: 'urgent',
    status: 'diagnosed',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    diagnosis: {
      diagnosedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      doctorName: 'د. كريم أبو بكر',
      provisionalConditionAr: 'التهاب عصب حاد في الضرس الأول العلوي الأيمن (Acute Irreversible Pulpitis)',
      provisionalConditionEn: 'Acute Irreversible Pulpitis in Tooth #16',
      urgencyLevel: 'urgent',
      firstAidInstructionsAr: 'تجنب المشروبات الباردة والساخنة تماماً، والمضغ على الجانب الأيسر. يوصى بأخذ كيتولاك أو بروفين 400 بعد الأكل لتسكين الألم مؤقتاً.',
      firstAidInstructionsEn: 'Avoid cold/hot stimuli and chew on the opposite side. Take Ibuprofen 400mg after meals for temporary relief.',
      recommendedMedicationsAr: 'مسكن ألم ومضاد للالتهاب (Ibuprofen 400mg) بعد الوجبات عند اللزوم',
      recommendedMedicationsEn: 'Ibuprofen 400mg after meals as needed',
      suggestedServiceId: 'root_canal',
      requireClinicVisit: true,
    },
  },
  {
    id: 'comp_02',
    patientId: 'patient_02',
    patientName: 'سارة خالد',
    patientPhone: '+20 102 987 6543',
    selectedTeeth: [21, 22],
    symptoms: ['broken_tooth'],
    painLevel: 3,
    description: 'انكسر طرف السن الأمامي أثناء تناول طعام صلب ولكن بدون ألم كبير.',
    photoUris: ['https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=500&q=80'],
    xrayUris: [],
    medicalAlerts: [],
    urgencyLevel: 'moderate',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt_01',
    patientId: 'patient_01',
    patientName: 'أحمد محمود سليمان',
    patientPhone: '+20 111 234 5678',
    serviceId: 'root_canal',
    serviceNameAr: 'علاج وجذور وأعصاب (علاج عصب)',
    serviceNameEn: 'Root Canal Treatment',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    timeSlot: '18:00 - 18:45',
    status: 'confirmed',
    price: 900,
    complaintId: 'comp_01',
    doctorNotes: 'جلسة أولى لفتح السن وسحب العصب',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_01',
    consultationId: 'comp_01',
    senderId: 'doctor',
    senderName: 'د. كريم أبو بكر',
    senderRole: 'doctor',
    text: 'أهلاً بك يا أستاذ أحمد. اطلعت على الصورة ووصف الألم، الحالة تشير لالتهاب عصب بالضرس 16. وضعت لك تعليمات التسكين وحجزنا موعد عاجل لفحص السن.',
    timestamp: new Date(Date.now() - 3600000 * 17).toISOString(),
  },
  {
    id: 'msg_02',
    consultationId: 'comp_01',
    senderId: 'patient_01',
    senderName: 'أحمد محمود سليمان',
    senderRole: 'patient',
    text: 'شكراً جداً يا دكتور، هل أستطيع أخذ مسكن قبل الجلسة؟',
    timestamp: new Date(Date.now() - 3600000 * 16).toISOString(),
  },
  {
    id: 'msg_03',
    consultationId: 'comp_01',
    senderId: 'doctor',
    senderName: 'د. كريم أبو بكر',
    senderRole: 'doctor',
    text: 'نعم بالتأكيد، مسكن بروفين 400 مناسب تماماً بعد الأكل حتى موعدنا.',
    timestamp: new Date(Date.now() - 3600000 * 15).toISOString(),
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('ar');
  const [role, setRoleState] = useState<UserRole>('patient');
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_PATIENT);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Defaults to true for seamless local/guest usage
  const [complaints, setComplaints] = useState<DentalComplaint[]>(INITIAL_COMPLAINTS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [beforeAfterCases] = useState<BeforeAfterCase[]>(INITIAL_BEFORE_AFTER_CASES);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);

  useEffect(() => {
    loadSavedData();
    initSupabaseAuth();
  }, []);

  const loadSavedData = async () => {
    try {
      const savedLang = await AsyncStorage.getItem('@dental_app_lang');
      if (savedLang === 'ar' || savedLang === 'en') {
        setLanguageState(savedLang);
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

  const initSupabaseAuth = () => {
    if (!isSupabaseConfigured) return;

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsAuthenticated(true);
        fetchRemoteProfile(session.user.id);
        fetchRemoteData();
      }
    });

    // Listen to Auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        fetchRemoteProfile(session.user.id);
        fetchRemoteData();
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
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

  const fetchRemoteData = async () => {
    if (!isSupabaseConfigured) return;
    try {
      // Fetch Consultations
      const { data: remoteComplaints } = await supabase
        .from('consultations')
        .select('*')
        .order('created_at', { ascending: false });

      if (remoteComplaints && remoteComplaints.length > 0) {
        const mapped: DentalComplaint[] = remoteComplaints.map((c) => ({
          id: c.id,
          patientId: c.patient_id,
          patientName: 'مريض',
          patientPhone: '',
          selectedTeeth: c.affected_teeth || [],
          symptoms: c.symptoms || [],
          painLevel: c.pain_level || 5,
          description: c.description || '',
          photoUris: c.image_urls || [],
          xrayUris: [],
          audioNoteUri: c.audio_url || undefined,
          medicalAlerts: c.medical_alerts || [],
          urgencyLevel: (c.urgency_level as any) || 'moderate',
          status: (c.status as any) || 'pending',
          createdAt: c.created_at,
          diagnosis: c.diagnosis_text
            ? {
                diagnosedAt: c.diagnosed_at || c.created_at,
                doctorName: 'د. كريم أبو بكر',
                provisionalConditionAr: c.diagnosis_text,
                provisionalConditionEn: c.diagnosis_text,
                urgencyLevel: (c.urgency_level as any) || 'urgent',
                firstAidInstructionsAr: c.first_aid_instructions || '',
                firstAidInstructionsEn: c.first_aid_instructions || '',
                recommendedMedicationsAr: c.recommended_medications || '',
                recommendedMedicationsEn: c.recommended_medications || '',
                suggestedServiceId: c.suggested_service_id || 'general',
              }
            : undefined,
        }));
        setComplaints(mapped);
      }

      // Fetch Messages
      const { data: remoteMessages } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (remoteMessages && remoteMessages.length > 0) {
        const mappedMsgs: ChatMessage[] = remoteMessages.map((m) => ({
          id: m.id,
          consultationId: m.consultation_id,
          senderId: m.sender_id,
          senderName: m.sender_name,
          senderRole: m.sender_role as UserRole,
          text: m.text,
          imageUri: m.image_url || undefined,
          audioUri: m.audio_url || undefined,
          timestamp: m.created_at,
        }));
        setMessages(mappedMsgs);
      }
    } catch (e) {
      console.warn('Fetch remote data error:', e);
    }
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    AsyncStorage.setItem('@dental_app_lang', lang).catch(console.warn);
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
  };

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setCurrentUser((prev) => ({ ...prev, ...profile }));
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
  };

  const addComplaint = async (
    data: Omit<DentalComplaint, 'id' | 'createdAt' | 'status'>
  ): Promise<DentalComplaint> => {
    const newComplaint: DentalComplaint = {
      ...data,
      id: `comp_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    const updated = [newComplaint, ...complaints];
    setComplaints(updated);
    await AsyncStorage.setItem('@dental_app_complaints', JSON.stringify(updated));

    // Sync to Supabase if connected
    if (isSupabaseConfigured) {
      try {
        await supabase.from('consultations').insert({
          patient_id: currentUser.id,
          affected_teeth: data.selectedTeeth,
          symptoms: data.symptoms,
          pain_level: data.painLevel,
          description: data.description,
          image_urls: data.photoUris,
          audio_url: data.audioNoteUri || null,
          medical_alerts: data.medicalAlerts,
          urgencyLevel: data.urgencyLevel,
          status: 'pending',
        } as any);
      } catch (err) {
        console.warn('Supabase add consultation error:', err);
      }
    }

    return newComplaint;
  };

  const submitDiagnosis = async (complaintId: string, diagnosis: PreliminaryDiagnosis) => {
    const updated = complaints.map((c) => {
      if (c.id === complaintId) {
        return {
          ...c,
          status: 'diagnosed' as const,
          urgencyLevel: diagnosis.urgencyLevel,
          diagnosis,
        };
      }
      return c;
    });
    setComplaints(updated);
    await AsyncStorage.setItem('@dental_app_complaints', JSON.stringify(updated));

    // Sync to Supabase if connected
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('consultations')
          .update({
            status: 'diagnosed',
            diagnosis_text: diagnosis.provisionalConditionAr,
            first_aid_instructions: diagnosis.firstAidInstructionsAr,
            recommended_medications: diagnosis.recommendedMedicationsAr,
            suggested_service_id: diagnosis.suggestedServiceId,
            diagnosed_at: new Date().toISOString(),
          } as any)
          .eq('id', complaintId);
      } catch (err) {
        console.warn('Supabase diagnosis update error:', err);
      }
    }
  };

  const bookAppointment = async (
    data: Omit<Appointment, 'id' | 'createdAt' | 'status'>
  ): Promise<Appointment> => {
    const newApt: Appointment = {
      ...data,
      id: `apt_${Date.now()}`,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };
    const updated = [newApt, ...appointments];
    setAppointments(updated);
    await AsyncStorage.setItem('@dental_app_appointments', JSON.stringify(updated));

    if (data.complaintId) {
      setComplaints((prev) =>
        prev.map((c) =>
          c.id === data.complaintId ? { ...c, status: 'appointment_booked' as const } : c
        )
      );
    }

    // Sync to Supabase if connected
    if (isSupabaseConfigured) {
      try {
        await supabase.from('appointments').insert({
          patient_id: currentUser.id,
          consultation_id: data.complaintId || null,
          service_id: data.serviceId,
          service_name: data.serviceNameAr,
          appointment_date: data.date,
          time_slot: data.timeSlot,
          price: data.price,
          status: 'confirmed',
        });
      } catch (err) {
        console.warn('Supabase appointment booking error:', err);
      }
    }

    return newApt;
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
        console.warn('Supabase appointment cancel error:', err);
      }
    }
  };

  const sendMessage = async (
    consultationId: string,
    text: string,
    audioUri?: string,
    imageUri?: string
  ) => {
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
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
    try {
      await AsyncStorage.setItem('@dental_app_messages', JSON.stringify(updated));
    } catch (e) {
      console.warn('Error saving message:', e);
    }

    // Sync to Supabase if connected
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
        beforeAfterCases,
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
