// app/myCabinet/layout.tsx
import { cookies } from 'next/headers';
import { getLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('local_access_token');
  const isValid = token && token.value.startsWith('Token ');

  if (!isValid) {
    const locale = await getLocale()
    redirect({ href: '/login', locale })
  }

  return <>{children}</>;
}
