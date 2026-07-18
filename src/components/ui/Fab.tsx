import { useNavigate, useSearchParams } from 'react-router-dom';

export function Fab() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isInquiries = searchParams.get('section') === 'inquiries';

  return (
    <button
      onClick={() => navigate(isInquiries ? '/inquiry/new' : '/new')}
      aria-label={isInquiries ? 'New inquiry' : 'New booking'}
      className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-5 z-40 flex h-15 w-15 items-center justify-center rounded-full bg-gradient-to-br from-maroon-500 to-maroon-600 text-3xl font-light text-gold-300 shadow-lg shadow-maroon-500/35 transition-transform active:scale-95 sm:bottom-8"
      style={{ height: '3.75rem', width: '3.75rem' }}
    >
      +
    </button>
  );
}
