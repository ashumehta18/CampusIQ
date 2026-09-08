import { Link } from 'react-router-dom';

const Unauthorized = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
    <div className="text-6xl mb-4">🔒</div>
    <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
    <p className="text-gray-500 mb-6">You don&apos;t have permission to view this page.</p>
    <Link to="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700">
      Go Home
    </Link>
  </div>
);

export default Unauthorized;
