const Spinner = ({ size = 'md' }) => {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className="flex justify-center items-center py-10">
      <div
        className={`animate-spin rounded-full border-2 border-transparent ${sizes[size]}`}
        style={{ borderTopColor: '#a0522d', borderRightColor: '#d4a574' }}
      />
    </div>
  );
};

export default Spinner;
