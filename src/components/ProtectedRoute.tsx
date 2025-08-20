'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { Cookies } from 'react-cookie';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const cookies = new Cookies();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = cookies.get('local_access_token');
    const isValid = token && token.startsWith('Token ');
    const allowVisit = pathname.startsWith('/') || pathname.startsWith('/About') || pathname.startsWith('/dashboard') || pathname.startsWith('/404page');

    if (!isValid && !allowVisit) {
      router.push('/');
    } else {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}; 