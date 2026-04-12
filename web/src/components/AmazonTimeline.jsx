import { useState, useEffect } from 'react';
import { Package, Truck, MapPin, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { supplyApi } from '../services/supplyApi.js';

const AmazonTimeline = ({ productId }) => {
  const [currentStep, setCurrentStep] = useState(2);
  const [events, setEvents] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const steps = [
    { id: 1, title: 'Registered', icon: Package, status: 'completed' },
    { id: 2, title: 'Harvested', icon: CheckCircle, status: 'completed' },
    { id: 3, title: 'Processing', icon: Clock, status: 'current' },
    { id: 4, title: 'Shipped', icon: Truck, status: 'pending' },
    { id: 5, title: 'Delivered', icon: MapPin, status: 'pending' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentStep < 5 && Math.random() < 0.4) {
        setCurrentStep(prev => prev + 1);
        setLastUpdate(new Date());
      }
    }, 8000);

    fetchEvents();
    return () => clearInterval(interval);
  }, [currentStep]);

  const fetchEvents = async () => {
    try {
      const updates = await supplyApi.getTimelineUpdates(productId);
      setEvents(updates.slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const getStepStatus = (stepId) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'pending';
  };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Track your product</h5>
        <small className="text-muted">Updated {lastUpdate.toLocaleTimeString()}</small>
      </div>
      
      <div className="card-body">
        {/* Progress Bar */}
        <div className="progress-container mb-4">
          <div className="progress-line">
            <div 
              className="progress-fill"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>
          
          {steps.map((step, index) => {
            const Icon = step.icon;
            const status = getStepStatus(step.id);
            
            return (
              <div key={step.id} className={`progress-step ${status}`}>
                <div className="step-circle">
                  <Icon size={16} />
                </div>
                <div className="step-label">{step.title}</div>
              </div>
            );
          })}
        </div>

        {/* Current Status */}
        <div className="current-status mb-4">
          <div className="d-flex align-items-center mb-2">
            <div className="status-dot me-2"></div>
            <strong>
              {currentStep === 5 ? 'Delivered' : 
               currentStep === 4 ? 'Out for delivery' :
               currentStep === 3 ? 'In processing' : 'Being prepared'}
            </strong>
          </div>
          <p className="text-muted mb-0">
            {currentStep === 5 ? 'Your product has been delivered successfully' :
             currentStep === 4 ? 'Your product is on the way' :
             currentStep === 3 ? 'Your product is being processed' : 
             'Your product is being prepared for shipment'}
          </p>
        </div>

        {/* Recent Updates */}
        {events.length > 0 && (
          <div className="recent-updates">
            <h6 className="mb-3">Recent updates</h6>
            {events.map((event, index) => (
              <div key={index} className="update-item">
                <div className="update-time">
                  {new Date(event.timestamp).toLocaleDateString()} at{' '}
                  {new Date(event.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                <div className="update-text">{event.title}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .progress-container {
          position: relative;
          padding: 20px 0;
        }
        
        .progress-line {
          position: absolute;
          top: 35px;
          left: 40px;
          right: 40px;
          height: 2px;
          background: #e0e0e0;
          z-index: 1;
        }
        
        .progress-fill {
          height: 100%;
          background: #ff9900;
          transition: width 0.5s ease;
        }
        
        .progress-step {
          position: relative;
          display: inline-block;
          width: 20%;
          text-align: center;
          z-index: 2;
        }
        
        .step-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          margin: 0 auto 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #e0e0e0;
          background: white;
          transition: all 0.3s ease;
        }
        
        .progress-step.completed .step-circle {
          background: #ff9900;
          border-color: #ff9900;
          color: white;
        }
        
        .progress-step.current .step-circle {
          background: #ff9900;
          border-color: #ff9900;
          color: white;
          box-shadow: 0 0 0 4px rgba(255, 153, 0, 0.2);
        }
        
        .step-label {
          font-size: 12px;
          color: #666;
          font-weight: 500;
        }
        
        .progress-step.completed .step-label,
        .progress-step.current .step-label {
          color: #ff9900;
          font-weight: 600;
        }
        
        .current-status {
          background: #f0f8ff;
          border: 1px solid #e6f3ff;
          border-radius: 8px;
          padding: 16px;
        }
        
        .status-dot {
          width: 8px;
          height: 8px;
          background: #ff9900;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(255, 153, 0, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(255, 153, 0, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 153, 0, 0); }
        }
        
        .recent-updates {
          border-top: 1px solid #e0e0e0;
          padding-top: 16px;
        }
        
        .update-item {
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .update-item:last-child {
          border-bottom: none;
        }
        
        .update-time {
          font-size: 12px;
          color: #666;
          margin-bottom: 2px;
        }
        
        .update-text {
          font-size: 14px;
          color: #333;
        }
      `}</style>
    </div>
  );
};

export default AmazonTimeline;
