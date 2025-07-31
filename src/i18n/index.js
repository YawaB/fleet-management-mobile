import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Function to get the initial language
async function getInitialLanguage() {
  try {
    const savedLanguage = await AsyncStorage.getItem('userLanguage');
    return savedLanguage || 'en'; // Default to 'en' if no language is saved
  } catch (error) {
    console.error('Error loading initial language:', error);
    return 'en';
  }
}

// Initialize i18n
async function initI18n() {
  const initialLanguage = await getInitialLanguage();
  
  i18n
    .use(initReactI18next)
    .init({
    // the translations
    // (tip move them in a JSON file and import them,
    // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
    resources: {
      en: {
        translation: {
          "vh_info": "Vehicle Information",
          "nxt_mec_check": "Next Mechanical Check",
          "schedule_service": "Schedule Service",
          "mec_check": "Mechanical Check",
          "vh_details": "Vehicle Details",
          "vh_history": "Vehicle History",
          "vh_documents": "Vehicle Documents",
          "vh_insurance": "Vehicle Insurance",
          "vh_maintenance": "Vehicle Maintenance",
          "feutures": "Feutures",
          "pane": "Panes",
          "dashboard": "Dashboard",
          "tire_rotation": "Tire Rotation",
          "breakdown_management": "Management panes",
          "fuel_level": "Fuel Level",
          "mileage": "Mileage",
          "oil_change": "Oil Change",
          "tire_pressure": "Tire Pressure",
          "last_oil_change": "Last Oil Change",
          "select_language": "Select Language",
          "profile": "Profile",
          "parametre": "Settings",
          "applications": "Applications",
          "deconnexion": "Logout",
          "logs": "Logs",
          "prendre_photo": "Take a photo",
          "langue": "Language",
          "edit": "Edit",
          "delete": "Delete",
          "delete_confirmation": "Delete Confirmation",
          "delete_message": "Are you sure you want to delete",
          "cancel": "Cancel",
          "restart_title": "Restart Required",
          "restart_message": "To apply the language changes, the app needs to restart. Would you like to restart now?",
          "restart_ok": "Restart",
          "restart_cancel": "Cancel"
        }
      },
      fr: {
        translation: {
          "vh_info": "Informations sur le véhicule",
          "nxt_mec_check": "Prochain contrôle mécanique",
          "schedule_service": "Planification du service",
          "mec_check": "Contrôle mécanique",
          "vh_details": "Détails du véhicule",
          "vh_history": "Histoire du véhicule",
          "vh_documents": "Documents du véhicule",
          "vh_insurance": "Assurance du véhicule",
          "vh_maintenance": "Maintenance du véhicule",
          "feutures": "Feutures",
          "pane": "Panes",
          "dashboard": "Dashboard",
          "tire_rotation": "Rotation des pneus",
          "breakdown_management": "Gestion des panes",
          "fuel_level": "Niveau de carburant",
          "mileage": "Kilométrage",
          "oil_change": "Remplacement de l'huile",
          "tire_pressure": "Pression des pneus",
          "last_oil_change": "Dernier remplacement de l'huile",
          "select_language": "Select Language",
          "profile": "Profile",
          "parametre": "Parametre",
          "applications": "Applications",
          "deconnexion": "Deconnexion",
          "logs": "Logs",
          "prendre_photo": "Prendre une photo",
          "langue": "Langue",
          "edit": "Modifier",
          "delete": "Supprimer",
          "delete_confirmation": "Confirmation de suppression",
          "delete_message": "Êtes-vous sûr de vouloir supprimer",
          "cancel": "Annuler",
          "restart_title": "Redémarrage Requis",
          "restart_message": "Pour appliquer les changements de langue, l'application doit redémarrer. Voulez-vous redémarrer maintenant?",
          "restart_ok": "Redémarrer",
          "restart_cancel": "Annuler"
        }
      },
      ar: {
        translation: {
          "vh_info": "معلومات السيارة",
          "nxt_mec_check": "الفحص الميكانيكي التالي",
          "schedule_service": "جدول الصيانة",
          "mec_check": "الفحص الميكانيكي",
          "vh_details": "تفاصيل السيارة",
          "vh_history": "تاريخ السيارة",
          "vh_documents": "مستندات السيارة",
          "vh_insurance": "تأمين السيارة",
          "vh_maintenance": "صيانة السيارة",
          "feutures": "الميزات",
          "pane": "مشكلات تقنية",
          "dashboard": "الرئيسية",
          "tire_rotation": "تدوير الإطارات",
          "breakdown_management": "إدارة الأعطال",
          "fuel_level": "مستوى الوقود",
          "mileage": "الكيلومترات",
          "oil_change": "تغيير الزيت",
          "tire_pressure": "ضغط الإطارات",
          "last_oil_change": "آخر تغيير الزيت",
          "select_language": "اختر اللغة",
          "profile": "الملف الشخصي",
          "parametre": "الإعدادات",
          "applications": "التطبيقات",
          "deconnexion": "خروج",
          "logs": "السجلات",
          "prendre_photo": "التقاط صورة",
          "langue": "اللغة",
          "edit": "تعديل",
          "delete": "حذف",
          "delete_confirmation": "تأكيد الحذف",
          "delete_message": "هل أنت متأكد أنك تريد حذف",
          "cancel": "إلغاء",
          "restart_title": "إعادة التشغيل مطلوبة",
          "restart_message": "لتطبيق تغييرات اللغة، يجب إعادة تشغيل التطبيق. هل تريد إعادة التشغيل الآن؟",
          "restart_ok": "إعادة التشغيل",
          "restart_cancel": "إلغاء"
        }
      }
    },
    lng: "en", 
    fallbackLng: "en",

    interpolation: {
      escapeValue: false 
    },
    lng: initialLanguage, // set the initial language
  });
}

// Initialize i18n
initI18n();

