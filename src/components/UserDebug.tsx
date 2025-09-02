import { useAuth } from '../hooks/useAuth';

export function UserDebug() {
  const { user, profile, isOwner } = useAuth();

  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-300 rounded-lg p-4 shadow-lg z-50">
      <h3 className="font-bold text-yellow-800 mb-2">Debug User Info</h3>
      <div className="text-sm space-y-1 mb-3">
        <div><strong>User ID:</strong> {user?.id?.substring(0, 8)}...</div>
        <div><strong>Email:</strong> {user?.email}</div>
        <div><strong>Profile Role:</strong> "{profile?.role}"</div>
        <div><strong>isOwner:</strong> {isOwner ? 'true' : 'false'}</div>
        <div><strong>canAddExpenses:</strong> {(profile?.role === 'owner' || profile?.role === 'manager') ? 'true' : 'false'}</div>
      </div>
      <button 
        onClick={refreshPage}
        className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
      >
        Actualiser
      </button>
    </div>
  );
}
