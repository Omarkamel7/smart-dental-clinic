import { Linking } from 'react-native';
import * as Updates from 'expo-updates';

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
    'اعتماد وتطبيق اللوجو الجديد فائق الدقة (Smart Dental HD Icon)',
  ],
  changelogEn: [
    'Dynamic doctor & clinic profile management (Bio, photos, hours)',
    'Realtime clinic services and price management portal',
    'Before & After portfolio gallery with in-app photo uploads',
    'Complete cleanup of mock data, 100% live database sync',
    'Official high-definition Smart Dental logo and app icon',
  ],
};

export interface UpdateCheckResult {
  hasUpdate: boolean;
  hasOtaUpdate: boolean;
  version: string;
  apkDownloadUrl: string;
  releaseNotesAr: string;
  releaseNotesEn: string;
  isMandatory: boolean;
}

/**
 * Checks for new app updates via GitHub releases and Expo OTA updates.
 */
export async function checkForAppUpdates(): Promise<UpdateCheckResult> {
  let hasOta = false;

  // 1. Check Expo OTA Updates
  try {
    if (!__DEV__) {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        hasOta = true;
      }
    }
  } catch (err) {
    // OTA check can fail in local dev or without network
  }

  // 2. Check GitHub Releases for New APK
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
      const latestTag = (release.tag_name || '').replace('v', '').trim();
      
      // Find APK download URL from assets if available
      let apkUrl = release.html_url || 'https://github.com/Omarkamel7/smart-dental-clinic/releases/latest';
      if (release.assets && Array.isArray(release.assets)) {
        const apkAsset = release.assets.find((a: any) => a.name?.endsWith('.apk'));
        if (apkAsset && apkAsset.browser_download_url) {
          apkUrl = apkAsset.browser_download_url;
        }
      }

      if (latestTag && latestTag !== APP_VERSION_DATA.version) {
        return {
          hasUpdate: true,
          hasOtaUpdate: hasOta,
          version: latestTag,
          apkDownloadUrl: apkUrl,
          releaseNotesAr: release.body || 'تحسينات جديدة في الأداء والواجهات وإصلاحات للنظام.',
          releaseNotesEn: release.body || 'New UI enhancements, features, and performance fixes.',
          isMandatory: false,
        };
      }
    }
  } catch (err) {
    console.warn('GitHub update check failed:', err);
  }

  return {
    hasUpdate: hasOta,
    hasOtaUpdate: hasOta,
    version: APP_VERSION_DATA.version,
    apkDownloadUrl: 'https://github.com/Omarkamel7/smart-dental-clinic/releases/latest',
    releaseNotesAr: 'تحديث جديد متوفر لتحسين تجربة الاستخدام.',
    releaseNotesEn: 'New update available to improve your experience.',
    isMandatory: false,
  };
}

/**
 * Downloads and applies the Expo OTA update immediately.
 */
export async function applyOtaUpdate(): Promise<void> {
  try {
    await Updates.fetchUpdateAsync();
    await Updates.reloadAsync();
  } catch (err) {
    console.warn('Failed to apply OTA update:', err);
    throw err;
  }
}

/**
 * Opens the APK download link in the browser.
 */
export async function openApkDownload(url?: string): Promise<void> {
  const targetUrl = url || 'https://github.com/Omarkamel7/smart-dental-clinic/releases/latest';
  const canOpen = await Linking.canOpenURL(targetUrl);
  if (canOpen) {
    await Linking.openURL(targetUrl);
  }
}
