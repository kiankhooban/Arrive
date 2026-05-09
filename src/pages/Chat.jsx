import { useLocation, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ChatBox from '../components/ChatBox';
import { filterResources } from '../utils/filterResources';
import { sendMessage } from '../services/watsonxClient';
import resources from '../data/resources.json';

const STORAGE_KEY = 'arrive_context';

function loadContext(locationState) {
  // Prefer navigation state (just arrived from onboarding)
  if (locationState?.province) return locationState;
  // Fall back to localStorage (page refresh)
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return null;
}

export default function Chat() {
  const location = useLocation();
  const context = loadContext(location.state);

  // No context means the user landed here without onboarding — send them back
  if (!context) {
    return <Navigate to="/onboard" replace />;
  }

  const { province, needs = [], status } = context;
  const filteredResources = filterResources(resources, province, status, needs);

  return (
    <div className="flex h-screen flex-col bg-stone-50">
      <Navbar />
      <ChatBox
        province={province}
        status={status}
        needs={needs}
        filteredResources={filteredResources}
        sendMessage={sendMessage}
      />
    </div>
  );
}
