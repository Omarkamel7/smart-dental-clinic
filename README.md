# 🦷 عيادة د. كريم أبو بكر للأسنان - Smart Dental Clinic

تطبيق ذكي متكامل لطب وجراحة وتجميل وزراعة الأسنان، يتيح للمرضى فحص وتشخيص الأسنان عبر مجسم فك ثلاثي الأبعاد تفاعلي، حجز المواعيد، التواصل المباشر مع الطبيب بالصوت والصورة، وتتبع السجل الطبي.

---

### 📲 تحميل تطبيق الأندرويد المباشر (Download APK):
[![Download Android APK](https://img.shields.io/badge/Download-Android%20APK-0284c7?style=for-the-badge&logo=android&logoColor=white)](https://github.com/Omarkamel7/smart-dental-clinic/releases/download/v1.0.0/smart-dental-clinic.apk)
[![Expo Build](https://img.shields.io/badge/Expo-Live%20Install-0d9488?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/accounts/omarsala7s-team/projects/smart-dental-clinic/builds/ac418cf4-9d1b-4313-843a-eb1e2b53c4c3)

---

## 📱 كيفية تشغيل التطبيق على الهاتف المحمول (Android & iOS):

### الطريقة الأولى: التشغيل المباشر عبر تطبيق Expo Go (الأسهل والأسرع)

1. **حمّل تطبيق Expo Go على هاتفك**:
   - لأجهزة أندرويد: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - لأجهزة آيفون: [Apple App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **على جهاز الكمبيوتر**:
   افتح مجلد المشروع في الـ Terminal ونفّذ الأوامر التالية:
   ```bash
   # تثبيت الحزم
   npm install

   # تشغيل خادم التطوير
   npx expo start
   ```

3. **افتح التطبيق على هاتفك**:
   - **أندرويد (Android)**: افتح تطبيق **Expo Go** واضغط على **Scan QR Code** وامسح الكود الظاهر على شاشة الكمبيوتر.
   - **آيفون (iOS)**: افتح كاميرا الهاتف العادية وامسح الـ QR Code واضغط على الإشعار ليفتح في Expo Go.

---

### الطريقة الثانية: بناء ملف APK مباشر للأندرويد (Standalone APK)

إذا كنت ترغب في استخراج ملف تثبيت `.apk` مستقل لتثبيته مباشرة على أي هاتف أندرويد دون الحاجة لجهاز كمبيوتر:

1. قم بتثبيت أداة EAS:
   ```bash
   npm install -g eas-cli
   eas login
   ```

2. نفّذ أمر البناء:
   ```bash
   eas build -p android --profile preview
   ```
   سيتم توليد رابط مباشر لتحميل ملف الـ APK وتثبيته على هاتفك.

---

## 🌐 تجربة محاكي الويب المباشر بدون تثبيت (Web Preview):
يمكنك فتح ملف `preview.html` في أي متصفح ويب (Chrome / Safari / Edge) لتجربة كامل الواجهات والمجسم والمحادثة بنقرة زر واحدة.

---

## 🛠️ التقنيات المستخدمة (Tech Stack):
- **Framework**: React Native + Expo (SDK 52)
- **Backend & Database**: Supabase (PostgreSQL, Realtime Channels, Storage, Auth)
- **UI & Icons**: Lucide React Native, Custom 3D Dental Spline Vectors
- **Media**: Expo Image Picker, Expo AV Audio Recorder
- **State Management**: React Context + AsyncStorage
