import React from 'react';
import { Link } from 'react-router-dom';

export default function Success() {
  return (
    <div className="w-full max-w-[400px] bg-surface-container-lowest border border-outline-variant rounded-xl p-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] mx-auto mt-xl text-center flex flex-col items-center gap-md">
      <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mb-sm">
        <span className="material-symbols-outlined text-primary text-4xl" style={{ fontSize: '36px' }}>check_circle</span>
      </div>
      <h2 className="font-headline-md text-headline-md text-primary tracking-tight">Appointment Created Successfully</h2>
      <p className="font-body-md text-body-md text-secondary">
        A confirmation email has been sent to your provided email address. We will remind you 1 hour before the appointment.
      </p>
      <div className="w-full pt-md mt-sm border-t border-surface-variant flex flex-col gap-sm">
        <Link to="/dashboard" className="w-full font-label-md text-label-md text-on-primary bg-primary py-md rounded hover:bg-tertiary-container transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:outline-none">
          Return to Dashboard
        </Link>
        <Link to="/create" className="w-full font-label-md text-label-md text-primary bg-surface-container-lowest border border-outline-variant py-md rounded hover:bg-surface transition-colors focus:ring-2 focus:ring-primary focus:outline-none">
          Book Another
        </Link>
      </div>
    </div>
  );
}
