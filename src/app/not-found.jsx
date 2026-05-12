"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function NotFound() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    // Check authentication status on the client side
    const user = localStorage.getItem('user'); // Replace with your actual logic
    setIsAuthenticated(!!user); // Set authentication status
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <p className="mt-4 text-lg">The page you are looking for does not exist.</p>
      {isAuthenticated !== null && (
        <Link
          href={isAuthenticated ? '/dashboard' : '/dashboard'} 
          className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Back to Home
        </Link>
      )}
    </div>
  );
}