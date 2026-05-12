"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Track authentication status
  const router = useRouter();

  useEffect(() => {
    // Check authentication status on the client side
    const user = localStorage.getItem('user'); // Replace with your actual logic
    setIsAuthenticated(!!user); // Set authentication status
  }, []);

  // Redirect based on authentication status
  useEffect(() => {
    if (isAuthenticated === true) {
      router.push('/dashboard'); // Redirect to dashboard if logged in
    } else if (isAuthenticated === false) {
      router.push('/login'); // Redirect to login if not logged in
    }
  }, [isAuthenticated, router]);

  // Render nothing while determining authentication status
  if (isAuthenticated === null) {
    return null;
  }

  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <p>Redirecting you based on your authentication status...</p>
    </div>
  );
}