import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Store, Package, ArrowRight, IndianRupee, CheckCircle, Wallet, ShoppingCart, TrendingUp } from 'lucide-react';
import { supplyApi } from '../services/supplyApi.js';

const Retailer = () => {
  const { address, isConnected } = useAccount();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [inventoryData, setInventoryData] = useState({
    quantity: '',
    retailPrice: '',
    discount: '',
    location: '',
    notes: ''
  });
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

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
    setInventoryData(prev => ({ ...prev, [name]: value }));
  };

  const handleInventoryUpdate = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      // Simulate inventory update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const selectedProductData = products.find(p => p.productId == selectedProduct);
      const finalPrice = inventoryData.retailPrice || selectedProductData?.predictedPrice || 0;
      const discountAmount = (finalPrice * (inventoryData.discount || 0)) / 100;
      
      setSuccess({
        productId: selectedProduct,
        productName: selectedProductData?.name,
        quantity: inventoryData.quantity,
        retailPrice: finalPrice,
        discount: inventoryData.discount,
        finalPrice: finalPrice - discountAmount,
        inventoryId: `INV${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      });
      
      setSelectedProduct('');
      setInventoryData({
        quantity: '',
        retailPrice: '',
        discount: '',
        location: '',
        notes: ''
      });
    } catch (error) {
      alert('Failed to update inventory');
    } finally {
      setLoading(false);
    }
  };

  const discountOptions = [
    { value: '0', label: 'No Discount' },
    { value: '5', label: '5% Off' },
    { value: '10', label: '10% Off' },
    { value: '15', label: '15% Off' },
    { value: '20', label: '20% Off' }
  ];

  return (
    <div className="container-fluid bg-light min-vh-100 py-5">
      <div className="container" style={{maxWidth: '800px'}}>
        {/* Header */}
        <div className="text-center mb-5">
          <div className="feature-icon bg-info text-white mb-4">
            <Store size={32} />
          </div>
          <h1 className="display-4 fw-bold mb-3">Retailer Dashboard</h1>
          <p className="lead text-muted">
            Manage inventory and set retail prices
          </p>
          {!isConnected && (
            <div className="alert alert-info">
              <Wallet size={16} className="me-2" />
              Wallet connection optional for demo
            </div>
          )}
        </div>

        {success ? (
          <div className="card text-center">
            <div className="card-body p-5">
              <div className="feature-icon bg-success text-white mb-4">
                <CheckCircle size={32} />
              </div>
              <h2 className="card-title">Inventory Updated Successfully!</h2>
              <p className="card-text mb-4">
                Inventory ID: <code className="bg-light p-1 rounded">{success.inventoryId}</code>
              </p>
              <div className="alert alert-success mb-4">
                <h6>Inventory Details:</h6>
                <div className="row text-start">
                  <div className="col-md-6">
                    <small><strong>Product:</strong> {success.productName}</small><br/>
                    <small><strong>Quantity:</strong> {success.quantity} units</small><br/>
                    <small><strong>Retail Price:</strong> ₹{success.retailPrice}</small>
                  </div>
                  <div className="col-md-6">
                    <small><strong>Discount:</strong> {success.discount}%</small><br/>
                    <small><strong>Final Price:</strong> ₹{success.finalPrice}</small><br/>
                    <small><strong>Updated:</strong> {new Date().toLocaleString()}</small>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSuccess(null)}
                className="btn btn-primary btn-lg"
              >
                Update Another Product
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleInventoryUpdate}>
            <div className="card mb-4">
              <div className="card-header">
                <h3 className="card-title mb-0">Select Product</h3>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-semibold">Product to Stock *</label>
                    <select
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className="form-select"
                      required
                    >
                      <option value="">Select a product</option>
                      {products.map(product => (
                        <option key={product.productId} value={product.productId}>
                          {product.name} - ₹{product.predictedPrice} ({product.status})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-header">
                <h3 className="card-title mb-0">Inventory Details</h3>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Quantity *</label>
                    <input
                      type="number"
                      name="quantity"
                      value={inventoryData.quantity}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="e.g., 100"
                      min="1"
                      required
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Retail Price (₹) *</label>
                    <input
                      type="number"
                      name="retailPrice"
                      value={inventoryData.retailPrice}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="e.g., 150"
                      min="1"
                      required
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Store Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={inventoryData.location}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="e.g., Delhi Store #1"
                      required
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Discount</label>
                    <select
                      name="discount"
                      value={inventoryData.discount}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      {discountOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label fw-semibold">Notes</label>
                    <textarea
                      name="notes"
                      value={inventoryData.notes}
                      onChange={handleInputChange}
                      className="form-control"
                      rows="3"
                      placeholder="Storage conditions, special offers, etc."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Price Preview */}
            {selectedProduct && inventoryData.retailPrice && (
              <div className="card mb-4 border-success">
                <div className="card-header bg-success text-white">
                  <h5 className="card-title mb-0">Price Preview</h5>
                </div>
                <div className="card-body">
                  <div className="row text-center">
                    <div className="col-md-4">
                      <h6>Retail Price</h6>
                      <h4 className="text-primary">₹{inventoryData.retailPrice}</h4>
                    </div>
                    <div className="col-md-4">
                      <h6>Discount</h6>
                      <h4 className="text-warning">{inventoryData.discount || 0}%</h4>
                    </div>
                    <div className="col-md-4">
                      <h6>Final Price</h6>
                      <h4 className="text-success">
                        ₹{(inventoryData.retailPrice - (inventoryData.retailPrice * (inventoryData.discount || 0) / 100)).toFixed(2)}
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center">
              <button
                type="submit"
                disabled={loading || !selectedProduct}
                className="btn btn-primary btn-lg"
              >
                {loading ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Updating Inventory...
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} className="me-2" />
                    Update Inventory
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Current Inventory */}
        <div className="card mt-5">
          <div className="card-header">
            <h5 className="card-title mb-0">Current Inventory</h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              {products.slice(0, 3).map((product) => (
                <div key={product.productId} className="col-md-4">
                  <div className="card border-info">
                    <div className="card-body text-center">
                      <Package size={24} className="text-info mb-2" />
                      <h6 className="card-title">{product.name}</h6>
                      <p className="card-text">
                        <small className="text-muted">
                          <IndianRupee size={12} className="me-1" />
                          ₹{product.predictedPrice}
                        </small>
                      </p>
                      <div className="d-flex justify-content-between">
                        <span className="badge bg-info">In Stock</span>
                        <span className="badge bg-success">
                          <TrendingUp size={12} className="me-1" />
                          High Demand
                        </span>
                      </div>
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

export default Retailer;
