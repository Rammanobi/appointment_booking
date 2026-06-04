import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAppointment } from '../services/appointmentService';

export default function CreateAppointment() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    appointmentDate: '',
    appointmentTime: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    navigate('/processing');
    try {
      await createAppointment({
        name: formData.name,
        email: formData.email,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime
      });
      navigate('/success');
    } catch (error) {
      console.error(error);
      navigate('/error');
    }
  };

  return (
    <div className="w-full max-w-[500px] bg-surface-container-lowest border border-outline-variant rounded-xl p-lg md:p-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] mx-auto mt-xl">
      <div className="mb-xl">
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary mb-sm">Create Appointment</h2>
        <p className="font-body-md text-body-md text-secondary">Enter customer details and appointment information.</p>
      </div>
      <form className="flex flex-col gap-lg" onSubmit={handleSubmit}>
        {/* Customer Name Field */}
        <div className="flex flex-col gap-sm">
          <label className="font-label-md text-label-md text-primary flex justify-between" htmlFor="name">
            Customer Name
            <span aria-hidden="true" className="text-error">*</span>
          </label>
          <input className="w-full bg-surface-container-lowest border border-outline-variant rounded p-sm md:p-md font-body-md text-body-md text-primary placeholder-outline focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Jane Doe" required type="text" />
        </div>
        {/* Email Field */}
        <div className="flex flex-col gap-sm">
          <label className="font-label-md text-label-md text-primary flex justify-between" htmlFor="email">
            Email Address
            <span aria-hidden="true" className="text-error">*</span>
          </label>
          <input className="w-full bg-surface-container-lowest border border-outline-variant rounded p-sm md:p-md font-body-md text-body-md text-primary placeholder-outline focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="jane.doe@example.com" required type="email" />
        </div>
        {/* Date & Time Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          {/* Date Field */}
          <div className="flex flex-col gap-sm">
            <label className="font-label-md text-label-md text-primary flex justify-between" htmlFor="appointmentDate">
              Appointment Date
              <span aria-hidden="true" className="text-error">*</span>
            </label>
            <div className="relative">
              <input className="w-full bg-surface-container-lowest border border-outline-variant rounded p-sm md:p-md font-body-md text-body-md text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer" id="appointmentDate" name="appointmentDate" value={formData.appointmentDate} onChange={handleChange} required type="date" />
              <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 text-outline pointer-events-none" style={{ fontSize: '20px' }}>calendar_today</span>
            </div>
          </div>
          {/* Time Field */}
          <div className="flex flex-col gap-sm">
            <label className="font-label-md text-label-md text-primary flex justify-between" htmlFor="appointmentTime">
              Appointment Time
              <span aria-hidden="true" className="text-error">*</span>
            </label>
            <div className="relative">
              <input className="w-full bg-surface-container-lowest border border-outline-variant rounded p-sm md:p-md font-body-md text-body-md text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer" id="appointmentTime" name="appointmentTime" value={formData.appointmentTime} onChange={handleChange} required type="time" />
              <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 text-outline pointer-events-none" style={{ fontSize: '20px' }}>schedule</span>
            </div>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex flex-col-reverse md:flex-row gap-md mt-sm pt-md border-t border-surface-variant">
          <button className="w-full md:w-1/2 font-label-md text-label-md text-primary bg-surface-container-lowest border border-outline-variant py-md rounded hover:bg-surface transition-colors focus:ring-2 focus:ring-primary focus:outline-none" type="reset" onClick={() => setFormData({name:'', email:'', appointmentDate:'', appointmentTime:''})}>
            Reset
          </button>
          <button className="w-full md:w-1/2 font-label-md text-label-md text-on-primary bg-primary py-md rounded hover:bg-tertiary-container transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:outline-none" type="submit">
            Submit Appointment
          </button>
        </div>
      </form>
      {/* Card Footer Context */}
      <div className="mt-lg pt-lg border-t border-surface-variant text-center">
        <p className="font-label-sm text-label-sm text-secondary flex items-center justify-center gap-xs">
          <span className="material-symbols-outlined text-[14px]" style={{ fontSize: '14px' }}>info</span>
          A confirmation email will be sent automatically.
        </p>
      </div>
    </div>
  );
}
