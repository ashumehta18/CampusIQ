/**
 * PageHeader — consistent title + optional subtitle used at the top of every page.
 */
const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      {subtitle && <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

export default PageHeader;
