import { createContext, useState } from 'react';

// 1. ቃላቱን (Translations) እዚህ እናስቀምጣለን
const translations = {
  en: {
    // Dashboard Menu
    dashboard: "Dashboard",
    manageUsers: "Manage Users",
    manageClasses: "Manage Classes",
    reports: "Reports",
    payments: "Payments",
    announcements: "Announcements",
    settings: "Settings",
    logout: "Logout",
    
    // Generic Words
    students: "Students",
    teachers: "Teachers",
    classes: "Classes",
    viewDetails: "View Details",
    name: "Name",
    email: "Email",
    class: "Class",
    status: "Status",
    action: "Action",
    active: "Active",
    notAssigned: "Not Assigned",
    notRecorded: "Not Recorded",
    loading: "Loading...",
    backToList: "Back to List",
    joined: "Joined",
    phone: "Phone",
    role: "Role",
    
    // Specific Pages
    studentsList: "Students List",
    teachersList: "Teachers List",
    studentProfile: "Student Profile",
    teacherProfile: "Teacher Profile",
    backToStudents: "Back to Students",
    backToTeachers: "Back to Teachers",
  },
  am: {
    // Dashboard Menu
    dashboard: "ዳሽቦርድ",
    manageUsers: "ተጠቃሚዎችን ያስተዳድሩ",
    manageClasses: "ክፍሎችን ያስተዳድሩ",
    reports: "ሪፖርቶች",
    payments: "ክፍያዎች",
    announcements: "ማስታወቂያዎች",
    settings: "ቅንብሮች",
    logout: "ውጣ",
    
    // Generic Words
    students: "ተማሪዎች",
    teachers: "መምህራን",
    classes: "ክፍሎች",
    viewDetails: "ዝርዝር ይመልከቱ",
    name: "ስም",
    email: "ኢሜይል",
    class: "ክፍል",
    status: "ሁኔታ",
    action: "ተግባር",
    active: "ንቁ",
    notAssigned: "አልተመደበም",
    notRecorded: "አልተመዘገበም",
    loading: "በመጫን ላይ...",
    backToList: "ወደ ዝርዝር ተመለስ",
    joined: "የተቀጠረበት/የተመዘገበበት ቀን",
    phone: "ስልክ ቁጥር",
    role: "ሮል",
    
    // Specific Pages
    studentsList: "የተማሪዎች ዝርዝር",
    teachersList: "የመምህራን ዝርዝር",
    studentProfile: "የተማሪ መገለጫ",
    teacherProfile: "የመምህር መገለጫ",
    backToStudents: "ወደ ተማሪዎች ተመለስ",
    backToTeachers: "ወደ መምህራን ተመለስ",
  }
};

export const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en'); // ነባሪ (Default) እንግሊዝኛ

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'am' : 'en'));
  };

  // ቃላቱን በቀላሉ ለመጥራት የሚያገለግል function (t = translate)
  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}