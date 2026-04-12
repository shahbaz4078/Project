import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scan, Upload, Search, Camera, X } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/library';

const Scanner = () => {
  const navigate = useNavigate();
  const [productId, setProductId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const codeReader = useRef(null);

  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();
    return () => {
      if (codeReader.current) {
        codeReader.current.reset();
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setError('');
      setIsScanning(true);
      
      const videoInputDevices = await codeReader.current.listVideoInputDevices();
      if (videoInputDevices.length === 0) {
        throw new Error('No camera found');
      }

      const selectedDeviceId = videoInputDevices[0].deviceId;
      
      codeReader.current.decodeFromVideoDevice(selectedDeviceId, videoRef.current, (result, err) => {
        if (result) {
          try {
            const qrData = JSON.parse(result.text);
            if (qrData.productId) {
              navigate(`/product/${qrData.productId}`);
            } else {
              navigate(`/product/${result.text}`);
            }
          } catch {
            navigate(`/product/${result.text}`);
          }
          stopScanning();
        }
        if (err && !(err.name === 'NotFoundException')) {
          console.error(err);
        }
      });
    } catch (error) {
      setError('Camera access denied or not available');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReader.current) {
      codeReader.current.reset();
    }
    setIsScanning(false);
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (productId.trim()) {
      navigate(`/product/${productId.trim()}`);
    }
  };

  const demoProducts = [
    { 
      id: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12', 
      name: 'Organic Tomatoes', 
      status: 'Fresh',
      shortId: '0x1a2b...ef12'
    },
    { 
      id: '0x2b3c4d5e6f7890abcdef1234567890abcdef1234', 
      name: 'Free Range Eggs', 
      status: 'Available',
      shortId: '0x2b3c...1234'
    },
    { 
      id: '0x3c4d5e6f7890abcdef1234567890abcdef123456', 
      name: 'Grass Fed Beef', 
      status: 'Premium',
      shortId: '0x3c4d...3456'
    },
    { 
      id: '0x4d5e6f7890abcdef1234567890abcdef12345678', 
      name: 'Organic Apples', 
      status: 'Seasonal',
      shortId: '0x4d5e...5678'
    }
  ];

  return (
    <div className="container-fluid bg-light min-vh-100 py-5">
      <div className="container" style={{maxWidth: '800px'}}>
        <div className="text-center mb-5">
          <div className="feature-icon bg-warning text-white mb-4">
            <Scan size={32} />
          </div>
          <h1 className="display-4 fw-bold mb-3">Product Scanner</h1>
          <p className="lead text-muted">Verify product authenticity and view supply chain history</p>
        </div>

        {/* Camera Scanner Modal */}
        {isScanning && (
          <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Scan QR Code</h5>
                  <button type="button" className="btn-close" onClick={stopScanning}></button>
                </div>
                <div className="modal-body text-center">
                  <video 
                    ref={videoRef} 
                    className="img-fluid rounded"
                    style={{width: '100%', maxWidth: '400px', height: '300px'}}
                  />
                  <p className="mt-3 text-muted">Point your camera at a QR code</p>
                  {error && (
                    <div className="alert alert-danger mt-3">{error}</div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={stopScanning}>
                    <X size={16} className="me-2" />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="row g-4 mb-5">
          {/* Camera Scanner */}
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-body text-center">
                <div className="feature-icon bg-primary text-white mb-3">
                  <Camera size={32} />
                </div>
                <h5 className="card-title">Camera Scanner</h5>
                <p className="card-text text-muted">Use your camera to scan QR codes</p>
                <button 
                  className="btn btn-primary w-100"
                  onClick={startScanning}
                  disabled={isScanning}
                >
                  <Scan size={20} className="me-2" />
                  {isScanning ? 'Scanning...' : 'Start Camera'}
                </button>
              </div>
            </div>
          </div>

          {/* Manual Search */}
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-body text-center">
                <div className="feature-icon bg-success text-white mb-3">
                  <Search size={32} />
                </div>
                <h5 className="card-title">Manual Search</h5>
                <p className="card-text text-muted">Enter product hash ID directly</p>
                <form onSubmit={handleManualSearch}>
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control"
                      value={productId}
                      onChange={(e) => setProductId(e.target.value)}
                      placeholder="0x1a2b3c4d5e6f7890abcdef1234567890abcdef12"
                    />
                  </div>
                  <button type="submit" className="btn btn-success w-100">
                    <Search size={20} className="me-2" />
                    Search
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Products */}
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">Demo Products</h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              {demoProducts.map((product) => (
                <div key={product.id} className="col-md-6">
                  <button
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="btn btn-outline-primary w-100 text-start"
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-medium">{product.name}</div>
                        <small className="text-muted font-monospace">{product.shortId}</small>
                      </div>
                      <span className="badge bg-success">{product.status}</span>
                    </div>
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-light rounded">
              <h6 className="mb-2">💡 How to use:</h6>
              <ul className="small text-muted mb-0">
                <li>Click any demo product above to see its details</li>
                <li>Copy and paste a full hash ID in the search box</li>
                <li>Use camera to scan QR codes from registered products</li>
                <li>All product IDs are now blockchain-style hashes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scanner;
