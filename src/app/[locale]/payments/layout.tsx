// app/myCabinet/layout.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('local_access_token');
  const isValid = token && token.value.startsWith('Token ');

  if (!isValid) {
    redirect('/login');
  }

  return <>{children}</>;
}
