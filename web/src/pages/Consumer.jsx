import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, Package, Star, CheckCircle, Wallet, Eye, ShieldCheck } from 'lucide-react';
import { supplyApi } from '../services/supplyApi.js';

const Consumer = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [reviews, setReviews] = useState({});

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const allProducts = await supplyApi.getAllProducts();
      setProducts(allProducts);
      
      // Mock reviews
      const mockReviews = {};
      allProducts.forEach(product => {
        mockReviews[product.productId] = {
          rating: 4 + Math.random(),
          count: Math.floor(Math.random() * 50) + 10
        };
      });
      setReviews(mockReviews);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      window.location.href = `/product/${searchId.trim()}`;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'fresh': return 'success';
      case 'available': return 'info';
      case 'premium': return 'warning';
      case 'seasonal': return 'primary';
      default: return 'secondary';
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={16} className="text-warning" fill="currentColor" />);
    }
    if (hasHalfStar) {
      stars.push(<Star key="half" size={16} className="text-warning" fill="currentColor" style={{opacity: 0.5}} />);
    }
    return stars;
  };

  return (
    <div className="container-fluid bg-light min-vh-100 py-5">
      <div className="container" style={{maxWidth: '1000px'}}>
        {/* Header */}
        <div className="text-center mb-5">
          <div className="feature-icon bg-warning text-white mb-4">
            <Users size={32} />
          </div>
          <h1 className="display-4 fw-bold mb-3">Consumer Portal</h1>
          <p className="lead text-muted">
            Verify product authenticity and view supply chain transparency
          </p>
        </div>

        {/* Search Section */}
        <div className="card mb-5">
          <div className="card-header">
            <h3 className="card-title mb-0">Search Products</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSearch} className="row g-3">
              <div className="col-md-8">
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="form-control form-control-lg"
                  placeholder="Enter Product ID (e.g., 1, 2, 3, 4)"
                />
              </div>
              <div className="col-md-4">
                <button type="submit" className="btn btn-primary btn-lg w-100">
                  <Search size={20} className="me-2" />
                  Search Product
                </button>
              </div>
            </form>
            <div className="mt-3">
              <small className="text-muted">
                💡 Try searching for product IDs: 1, 2, 3, or 4 to see detailed information
              </small>
            </div>
          </div>
        </div>

        {/* Available Products */}
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h3 className="card-title mb-0">Available Products</h3>
            <span className="badge bg-primary">{products.length} Products</span>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading products...</p>
              </div>
            ) : (
              <div className="row g-4">
                {products.map((product) => (
                  <div key={product.productId} className="col-md-6 col-lg-4">
                    <div className="card h-100 border-0 shadow-sm">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="feature-icon bg-primary text-white" style={{width: '40px', height: '40px'}}>
                            <Package size={20} />
                          </div>
                          <span className={`badge bg-${getStatusColor(product.status)}`}>
                            {product.status}
                          </span>
                        </div>
                        
                        <h5 className="card-title">{product.name}</h5>
                        <p className="card-text text-muted small">
                          {product.description?.substring(0, 80)}...
                        </p>
                        
                        <div className="mb-3">
                          <div className="d-flex align-items-center mb-1">
                            {reviews[product.productId] && renderStars(reviews[product.productId].rating)}
                            <small className="text-muted ms-2">
                              ({reviews[product.productId]?.count} reviews)
                            </small>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-bold text-success fs-5">
                              ₹{product.predictedPrice} <span className="fs-6 text-muted fw-normal">/{product.priceUnit?.replace('per ', '') || 'kg'}</span>
                            </span>
                            <small className="text-muted">ID: {product.productId?.length > 8 ? product.productId.slice(0,8) + '...' : product.productId}</small>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <small className="text-muted d-block text-truncate">
                            <strong>Origin:</strong> {product.location || 'Pending Details'}
                          </small>
                          <small className="text-muted d-block text-truncate">
                            <strong>Method:</strong> {product.farmingMethod || 'Standard'}
                          </small>
                          <small className="text-muted d-block text-truncate">
                            <strong>Farmer:</strong> {product.farmer}
                          </small>
                          <small className="text-success d-block fw-semibold mt-1">
                            🚚 Est. Delivery: {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})}
                          </small>
                        </div>
                        
                        <div className="d-grid gap-2">
                          <div className="d-flex gap-2">
                            <Link 
                              to={`/product/${product.productId}`}
                              className="btn btn-primary flex-grow-1"
                            >
                              <Eye size={16} className="me-2" />
                              View
                            </Link>
                            <button 
                              className="btn btn-success flex-grow-1"
                              onClick={() => alert(`Purchased ${product.name}!`)}
                            >
                              Buy Now
                            </button>
                          </div>
                          <div className="text-center mt-1">
                            <small className="text-success fw-medium">
                              <ShieldCheck size={14} className="me-1" />
                              Blockchain Verified
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="row mt-5">
          <div className="col-md-4 text-center">
            <div className="feature-icon bg-success text-white mb-3">
              <ShieldCheck size={32} />
            </div>
            <h5>Verified Products</h5>
            <p className="text-muted">All products are blockchain verified for authenticity</p>
          </div>
          <div className="col-md-4 text-center">
            <div className="feature-icon bg-info text-white mb-3">
              <Eye size={32} />
            </div>
            <h5>Full Transparency</h5>
            <p className="text-muted">Complete supply chain visibility from farm to table</p>
          </div>
          <div className="col-md-4 text-center">
            <div className="feature-icon bg-warning text-white mb-3">
              <Star size={32} />
            </div>
            <h5>Quality Assured</h5>
            <p className="text-muted">AI-powered quality and fraud detection</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Consumer;
