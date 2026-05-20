create table public.clientes (
  id uuid not null default gen_random_uuid (),
  nombre character varying(100) not null,
  apellido character varying(100) not null,
  medio_contacto character varying(20) null,
  telefono character varying(20) not null,
  dni character varying(20) null,
  mail character varying(255) null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint clientes_pkey primary key (id),
  constraint clientes_dni_key unique (dni),
  constraint clientes_mail_key unique (mail),
  constraint clientes_medio_contacto_check check (
    (
      (medio_contacto)::text = any (
        (
          array[
            'Whatsapp'::character varying,
            'Facebook'::character varying,
            'Instagram'::character varying,
            'Mail'::character varying,
            'Web'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_clientes_dni on public.clientes using btree (dni) TABLESPACE pg_default;

create index IF not exists idx_clientes_mail on public.clientes using btree (mail) TABLESPACE pg_default;

create trigger trigger_clientes_updated_at BEFORE
update on clientes for EACH row
execute FUNCTION update_updated_at_column ();

###

create table public.ordenes (
  id uuid not null default gen_random_uuid (),
  cliente_id uuid not null,
  direccion_id uuid null,
  empresa_envio character varying(50) null,
  tipo_envio character varying(20) null,
  cantidad_sellos integer null default 0,
  senia_total numeric(10, 2) null default 0.00,
  valor_total numeric(10, 2) null default 0.00,
  restante numeric(10, 2) null default 0.00,
  seguimiento character varying(100) null,
  estado_orden character varying(30) null,
  fecha date null default CURRENT_DATE,
  estado_envio character varying(30) null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  taken_by uuid null,
  costo_fabricacion_total numeric(12, 1) null,
  margen_fabricacion_total numeric(12, 1) null,
  constraint ordenes_pkey primary key (id),
  constraint ordenes_direccion_id_fkey foreign KEY (direccion_id) references direcciones (id),
  constraint ordenes_taken_by_fkey foreign KEY (taken_by) references auth.users (id),
  constraint ordenes_cliente_id_fkey foreign KEY (cliente_id) references clientes (id) on delete CASCADE,
  constraint ordenes_tipo_envio_check check (
    (
      (tipo_envio)::text = any (
        (
          array[
            'Domicilio'::character varying,
            'Sucursal'::character varying,
            'Retiro'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint ordenes_empresa_envio_check check (
    (
      (empresa_envio)::text = any (
        (
          array[
            'Andreani'::character varying,
            'Correo Argentino'::character varying,
            'Via Cargo'::character varying,
            'Retiro'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint ordenes_estado_envio_check check (
    (
      (estado_envio is null)
      or (
        (estado_envio)::text = any (
          (
            array[
              'Sin envio'::character varying,
              'Hacer Etiqueta'::character varying,
              'Etiqueta Lista'::character varying,
              'Error de Etiqueta'::character varying,
              'Despachado'::character varying,
              'Seguimiento Enviado'::character varying
            ]
          )::text[]
        )
      )
    )
  ),
  constraint ordenes_estado_orden_check check (
    (
      (estado_orden is null)
      or (
        (estado_orden)::text = any (
          (
            array[
              'Señado'::character varying,
              'Hecho'::character varying,
              'Foto'::character varying,
              'Transferido'::character varying,
              'Deudor'::character varying,
              'Hacer Etiqueta'::character varying,
              'Etiqueta Lista'::character varying,
              'Despachado'::character varying,
              'Seguimiento Enviado'::character varying
            ]
          )::text[]
        )
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_ordenes_taken_by on public.ordenes using btree (taken_by) TABLESPACE pg_default;

create index IF not exists idx_ordenes_cliente_id on public.ordenes using btree (cliente_id) TABLESPACE pg_default;

create index IF not exists idx_ordenes_fecha on public.ordenes using btree (fecha) TABLESPACE pg_default;

create trigger trigger_consume_stock_on_envio
after
update OF estado_envio on ordenes for EACH row
execute FUNCTION trg_consume_stock_on_envio ();

create trigger trigger_envio_despachado
after
update OF estado_envio,
seguimiento on ordenes for EACH row
execute FUNCTION trigger_envio_despachado ();

create trigger trigger_ordenes_updated_at BEFORE
update on ordenes for EACH row
execute FUNCTION update_updated_at_column ();

create trigger trigger_update_orden_restante_on_shipping_change BEFORE
update on ordenes for EACH row when (
  old.empresa_envio::text is distinct from new.empresa_envio::text
  or old.tipo_envio::text is distinct from new.tipo_envio::text
)
execute FUNCTION update_orden_restante_on_shipping_change ();

###

create table public.sellos (
  id uuid not null default gen_random_uuid (),
  orden_id uuid not null,
  programa_id uuid null,
  fecha date null default CURRENT_DATE,
  tipo character varying(20) null,
  senia numeric(10, 2) null default 0.00,
  fecha_limite date null,
  diseno text null,
  nota text null,
  valor numeric(10, 2) not null,
  restante numeric(10, 2) null default 0.00,
  estado_fabricacion character varying(20) null,
  estado_venta character varying(20) null,
  archivo_base text null,
  foto_sello text null,
  tipo_planchuela integer null,
  tiempo integer null,
  maquina character varying(10) null,
  largo_real numeric(8, 2) null,
  ancho_real numeric(8, 2) null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  archivo_vector_preview text null,
  estado_aspire character varying null,
  programa_nombre text null,
  estado_vectorizacion character varying(20) null,
  es_prioritario boolean not null default false,
  item_type character varying(32) not null default 'SELLO'::character varying,
  item_config jsonb not null default '{}'::jsonb,
  costo_fabricacion numeric(12, 1) null,
  margen_fabricacion numeric(12, 1) null,
  constraint sellos_pkey primary key (id),
  constraint sellos_programa_id_fkey foreign KEY (programa_id) references programa (id),
  constraint sellos_orden_id_fkey foreign KEY (orden_id) references ordenes (id) on delete CASCADE,
  constraint sellos_estado_venta_check check (
    (
      (estado_venta is null)
      or (
        (estado_venta)::text = any (
          (
            array[
              'Señado'::character varying,
              'Foto'::character varying,
              'Transferido'::character varying,
              'Deudor'::character varying
            ]
          )::text[]
        )
      )
    )
  ),
  constraint sellos_item_type_check check (
    (
      (item_type)::text = any (
        (
          array[
            'SELLO'::character varying,
            'ABECEDARIO'::character varying,
            'SOLDADOR'::character varying,
            'MANGO_GOLPE'::character varying,
            'BASE_REMACHADORA'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint sellos_maquina_check check (
    (
      (maquina is null)
      or (
        (maquina)::text = any (
          (
            array[
              'C'::character varying,
              'G'::character varying,
              'XL'::character varying
            ]
          )::text[]
        )
      )
    )
  ),
  constraint sellos_tipo_check check (
    (
      (tipo)::text = any (
        (
          array[
            'Clasico'::character varying,
            '3mm'::character varying,
            'Lacre'::character varying,
            'Alimento'::character varying,
            'ABC'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint sellos_estado_aspire_check check (
    (
      (estado_aspire is null)
      or (
        (estado_aspire)::text = any (
          (
            array[
              'Aspire G'::character varying,
              'Aspire G Check'::character varying,
              'Aspire C'::character varying,
              'Aspire C Check'::character varying,
              'Aspire XL'::character varying
            ]
          )::text[]
        )
      )
    )
  ),
  constraint sellos_tipo_planchuela_check check (
    (
      tipo_planchuela = any (array[100, 63, 38, 25, 19, 12])
    )
  ),
  constraint sellos_estado_fabricacion_check check (
    (
      (estado_fabricacion)::text = any (
        (
          array[
            'Sin Hacer'::character varying,
            'Haciendo'::character varying,
            'Hecho'::character varying,
            'Rehacer'::character varying,
            'Retocar'::character varying,
            'Prioridad'::character varying,
            'Verificar'::character varying,
            'Programado'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint sellos_estado_vectorizacion_check check (
    (
      (estado_vectorizacion is null)
      or (
        (estado_vectorizacion)::text = any (
          (
            array[
              'BASE'::character varying,
              'VECTORIZADO'::character varying,
              'DESCARGADO'::character varying,
              'EN_PROCESO'::character varying
            ]
          )::text[]
        )
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_sellos_item_type on public.sellos using btree (item_type) TABLESPACE pg_default;

create index IF not exists idx_sellos_fecha_limite on public.sellos using btree (fecha_limite) TABLESPACE pg_default;

create index IF not exists idx_sellos_orden_id on public.sellos using btree (orden_id) TABLESPACE pg_default;

create index IF not exists idx_sellos_programa_id on public.sellos using btree (programa_id) TABLESPACE pg_default;

create index IF not exists idx_sellos_estado_fabricacion on public.sellos using btree (estado_fabricacion) TABLESPACE pg_default;

create index IF not exists idx_sellos_es_prioritario on public.sellos using btree (es_prioritario) TABLESPACE pg_default;

create trigger trigger_calc_sello_fabrication_cost BEFORE INSERT
or
update OF item_type,
item_config,
largo_real,
ancho_real,
valor,
diseno,
nota on sellos for EACH row
execute FUNCTION calc_sello_fabrication_cost ();

create trigger trigger_detect_programado BEFORE INSERT
or
update OF estado_aspire,
estado_fabricacion on sellos for EACH row
execute FUNCTION detect_programado_state ();

create trigger trigger_foto_sello_subida
after
update OF foto_sello on sellos for EACH row
execute FUNCTION trigger_foto_sello_subida ();

create trigger trigger_refresh_orden_fabrication_totals
after INSERT
or DELETE
or
update on sellos for EACH row
execute FUNCTION trg_refresh_orden_fabrication_totals ();

create trigger trigger_sellos_updated_at BEFORE
update on sellos for EACH row
execute FUNCTION update_updated_at_column ();

create trigger trigger_update_orden_totals
after INSERT
or DELETE
or
update on sellos for EACH row
execute FUNCTION update_orden_totals ();

create trigger trigger_update_programa_cantidad
after INSERT
or DELETE
or
update on sellos for EACH row
execute FUNCTION update_programa_cantidad ();

create trigger trigger_update_sello_restante BEFORE INSERT
or
update OF valor,
senia on sellos for EACH row
execute FUNCTION update_sello_restante ();

###

create table public.direcciones (
  id uuid not null default gen_random_uuid (),
  cliente_id uuid not null,
  activa boolean null default true,
  codigo_postal character varying(10) not null,
  provincia character varying(100) not null,
  localidad character varying(100) not null,
  domicilio character varying(255) not null,
  nombre character varying(100) not null,
  apellido character varying(100) not null,
  telefono character varying(20) null,
  dni character varying(20) null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  codigo_sucursal_micorreo text null,
  constraint direcciones_pkey primary key (id),
  constraint direcciones_cliente_id_fkey foreign KEY (cliente_id) references clientes (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_direcciones_cliente_id on public.direcciones using btree (cliente_id) TABLESPACE pg_default;

create trigger trigger_direcciones_updated_at BEFORE
update on direcciones for EACH row
execute FUNCTION update_updated_at_column ();

###

create table public.mockup_solicitudes (
  id uuid not null default gen_random_uuid (),
  nombre_muestra text null,
  nombre_slug text not null,
  whatsapp text null,
  material text not null,
  omitir_analisis boolean not null default false,
  estado text not null default 'procesando'::text,
  archivo_base_url text null,
  archivo_base_path text null,
  validacion jsonb null,
  imagen_optimizada_url text null,
  imagen_optimizada_path text null,
  mockup_cuero_url text null,
  mockup_cuero_path text null,
  mockup_madera_url text null,
  mockup_madera_path text null,
  intentos_optimizacion integer not null default 0,
  mensaje_error text null,
  creado_por uuid null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  preparado_con_simplificar_ia boolean not null default false,
  logo_trazo_ancho_px integer null,
  logo_trazo_alto_px integer null,
  logo_trazo_ratio_w_h double precision null,
  logo_trazo_ratio_label text null,
  logo_trazo_bbox_fallback boolean null,
  medidas_cotizacion_json jsonb null,
  constraint mockup_solicitudes_pkey primary key (id),
  constraint mockup_solicitudes_creado_por_fkey foreign KEY (creado_por) references auth.users (id) on delete set null,
  constraint mockup_solicitudes_estado_check check (
    (
      estado = any (
        array[
          'procesando'::text,
          'pendiente_aprobacion'::text,
          'completado'::text,
          'error'::text
        ]
      )
    )
  ),
  constraint mockup_solicitudes_material_check check (
    (
      material = any (
        array['cuero'::text, 'madera'::text, 'ambos'::text]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_mockup_solicitudes_created_at on public.mockup_solicitudes using btree (created_at desc) TABLESPACE pg_default;

create index IF not exists idx_mockup_solicitudes_whatsapp on public.mockup_solicitudes using btree (whatsapp) TABLESPACE pg_default;

create trigger trg_mockup_solicitudes_updated_at BEFORE
update on mockup_solicitudes for EACH row
execute FUNCTION mockup_solicitudes_touch_updated_at ();