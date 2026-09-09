const Card = ({ children, className = '' }) => (
  <div
    className={`bg-white rounded-2xl p-6 ${className}`}
    style={{ border: '1px solid #ede8e1', boxShadow: '0 1px 8px rgba(160,82,45,0.06)' }}
  >
    {children}
  </div>
);

export default Card;
