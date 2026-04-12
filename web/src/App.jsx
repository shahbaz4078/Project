import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './config/wagmi';
import { AuthProvider } from './context/AuthContext.jsx';
import { SocketBridge } from './components/SocketBridge.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Farmer from './pages/Farmer';
import Distributor from './pages/Distributor';
import Retailer from './pages/Retailer';
import Scanner from './pages/Scanner';
import Consumer from './pages/Consumer';
import ProductDetails from './pages/ProductDetails';
import Login from './pages/Login.jsx';

const queryClient = new QueryClient();

function App() {
  return (
    <AuthProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <Router>
            <div className="min-vh-100">
              <SocketBridge />
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route
                  path="/farmer"
                  element={
                    <ProtectedRoute allowedRole="farmer">
                      <Farmer />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/distributor"
                  element={
                    <ProtectedRoute allowedRole="processor">
                      <Distributor />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/retailer"
                  element={
                    <ProtectedRoute allowedRole="retailer">
                      <Retailer />
                    </ProtectedRoute>
                  }
                />
                <Route path="/scanner" element={<Scanner />} />
                <Route
                  path="/consumer"
                  element={
                    <ProtectedRoute allowedRole="consumer">
                      <Consumer />
                    </ProtectedRoute>
                  }
                />
                <Route path="/product/:id" element={<ProductDetails />} />
              </Routes>
            </div>
          </Router>
        </QueryClientProvider>
      </WagmiProvider>
    </AuthProvider>
  );
}

export default App;
