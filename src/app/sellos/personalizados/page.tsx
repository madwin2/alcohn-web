import { redirect } from 'next/navigation';

/** La landing general de personalizados se reemplazó por el modal en /productos. */
export default function SellosPersonalizadosRedirect() {
  redirect('/productos');
}
