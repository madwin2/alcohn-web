import { redirect } from 'next/navigation';

export default function CotizarPage() {
  redirect('/buy?mode=custom');
}
