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
  version: '1.2.0',
  buildNumber: 120,
  releaseDate: '2026-08-27',
  channel: 'production',
  latestVersion: '1.2.0',
  isUpdateAvailable: false,
  mandatoryUpdate: false,
  changelogAr: [
    'تخصيص كامل لخيارات نموذج الاستشارة وقائمة الأعراض والتاريخ الصحي من لوحة الطبيب',
    'إمكانية التحكم في إظهار أو إخفاء كارت بيانات ومواعيد العيادة وتعديل محتواه',
    'شارة العرض المجاني الترويجي ثلاثية الأبعاد (مجاناً لفترة محدودة) على الاستشارة والمحادثة مع تحكم الطبيب',
    'إلزام المريض بإدخال الاسم ورقم الهاتف قبل بدء المراسلة المباشرة مع الطبيب',
    'استبدال مخطط الأسنان القديم بمخطط الابتسامة والفكين التفاعلي فائق السلاسة',
    'دعم كامل ومحسن للترجمة الفورية بين اللغتين العربية والإنجليزية',
  ],
  changelogEn: [
    'Doctor consultation form customizer for symptoms and medical history alerts',
    'Toggle visibility and dynamic editor for clinic info & working hours card',
    '3D Promotional ribbon badge (Free for a limited time) on consultation and direct chat',
    'Mandatory patient name and phone identification before entering direct chat',
    'New intuitive smiling dental arch interactive teeth selection',
    'Enhanced bilingual synchronization between Arabic and English',
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

function isNewerVersion(remote: string, local: string): boolean {
  const rParts = remote.split('.').map((n) => parseInt(n, 10) || 0);
  const lParts = local.split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(rParts.length, lParts.length); i++) {
    const r = rParts[i] ?? 0;
    const l = lParts[i] ?? 0;
    if (r > l) return true;
    if (r < l) return false;
  }
  return false;
}

function cleanMarkdownNotes(text: string): string {
  if (!text) return '';
  return text
    .replace(/###+/g, '')
    .replace(/\*\*/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/👉/g, '•')
    .trim();
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
      
      // Find APK download URL from assets or body if available
      let apkUrl = 'https://expo.dev/accounts/omarsala7s-team/projects/smart-dental-clinic/builds/94cb967b-efc4-4325-aa74-3d675b39072c';
      if (release.assets && Array.isArray(release.assets)) {
        const apkAsset = release.assets.find((a: any) => a.name?.endsWith('.apk'));
        if (apkAsset && apkAsset.browser_download_url) {
          apkUrl = apkAsset.browser_download_url;
        }
      }
      const expoBuildMatch = release.body?.match(/https:\/\/expo\.dev\/accounts\/[^\s\)\<\"]+/);
      if (expoBuildMatch) {
        apkUrl = expoBuildMatch[0];
      }

      if (latestTag && isNewerVersion(latestTag, APP_VERSION_DATA.version)) {
        const cleanNotes = cleanMarkdownNotes(release.body) || 'تحسينات جديدة في الأداء والواجهات وإصلاحات للنظام.';
        return {
          hasUpdate: true,
          hasOtaUpdate: hasOta,
          version: latestTag,
          apkDownloadUrl: apkUrl,
          releaseNotesAr: cleanNotes,
          releaseNotesEn: cleanNotes,
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
