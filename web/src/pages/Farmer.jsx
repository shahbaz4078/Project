import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Leaf, Plus, CheckCircle, Wallet } from 'lucide-react';
import { supplyApi } from '../services/supplyApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import QRCode from 'qrcode';

const Farmer = () => {
  const { isAuthenticated } = useAuth();
  const { address, isConnected } = useAccount();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    harvestDate: '',
    location: '',
    farmingMethod: 'organic'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [qrCode, setQrCode] = useState('');

  const categories = ['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Meat', 'Herbs'];
  const farmingMethods = [
    { value: 'organic', label: 'Organic' },
    { value: 'conventional', label: 'Conventional' },
    { value: 'hydroponic', label: 'Hydroponic' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateQRCode = async (productId) => {
    try {
      const qrData = JSON.stringify({
        productId,
        url: `${window.location.origin}/product/${productId}`
      });
      const qrCodeDataURL = await QRCode.toDataURL(qrData);
      setQrCode(qrCodeDataURL);
    } catch (error) {
      console.error('QR Code generation failed:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please use API login (navbar) as a farmer before registering products.');
      return;
    }
    setLoading(true);
    try {
      const result = await supplyApi.registerProduct({
        ...formData,
        farmerAddress: address || 'demo-farmer',
      });
      
      setSuccess(result);
      await generateQRCode(result.productId);
      setFormData({
        name: '', description: '', category: '', harvestDate: '', location: '', farmingMethod: 'organic'
      });
    } catch (error) {
      console.error('Registration error:', error);
      alert(`Registration failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid bg-light min-vh-100 py-5">
      <div className="container" style={{maxWidth: '800px'}}>
        {/* Header */}
        <div className="text-center mb-5">
          <div className="feature-icon bg-success text-white mb-4">
            <Leaf size={32} />
          </div>
          <h1 className="display-4 fw-bold mb-3">Register Your Products</h1>
          <p className="lead text-muted">
            Add your products to the blockchain for complete transparency
          </p>
          {!isConnected && (
            <div className="alert alert-info">
              <Wallet size={16} className="me-2" />
              Wallet connection optional — REST API + MongoDB store the record
            </div>
          )}
          {!isAuthenticated && (
            <div className="alert alert-warning">
              <Link to="/login" className="alert-link fw-bold">
                API login
              </Link>{' '}
              required to create products (JWT → Express → MongoDB).
            </div>
          )}
        </div>

        {success ? (
          <div className="card text-center">
            <div className="card-body p-5">
              <div className="feature-icon bg-success text-white mb-4">
                <CheckCircle size={32} />
              </div>
              <h2 className="card-title">Product Registered Successfully!</h2>
              <p className="card-text mb-4">
                Product ID: <code className="bg-light p-1 rounded">{success.productId}</code>
              </p>
              
              {success.aiAnalysis && (
                <div className="alert alert-info mb-4">
                  <h6>AI Analysis Results:</h6>
                  <div className="row text-start">
                    <div className="col-md-6">
                      <small><strong>Predicted Price:</strong> {success.aiAnalysis.predictedPrice}</small><br/>
                      <small><strong>Price Trend:</strong> {success.aiAnalysis.priceTrend}</small>
                    </div>
                    <div className="col-md-6">
                      <small><strong>Demand Level:</strong> {success.aiAnalysis.demandLevel}</small><br/>
                      <small><strong>Risk Level:</strong> {success.aiAnalysis.riskLevel}</small>
                    </div>
                  </div>
                </div>
              )}
              
              {qrCode && (
                <div className="bg-light p-4 rounded mb-4 d-inline-block">
                  <img src={qrCode} alt="QR Code" className="img-fluid" style={{width: '200px'}} />
                  <p className="small text-muted mt-3 mb-0">Scan this QR code to track your product</p>
                </div>
              )}
              
              <button
                onClick={() => setSuccess(null)}
                className="btn btn-primary btn-lg"
              >
                Register Another Product
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="card mb-4">
              <div className="card-header">
                <h3 className="card-title mb-0">Product Information</h3>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Product Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="e.g., Organic Tomatoes"
                      required
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label fw-semibold">Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="form-control"
                      rows="4"
                      placeholder="Describe your product, growing conditions, quality, etc."
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-header">
                <h3 className="card-title mb-0">Farm Details</h3>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Farm Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="e.g., California, USA"
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Harvest Date</label>
                    <input
                      type="date"
                      name="harvestDate"
                      value={formData.harvestDate}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label fw-semibold">Farming Method</label>
                    <div className="row g-3">
                      {farmingMethods.map(method => (
                        <div key={method.value} className="col-md-4">
                          <div className={`card h-100 ${formData.farmingMethod === method.value ? 'border-success bg-light' : ''}`}>
                            <div className="card-body text-center">
                              <input
                                type="radio"
                                name="farmingMethod"
                                value={method.value}
                                checked={formData.farmingMethod === method.value}
                                onChange={handleInputChange}
                                className="form-check-input mb-3"
                                id={method.value}
                              />
                              <label htmlFor={method.value} className="form-check-label">
                                <Leaf size={24} className="text-success mb-2 d-block mx-auto" />
                                <span className="fw-medium">{method.label}</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg"
              >
                {loading ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Registering...
                  </>
                ) : (
                  <>
                    <Plus size={20} className="me-2" />
                    Register Product
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Farmer;
