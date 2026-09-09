import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { HerdManagementPage } from './pages/HerdManagementPage';
import { AnimalProfilePage } from './pages/AnimalProfilePage';
import { SmartCollarPage } from './pages/SmartCollarPage';
import { MilkSensorPage } from './pages/MilkSensorPage';
import { FeedingPage } from './pages/FeedingPage';
import { EnvironmentPage } from './pages/EnvironmentPage';
import { MilkingManagementPage } from './pages/MilkingManagementPage';
import { CapaPage } from './pages/CapaPage';
import { HygieneHousingPage } from './pages/HygieneHousingPage';
import { VaccinationPage } from './pages/VaccinationPage';
import { DiseaseTreatmentPage } from './pages/DiseaseTreatmentPage';
import { RiskProgressionPage } from './pages/RiskProgressionPage';
import { GisFarmMapPage } from './pages/GisFarmMapPage';
import { IotDevicesPage } from './pages/IotDevicesPage';
import { LabRecordsPage } from './pages/LabRecordsPage';
import { ReportsPage } from './pages/ReportsPage';
import { ModelPerformancePage } from './pages/ModelPerformancePage';
import { ArchitecturePage } from './pages/ArchitecturePage';

const MainLayout: React.FC = () => {
  const { activeTab, notification } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'herd':
        return <HerdManagementPage />;
      case 'animalProfile':
      case 'prediction':
        return <AnimalProfilePage />;
      case 'collar':
        return <SmartCollarPage />;
      case 'milkSensor':
        return <MilkSensorPage />;
      case 'feeding':
        return <FeedingPage />;
      case 'environment':
        return <EnvironmentPage />;
      case 'milking':
        return <MilkingManagementPage />;
      case 'capa':
        return <CapaPage />;
      case 'hygiene':
        return <HygieneHousingPage />;
      case 'vaccination':
        return <VaccinationPage />;
      case 'disease':
        return <DiseaseTreatmentPage />;
      case 'progression':
        return <RiskProgressionPage />;
      case 'gis':
        return <GisFarmMapPage />;
      case 'devices':
        return <IotDevicesPage />;
      case 'lab':
        return <LabRecordsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'modelPerformance':
        return <ModelPerformancePage />;
      case 'architecture':
        return <ArchitecturePage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-fade-in border border-emerald-400">
          <span>{notification}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        isSidebarOpen={isSidebarOpen} 
      />

      {/* Main Body */}
      <div className="flex flex-1">
        {/* Navigation Sidebar */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />

        {/* Content Area */}
        <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;
