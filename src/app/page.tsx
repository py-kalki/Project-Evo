import { redirect } from 'next/navigation';

/** / → /events */
export default function RootPage() {
  redirect('/events');
}
