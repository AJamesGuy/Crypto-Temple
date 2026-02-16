import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/NavBar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Trade from './pages/Trade';
import Portfolio from './pages/Portfolio';
import Settings from './pages/Settings';



const Protected = ({ children }) => { // This component checks if the user is authenticated before rendering the protected route
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />; // If the user is not authenticated, redirect to the login page
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-950">
          <Navbar />
          <div className="pt-16 pb-8 max-w-7xl mx-auto px-4">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
              <Route path="/trade" element={<Protected><Trade /></Protected>} />
              <Route path="/portfolio" element={<Protected><Portfolio /></Protected>} />
              <Route path="/settings" element={<Protected><Settings /></Protected>} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
export default App;