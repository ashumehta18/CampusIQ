/**
 * Spinner — centered loading indicator.
 */
const Spinner = ({ size = 'md' }) => {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className="flex justify-center items-center py-10">
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizes[size]}`} />
    </div>
  );
};

export default Spinner;
