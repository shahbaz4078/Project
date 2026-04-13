import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Leaf, Truck, Store, Scan, Shield, Users, ArrowRight, TrendingUp, Package, IndianRupee, BarChart3, AlertTriangle, RefreshCw } from 'lucide-react';
import { supplyApi } from '../services/supplyApi.js';
import { useAuth } from '../context/AuthContext.jsx';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    loadRecentProducts();
    const interval = setInterval(loadRecentProducts, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setSummary(null);
      return;
    }
    supplyApi
      .getAnalyticsSummary()
      .then(setSummary)
      .catch(() => setSummary(null));
  }, [isAuthenticated]);

  const loadRecentProducts = async () => {
    try {
      const products = await supplyApi.getAllProducts();
      setRecentProducts(products.slice(-4));
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    loadRecentProducts();
  };

  const roles = [
    {
      icon: <Leaf size={32} />,
      title: 'Farmer',
      description: 'Register your products',
      link: '/farmer',
      color: 'bg-success'
    },
    {
      icon: <Truck size={32} />,
      title: 'Distributor',
      description: 'Track shipments',
      link: '/distributor',
      color: 'bg-success'
    },
    {
      icon: <Store size={32} />,
      title: 'Retailer',
      description: 'Manage inventory',
      link: '/retailer',
      color: 'bg-info'
    },
    {
      icon: <Users size={32} />,
      title: 'Consumer',
      description: 'Verify products',
      link: '/consumer',
      color: 'bg-warning'
    }
  ];

  const totalProducts = summary?.productCount ?? recentProducts.length;
  const shipmentTotal = summary?.shipmentsByStatus
    ? Object.values(summary.shipmentsByStatus).reduce((a, b) => a + b, 0)
    : recentProducts.length;

  const dashboardMetrics = [
    {
      title: 'Catalog products',
      value: String(totalProducts),
      change: summary ? 'API' : 'live',
      icon: <Package size={24} />,
      color: 'primary',
      link: '/scanner',
    },
    {
      title: 'Shipments (all)',
      value: String(shipmentTotal),
      change: summary ? 'MongoDB' : '—',
      icon: <IndianRupee size={24} />,
      color: 'success',
      link: '/distributor',
    },
    {
      title: 'Registered users',
      value: summary ? String(summary.userCount) : '—',
      change: isAuthenticated ? 'JWT' : 'login',
      icon: <Users size={24} />,
      color: 'info',
      link: '/login',
    },
    {
      title: 'Realtime',
      value: isAuthenticated ? 'ON' : '—',
      change: 'Socket.io',
      icon: <AlertTriangle size={24} />,
      color: 'warning',
      link: '/login',
    },
  ];

  // April 2026 — Based on Indian Mandi Rates & AGMARKNET data
  const marketTrends = [
    { category: 'Vegetables', trend: 'up',   price: '₹45/kg',  change: '+18%', detail: 'Tomato, Onion surging' },
    { category: 'Fruits',     trend: 'down',  price: '₹115/kg', change: '-8%',  detail: 'Apple, Grapes peak arrival' },
    { category: 'Grains',     trend: 'stable',price: '₹42/kg',  change: '+2%',  detail: 'Rice stable, Maize rising' },
    { category: 'Dairy',      trend: 'up',    price: '₹66/L',   change: '+4%',  detail: 'Amul milk rate hike' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <div className="hero-section text-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="badge bg-light text-success mb-4 p-2">
                <Shield size={16} className="me-2" />
                Blockchain Powered Dashboard
              </div>

              <h1 className="display-2 fw-bold mb-4">
                Agri Supply
                <br />
                <span className="text-white">Chain</span>
              </h1>

              <p className="lead mb-5">
                Real-time insights and AI-powered analytics for complete supply chain transparency
              </p>

              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                <Link to="/scanner" className="btn btn-light btn-lg">
                  <Scan size={20} className="me-2" />
                  Scan Product
                </Link>
                <Link to="/farmer" className="btn btn-outline-light btn-lg">
                  Register Product
                  <ArrowRight size={16} className="ms-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Metrics */}
      <div className="container my-5">
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-center align-items-center gap-3">
              <h2 className="display-5 fw-bold mb-0">Live Dashboard</h2>
              <span className="badge bg-success">LIVE</span>
              <button
                onClick={handleRefresh}
                className="btn btn-outline-primary btn-sm"
                disabled={loading}
              >
                <RefreshCw size={16} className={loading ? 'spin' : ''} />
              </button>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-5">
          {dashboardMetrics.map((metric, index) => (
            <div key={index} className="col-md-6 col-lg-3">
              <Link to={metric.link} className="text-decoration-none">
                <div className="card h-100 border-0 shadow-sm hover-card">
                  <div className="card-body text-center">
                    <div className={`feature-icon bg-${metric.color} text-white mb-3`}>
                      {metric.icon}
                    </div>
                    <h3 className="fw-bold mb-1 text-dark">{metric.value}</h3>
                    <p className="text-muted mb-2">{metric.title}</p>
                    <span className={`badge ${metric.change.startsWith('+') ? 'bg-success' : 'bg-danger'}`}>
                      <TrendingUp size={12} className="me-1" />
                      {metric.change}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Recent Product & Market Trends */}
        <div className="row g-4 mb-5">
          <div className="col-lg-6">
            <div className="card h-100">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">
                  Recent Product
                  <span className="badge bg-success ms-2">{recentProducts.length}</span>
                </h5>
                <Link to="/scanner" className="btn btn-sm btn-outline-success">View All</Link>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : recentProducts.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <Package size={48} className="mb-3 opacity-50" />
                    <p>No products registered yet</p>
                    <Link to="/farmer" className="btn btn-primary btn-sm">
                      Register First Product
                    </Link>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {recentProducts.map((product) => (
                      <Link
                        key={String(product.productId)}
                        to={`/product/${product.productId}`}
                        className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 text-decoration-none hover-item"
                      >
                        <div>
                          <h6 className="mb-1 text-dark">{product.name}</h6>
                          <small className="text-muted">by {product.farmer}</small>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold text-success">₹{product.predictedPrice}</div>
                          <span className="badge bg-light text-dark">{product.status}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="card-title mb-0 d-flex align-items-center">
                  <BarChart3 size={20} className="me-2" />
                  Market Trends
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {marketTrends.map((trend, index) => (
                    <div key={index} className="col-6">
                      <div className="text-center p-3 bg-light rounded hover-item">
                        <h6 className="mb-1">{trend.category}</h6>
                        <div className="fw-bold text-success mb-1">{trend.price}</div>
                        <span className={`badge ${trend.trend === 'up' ? 'bg-success' : trend.trend === 'down' ? 'bg-danger' : 'bg-secondary'}`}>
                          {trend.change}
                        </span>
                        {trend.detail && <div className="mt-1" style={{fontSize:'0.7rem',color:'#6b7280'}}>{trend.detail}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role Cards */}
      <div className="container my-5">
        <div className="row mb-4">
          <div className="col-12">
            <h2 className="display-5 fw-bold text-center mb-4">Choose Your Role</h2>
          </div>
        </div>

        <div className="row g-4">
          {roles.map((role, index) => (
            <div key={index} className="col-md-6 col-lg-3">
              <Link to={role.link} className="text-decoration-none">
                <div className="card h-100 text-center border-0 shadow-sm hover-card">
                  <div className="card-body">
                    <div className={`feature-icon ${role.color} text-white mb-3`}>
                      {role.icon}
                    </div>

                    <h5 className="card-title text-dark">{role.title}</h5>
                    <p className="card-text text-muted">{role.description}</p>

                    <div className="text-primary fw-medium">
                      Get started
                      <ArrowRight size={16} className="ms-1" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="container my-5">
        <div className="text-center mb-5">
          <h2 className="display-4 fw-bold">Why Choose Our Platform?</h2>
        </div>

        <div className="row g-4">
          <div className="col-md-4 text-center">
            <div className="feature-icon bg-success text-white">
              <Shield size={32} />
            </div>
            <h4 className="fw-bold">Secure</h4>
            <p className="text-muted">Blockchain-secured records that can't be tampered with</p>
          </div>

          <div className="col-md-4 text-center">
            <div className="feature-icon bg-info text-white">
              <Scan size={32} />
            </div>
            <h4 className="fw-bold">Traceable</h4>
            <p className="text-muted">Complete product journey from origin to consumer</p>
          </div>

          <div className="col-md-4 text-center">
            <div className="feature-icon bg-warning text-white">
              <Users size={32} />
            </div>
            <h4 className="fw-bold">Trusted</h4>
            <p className="text-muted">Multi-stakeholder verification for authenticity</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
          transition: all 0.3s ease;
        }
        .hover-item:hover {
          background-color: #f8f9fa !important;
          transition: all 0.2s ease;
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Home;
