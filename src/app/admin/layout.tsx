import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

/**
 * Layer 2 of admin route protection (Server Component).
 * Checks the JWT session and redirects non-admins to /login.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || session.role !== 'ADMIN') {
    redirect('/login?next=/admin');
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', backgroundColor: '#000000' }}>
      <main className="container" style={{ paddingTop: '32px', paddingBottom: '64px' }}>
        {children}
      </main>
    </div>
  );
}
