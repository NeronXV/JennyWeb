import React from 'react';
import { AppStateProvider, useAppState } from './context/AppContext';
import { Layout } from './components/Layout';
import { Login } from './views/Login';
import { Hub } from './views/Hub';

// School Module Views
import { DashboardEscolar } from './views/escolar/Dashboard';
import { Alumnos } from './views/escolar/Alumnos';
import { Asistencia } from './views/escolar/Asistencia';
import { Campos } from './views/escolar/Campos';
import { Actividades } from './views/escolar/Actividades';
import { Porcentajes } from './views/escolar/Porcentajes';
import { Concentrado } from './views/escolar/Concentrado';

// Business Module Views
import { DashboardNegocio } from './views/negocio/Dashboard';
import { Lotes } from './views/negocio/Lotes';
import { RegistrarProducto } from './views/negocio/RegistrarProducto';
import { Inventario } from './views/negocio/Inventario';
import { POS } from './views/negocio/POS';
import { DetalleLote } from './views/negocio/DetalleLote';

// Common Views
import { Reportes } from './views/Reportes';

const AppContent: React.FC = () => {
  const { currentView } = useAppState();

  const renderActiveView = () => {
    switch (currentView) {
      case 'login':
        return <Login />;
      case 'hub':
        return <Hub />;
      
      // Control Escolar Module
      case 'escolar-dashboard':
        return <DashboardEscolar />;
      case 'escolar-alumnos':
        return <Alumnos />;
      case 'escolar-asistencia':
        return <Asistencia />;
      case 'escolar-campos':
        return <Campos />;
      case 'escolar-actividades':
        return <Actividades />;
      case 'escolar-porcentajes':
        return <Porcentajes />;
      case 'escolar-concentrado':
        return <Concentrado />;
      
      // Negocio de Ropa Module
      case 'negocio-dashboard':
        return <DashboardNegocio />;
      case 'negocio-lotes':
        return <Lotes />;
      case 'negocio-registrar-producto':
        return <RegistrarProducto />;
      case 'negocio-inventario':
        return <Inventario />;
      case 'negocio-pos':
        return <POS />;
      case 'negocio-detalle-lote':
        return <DetalleLote />;

      // Common / General Reports
      case 'reportes':
        return <Reportes />;

      default:
        return <Hub />;
    }
  };

  return <Layout>{renderActiveView()}</Layout>;
};

function App() {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
}

export default App;
