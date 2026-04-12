import { useState, useEffect } from 'react';
import { Calendar, Truck, Package, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { supplyApi } from '../services/supplyApi.js';
import { getSocket } from '../services/socket.js';

const RealTimeTimeline = ({ productId, initialTimeline = [] }) => {
  const [timeline, setTimeline] = useState(initialTimeline);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  // Fetch real-time updates from API
  const fetchTimelineUpdates = async () => {
    try {
      setIsLoading(true);
      const updates = await supplyApi.getTimelineUpdates(productId);
      
      setTimeline(prev => {
        const existingTitles = new Set(prev.map(event => event.title));
        const newEvents = updates.filter(event => !existingTitles.has(event.title));
        
        if (newEvents.length > 0) {
          setLastUpdate(new Date());
          return [...prev, ...newEvents].slice(-15); // Keep only last 15 events
        }
        return prev;
      });
    } catch (error) {
      console.error('Failed to fetch timeline updates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimelineUpdates();
    const interval = setInterval(fetchTimelineUpdates, 10000);
    return () => clearInterval(interval);
  }, [productId]);

  useEffect(() => {
    const s = getSocket();
    if (!s) return;
    const onShipment = () => fetchTimelineUpdates();
    s.on('shipment:updated', onShipment);
    s.on('shipment:location', onShipment);
    return () => {
      s.off('shipment:updated', onShipment);
      s.off('shipment:location', onShipment);
    };
  }, [productId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'warning';
      case 'shipped': return 'info';
      case 'delivered': return 'primary';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} />;
      case 'processing': return <Clock size={16} />;
      case 'shipped': return <Truck size={16} />;
      case 'delivered': return <Package size={16} />;
      default: return <Calendar size={16} />;
    }
  };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">Real-Time Supply Chain Timeline</h5>
        <div className="d-flex align-items-center">
          {isLoading ? (
            <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : (
            <div className="spinner-border spinner-border-sm text-success me-2" role="status">
              <span className="visually-hidden">Live updates...</span>
            </div>
          )}
          <small className="text-muted">
            Last update: {lastUpdate.toLocaleTimeString()}
          </small>
          <button 
            className="btn btn-sm btn-outline-primary ms-2"
            onClick={fetchTimelineUpdates}
            disabled={isLoading}
          >
            <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
          </button>
        </div>
      </div>
      <div className="card-body">
        {timeline.length === 0 ? (
          <div className="text-center text-muted py-4">
            <Clock size={32} className="mb-2" />
            <p>Waiting for timeline updates...</p>
          </div>
        ) : (
          <div className="timeline">
            {timeline
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .map((event, index) => (
              <div key={event.id || index} className="timeline-item">
                <div className={`timeline-marker bg-${getStatusColor(event.status)}`}>
                  {getStatusIcon(event.status)}
                </div>
                <div className="timeline-content">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">{event.title}</h6>
                      <p className="text-muted mb-1 small">{event.description}</p>
                      <small className="text-muted">
                        {new Date(event.timestamp).toLocaleString()}
                      </small>
                    </div>
                    <span className={`badge bg-${getStatusColor(event.status)} ms-2`}>
                      {event.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .timeline {
          position: relative;
          padding-left: 40px;
        }
        .timeline::before {
          content: '';
          position: absolute;
          left: 20px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #dee2e6;
        }
        .timeline-item {
          position: relative;
          margin-bottom: 25px;
        }
        .timeline-marker {
          position: absolute;
          left: -30px;
          top: 0;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 0 0 2px #dee2e6;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .timeline-content {
          padding-left: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          padding: 15px;
          border-left: 3px solid #dee2e6;
        }
        .timeline-item:hover .timeline-content {
          background: #e9ecef;
          transition: background-color 0.2s;
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

export default RealTimeTimeline;
