-- Permite metodo_pago = 'Internacional' para checkout LatAm (dLocal / DHL).
-- Ejecutar en Supabase SQL Editor antes de aceptar pedidos internacionales en producción.

ALTER TABLE public.ordenes
  DROP CONSTRAINT IF EXISTS ordenes_metodo_pago_check;

ALTER TABLE public.ordenes
  ADD CONSTRAINT ordenes_metodo_pago_check
  CHECK (
    metodo_pago IS NULL
    OR (metodo_pago::text = ANY (ARRAY[
      'Openpay'::text,
      'Transferencia'::text,
      'Internacional'::text
    ]))
  );

COMMENT ON COLUMN public.ordenes.metodo_pago IS
  'Openpay | Transferencia | Internacional.';
