const EmptyState = ({ icon = '📭', title = 'No data found', description = '' }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4"
      style={{ background: '#fdf3e7', border: '1px solid #e8c9a0' }}
    >
      {icon}
    </div>
    <h3 className="text-stone-700 font-semibold text-sm">{title}</h3>
    {description && <p className="text-stone-400 text-xs mt-1 max-w-xs">{description}</p>}
  </div>
);

export default EmptyState;
