export interface AppVersionInfo {
  version: string;
  buildNumber: number;
  releaseDate: string;
  channel: 'production' | 'preview' | 'development';
  latestVersion: string;
  isUpdateAvailable: boolean;
  mandatoryUpdate: boolean;
  changelogAr: string[];
  changelogEn: string[];
}

export const APP_VERSION_DATA: AppVersionInfo = {
  version: '1.1.0',
  buildNumber: 110,
  releaseDate: '2026-08-27',
  channel: 'production',
  latestVersion: '1.1.0',
  isUpdateAvailable: false,
  mandatoryUpdate: false,
  changelogAr: [
    'إدارة ديناميكية كاملة لبيانات العيادة والطبيب ومواعيد العمل والصور',
    'إدارة الخدمات والأسعار من لوحة الطبيب مع المزامنة الفورية',
    'معرض الأعمال والنتائج (قبل وبعد) مع رفع صور الحالات من التطبيق',
    'إزالة كافة البيانات الوهمية والاعتماد الكلي على قاعدة البيانات الحقيقية',
    'ربط حساب الطبيب الرسمي وتأمين التسجيل للمرضى فقط',
  ],
  changelogEn: [
    'Dynamic doctor & clinic profile management (Bio, photos, hours)',
    'Realtime clinic services and price management portal',
    'Before & After portfolio gallery with in-app photo uploads',
    'Complete cleanup of mock data, 100% live database sync',
    'Secure doctor role assignment and patient authentication',
  ],
};

/**
 * Checks for new app updates via GitHub releases or remote config.
 */
export async function checkForAppUpdates(): Promise<{
  hasUpdate: boolean;
  version: string;
  notes: string;
}> {
  try {
    const response = await fetch(
      'https://api.github.com/repos/Omarkamel7/smart-dental-clinic/releases/latest',
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (response.ok) {
      const release = await response.json();
      const latestTag = (release.tag_name || '').replace('v', '');

      if (latestTag && latestTag !== APP_VERSION_DATA.version) {
        return {
          hasUpdate: true,
          version: latestTag,
          notes: release.body || 'تحسينات جديدة في الأداء والواجهات.',
        };
      }
    }
  } catch (err) {
    console.warn('Update check failed, using cached state:', err);
  }

  return {
    hasUpdate: false,
    version: APP_VERSION_DATA.version,
    notes: 'أنت تستخدم أحدث إصدار معتمد من التطبيق.',
  };
}
