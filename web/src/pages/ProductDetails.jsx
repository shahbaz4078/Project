import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Package, MapPin, Calendar, Leaf, User, Hash, ExternalLink, IndianRupee } from 'lucide-react';
import { supplyApi } from '../services/supplyApi.js';
import AIAnalytics from '../components/AIAnalytics';
import AmazonTimeline from '../components/AmazonTimeline';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await supplyApi.getProduct(id);
      setProduct(data);
    } catch (err) {
      console.error('Product fetch error:', err);
      setError(`Product not found: ${id}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-fluid bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <div className="card text-center" style={{maxWidth: '500px'}}>
          <div className="card-body p-5">
            <div className="feature-icon bg-danger text-white mb-4">
              <Package size={32} />
            </div>
            <h4 className="card-title">Product Not Found</h4>
            <p className="card-text text-muted mb-4">{error}</p>
            <div className="alert alert-info text-start">
              <h6>Use a real product id</h6>
              <p className="small mb-0">
                Open the catalog from Home or Consumer, or register a product as a logged-in farmer — URLs use
                MongoDB <code>_id</code> values.
              </p>
            </div>
            <a href="/scanner" className="btn btn-primary">
              Back to Scanner
            </a>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'fresh': return 'success';
      case 'available': return 'info';
      case 'premium': return 'warning';
      case 'seasonal': return 'primary';
      default: return 'secondary';
    }
  };

  const getFarmingMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'organic': return '🌱';
      case 'hydroponic': return '💧';
      default: return '🚜';
    }
  };

  return (
    <div className="container-fluid bg-light min-vh-100 py-5">
      <div className="container" style={{maxWidth: '1000px'}}>
        {/* Header */}
        <div className="text-center mb-5">
          <div className="feature-icon bg-primary text-white mb-4">
            <Package size={32} />
          </div>
          <h1 className="display-4 fw-bold mb-3">{product.name}</h1>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <span className={`badge bg-${getStatusColor(product.status)} fs-6`}>
              {product.status}
            </span>
            <span className="badge bg-secondary fs-6">
              ID: {product.productId?.length > 20 ? `${product.productId.slice(0, 10)}...` : product.productId}
            </span>
            {product.predictedPrice && (
              <span className="badge bg-success fs-6">
                <IndianRupee size={14} className="me-1" />
                ₹{product.predictedPrice}
              </span>
            )}
          </div>
        </div>

        {/* Product Information */}
        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="card-title mb-0">Product Information</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <Package size={16} className="text-primary me-2" />
                    <strong>Description:</strong>
                  </div>
                  <p className="text-muted ms-4">{product.description || 'No description available'}</p>
                </div>

                <div className="mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <Hash size={16} className="text-primary me-2" />
                    <strong>Category:</strong>
                  </div>
                  <span className="badge bg-info ms-4">{product.category}</span>
                </div>

                {product.farmingMethod && (
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <Leaf size={16} className="text-success me-2" />
                      <strong>Farming Method:</strong>
                    </div>
                    <span className="ms-4">
                      {getFarmingMethodIcon(product.farmingMethod)} {product.farmingMethod}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="card-title mb-0">Supply Chain Details</h5>
              </div>
              <div className="card-body">
                {product.location && (
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <MapPin size={16} className="text-danger me-2" />
                      <strong>Location:</strong>
                    </div>
                    <p className="text-muted ms-4">{product.location}</p>
                  </div>
                )}

                {product.harvestDate && (
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <Calendar size={16} className="text-warning me-2" />
                      <strong>Harvest Date:</strong>
                    </div>
                    <p className="text-muted ms-4">
                      {new Date(product.harvestDate).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {product.farmer && (
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <User size={16} className="text-info me-2" />
                      <strong>Farmer:</strong>
                    </div>
                    <p className="text-muted ms-4">{product.farmer}</p>
                  </div>
                )}

                {product.transactionHash && (
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <ExternalLink size={16} className="text-secondary me-2" />
                      <strong>Transaction:</strong>
                    </div>
                    <code className="ms-4 small">{product.transactionHash.slice(0, 20)}...</code>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* AI Analytics */}
        {product.aiAnalysis && (
          <AIAnalytics aiAnalysis={product.aiAnalysis} productData={product} />
        )}

        {/* Amazon-Style Supply Chain Timeline */}
        <AmazonTimeline productId={product.productId} />

        {/* Verification Badge */}
        <div className="text-center mt-4">
          <div className="alert alert-success d-inline-block">
            <strong>✓ Blockchain Verified</strong><br/>
            This product is registered on the blockchain and its authenticity is guaranteed.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
