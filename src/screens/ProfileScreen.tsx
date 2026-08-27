import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import {
  User,
  Globe,
  UserCheck,
  Shield,
  Phone,
  Heart,
  Save,
  LogOut,
  Info,
} from 'lucide-react-native';
import { Colors, Shadows } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { CLINIC_INFO } from '../constants/dentalData';

export const ProfileScreen: React.FC = () => {
  const {
    t,
    language,
    setLanguage,
    role,
    setRole,
    currentUser,
    updateUserProfile,
  } = useApp();

  const [fullName, setFullName] = useState(currentUser.fullName);
  const [phone, setPhone] = useState(currentUser.phone);
  const [hasDiabetes, setHasDiabetes] = useState(
    currentUser.medicalHistory.hasDiabetes
  );
  const [hasHypertension, setHasHypertension] = useState(
    currentUser.medicalHistory.hasHypertension
  );
  const [hasPenicillinAllergy, setHasPenicillinAllergy] = useState(
    currentUser.medicalHistory.hasPenicillinAllergy
  );

  const handleSave = () => {
    updateUserProfile({
      fullName,
      phone,
      medicalHistory: {
        ...currentUser.medicalHistory,
        hasDiabetes,
        hasHypertension,
        hasPenicillinAllergy,
      },
    });
    Alert.alert(
      language === 'ar' ? 'تم الحفظ' : 'Saved',
      language === 'ar'
        ? 'تم تحديث الملف الطبي بنجاح.'
        : 'Profile updated successfully.'
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Role & Mode Switch Card */}
      <View style={styles.roleCard}>
        <View style={styles.roleHeader}>
          <UserCheck size={20} color={Colors.secondary} />
          <Text style={styles.roleTitle}>
            {language === 'ar' ? 'نمط الواجهة الحالي:' : 'Current Role:'}
          </Text>
          <Text style={styles.roleBadge}>
            {role === 'patient' ? t.patientRole : t.doctorRole}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.switchRoleBtn}
          onPress={() => setRole(role === 'patient' ? 'doctor' : 'patient')}
        >
          <Text style={styles.switchRoleBtnText}>
            {role === 'patient' ? t.switchToDoctor : t.switchToPatient}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Language Setting Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Globe size={18} color={Colors.primary} />
          <Text style={styles.cardTitle}>
            {language === 'ar' ? 'لغة التطبيق (Language)' : 'App Language'}
          </Text>
        </View>

        <View style={styles.langRow}>
          <TouchableOpacity
            style={[styles.langChip, language === 'ar' && styles.langChipActive]}
            onPress={() => setLanguage('ar')}
          >
            <Text
              style={[
                styles.langChipText,
                language === 'ar' && styles.langChipTextActive,
              ]}
            >
              العربية (RTL)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langChip, language === 'en' && styles.langChipActive]}
            onPress={() => setLanguage('en')}
          >
            <Text
              style={[
                styles.langChipText,
                language === 'en' && styles.langChipTextActive,
              ]}
            >
              English (LTR)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Personal Info */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <User size={18} color={Colors.primary} />
          <Text style={styles.cardTitle}>
            {language === 'ar' ? 'البيانات الشخصية' : 'Personal Information'}
          </Text>
        </View>

        <Text style={styles.fieldLabel}>
          {language === 'ar' ? 'الاسم الكامل:' : 'Full Name:'}
        </Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          textAlign={language === 'ar' ? 'right' : 'left'}
        />

        <Text style={styles.fieldLabel}>
          {language === 'ar' ? 'رقم الهاتف:' : 'Phone Number:'}
        </Text>
        <TextInput
          style={[styles.input, { writingDirection: 'ltr' }]}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          textAlign={language === 'ar' ? 'right' : 'left'}
        />
      </View>

      {/* Health History Switches */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Heart size={18} color={Colors.emergency} />
          <Text style={styles.cardTitle}>
            {language === 'ar'
              ? 'التاريخ الطبي للأمراض المزمنة'
              : 'Medical Health Background'}
          </Text>
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{t.diabetes}</Text>
          <Switch
            value={hasDiabetes}
            onValueChange={setHasDiabetes}
            trackColor={{ false: Colors.border, true: Colors.primary }}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{t.hypertension}</Text>
          <Switch
            value={hasHypertension}
            onValueChange={setHasHypertension}
            trackColor={{ false: Colors.border, true: Colors.primary }}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{t.penicillinAllergy}</Text>
          <Switch
            value={hasPenicillinAllergy}
            onValueChange={setHasPenicillinAllergy}
            trackColor={{ false: Colors.border, true: Colors.emergency }}
          />
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Save size={18} color={Colors.white} />
        <Text style={styles.saveBtnText}>{t.save}</Text>
      </TouchableOpacity>

      {/* Account / Cloud Auth Action */}
      <TouchableOpacity
        style={styles.authActionBtn}
        onPress={() => (navigation ? navigation.navigate('Auth') : setRole(role === 'patient' ? 'doctor' : 'patient'))}
      >
        <LogOut size={18} color={Colors.emergency} />
        <Text style={styles.authActionBtnText}>
          {language === 'ar' ? 'تبديل الحساب / تسجيل الدخول (Supabase Auth)' : 'Switch Account / Sign In'}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  roleCard: {
    backgroundColor: Colors.secondaryLight,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.secondary,
    marginBottom: 14,
    ...Shadows.sm,
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  roleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.secondary,
  },
  roleBadge: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  switchRoleBtn: {
    backgroundColor: Colors.secondary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  switchRoleBtnText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  langRow: {
    flexDirection: 'row',
    gap: 10,
  },
  langChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  langChipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  langChipText: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  langChipTextActive: {
    color: Colors.primaryDark,
    fontWeight: '800',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 4,
    marginTop: 4,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  switchLabel: {
    fontSize: 13,
    color: Colors.textPrimary,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
    ...Shadows.sm,
    marginBottom: 10,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.white,
  },
  authActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#fca5a5',
    borderRadius: 14,
    paddingVertical: 12,
    gap: 8,
    marginTop: 6,
  },
  authActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.emergency,
  },
});
