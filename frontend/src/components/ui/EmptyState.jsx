/**
 * EmptyState — shown when a list/table has no data.
 */
const EmptyState = ({ icon = '📭', title = 'No data found', description = '' }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="text-5xl mb-3">{icon}</div>
    <h3 className="text-gray-700 font-medium text-base">{title}</h3>
    {description && <p className="text-gray-400 text-sm mt-1">{description}</p>}
  </div>
);

export default EmptyState;
