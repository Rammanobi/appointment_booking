import { Link, NavLink, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="bg-background text-on-background font-body-md text-body-md min-h-screen flex flex-col antialiased">
      {/* TopNavBar Shared Component */}
      <nav className="w-full top-0 sticky z-50 bg-surface-container-lowest border-b border-outline-variant flat no shadows font-body-md text-body-md">
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-md max-w-7xl mx-auto">
          {/* Left: Brand & Nav Links */}
          <div className="flex items-center gap-xl">
            {/* Brand Logo */}
            <Link to="/" className="text-headline-sm font-headline-sm text-primary tracking-tight flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">calendar_month</span>
              <span className="hidden md:inline-block">Appointment Reminder System</span>
            </Link>
            {/* Main Navigation (Desktop) */}
            <div className="hidden md:flex items-center gap-lg h-full pt-1">
              <NavLink 
                to="/dashboard" 
                className={({ isActive }) => `transition-all duration-200 pb-1 border-b-2 active:scale-95 ${
                  isActive 
                    ? 'text-primary font-bold border-primary' 
                    : 'text-secondary font-normal border-transparent hover:text-primary hover:border-outline-variant'
                }`}
              >
                Dashboard
              </NavLink>
            </div>
          </div>
          {/* Right: Actions */}
          <div className="flex items-center gap-md">
            <NavLink 
              to="/create" 
              className={({ isActive }) => `hidden md:inline-flex items-center justify-center font-label-sm text-label-sm px-lg py-sm rounded transition-all duration-200 active:scale-95 border-b-2 ${
                isActive
                  ? 'bg-surface-tint text-on-primary border-on-primary font-bold'
                  : 'bg-primary text-on-primary border-transparent font-medium hover:bg-surface-tint'
              }`}
            >
              New Appointment
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-xl flex flex-col gap-xl h-full">
        <Outlet />
      </main>

      {/* Footer Shared Component */}
      <footer className="w-full mt-auto bg-surface border-t border-outline-variant flat no shadows font-label-sm text-label-sm text-secondary transition-opacity duration-200">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop py-xl max-w-7xl mx-auto gap-lg">
          <div className="text-label-md font-label-md text-primary">
            © 2026 Appointment Reminder System. All rights reserved.
          </div>
          <div className="flex items-center gap-md">
            <a className="hover:text-primary underline transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-primary underline transition-colors" href="#">Terms of Service</a>
            <a className="hover:text-primary underline transition-colors" href="#">Support</a>
            <a className="hover:text-primary underline transition-colors" href="#">API Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
