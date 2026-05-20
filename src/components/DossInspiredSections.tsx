'use client';

import { useState } from 'react';
import ActionButton from './ActionButton';

const stages = [
  {
    id: 'PASO1',
    label: 'Elegis el Material',
    title: 'Seleccionas el material que querés marcar',
    body: 'Elegis si queres marcar cuero, madera, alimentos, o otro material. Con esto, sabemos que muestra tenemos que hacerte. No te preocupes, el sello igual sirve para todos los materiales.',
    stat: '01',
  },
  {
    id: 'PASO2',
    label: 'Subis tu Logo',
    title: 'Carga tu logo en la pagina',
    body: 'Podes subir el logo con el que queres hacer tu sello. Puede ser PNG, JPG, EPS, AI, SVG.',
    stat: '02',
  },
  {
    id: 'PASO3',
    label: 'Ves Muestras, Medidas y Precio',
    title: 'Ves como va a quedar tu marca y el precio total',
    body: 'En este paso, vas a poder ver como va a quedar tu marca, las medidas y el precio de cada una.',
    stat: '03',
  },
  {
    id: 'checkout',
    label: 'Pago',
    title: 'Compras de Manera Segura',
    body: 'Realizas la compra de manera segura y facil.podes pagar con tarjeta o transferencia.',
    stat: '04',
  },
  {
    id: 'production',
    label: 'Producción',
    title: 'Fabricamos el sello en 72hs y te lo enviamos',
    body: 'Te mantenemos al tanto del proceso de fabricacion y te lo enviamos a tu direccion o sucursal, segun lo que elijas.',
    stat: '05',
  },
];

export default function DossInspiredSections() {
  const [activeStage, setActiveStage] = useState(stages[1]);

  return (
    <section className="bg-[var(--alcohn-ink)] py-16 text-white md:snap-start md:snap-always md:min-h-[calc(100vh-4rem)] md:py-24 flex items-center">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="dark-system-panel motion-reveal-delay">
          <div className="relative z-10 grid min-h-[620px] grid-cols-1 lg:grid-cols-[0.32fr_0.68fr]">
            <div className="border-b border-white/10 p-6 md:p-8 lg:border-b-0 lg:border-r lg:p-10">
              <p className="text-[10px] font-semibold uppercase text-white/52">PASO A PASA PARA COMPRAR</p>
              <div className="mt-8 grid gap-2">
                {stages.map((stage) => (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => setActiveStage(stage)}
                    className={`flex min-h-[56px] items-center justify-between border px-4 text-left text-sm font-semibold transition-all ${
                      activeStage.id === stage.id
                        ? 'border-[var(--alcohn-bronze)] bg-white/10 text-white'
                        : 'border-white/10 bg-white/[0.03] text-white/46 hover:border-white/28 hover:text-white'
                    }`}
                  >
                    <span>{stage.label}</span>
                    <span className="text-[10px] text-white/42">{stage.stat}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative flex min-h-[520px] flex-col justify-between p-6 md:p-10 lg:p-14">
              <div>
                <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase text-white/60">
                  <span className="signal-dot h-2 w-2 rounded-full bg-[var(--alcohn-bronze)]" />
                  SIMPLE RAPIDO PRECISO
                </p>
                <h2 className="mt-8 max-w-xl text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
                  {activeStage.title}
                </h2>
                <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/58 md:text-base">
                  {activeStage.body}
                </p>
              </div>

              <div className="relative mt-10 min-h-[260px] md:min-h-[320px]">
                <svg className="absolute inset-0 h-full w-full text-white/12" viewBox="0 0 700 340" fill="none" aria-hidden="true">
                  <path d="M70 250L350 90L630 250" stroke="currentColor" />
                  <path d="M150 250L350 135L550 250" stroke="currentColor" />
                  <path d="M230 250L350 180L470 250" stroke="currentColor" />
                  <path d="M70 250H630" stroke="currentColor" strokeDasharray="6 8" />
                  <path d="M350 90V278" stroke="currentColor" strokeDasharray="6 8" />
                </svg>

                <div className="system-cube absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 md:h-36 md:w-36">
                  <div className="absolute inset-0 rotate-45 border border-[var(--alcohn-bronze)] bg-[var(--alcohn-bronze)]/18" />
                  <div className="absolute inset-4 rotate-45 border border-white/34 bg-white/8" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-semibold text-white md:text-2xl">{activeStage.stat}</span>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 grid grid-cols-2 gap-2 md:grid-cols-5">
                  {stages.map((stage) => (
                    <div key={stage.id} className={`border p-3 ${activeStage.id === stage.id ? 'border-[var(--alcohn-bronze)] bg-white/8' : 'border-white/10 bg-black/10'}`}>
                      <p className="text-[10px] uppercase text-white/44">{stage.stat}</p>
                      <p className="mt-1 text-xs font-semibold text-white">{stage.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <ActionButton href="/buy?mode=custom" variant="secondary" className="border-white bg-white text-neutral-900 hover:bg-[var(--alcohn-paper)]">
                  Probar el flujo online
                </ActionButton>
                <ActionButton href="/proceso" variant="ghost" className="text-white hover:text-white">
                  Ver proceso completo
                </ActionButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
