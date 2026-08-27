import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import {
  Stethoscope,
  Clock,
  AlertCircle,
  CheckCircle,
  Calendar,
  ChevronRight,
  ShieldAlert,
  Users,
  Activity,
  MessageCircle,
} from 'lucide-react-native';
import { Colors, Shadows } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { FDI_TEETH } from '../constants/dentalData';

interface DoctorDashboardScreenProps {
  navigation: any;
}

export const DoctorDashboardScreen: React.FC<DoctorDashboardScreenProps> = ({
  navigation,
}) => {
  const { t, language, complaints, appointments, isRTL } = useApp();

  const pendingComplaints = complaints.filter((c) => c.status === 'pending');
  const diagnosedComplaints = complaints.filter(
    (c) => c.status === 'diagnosed' || c.status === 'appointment_booked'
  );

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'emergency':
      case 'urgent':
        return {
          bg: Colors.emergencyBg,
          text: Colors.emergency,
          label: t.urgencyUrgent,
        };
      case 'moderate':
        return {
          bg: Colors.urgentBg,
          text: Colors.urgent,
          label: t.urgencyModerate,
        };
      default:
        return {
          bg: Colors.routineBg,
          text: Colors.routine,
          label: t.urgencyRoutine,
        };
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Doctor Header Banner */}
      <View style={styles.doctorBanner}>
        <View style={styles.bannerHeader}>
          <Image
            source={require('../../assets/doctor_clinic.jpg')}
            style={styles.doctorBannerAvatar}
          />
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>{t.doctorDashboardTitle}</Text>
            <Text style={styles.bannerSub}>
              {language === 'ar'
                ? 'متابعة الشكاوى الواردة وإصدار التشخيصات المبدئية للمرضى'
                : 'Review incoming complaints & issue triage preliminary diagnosis'}
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumAlert}>{pendingComplaints.length}</Text>
            <Text style={styles.statLabel}>{t.pendingReviews}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{diagnosedComplaints.length}</Text>
            <Text style={styles.statLabel}>{t.statusDiagnosed}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{appointments.length}</Text>
            <Text style={styles.statLabel}>{t.todaysAppointments}</Text>
          </View>
        </View>
      </View>

      {/* Doctor Management Quick Actions */}
      <View style={styles.managementSection}>
        <Text style={styles.sectionTitle}>
          {language === 'ar' ? '⚙️ أدوات إدارة العيادة والمحتوى:' : '⚙️ Clinic & Content Management:'}
        </Text>
        <View style={styles.managementGrid}>
          <TouchableOpacity
            style={styles.manageCard}
            onPress={() => navigation.navigate('EditClinic')}
          >
            <View style={[styles.manageIconCircle, { backgroundColor: '#e0f2fe' }]}>
              <Stethoscope size={20} color={Colors.primary} />
            </View>
            <Text style={styles.manageCardTitle}>
              {language === 'ar' ? 'بيانات العيادة والصور' : 'Clinic & Doctor Info'}
            </Text>
            <Text style={styles.manageCardSub}>
              {language === 'ar' ? 'تعديل السيرة وأرقام التواصل' : 'Update bio, contact & hours'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.manageCard}
            onPress={() => navigation.navigate('ManageServices')}
          >
            <View style={[styles.manageIconCircle, { backgroundColor: '#f0fdf4' }]}>
              <Activity size={20} color="#16a34a" />
            </View>
            <Text style={styles.manageCardTitle}>
              {language === 'ar' ? 'الخدمات والأسعار' : 'Services & Prices'}
            </Text>
            <Text style={styles.manageCardSub}>
              {language === 'ar' ? 'إضافة وتعديل أسعار الكشوفات' : 'Add/edit treatment prices'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.manageCard}
            onPress={() => navigation.navigate('ManagePortfolio')}
          >
            <View style={[styles.manageIconCircle, { backgroundColor: '#fef3c7' }]}>
              <Users size={20} color="#d97706" />
            </View>
            <Text style={styles.manageCardTitle}>
              {language === 'ar' ? 'معرض الأعمال (قبل/بعد)' : 'Portfolio (Before/After)'}
            </Text>
            <Text style={styles.manageCardSub}>
              {language === 'ar' ? 'رفع صور وتفاصيل الحالات' : 'Upload case transformations'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Section 1: Pending Complaints Requiring Diagnosis */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t.incomingComplaints}</Text>
      </View>

      {complaints.length === 0 ? (
        <View style={styles.emptyBox}>
          <CheckCircle size={36} color={Colors.routine} />
          <Text style={styles.emptyText}>
            {language === 'ar' ? 'لا توجد شكاوى واردة حالياً' : 'No incoming cases'}
          </Text>
        </View>
      ) : (
        complaints.map((item) => {
          const urgency = getUrgencyBadge(item.urgencyLevel);
          const isPending = item.status === 'pending';

          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.caseCard,
                isPending && styles.caseCardPending,
              ]}
              onPress={() =>
                navigation.navigate('DoctorConsultationDetail', {
                  complaintId: item.id,
                })
              }
              activeOpacity={0.85}
            >
              <View style={styles.caseHeader}>
                <View style={styles.patientInfo}>
                  <Text style={styles.patientName}>{item.patientName}</Text>
                  <Text style={styles.patientPhone}>{item.patientPhone}</Text>
                </View>

                <View
                  style={[
                    styles.urgencyBadge,
                    { backgroundColor: urgency.bg },
                  ]}
                >
                  <Text
                    style={[
                      styles.urgencyText,
                      { color: urgency.text },
                    ]}
                  >
                    {urgency.label}
                  </Text>
                </View>
              </View>

              {/* Teeth Selected */}
              <View style={styles.teethBadges}>
                {item.selectedTeeth.map((num) => (
                  <View key={num} style={styles.toothTag}>
                    <Text style={styles.toothTagText}>السن #{num}</Text>
                  </View>
                ))}
                <View style={styles.painTag}>
                  <Text style={styles.painTagText}>
                    شدة الألم: {item.painLevel}/10
                  </Text>
                </View>
              </View>

              {/* Complaint snippet */}
              <Text style={styles.descSnippet} numberOfLines={2}>
                {item.description}
              </Text>

              {/* Footer action */}
              <View style={styles.caseFooter}>
                <View style={styles.statusIndicator}>
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor: isPending
                          ? Colors.urgent
                          : Colors.routine,
                      },
                    ]}
                  />
                  <Text style={styles.statusLabel}>
                    {isPending ? t.statusPending : t.statusDiagnosed}
                  </Text>
                </View>

                <View style={styles.cardBtnRow}>
                  <TouchableOpacity
                    style={styles.cardChatBtn}
                    onPress={(e) => {
                      e.stopPropagation?.();
                      navigation.navigate('Chat', {
                        consultationId: item.id,
                      });
                    }}
                  >
                    <MessageCircle size={14} color={Colors.primary} />
                    <Text style={styles.cardChatBtnText}>{t.chatWithPatient}</Text>
                  </TouchableOpacity>

                  <View style={styles.actionPrompt}>
                    <Text style={styles.actionPromptText}>
                      {isPending ? t.diagnosePatient : t.viewDetails}
                    </Text>
                    <ChevronRight
                      size={16}
                      color={Colors.primary}
                      style={{
                        transform: [{ rotate: isRTL ? '180deg' : '0deg' }],
                      }}
                    />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })
      )}

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
  doctorBanner: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    ...Shadows.md,
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  doctorBannerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 2,
  },
  bannerSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingVertical: 10,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumAlert: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fbbf24',
  },
  statNum: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  emptyBox: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  caseCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    ...Shadows.sm,
  },
  caseCardPending: {
    borderColor: Colors.urgent,
    borderWidth: 1.5,
  },
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  patientInfo: {},
  patientName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  patientPhone: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    writingDirection: 'ltr',
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: '700',
  },
  teethBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  toothTag: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  toothTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  painTag: {
    backgroundColor: Colors.emergencyBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  painTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.emergency,
  },
  descSnippet: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: 10,
  },
  caseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  cardBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  cardChatBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  actionPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionPromptText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  managementSection: {
    marginBottom: 16,
  },
  managementGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  manageCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    textAlign: 'center',
    ...Shadows.sm,
  },
  manageIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  manageCardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 2,
  },
  manageCardSub: {
    fontSize: 9,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 12,
  },
});
