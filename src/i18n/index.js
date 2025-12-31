import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { I18nManager } from "react-native";
import { configureLanguage } from "../utils/languageUtils";

// Translation resources
const resources = {
  en: {
    translation: {
      vh_info: "Vehicle Information",
      nxt_mec_check: "Next Mechanical Check",
      schedule_service: "Schedule Service",
      mec_check: "Mechanical Check",
      vh_details: "Vehicle Details",
      vh_history: "Vehicle History",
      vh_documents: "Vehicle Documents",
      vh_insurance: "Vehicle Insurance",
      vh_maintenance: "Vehicle Maintenance",
      feutures: "Feutures",
      pane: "Panes",
      dashboard: "Dashboard",
      tire_rotation: "Tire Rotation",
      breakdown_management: "Management panes",
      fuel_level: "Fuel Level",
      mileage: "Mileage",
      oil_change: "Oil Change",
      tire_pressure: "Tire Pressure",
      last_oil_change: "Last Oil Change",
      select_language: "Select Language",
      profile: "Profile",
      parametre: "Settings",
      applications: "Applications",
      deconnexion: "Logout",
      logs: "Logs",
      prendre_photo: "Take a photo",
      langue: "Language",
      edit: "Edit",
      delete: "Delete",
      delete_confirmation: "Delete Confirmation",
      delete_message: "Are you sure you want to delete",
      cancel: "Cancel",
      restart_title: "Restart Required",
      restart_message:
        "To apply the language changes, the app needs to restart. Would you like to restart now?",
      restart_ok: "Restart",
      restart_cancel: "Cancel",
      task: "Tasks",
      Deadline_date: "Deadline Date",
      created: "Created on",
      all: "All",
      late: "Late",
      in_progress: "In Progress",
      completed: "Completed",
      overdue: "Overdue",
      login_title: "Login",
      remember_me: "Remember me",
      login: "Login",
    },
  },
  fr: {
    translation: {
      vh_info: "Informations sur le véhicule",
      nxt_mec_check: "Prochain contrôle mécanique",
      schedule_service: "Planification du service",
      mec_check: "Contrôle mécanique",
      vh_details: "Détails du véhicule",
      vh_history: "Histoire du véhicule",
      vh_documents: "Documents du véhicule",
      vh_insurance: "Assurance du véhicule",
      vh_maintenance: "Maintenance du véhicule",
      feutures: "Feutures",
      pane: "Panes",
      dashboard: "Dashboard",
      tire_rotation: "Rotation des pneus",
      breakdown_management: "Gestion des panes",
      fuel_level: "Niveau de carburant",
      mileage: "Kilométrage",
      oil_change: "Remplacement de l'huile",
      tire_pressure: "Pression des pneus",
      last_oil_change: "Dernier remplacement de l'huile",
      select_language: "Select Language",
      profile: "Profile",
      parametre: "Parametre",
      applications: "Applications",
      deconnexion: "Deconnexion",
      logs: "Logs",
      prendre_photo: "Prendre une photo",
      langue: "Langue",
      edit: "Modifier",
      delete: "Supprimer",
      delete_confirmation: "Confirmation de suppression",
      delete_message: "Êtes-vous sûr de vouloir supprimer",
      cancel: "Annuler",
      restart_title: "Redémarrage Requis",
      restart_message:
        "Pour appliquer les changements de langue, l'application doit redémarrer. Voulez-vous redémarrer maintenant?",
      restart_ok: "Redémarrer",
      restart_cancel: "Annuler",
      task: "Tâches",
      Deadline_date: "Date d'échéance",
      created: "Créé le",
      overdue: "En retard",
      in_progress: "En cours",
      completed: "Terminé",
      late: "En retard",
      all: "Tout",
      today: "Aujourd'hui",
      login: "Se connecter",
      logout: "Se déconnecter",
      remember_me: "Se souvenir de moi",
    },
  },
  ar: {
    translation: {
      vh_info: "معلومات السيارة",
      nxt_mec_check: "الفحص الميكانيكي التالي",
      schedule_service: "جدول الصيانة",
      mec_check: "الفحص الميكانيكي",
      vh_details: "تفاصيل السيارة",
      vh_history: "تاريخ السيارة",
      vh_documents: "مستندات السيارة",
      vh_insurance: "تأمين السيارة",
      vh_maintenance: "صيانة السيارة",
      feutures: "الميزات",
      pane: "مشكلات تقنية",
      dashboard: "الرئيسية",
      tire_rotation: "تدوير الإطارات",
      breakdown_management: "إدارة الأعطال",
      fuel_level: "مستوى الوقود",
      mileage: "الكيلومترات",
      oil_change: "تغيير الزيت",
      tire_pressure: "ضغط الإطارات",
      last_oil_change: "آخر تغيير الزيت",
      select_language: "اختر اللغة",
      profile: "الملف الشخصي",
      parametre: "الإعدادات",
      applications: "التطبيقات",
      deconnexion: "خروج",
      logs: "السجلات",
      prendre_photo: "التقاط صورة",
      langue: "اللغة",
      edit: "تعديل",
      delete: "حذف",
      delete_confirmation: "تأكيد الحذف",
      delete_message: "هل أنت متأكد أنك تريد حذف",
      cancel: "إلغاء",
      restart_title: "إعادة التشغيل مطلوبة",
      restart_message:
        "لتطبيق تغييرات اللغة، يجب إعادة تشغيل التطبيق. هل تريد إعادة التشغيل الآن؟",
      restart_ok: "إعادة التشغيل",
      restart_cancel: "إلغاء",
      task: "المهام",
      Deadline_date: "تاريخ الانتهاء",
      created: "تم الإنشاء في",
      overdue: "متأخر",
      in_progress: "قيد التنفيذ",
      completed: "مكتمل",
      all: "الكل",
      late: "متأخر",
      today: "اليوم",
      login: "تسجيل الدخول",
      logout: "تسجيل الخروج",
      remember_me: "تذكرني",
    },
  },
};

// Initialize i18n synchronously with default language
i18n.use(initReactI18next).init({
  resources,
  fallbackLng: "fr",
  lng: "fr", // Default to French, will be updated async if needed
  interpolation: {
    escapeValue: false,
  },
});

// Function to load and apply saved language asynchronously
async function loadSavedLanguage() {
  try {
    const savedLanguage = await AsyncStorage.getItem("userLanguage");
    // If Arabic was previously selected, it will force RTL at app start.
    // Reset to French so the default startup is always French/LTR.
    if (savedLanguage === "ar") {
      await AsyncStorage.setItem("userLanguage", "fr");
      await configureLanguage("fr");
      return;
    }
    if (savedLanguage && savedLanguage !== i18n.language) {
      await configureLanguage(savedLanguage);
      await i18n.changeLanguage(savedLanguage);
    }
  } catch (error) {
    console.error("Error loading saved language:", error);
  }
}

// Load saved language preference
loadSavedLanguage();

export default i18n;
