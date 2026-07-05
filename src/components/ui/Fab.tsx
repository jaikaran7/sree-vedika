import { useNavigate } from 'react-router-dom';

export function Fab() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate('/new')}
      aria-label="New booking"
      className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-5 z-40 flex h-15 w-15 items-center justify-center rounded-full bg-maroon-500 text-3xl font-light text-gold-300 shadow-lg shadow-maroon-500/40 transition-transform active:scale-95 sm:bottom-8"
      style={{ height: '3.75rem', width: '3.75rem' }}
    >
      +
    </button>
  );
}
