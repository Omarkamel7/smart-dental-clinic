import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Image,
} from 'react-native';
import {
  Stethoscope,
  Calendar,
  Phone,
  MessageSquare,
  MapPin,
  Star,
  Award,
  Users,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Globe,
  UserCheck,
} from 'lucide-react-native';
import { Colors, Shadows } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { CLINIC_INFO, DEFAULT_SERVICES } from '../constants/dentalData';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { language, setLanguage, role, setRole, t, isRTL, beforeAfterCases } = useApp();

  const handleCall = () => {
    Linking.openURL(`tel:${CLINIC_INFO.phone}`).catch(console.warn);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      language === 'ar'
        ? 'مرحباً د. كريم، أود الاستفسار بخصوص استشارة بالعيادة.'
        : 'Hello Dr. Karim, I would like to inquire about a clinic consultation.'
    );
    Linking.openURL(`https://wa.me/${CLINIC_INFO.whatsapp}?text=${text}`).catch(console.warn);
  };

  const handleMap = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${CLINIC_INFO.mapLatitude},${CLINIC_INFO.mapLongitude}`;
    Linking.openURL(url).catch(console.warn);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Header & Role/Language Switcher Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.langButton}
          onPress={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
        >
          <Globe size={14} color={Colors.primaryDark} />
          <Text style={styles.langButtonText}>
            {language === 'ar' ? 'English' : 'عربي'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.roleButton}
          onPress={() => setRole(role === 'patient' ? 'doctor' : 'patient')}
        >
          <UserCheck size={14} color={Colors.secondary} />
          <Text style={styles.roleButtonText}>
            {role === 'patient' ? t.switchToDoctor : t.switchToPatient}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Doctor Hero Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroHeaderCentered}>
          <View style={styles.doctorAvatarContainer}>
            <Image
              source={require('../../assets/doctor_clinic.jpg')}
              style={styles.doctorAvatar}
              resizeMode="cover"
            />
            <View style={styles.verifiedBadge}>
              <ShieldCheck size={14} color={Colors.white} />
            </View>
          </View>

          <View style={styles.heroTextContainerCentered}>
            <Text style={styles.doctorName}>
              {language === 'ar' ? CLINIC_INFO.doctorNameAr : CLINIC_INFO.doctorNameEn}
            </Text>
            <Text style={styles.doctorTitle}>
              {language === 'ar' ? CLINIC_INFO.doctorTitleAr : CLINIC_INFO.doctorTitleEn}
            </Text>
            <View style={styles.ratingPill}>
              <Star size={14} color="#eab308" fill="#eab308" />
              <Text style={styles.ratingText}>{CLINIC_INFO.rating}</Text>
              <Text style={styles.reviewCount}>({CLINIC_INFO.reviewCount}+ مريض)</Text>
            </View>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Award size={18} color={Colors.primary} />
            <Text style={styles.statNumber}>+12</Text>
            <Text style={styles.statLabel}>{t.yearsExperience}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Users size={18} color={Colors.secondary} />
            <Text style={styles.statNumber}>+5000</Text>
            <Text style={styles.statLabel}>{t.satisfiedPatients}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Sparkles size={18} color="#eab308" />
            <Text style={styles.statNumber}>4.9/5</Text>
            <Text style={styles.statLabel}>{t.ratingScore}</Text>
          </View>
        </View>
      </View>

      {/* Main Action Banners */}
      <View style={styles.actionsSection}>
        {/* 1. Request Preliminary Diagnosis (Triage) */}
        <TouchableOpacity
          style={styles.primaryActionCard}
          onPress={() => navigation.navigate('ComplaintIntake')}
          activeOpacity={0.85}
        >
          <View style={styles.actionIconBubble}>
            <Stethoscope size={28} color={Colors.white} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>{t.startConsultation}</Text>
            <Text style={styles.actionSubtitle}>{t.startConsultationSub}</Text>
          </View>
          <View style={styles.actionArrow}>
            <ChevronRight
              size={20}
              color={Colors.primary}
              style={{ transform: [{ rotate: isRTL ? '180deg' : '0deg' }] }}
            />
          </View>
        </TouchableOpacity>

        {/* 2. Book Appointment */}
        <TouchableOpacity
          style={styles.secondaryActionCard}
          onPress={() => navigation.navigate('Appointments')}
          activeOpacity={0.85}
        >
          <View style={styles.actionIconBubbleTeal}>
            <Calendar size={26} color={Colors.white} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitleTeal}>{t.bookAppointment}</Text>
            <Text style={styles.actionSubtitle}>{t.bookAppointmentSub}</Text>
          </View>
          <View style={styles.actionArrow}>
            <ChevronRight
              size={20}
              color={Colors.secondary}
              style={{ transform: [{ rotate: isRTL ? '180deg' : '0deg' }] }}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Direct Clinic Contact Buttons */}
      <View style={styles.contactBar}>
        <TouchableOpacity onPress={handleCall} style={styles.contactBtnPhone}>
          <Phone size={18} color={Colors.white} />
          <Text style={styles.contactBtnTextWhite}>{t.callNow}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleWhatsApp} style={styles.contactBtnWhatsapp}>
          <MessageSquare size={18} color={Colors.white} />
          <Text style={styles.contactBtnTextWhite}>{t.chatWhatsapp}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleMap} style={styles.contactBtnMap}>
          <MapPin size={18} color={Colors.primaryDark} />
          <Text style={styles.contactBtnTextDark}>
            {language === 'ar' ? 'الخريطة' : 'Map'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Dental Services Grid */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t.ourServices}</Text>
      </View>

      <View style={styles.servicesGrid}>
        {DEFAULT_SERVICES.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={styles.serviceCard}
            onPress={() =>
              navigation.navigate('Appointments', { selectedServiceId: service.id })
            }
          >
            <View style={styles.serviceIconContainer}>
              <Sparkles size={20} color={Colors.primary} />
            </View>
            <Text style={styles.serviceName}>
              {language === 'ar' ? service.nameAr : service.nameEn}
            </Text>
            <Text style={styles.serviceDesc} numberOfLines={2}>
              {language === 'ar' ? service.descriptionAr : service.descriptionEn}
            </Text>
            <View style={styles.serviceFooter}>
              <Text style={styles.servicePrice}>
                {service.estimatedPrice} {t.egp}
              </Text>
              <Text style={styles.serviceDuration}>
                {service.durationMinutes} {t.minutes}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Smile Makeover Before & After Gallery */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t.smileGallery}</Text>
      </View>

      <View style={styles.galleryContainer}>
        {beforeAfterCases.map((item) => (
          <BeforeAfterSlider key={item.id} item={item} />
        ))}
      </View>

      {/* About Dr. Karim Section with Full-Frame Formal Photo */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {language === 'ar' ? 'عن د. كريم أبو بكر' : 'About Dr. Karim Abo Bakr'}
        </Text>
      </View>

      <View style={styles.doctorBioCard}>
        <View style={styles.doctorBioImageContainer}>
          <Image
            source={require('../../assets/doctor_formal.jpg')}
            style={styles.doctorBioImage}
            resizeMode="cover"
          />
          <View style={styles.doctorBioVerifiedBadge}>
            <ShieldCheck size={14} color={Colors.white} />
          </View>
        </View>

        <View style={styles.doctorBioOverlay}>
          <Text style={styles.doctorBioName}>
            {language === 'ar' ? 'د. كريم أبو بكر' : 'Dr. Karim Abo Bakr'}
          </Text>
          <View style={styles.doctorBioDegreeBadge}>
            <Text style={styles.doctorBioDegree}>
              {language === 'ar'
                ? 'استشاري طب وجراحة وتجميل وزراعة الأسنان'
                : 'Consultant in Dental Surgery, Cosmetics & Implants'}
            </Text>
          </View>
          <Text style={styles.doctorBioDesc}>
            {language === 'ar'
              ? 'تقديم أحدث الحلول العلاجية والتجميلية وزراعة الأسنان بأعلى معايير التعقيم العالمية وأحدث التقنيات الرقمية المتقدمة.'
              : 'Dedicated to delivering state-of-the-art cosmetic dentistry, dental implants, and advanced clinical care with international sterilization standards.'}
          </Text>
        </View>
      </View>

      {/* Clinic Info Card */}
      <View style={styles.clinicInfoCard}>
        <Text style={styles.clinicName}>
          {language === 'ar' ? CLINIC_INFO.nameAr : CLINIC_INFO.nameEn}
        </Text>
        <View style={styles.infoRow}>
          <MapPin size={16} color={Colors.primary} />
          <Text style={styles.infoText}>
            {language === 'ar' ? CLINIC_INFO.addressAr : CLINIC_INFO.addressEn}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Calendar size={16} color={Colors.secondary} />
          <Text style={styles.infoText}>
            {language === 'ar' ? CLINIC_INFO.workingDaysAr : CLINIC_INFO.workingDaysEn} (
            {language === 'ar' ? CLINIC_INFO.workingHoursAr : CLINIC_INFO.workingHoursEn})
          </Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  langButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  roleButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
  },
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.md,
    marginBottom: 16,
  },
  heroHeaderCentered: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  doctorAvatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  doctorAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3.5,
    borderColor: Colors.primary,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 3,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  heroTextContainerCentered: {
    alignItems: 'center',
    width: '100%',
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 2,
    textAlign: 'center',
  },
  doctorTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fef9c3',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fde047',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#854d0e',
  },
  reviewCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#854d0e',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },
  actionsSection: {
    gap: 12,
    marginBottom: 16,
  },
  primaryActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    ...Shadows.sm,
  },
  secondaryActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondaryLight,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.secondary,
    ...Shadows.sm,
  },
  actionIconBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIconBubbleTeal: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
    marginHorizontal: 12,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primaryDark,
    marginBottom: 2,
  },
  actionTitleTeal: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.secondary,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  actionArrow: {
    padding: 4,
  },
  contactBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  contactBtnPhone: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  contactBtnWhatsapp: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  contactBtnMap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 6,
  },
  contactBtnTextWhite: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  contactBtnTextDark: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  serviceCard: {
    width: '48.5%',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  serviceIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  serviceDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
    marginBottom: 8,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 6,
  },
  servicePrice: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  serviceDuration: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  galleryContainer: {
    marginBottom: 20,
  },
  doctorBioCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
    ...Shadows.md,
  },
  doctorBioImageContainer: {
    position: 'relative',
    width: '100%',
    height: 290,
    backgroundColor: '#0f172a',
  },
  doctorBioImage: {
    width: '100%',
    height: '100%',
  },
  doctorBioVerifiedBadge: {
    position: 'absolute',
    bottom: 12,
    right: 14,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 5,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  doctorBioOverlay: {
    alignItems: 'center',
    width: '100%',
    padding: 18,
  },
  doctorBioName: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  doctorBioDegreeBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  doctorBioDegree: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primaryDark,
    textAlign: 'center',
  },
  doctorBioDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
  },
  clinicInfoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
    ...Shadows.sm,
  },
  clinicName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
});
