/**
 * Badge — colored label for roles, statuses, etc.
 * variant: 'brown' | 'green' | 'red' | 'yellow' | 'purple' | 'gray' | 'blue'
 */
const variants = {
  brown: 'bg-amber-100 text-amber-800',
  blue:  'bg-amber-100 text-amber-800',   // remapped to brown
  green: 'bg-emerald-100 text-emerald-700',
  red:   'bg-red-100 text-red-700',
  yellow:'bg-yellow-100 text-yellow-700',
  purple:'bg-purple-100 text-purple-700',
  gray:  'bg-stone-100 text-stone-600',
};

const Badge = ({ label, variant = 'gray' }) => (
  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${variants[variant] || variants.gray}`}>
    {label}
  </span>
);

export default Badge;
