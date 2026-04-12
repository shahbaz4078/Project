import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Truck, Package, MapPin, CheckCircle, Wallet, Route } from 'lucide-react';
import { supplyApi } from '../services/supplyApi.js';
import { useAuth } from '../context/AuthContext.jsx';

const Distributor = () => {
  const { isAuthenticated } = useAuth();
  const { isConnected } = useAccount();
  const [products, setProducts] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [shipmentData, setShipmentData] = useState({
    destination: '',
    estimatedDelivery: '',
    transportMethod: 'truck',
    notes: '',
  });
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (!selectedProduct) {
      setBatches([]);
      setSelectedBatch('');
      return;
    }
    (async () => {
      try {
        const list = await supplyApi.listBatchesPublic(selectedProduct);
        setBatches(list);
        setSelectedBatch(list[0]?._id || '');
      } catch (e) {
        console.error(e);
        setBatches([]);
      }
    })();
  }, [selectedProduct]);

  const loadProducts = async () => {
    try {
      const allProducts = await supplyApi.getAllProducts();
      setProducts(allProducts);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShipmentData(prev => ({ ...prev, [name]: value }));
  };

  const handleShipmentUpdate = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('API login required (processor / admin / farmer for own batches).');
      return;
    }
    if (!selectedBatch) {
      alert('No batch for this product — register a product as a farmer first.');
      return;
    }
    setLoading(true);
    try {
      const eta = shipmentData.estimatedDelivery
        ? new Date(shipmentData.estimatedDelivery).toISOString()
        : undefined;
      const created = await supplyApi.createShipment({
        batchId: selectedBatch,
        status: 'in_transit',
        destination: shipmentData.destination,
        eta,
        origin: '',
        rfidTags: [],
      });
      setSuccess({
        productId: selectedProduct,
        trackingId: created._id,
        status: created.status || 'in_transit',
      });
      setSelectedProduct('');
      setSelectedBatch('');
      setShipmentData({
        destination: '',
        estimatedDelivery: '',
        transportMethod: 'truck',
        notes: '',
      });
    } catch (error) {
      alert(error.response?.data?.error || error.message || 'Failed to create shipment');
    } finally {
      setLoading(false);
    }
  };

  const transportMethods = [
    { value: 'truck', label: '🚛 Truck', description: 'Road transport' },
    { value: 'ship', label: '🚢 Ship', description: 'Sea freight' },
    { value: 'plane', label: '✈️ Air', description: 'Air cargo' }
  ];

  return (
    <div className="container-fluid bg-light min-vh-100 py-5">
      <div className="container" style={{maxWidth: '800px'}}>
        {/* Header */}
        <div className="text-center mb-5">
          <div className="feature-icon bg-primary text-white mb-4">
            <Truck size={32} />
          </div>
          <h1 className="display-4 fw-bold mb-3">Distributor Dashboard</h1>
          <p className="lead text-muted">
            Manage shipments and track product distribution
          </p>
          {!isConnected && (
            <div className="alert alert-info">
              <Wallet size={16} className="me-2" />
              Wallet optional — shipments use REST + Socket.io
            </div>
          )}
          {!isAuthenticated && (
            <div className="alert alert-warning">
              <Link to="/login" className="alert-link fw-bold">
                API login
              </Link>{' '}
              (farmer for own batches, or processor/admin) to create shipments in MongoDB.
            </div>
          )}
        </div>

        {success ? (
          <div className="card text-center">
            <div className="card-body p-5">
              <div className="feature-icon bg-success text-white mb-4">
                <CheckCircle size={32} />
              </div>
              <h2 className="card-title">Shipment Updated Successfully!</h2>
                <p className="card-text mb-4">
                Shipment id: <code className="bg-light p-1 rounded">{success.trackingId}</code>
              </p>
              <div className="alert alert-success mb-4">
                <h6>Shipment Details:</h6>
                <div className="text-start">
                  <small><strong>Product ID:</strong> {success.productId}</small><br/>
                  <small><strong>Status:</strong> {success.status}</small><br/>
                  <small><strong>Updated:</strong> {new Date().toLocaleString()}</small>
                </div>
              </div>
              <button
                onClick={() => setSuccess(null)}
                className="btn btn-primary btn-lg"
              >
                Update Another Shipment
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleShipmentUpdate}>
            <div className="card mb-4">
              <div className="card-header">
                <h3 className="card-title mb-0">Select Product</h3>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-semibold">Product to Ship *</label>
                    <select
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className="form-select"
                      required
                    >
                      <option value="">Select a product</option>
                      {products.map((product) => (
                        <option key={String(product.productId)} value={String(product.productId)}>
                          {product.name} ({product.category || 'crop'})
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedProduct && batches.length > 0 && (
                    <div className="col-12">
                      <label className="form-label fw-semibold">Batch *</label>
                      <select
                        value={selectedBatch}
                        onChange={(e) => setSelectedBatch(e.target.value)}
                        className="form-select"
                        required
                      >
                        {batches.map((b) => (
                          <option key={b._id} value={b._id}>
                            {b.batchCode} — QR {b.qrPayload?.slice(0, 12)}…
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-header">
                <h3 className="card-title mb-0">Shipment Details</h3>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Destination *</label>
                    <input
                      type="text"
                      name="destination"
                      value={shipmentData.destination}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="e.g., Mumbai, Maharashtra"
                      required
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Estimated Delivery *</label>
                    <input
                      type="date"
                      name="estimatedDelivery"
                      value={shipmentData.estimatedDelivery}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                    />
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label fw-semibold">Transport Method</label>
                    <div className="row g-3">
                      {transportMethods.map(method => (
                        <div key={method.value} className="col-md-4">
                          <div className={`card h-100 ${shipmentData.transportMethod === method.value ? 'border-primary bg-light' : ''}`}>
                            <div className="card-body text-center">
                              <input
                                type="radio"
                                name="transportMethod"
                                value={method.value}
                                checked={shipmentData.transportMethod === method.value}
                                onChange={handleInputChange}
                                className="form-check-input mb-3"
                                id={method.value}
                              />
                              <label htmlFor={method.value} className="form-check-label">
                                <div className="fs-4 mb-2">{method.label.split(' ')[0]}</div>
                                <div className="fw-medium">{method.label.split(' ')[1]}</div>
                                <small className="text-muted">{method.description}</small>
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label fw-semibold">Shipping Notes</label>
                    <textarea
                      name="notes"
                      value={shipmentData.notes}
                      onChange={handleInputChange}
                      className="form-control"
                      rows="3"
                      placeholder="Special handling instructions, delivery notes, etc."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                type="submit"
                disabled={loading || !selectedProduct || !selectedBatch}
                className="btn btn-primary btn-lg"
              >
                {loading ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Updating Shipment...
                  </>
                ) : (
                  <>
                    <Route size={20} className="me-2" />
                    Update Shipment Status
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Active Shipments */}
        <div className="card mt-5">
          <div className="card-header">
            <h5 className="card-title mb-0">Recent Shipments</h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              {products.slice(0, 3).map((product) => (
                <div key={product.productId} className="col-md-4">
                  <div className="card border-primary">
                    <div className="card-body text-center">
                      <Package size={24} className="text-primary mb-2" />
                      <h6 className="card-title">{product.name}</h6>
                      <p className="card-text">
                        <small className="text-muted">
                          <MapPin size={12} className="me-1" />
                          {product.category || '—'}
                        </small>
                      </p>
                      <span className="badge bg-success">In Transit</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Distributor;
