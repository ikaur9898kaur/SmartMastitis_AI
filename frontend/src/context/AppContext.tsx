import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, Language } from '../types';
import { translations } from '../i18n/translations';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['en'];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedAnimalId: string;
  setSelectedAnimalId: (id: string) => void;
  refreshCount: number;
  triggerRefresh: () => void;
  notification: string | null;
  showNotification: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('farmer');
  const [language, setLanguage] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('COW004');
  const [refreshCount, setRefreshCount] = useState<number>(0);
  const [notification, setNotification] = useState<string | null>(null);

  const t = translations[language] || translations.en;

  const triggerRefresh = () => setRefreshCount(prev => prev + 1);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        language,
        setLanguage,
        t,
        activeTab,
        setActiveTab,
        selectedAnimalId,
        setSelectedAnimalId,
        refreshCount,
        triggerRefresh,
        notification,
        showNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
