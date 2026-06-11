import React, { useState, useEffect } from 'react';
import { subscribeToAppointments, cancelAppointment } from '../services/appointmentService';

export default function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' or 'upcoming'

  useEffect(() => {
    const unsubscribe = subscribeToAppointments((data) => {
      setAppointments(data);
    });
    return () => unsubscribe();
  }, []);

  // Format date helper
  const formatAppointmentDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Format time helper
  const formatAppointmentTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Stats calculation
  const totalAppts = appointments.length;
  const upcomingAppts = appointments.filter(a => 
    ['created', 'confirmation_pending', 'confirmation_sent', 'reminder_pending'].includes(a.status)
  ).length;
  const completedAppts = appointments.filter(a => a.status === 'completed').length;
  const remindersSent = appointments.filter(a => a.reminderSent || a.status === 'reminder_sent').length;

  // Filter and search logic
  const filteredAppointments = appointments.filter(appt => {
    const nameMatch = appt.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const phoneMatch = appt.phone?.includes(searchTerm);
    const emailMatch = appt.email?.toLowerCase().includes(searchTerm.toLowerCase()); // Backward compat
    const matchesSearch = nameMatch || phoneMatch || emailMatch;

    if (filterMode === 'upcoming') {
      const isUpcoming = ['created', 'confirmation_pending', 'confirmation_sent', 'reminder_pending'].includes(appt.status);
      return matchesSearch && isUpcoming;
    }
    if (filterMode === 'failed') {
      return matchesSearch && (appt.status === 'failed' || appt.whatsappStatus === 'failed');
    }
    return matchesSearch;
  });

  // Render Status Badge
  const renderStatus = (appt) => {
    const status = appt.status;
    const errorMsg = appt.errorMessage;
    const retryCount = appt.retryCount;

    switch (status) {
      case 'created':
        return (
          <span className="inline-flex items-center px-sm py-xs rounded-full font-label-sm text-label-sm border border-outline-variant bg-surface-container text-primary">
            Created
          </span>
        );
      case 'confirmation_pending':
        return (
          <span className="inline-flex items-center px-sm py-xs rounded-full font-label-sm text-label-sm border border-outline-variant bg-surface-container-low text-secondary">
            Confirming
          </span>
        );
      case 'confirmation_sent':
        return (
          <span className="inline-flex items-center px-sm py-xs rounded-full font-label-sm text-label-sm border border-primary bg-primary text-on-primary">
            Confirmed
          </span>
        );
      case 'reminder_pending':
        return (
          <span className="inline-flex items-center px-sm py-xs rounded-full font-label-sm text-label-sm border border-outline-variant bg-surface-container text-primary">
            Scheduled
          </span>
        );
      case 'reminder_sent':
        return (
          <span className="inline-flex items-center px-sm py-xs rounded-full font-label-sm text-label-sm border border-primary bg-primary text-on-primary">
            Reminder Sent
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-sm py-xs rounded-full font-label-sm text-label-sm border border-primary bg-primary text-on-primary">
            Completed
          </span>
        );
      case 'failed':
        return (
          <div className="flex flex-col gap-2xs items-start">
            <span className="inline-flex items-center px-sm py-xs rounded-full font-label-sm text-label-sm border border-error bg-error-container text-on-error-container">
              Failed
            </span>
            {errorMsg && (
              <span className="text-[10px] text-error font-medium leading-tight max-w-[150px] truncate" title={errorMsg}>
                {errorMsg}
              </span>
            )}
            {retryCount !== undefined && (
              <span className="text-[9px] text-secondary">
                Retries: {retryCount}
              </span>
            )}
          </div>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-sm py-xs rounded-full font-label-sm text-label-sm border border-outline bg-surface-container-low text-secondary line-through">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-sm py-xs rounded-full font-label-sm text-label-sm border border-outline-variant bg-surface-container text-primary">
            {status}
          </span>
        );
    }
  };

  return (
    <>
      {/* Header Section */}
      <header className="flex flex-col gap-xs">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary tracking-tight">Appointment Dashboard</h1>
        <p className="font-body-md text-body-md text-secondary">Monitor appointments and reminder status in real time.</p>
      </header>
      
      {/* Stats Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-md md:gap-gutter">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col gap-sm">
          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest flex items-center gap-xs">
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: '16px' }}>calendar_today</span>
            Total Appts
          </span>
          <span className="font-headline-lg text-headline-lg text-primary">{totalAppts}</span>
          <span className="font-label-md text-label-md text-secondary mt-auto">All time</span>
        </div>
        
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col gap-sm">
          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest flex items-center gap-xs">
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: '16px' }}>schedule</span>
            Upcoming
          </span>
          <span className="font-headline-lg text-headline-lg text-primary">{upcomingAppts}</span>
          <span className="font-label-md text-label-md text-secondary mt-auto">Active</span>
        </div>
        
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col gap-sm">
          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest flex items-center gap-xs">
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: '16px' }}>check_circle</span>
            Completed
          </span>
          <span className="font-headline-lg text-headline-lg text-primary">{completedAppts}</span>
          <span className="font-label-md text-label-md text-secondary mt-auto">Finished</span>
        </div>
        
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col gap-sm">
          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest flex items-center gap-xs">
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: '16px' }}>chat</span>
            Reminders Sent
          </span>
          <span className="font-headline-lg text-headline-lg text-primary">{remindersSent}</span>
          <span className="font-label-md text-label-md text-secondary mt-auto">All time</span>
        </div>
      </section>

      {/* Controls Section */}
      <section className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-md mt-md">
        <div className="flex flex-wrap items-center gap-sm">
          <button 
            onClick={() => setFilterMode('all')}
            className={`font-label-sm text-label-sm px-md py-xs rounded-full border transition-colors ${filterMode === 'all' ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container text-primary border-transparent hover:bg-surface-variant'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilterMode('upcoming')}
            className={`font-label-sm text-label-sm px-md py-xs rounded-full border transition-colors ${filterMode === 'upcoming' ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container text-primary border-transparent hover:bg-surface-variant'}`}
          >
            Upcoming
          </button>
          <button 
            onClick={() => setFilterMode('failed')}
            className={`font-label-sm text-label-sm px-md py-xs rounded-full border transition-colors ${filterMode === 'failed' ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container text-primary border-transparent hover:bg-surface-variant'}`}
          >
            Failed
          </button>
        </div>
        <div className="relative w-full lg:w-80">
          <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-outline">search</span>
          </div>
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-[36px] pr-sm py-sm bg-surface-container-lowest border border-outline-variant rounded font-body-md text-body-md text-primary placeholder-outline focus:outline-none focus:border-primary focus:ring-0 transition-colors" 
            placeholder="Search by customer name or phone" 
            type="text" 
          />
        </div>
      </section>

      {/* Data Table Section */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-lowest">
              <th className="font-label-sm text-label-sm uppercase text-secondary py-md px-lg font-semibold tracking-wider whitespace-nowrap">Customer Name</th>
              <th className="font-label-sm text-label-sm uppercase text-secondary py-md px-lg font-semibold tracking-wider whitespace-nowrap">Phone Number</th>
              <th className="font-label-sm text-label-sm uppercase text-secondary py-md px-lg font-semibold tracking-wider whitespace-nowrap">Date</th>
              <th className="font-label-sm text-label-sm uppercase text-secondary py-md px-lg font-semibold tracking-wider whitespace-nowrap">Time</th>
              <th className="font-label-sm text-label-sm uppercase text-secondary py-md px-lg font-semibold tracking-wider whitespace-nowrap">Status</th>
              <th className="font-label-sm text-label-sm uppercase text-secondary py-md px-lg font-semibold tracking-wider text-center whitespace-nowrap">Confirmation</th>
              <th className="font-label-sm text-label-sm uppercase text-secondary py-md px-lg font-semibold tracking-wider text-center whitespace-nowrap">Reminder</th>
              <th className="font-label-sm text-label-sm uppercase text-secondary py-md px-lg font-semibold tracking-wider text-center whitespace-nowrap">Actions</th>
              <th className="font-label-sm text-label-sm uppercase text-secondary py-md px-lg font-semibold tracking-wider text-right whitespace-nowrap">Created At</th>
            </tr>
          </thead>
          <tbody className="font-body-md text-body-md text-primary">
            {filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-lg py-xl text-center text-secondary">
                  No appointments found.
                </td>
              </tr>
            ) : (
              filteredAppointments.map((appt, index) => (
                <tr key={appt.id} className={`border-b border-outline-variant hover:bg-surface-container-low transition-colors h-[56px] ${index === 0 ? 'animate-live-row' : ''}`}>
                  <td className="px-lg py-sm align-middle font-medium">{appt.customerName}</td>
                  <td className="px-lg py-sm align-middle text-secondary">{appt.phone || appt.email}</td>
                  <td className="px-lg py-sm align-middle">{formatAppointmentDate(appt.appointmentTime)}</td>
                  <td className="px-lg py-sm align-middle">{formatAppointmentTime(appt.appointmentTime)}</td>
                  <td className="px-lg py-sm align-middle">
                    {renderStatus(appt)}
                  </td>

                  <td className="px-lg py-sm align-middle text-center">
                    {appt.confirmationSent ? (
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>check</span>
                    ) : (
                      <span className="inline-flex items-center px-sm py-xs rounded-full font-label-sm text-label-sm border border-outline-variant bg-surface-container-lowest text-secondary">Pending</span>
                    )}
                  </td>
                  <td className="px-lg py-sm align-middle text-center">
                    {appt.reminderSent ? (
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>check</span>
                    ) : (
                      <span className="inline-flex items-center px-sm py-xs rounded-full font-label-sm text-label-sm border border-outline-variant bg-surface-container-lowest text-secondary">Pending</span>
                    )}
                  </td>
                  <td className="px-lg py-sm align-middle text-center">
                    {['created', 'confirmation_pending', 'confirmation_sent', 'reminder_pending'].includes(appt.status) ? (
                      <button
                        onClick={async () => {
                          if (confirm(`Are you sure you want to cancel the appointment for ${appt.customerName}?`)) {
                            try {
                              await cancelAppointment(appt.id);
                            } catch (e) {
                              alert("Failed to cancel appointment: " + e.message);
                            }
                          }
                        }}
                        className="px-sm py-xs rounded font-label-sm text-label-sm bg-error-container text-on-error-container hover:bg-error hover:text-on-error transition-colors border border-transparent hover:border-error-container"
                      >
                        Cancel
                      </button>
                    ) : (
                      <span className="text-secondary font-label-md text-label-md">-</span>
                    )}
                  </td>
                  <td className="px-lg py-sm align-middle text-right text-secondary font-label-md">
                    {appt.createdAt ? new Date(appt.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </>
  );
}
