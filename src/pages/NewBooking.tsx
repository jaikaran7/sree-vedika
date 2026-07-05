import { useNavigate } from 'react-router-dom';
import { BookingForm } from '../components/booking/BookingForm';

export default function NewBooking() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-5">
      <header className="mb-5 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink-soft hover:bg-ink/5 dark:text-ink-dark-soft dark:hover:bg-white/10"
        >
          ←
        </button>
        <h1 className="font-display text-2xl font-semibold text-ink dark:text-ink-dark">New Booking</h1>
      </header>
      <BookingForm />
    </div>
  );
}
