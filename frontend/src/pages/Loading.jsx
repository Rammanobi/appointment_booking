import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Loading() {
  const navigate = useNavigate();

  // Simulate network request for UI demonstration
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/success');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="w-full max-w-[400px] bg-surface-container-lowest border border-outline-variant rounded-xl p-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] mx-auto mt-xl text-center flex flex-col items-center gap-lg">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-surface-container-high border-t-primary rounded-full animate-spin"></div>
        <span className="material-symbols-outlined absolute text-primary" style={{ fontSize: '24px' }}>sync</span>
      </div>
      <div className="flex flex-col gap-xs">
        <h2 className="font-headline-md text-headline-md text-primary tracking-tight animate-pulse">Submitting Appointment...</h2>
        <p className="font-body-md text-body-md text-secondary">
          Please wait while we secure your timeslot and notify our systems.
        </p>
      </div>
    </div>
  );
}
