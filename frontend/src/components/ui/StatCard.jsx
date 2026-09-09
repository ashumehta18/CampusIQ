/**
 * StatCard — single metric card used in dashboards.
 */
const StatCard = ({ label, value, icon, color = 'brown' }) => {
  const colors = {
    brown:  { bg: '#fdf3e7', text: '#a0522d', border: '#e8c9a0' },
    blue:   { bg: '#fdf3e7', text: '#a0522d', border: '#e8c9a0' }, // remapped
    green:  { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' },
    purple: { bg: '#f5f3ff', text: '#5b21b6', border: '#ddd6fe' },
    yellow: { bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
    red:    { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' },
  };

  const c = colors[color] || colors.brown;

  return (
    <div
      className="bg-white rounded-2xl p-5 flex items-center gap-4"
      style={{ border: '1px solid #ede8e1', boxShadow: '0 1px 8px rgba(160,82,45,0.06)' }}
    >
      <div
        className="text-xl p-3 rounded-xl shrink-0"
        style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-stone-400 font-medium uppercase tracking-wide truncate">{label}</p>
        <p className="text-2xl font-bold text-stone-800 leading-tight mt-0.5">{value ?? '—'}</p>
      </div>
    </div>
  );
};

export default StatCard;
