import { Link, useLocation } from 'react-router-dom';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Wallet, LogOut, Scan, LogIn, Leaf, Truck, Store, Users, LayoutDashboard } from 'lucide-react';
import { useAuth, roleRoute } from '../context/AuthContext.jsx';

/** Returns the nav items a given role is allowed to see */
function navItemsForRole(role) {
  switch (role) {
    case 'farmer':
      return [
        { name: 'Home', href: '/' },
        { name: 'My Dashboard', href: '/farmer', Icon: Leaf },
      ];
    case 'processor':
      return [
        { name: 'Home', href: '/' },
        { name: 'My Dashboard', href: '/distributor', Icon: Truck },
      ];
    case 'retailer':
      return [
        { name: 'Home', href: '/' },
        { name: 'My Dashboard', href: '/retailer', Icon: Store },
      ];
    case 'consumer':
      return [
        { name: 'Home', href: '/' },
        { name: 'My Dashboard', href: '/consumer', Icon: Users },
      ];
    case 'admin':
      return [
        { name: 'Home', href: '/' },
        { name: 'Farmer', href: '/farmer', Icon: Leaf },
        { name: 'Distributor', href: '/distributor', Icon: Truck },
        { name: 'Retailer', href: '/retailer', Icon: Store },
        { name: 'Consumer', href: '/consumer', Icon: Users },
      ];
    default:
      // Unauthenticated — only Home
      return [{ name: 'Home', href: '/' }];
  }
}

const Navbar = () => {
  const location = useLocation();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { user, logout, isAuthenticated } = useAuth();

  const navigation = navItemsForRole(isAuthenticated ? user?.role : null);

  const handleConnect = () => {
    const metaMaskConnector = connectors.find(connector => connector.name === 'MetaMask');
    if (metaMaskConnector) {
      connect({ connector: metaMaskConnector });
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light sticky-top">
      <div className="container">
        {/* Logo */}
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <div className="bg-success text-white rounded d-flex align-items-center justify-content-center me-2"
               style={{width: '40px', height: '40px'}}>
            <span className="fw-bold">S</span>
          </div>
          <span className="fw-bold fs-4">SupplyChain</span>
        </Link>

        {/* Mobile Toggle */}
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {navigation.map((item) => (
              <li key={item.name} className="nav-item">
                <Link
                  to={item.href}
                  className={`nav-link d-flex align-items-center gap-1 ${location.pathname === item.href ? 'active' : ''}`}
                >
                  {item.Icon && <item.Icon size={15} />}
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right Side Actions */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {isAuthenticated ? (
              <>
                {/* Role badge */}
                <span className="badge bg-secondary text-truncate" style={{ maxWidth: 180 }} title={user?.email}>
                  <LayoutDashboard size={12} className="me-1" />
                  {user?.email}
                  {user?.role && (
                    <span className="ms-1 opacity-75">· {
                      user.role === 'processor' ? 'distributor' : user.role
                    }</span>
                  )}
                </span>
                {/* Go-to-dashboard shortcut */}
                <Link
                  to={roleRoute(user?.role)}
                  className="btn btn-outline-success btn-sm"
                  title="My dashboard"
                >
                  <LayoutDashboard size={14} />
                </Link>
                <button type="button" onClick={() => logout()} className="btn btn-outline-secondary btn-sm">
                  <LogOut size={14} className="me-1" />
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-outline-success btn-sm d-flex align-items-center gap-1">
                <LogIn size={16} />
                Sign in
              </Link>
            )}

            {/* Scanner Button — always visible as a utility */}
            <Link to="/scanner" className="btn btn-outline-secondary" title="Scan QR">
              <Scan size={20} />
            </Link>

            {/* Wallet Connection */}
            {isConnected ? (
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-light text-dark">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                <button
                  onClick={() => disconnect()}
                  className="btn btn-outline-danger btn-sm"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                className="btn btn-primary d-flex align-items-center gap-2"
              >
                <Wallet size={16} />
                <span className="d-none d-sm-inline">Connect</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
