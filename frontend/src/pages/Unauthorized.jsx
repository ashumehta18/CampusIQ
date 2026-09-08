import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
    <div className="text-6xl mb-4">404</div>
    <h1 className="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h1>
    <p className="text-gray-500 mb-6">The page you&apos;re looking for doesn&apos;t exist.</p>
    <Link to="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700">
      Go Home
    </Link>
  </div>
);

export default NotFound;
