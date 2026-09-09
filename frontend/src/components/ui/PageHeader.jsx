/**
 * PageHeader — consistent title + optional subtitle used at the top of every page.
 */
const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-7">
    <div>
      <h2 className="text-2xl font-bold text-stone-800 tracking-tight">{title}</h2>
      {subtitle && <p className="text-stone-400 text-sm mt-1">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0 ml-4">{action}</div>}
  </div>
);

export default PageHeader;
