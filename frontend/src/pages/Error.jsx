import React from 'react';
import { Link } from 'react-router-dom';

export default function Error() {
  return (
    <div className="w-full max-w-[400px] bg-surface-container-lowest border border-error-container rounded-xl p-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] mx-auto mt-xl text-center flex flex-col items-center gap-md">
      <div className="w-16 h-16 bg-error-container rounded-full flex items-center justify-center mb-sm">
        <span className="material-symbols-outlined text-error text-4xl" style={{ fontSize: '36px' }}>error</span>
      </div>
      <h2 className="font-headline-md text-headline-md text-error tracking-tight">Failed to Create Appointment</h2>
      <p className="font-body-md text-body-md text-on-surface-variant">
        There was a problem submitting your appointment details. Please verify your information and try again.
      </p>
      <div className="w-full pt-md mt-sm border-t border-surface-variant">
        <Link to="/create" className="block w-full font-label-md text-label-md text-on-error bg-error py-md rounded hover:bg-on-error-container transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-error focus:outline-none">
          Try Again
        </Link>
      </div>
    </div>
  );
}
