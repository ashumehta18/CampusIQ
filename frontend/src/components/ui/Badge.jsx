/**
 * Badge — colored label for roles, statuses, etc.
 * variant: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray'
 */
const variants = {
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  purple: 'bg-purple-100 text-purple-700',
  gray: 'bg-gray-100 text-gray-600',
};

const Badge = ({ label, variant = 'gray' }) => (
  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
    {label}
  </span>
);

export default Badge;
