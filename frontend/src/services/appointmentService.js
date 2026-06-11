import { db } from './firebase';
import { addDoc, serverTimestamp, onSnapshot, query, orderBy, Timestamp, doc, updateDoc, collection } from 'firebase/firestore';

const APPOINTMENTS_COLLECTION = 'appointments';

export const createAppointment = async (appointmentData) => {
  try {
    const { name, phone, appointmentDate, appointmentTime } = appointmentData;
    
    // Combine date and time strings into a unified Date object
    const [year, month, day] = appointmentDate.split('-').map(Number);
    const [hours, minutes] = appointmentTime.split(':').map(Number);
    const combinedDate = new Date(year, month - 1, day, hours, minutes);

    const docRef = await addDoc(collection(db, APPOINTMENTS_COLLECTION), {
      customerName: name,
      phone: phone,
      appointmentTime: Timestamp.fromDate(combinedDate),
      status: 'created',
      confirmationSent: false,
      confirmationSentAt: null,
      reminderSent: false,
      reminderSentAt: null,
      whatsappStatus: 'pending',
      errorMessage: '',
      reminderTime: null,
      confirmationMessage: 'Your appointment has been successfully scheduled and confirmed.',
      reminderMessage: 'This is a friendly reminder that your upcoming appointment is scheduled to start in 1 hour.',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating appointment: ", error);
    throw error;
  }
};

export const subscribeToAppointments = (callback) => {
  // Order by appointmentTime to show nearest appointments first
  const q = query(collection(db, APPOINTMENTS_COLLECTION), orderBy('appointmentTime', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const appointments = [];
    snapshot.forEach((doc) => {
      appointments.push({ id: doc.id, ...doc.data() });
    });
    callback(appointments);
  }, (error) => {
    console.error("Error fetching appointments in realtime: ", error);
  });
};

export const cancelAppointment = async (appointmentId) => {
  try {
    const appointmentRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
    await updateDoc(appointmentRef, {
      status: 'cancelled',
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error cancelling appointment: ", error);
    throw error;
  }
};
