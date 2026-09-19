import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from './Modal';
import { appointmentApi } from '../../api/appointmentApi';
import { useDispatch } from 'react-redux';
import { showToast } from '../../redux/slices/uiSlice';
import { Calendar, Clock, Video, Building2, CheckCircle2 } from 'lucide-react';
import { format, addDays } from 'date-fns';

export const BookAppointmentModal = ({
  isOpen,
  onClose,
  doctor,
  onSuccess,
}) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const [date, setDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [time, setTime] = useState('10:30');
  const [appointmentType, setAppointmentType] = useState('offline');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!doctor) return null;

  const doctorName = doctor.userId?.name || doctor.name || 'Dr. Specialist';
  const doctorPhoto = doctor.profile_photo || doctor.profilePhoto || '/assets/doctor.png';
  const hospitalName = doctor.hospitalName || doctor.hospital?.name || 'Partner Hospital';
  const departmentName = doctor.departmentName || doctor.department?.name || doctor.specialisation || doctor.position || 'General OPD';
  const consultationFee = doctor.consultationFee || doctor.consultation_fees || 500;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!doctor) return;

    setIsSubmitting(true);
    try {
      const combinedDateTime = new Date(`${date}T${time}:00`).toISOString();

      await appointmentApi.createAppointment({
        doctorId: doctor.id || doctor._id,
        date: combinedDateTime,
        appointmentType,
        reason,
        description,
        doctorName,
        doctorProfilePhoto: doctorPhoto,
        hospitalName,
        departmentName,
      });

      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      dispatch(showToast({ message: 'Appointment booked successfully!', type: 'success' }));
      onClose();
      if (onSuccess) onSuccess();
    } catch {
      dispatch(showToast({ message: 'Failed to book appointment', type: 'error' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Book Doctor Appointment" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Doctor Summary Header */}
        <div className="flex items-center gap-3.5 rounded-2xl bg-slate-900/90 border border-white/10 p-3.5">
          <div className="h-14 w-14 rounded-2xl overflow-hidden bg-slate-800 shrink-0 border border-blue-500/30">
            <img
              src={doctorPhoto}
              alt={doctorName}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.src = '/assets/doctor.png';
              }}
            />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">{doctorName}</h4>
            <p className="text-xs text-blue-400 font-medium">{departmentName}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Fee: ₹{consultationFee}</p>
          </div>
        </div>

        {/* Consultation Mode Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Consultation Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAppointmentType('offline')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                appointmentType === 'offline'
                  ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-md shadow-blue-500/10'
                  : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>In-Person OPD</span>
            </button>
            <button
              type="button"
              onClick={() => setAppointmentType('online')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                appointmentType === 'online'
                  ? 'bg-purple-600/20 border-purple-500 text-purple-400 shadow-md shadow-purple-500/10'
                  : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Online Video Call</span>
            </button>
          </div>
        </div>

        {/* Date & Time Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>Appointment Date</span>
            </label>
            <input
              type="date"
              value={date}
              min={format(new Date(), 'yyyy-MM-dd')}
              max={format(addDays(new Date(), 30), 'yyyy-MM-dd')}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Select Time Slot</span>
            </label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-white outline-none focus:border-blue-500"
            >
              {timeSlots.map((slot) => (
                <option key={slot} value={slot} className="bg-slate-900 text-white">
                  {slot} ({parseInt(slot.split(':')[0]) < 12 ? 'AM' : 'PM'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reason for Visit */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Reason for Visit
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="E.g., Routine health checkup, fever, chest pain..."
            required
            className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Additional Symptoms / Notes (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe any existing medications or medical history..."
            rows={2}
            className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
          />
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl glow-btn-primary font-bold text-xs tracking-wide shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Confirming Booking...' : 'Confirm Appointment'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BookAppointmentModal;
