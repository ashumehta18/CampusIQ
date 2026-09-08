/**
 * StatCard — single metric card used in dashboards.
 * Example: Total Students: 120
 */
const StatCard = ({ label, value, icon, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`text-2xl p-3 rounded-lg ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value ?? '—'}</p>
      </div>
    </div>
  );
};

export default StatCard;
