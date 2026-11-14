import { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import Icon from "./Icon";
import { LoadingState } from "./Table";

const navigation = [
  { path: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { path: "/orders", label: "All orders", icon: "orders" },
  { path: "/products", label: "All products", icon: "products" },
  { path: "/suppliers", label: "All suppliers", icon: "suppliers" },
  { path: "/customers", label: "All customers", icon: "customers" },
];

function Navigation({ onNavigate }) {
  return (
    <nav aria-label="Main navigation" className="navigation">
      {navigation.map(({ path, label, icon }) => (
        <NavLink
          key={path}
          to={path}
          aria-label={label}
          title={label}
          onClick={onNavigate}
          className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
        >
          <Icon name={icon} />
          <span className="nav-tooltip">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

function MobileMenu({ onClose, onLogout, loggingOut }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    const media = window.matchMedia("(min-width: 1440px)");
    const closeOnDesktop = (event) => {
      if (event.matches) onClose();
    };
    media.addEventListener("change", closeOnDesktop);
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
      media.removeEventListener("change", closeOnDesktop);
    };
  }, [onClose]);
  return (
    <dialog
      ref={dialog}
      className="menu-drawer"
      aria-label="Navigation menu"
      onCancel={onClose}
      onClick={(event) => {
        if (
          event.target === event.currentTarget &&
          event.clientX > event.currentTarget.getBoundingClientRect().right
        )
          onClose();
      }}
    >
      <button
        type="button"
        className="icon-button drawer-close"
        aria-label="Close menu"
        onClick={onClose}
      >
        <Icon name="close" />
      </button>
      <Navigation onNavigate={onClose} />
      <button
        type="button"
        className="logout-button drawer-logout"
        aria-label="Log out"
        title="Log out"
        disabled={loggingOut}
        onClick={onLogout}
      >
        <Icon name="logout" />
      </button>
    </dialog>
  );
}

export default function SharedLayout() {
  const { user, logout, isDemo } = useAuth();
  const { loading, error, refreshError, reload } = useData();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const location = useLocation();
  const title =
    navigation.find((item) => item.path === location.pathname)?.label ||
    "Dashboard";

  useEffect(() => {
    document.title = `${title} | E-Pharmacy`;
  }, [title]);

  async function handleLogout() {
    setLoggingOut(true);
    setLogoutError("");
    try {
      await logout();
    } catch (failure) {
      setLogoutError(failure.message);
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <header className="header">
        <button
          type="button"
          className="icon-button menu-toggle"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <Icon name="menu" />
        </button>
        <Link
          className="header-logo"
          to="/dashboard"
          aria-label="E-Pharmacy home"
        >
          <Icon name="logo" />
        </Link>
        <div className="header-titles">
          <h1>Medicine store</h1>
          <div className="breadcrumbs">
            <Link to="/dashboard">{title}</Link>
            <span aria-hidden="true">|</span>
            <span className="header-email" title={user?.email}>
              {user?.email}
            </span>
          </div>
        </div>
        {isDemo && (
          <span
            className="demo-indicator"
            title="Changes are saved in this browser"
          >
            Demo
          </span>
        )}
        <button
          type="button"
          className="logout-button header-logout"
          aria-label="Log out"
          title="Log out"
          disabled={loggingOut}
          onClick={handleLogout}
        >
          <Icon name="logout" />
        </button>
      </header>
      <aside className="sidebar">
        <Navigation />
      </aside>
      {menuOpen && (
        <MobileMenu
          onClose={closeMenu}
          onLogout={handleLogout}
          loggingOut={loggingOut}
        />
      )}
      <main
        id="main-content"
        className={`main-content ${location.pathname === "/dashboard" ? "dashboard-main" : ""}`}
      >
        {logoutError && (
          <div className="error-banner" role="alert">
            {logoutError}
          </div>
        )}
        {refreshError && (
          <div className="error-banner" role="alert">
            <p>{refreshError}</p>
            <button
              className="retry-link"
              onClick={() => reload({ background: true })}
            >
              Refresh data
            </button>
          </div>
        )}
        {loading ? (
          <LoadingState label="Loading pharmacy data…" />
        ) : error ? (
          <div className="error-state" role="alert">
            <h2>Unable to load your data</h2>
            <p>{error}</p>
            <button className="button button-primary" onClick={() => reload()}>
              Try again
            </button>
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}
