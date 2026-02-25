import React from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Link } from 'react-router';

export default function NotFound() {
  useDocumentTitle('Page Not Found');
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <h1 className="text-9xl font-bold text-gray-200">404</h1>
      <h2 className="text-2xl font-bold text-gray-900 mt-4">Page Not Found</h2>
      <p className="text-gray-500 mt-2 mb-6">The page you are looking for doesn't exist or has been moved.</p>
      <Link
        to="/"
        className="bg-red-700 hover:bg-red-800 text-white px-6 py-3 rounded-lg font-medium transition-colors">
        
        Go Back Home
      </Link>
    </div>);

}