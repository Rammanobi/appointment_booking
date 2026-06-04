import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CreateAppointment from './pages/CreateAppointment';
import Loading from './pages/Loading';
import Success from './pages/Success';
import ErrorPage from './pages/Error';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="create" element={<CreateAppointment />} />
          <Route path="processing" element={<Loading />} />
          <Route path="success" element={<Success />} />
          <Route path="error" element={<ErrorPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
