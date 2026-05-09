import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import OnboardingForm from '../components/OnboardingForm';

const STORAGE_KEY = 'arrive_context';

export default function Onboarding() {
  const navigate = useNavigate();

  function handleComplete({ province, needs, status }) {
    const context = { province, needs, status };
    // Persist to localStorage so a refresh on /chat doesn't lose context
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(context));
    } catch {
      // Storage unavailable — context lives only in navigation state
    }
    navigate('/chat', { state: context });
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <OnboardingForm onComplete={handleComplete} />
    </div>
  );
}
