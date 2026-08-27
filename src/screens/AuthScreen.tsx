import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Stethoscope,
  User,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Globe,
  ArrowRight,
  Sparkles,
} from 'lucide-react-native';
import { Colors, Shadows } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { UserRole } from '../types';

interface AuthScreenProps {
  navigation?: any;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ navigation }) => {
  const { language, setLanguage, setRole, updateUserProfile, t, isRTL } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle Sign In
  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        language === 'ar' ? 'تنبيه' : 'Notice',
        language === 'ar'
          ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور'
          : 'Please enter your email and password'
      );
      return;
    }

    setLoading(true);

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        setLoading(false);
        Alert.alert(language === 'ar' ? 'خطأ' : 'Error', error.message);
        return;
      }

      if (data.user) {
        // Fetch user profile from Supabase
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          setRole(profile.role as UserRole);
          updateUserProfile({
            id: profile.id,
            fullName: profile.full_name,
            phone: profile.phone,
            medicalHistory: {
              hasDiabetes: profile.has_diabetes,
              hasHypertension: profile.has_hypertension,
              hasPenicillinAllergy: profile.has_penicillin_allergy,
            },
          });
        }
      }
    } else {
      // Local development simulation
      setTimeout(() => {
        setLoading(false);
        if (email.includes('doctor')) {
          setRole('doctor');
        } else {
          setRole('patient');
        }
      }, 500);
      return;
    }

    setLoading(false);
  };

  // Handle Sign Up
  const handleSignUp = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert(
        language === 'ar' ? 'تنبيه' : 'Notice',
        language === 'ar'
          ? 'يرجى إدخال الاسم، البريد الإلكتروني وكلمة المرور'
          : 'Please fill in name, email and password'
      );
      return;
    }

    setLoading(true);

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
            role: selectedRole,
          },
        },
      });

      if (error) {
        setLoading(false);
        Alert.alert(language === 'ar' ? 'خطأ' : 'Error', error.message);
        return;
      }

      if (data.user) {
        // Insert into public.profiles
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName.trim(),
          phone: phone.trim(),
          role: selectedRole,
          has_diabetes: false,
          has_hypertension: false,
          has_penicillin_allergy: false,
        });

        setRole(selectedRole);
        updateUserProfile({
          id: data.user.id,
          fullName: fullName.trim(),
          phone: phone.trim(),
        });
      }
    } else {
      // Offline fallback
      setTimeout(() => {
        setLoading(false);
        setRole(selectedRole);
        updateUserProfile({
          id: `user_${Date.now()}`,
          fullName: fullName.trim(),
          phone: phone.trim(),
        });
      }, 500);
      return;
    }

    setLoading(false);
  };

  // Instant Guest Mode Entry
  const handleGuestMode = (guestRole: UserRole) => {
    setRole(guestRole);
    updateUserProfile({
      id: `guest_${guestRole}_${Date.now()}`,
      fullName: guestRole === 'doctor' ? 'د. كريم أبو بكر' : 'مريض زائر (Guest Patient)',
      phone: '+20 100 000 0000',
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Language Toggle */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.langBtn}
            onPress={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          >
            <Globe size={14} color={Colors.primaryDark} />
            <Text style={styles.langBtnText}>
              {language === 'ar' ? 'English' : 'عربي'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Clinic Branding Header */}
        <View style={styles.brandingHeader}>
          <Image
            source={require('../../assets/doctor_clinic.jpg')}
            style={styles.logoAvatar}
          />
          <Text style={styles.appTitle}>{t.appTitle}</Text>
          <Text style={styles.tagline}>{t.tagline}</Text>
        </View>

        {/* Mode Switcher Tabs */}
        <View style={styles.authCard}>
          <View style={styles.tabSwitchContainer}>
            <TouchableOpacity
              style={[
                styles.tabBtn,
                mode === 'signin' && styles.tabBtnActive,
              ]}
              onPress={() => setMode('signin')}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  mode === 'signin' && styles.tabBtnTextActive,
                ]}
              >
                {t.signIn}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabBtn,
                mode === 'signup' && styles.tabBtnActive,
              ]}
              onPress={() => setMode('signup')}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  mode === 'signup' && styles.tabBtnTextActive,
                ]}
              >
                {t.signUp}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          {mode === 'signup' && (
            <>
              {/* Role Selection */}
              <Text style={styles.fieldLabel}>{t.chooseRole}</Text>
              <View style={styles.rolePickerRow}>
                <TouchableOpacity
                  style={[
                    styles.roleChip,
                    selectedRole === 'patient' && styles.roleChipActive,
                  ]}
                  onPress={() => setSelectedRole('patient')}
                >
                  <User
                    size={16}
                    color={
                      selectedRole === 'patient'
                        ? Colors.primary
                        : Colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.roleChipText,
                      selectedRole === 'patient' && styles.roleChipTextActive,
                    ]}
                  >
                    {t.iAmPatient}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleChip,
                    selectedRole === 'doctor' && styles.roleChipActive,
                  ]}
                  onPress={() => setSelectedRole('doctor')}
                >
                  <Stethoscope
                    size={16}
                    color={
                      selectedRole === 'doctor'
                        ? Colors.primary
                        : Colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.roleChipText,
                      selectedRole === 'doctor' && styles.roleChipTextActive,
                    ]}
                  >
                    {t.iAmDoctor}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Full Name */}
              <Text style={styles.fieldLabel}>{t.fullNamePlaceholder}:</Text>
              <View style={styles.inputBox}>
                <User size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder={
                    selectedRole === 'doctor' ? 'د. كريم أبو بكر' : 'أحمد محمود'
                  }
                  value={fullName}
                  onChangeText={setFullName}
                  textAlign={isRTL ? 'right' : 'left'}
                />
              </View>

              {/* Phone */}
              <Text style={styles.fieldLabel}>{t.phonePlaceholder}:</Text>
              <View style={styles.inputBox}>
                <Phone size={18} color={Colors.textMuted} />
                <TextInput
                  style={[styles.input, { writingDirection: 'ltr' }]}
                  placeholder="+20 111 234 5678"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  textAlign={isRTL ? 'right' : 'left'}
                />
              </View>
            </>
          )}

          {/* Email */}
          <Text style={styles.fieldLabel}>{t.emailPlaceholder}:</Text>
          <View style={styles.inputBox}>
            <Mail size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="example@dental.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>

          {/* Password */}
          <Text style={styles.fieldLabel}>{t.passwordPlaceholder}:</Text>
          <View style={styles.inputBox}>
            <Lock size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>

          {/* Submit Auth Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={mode === 'signin' ? handleSignIn : handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.submitBtnText}>
                {mode === 'signin' ? t.signIn : t.signUp}
              </Text>
            )}
          </TouchableOpacity>

          {/* Switch Mode Prompt */}
          <TouchableOpacity
            style={styles.switchModePrompt}
            onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          >
            <Text style={styles.switchModeText}>
              {mode === 'signin' ? t.dontHaveAccount : t.alreadyHaveAccount}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Guest Mode Card */}
        <View style={styles.guestCard}>
          <Text style={styles.guestTitle}>
            {language === 'ar' ? '⚡ تجربة فورية بدون تسجيل:' : '⚡ Quick Instant Preview:'}
          </Text>
          <View style={styles.guestBtnRow}>
            <TouchableOpacity
              style={styles.guestBtnPatient}
              onPress={() => handleGuestMode('patient')}
            >
              <User size={16} color={Colors.white} />
              <Text style={styles.guestBtnText}>
                {language === 'ar' ? 'دخول كمريض' : 'Patient View'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guestBtnDoctor}
              onPress={() => handleGuestMode('doctor')}
            >
              <Stethoscope size={16} color={Colors.white} />
              <Text style={styles.guestBtnText}>
                {language === 'ar' ? 'دخول كطبيب' : 'Doctor View'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  langBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  brandingHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: Colors.primary,
    marginBottom: 10,
    ...Shadows.md,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
  authCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.md,
    marginBottom: 16,
  },
  tabSwitchContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: Colors.white,
    ...Shadows.sm,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tabBtnTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
    marginTop: 4,
  },
  rolePickerRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  roleChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: '#f8fafc',
  },
  roleChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  roleChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  roleChipTextActive: {
    color: Colors.primaryDark,
    fontWeight: '800',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    marginBottom: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    ...Shadows.sm,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.white,
  },
  switchModePrompt: {
    marginTop: 14,
    alignItems: 'center',
  },
  switchModeText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700',
  },
  guestCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  guestTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  guestBtnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  guestBtnPatient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
  },
  guestBtnDoctor: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    paddingVertical: 10,
  },
  guestBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.white,
  },
});
