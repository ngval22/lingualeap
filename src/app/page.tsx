import { Dashboard } from '@/components/dashboard';
import { AuthGate } from '@/components/auth-gate'; // Import AuthGate

export default function Home() {
  return (
    <AuthGate> {/* Wrap Dashboard with AuthGate */}
      <Dashboard />
    </AuthGate>
  );
}
