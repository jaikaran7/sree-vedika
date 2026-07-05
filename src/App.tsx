import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import Dashboard from './pages/Dashboard';
import NewBooking from './pages/NewBooking';
import BookingDetails from './pages/BookingDetails';
import CalendarPage from './pages/CalendarPage';
import { BottomNav } from './components/ui/BottomNav';
import { Fab } from './components/ui/Fab';
import { ThemeToggle } from './components/ui/ThemeToggle';

function Chrome() {
  const location = useLocation();
  const showFab = location.pathname === '/' || location.pathname === '/calendar';

  return (
    <>
      <div className="fixed right-4 z-40" style={{ top: 'calc(env(safe-area-inset-top) + 1rem)' }}>
        <ThemeToggle />
      </div>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/new" element={<NewBooking />} />
        <Route path="/booking/:id" element={<BookingDetails />} />
        <Route path="/calendar" element={<CalendarPage />} />
      </Routes>
      {showFab && <Fab />}
      <BottomNav />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="bg-hall min-h-screen">
        <Chrome />
      </div>
      <Toaster position="top-center" richColors closeButton />
    </BrowserRouter>
  );
}

export default App;
