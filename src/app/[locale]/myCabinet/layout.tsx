// app/myCabinet/layout.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import MobileTabs from './components/MobileTabs';

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

  return (
    <>
      <div className="xl:hidden max-w-8xl mx-auto px-4 md:px-6 pt-4">
        <MobileTabs />
      </div>
      {children}
    </>
  );
}
