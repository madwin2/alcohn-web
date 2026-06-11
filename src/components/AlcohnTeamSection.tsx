import MobileCarousel from '@/components/MobileCarousel';
import { teamMembers } from '@/data/aboutAlcohn';

function memberInitials(name: string, role: string) {
  const source = name.trim() || role;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }
  return (parts[0]?.slice(0, 2) ?? 'AL').toUpperCase();
}

function TeamMemberCard({ member }: { member: (typeof teamMembers)[number] }) {
  const initials = memberInitials(member.name, member.role);

  return (
    <article className="mobile-snap-card flex h-full flex-col border border-[var(--alcohn-line)] bg-[var(--alcohn-surface)] md:min-w-0 md:border-0 md:bg-transparent">
      <div className="material-frame relative aspect-square overflow-hidden">
        {member.image ? (
          <img
            src={member.image}
            alt={member.name.trim() ? `Foto de ${member.name}` : member.role}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#f7f3ec] to-[#ebe4d8]"
            aria-hidden="true"
          >
            <span className="text-3xl font-semibold tracking-tight text-[var(--alcohn-bronze-dark)]/70 md:text-4xl">
              {initials}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 md:p-6">
        {member.name.trim() ? (
          <>
            <h3 className="text-lg font-semibold tracking-tight text-neutral-950">{member.name}</h3>
            <p className="craft-label mt-2 text-[var(--alcohn-bronze-dark)]">{member.role}</p>
          </>
        ) : (
          <h3 className="text-lg font-semibold tracking-tight text-neutral-950">{member.role}</h3>
        )}
        <p className="mt-3 flex-1 text-sm leading-relaxed text-neutral-700">{member.bio}</p>
      </div>
    </article>
  );
}

export default function AlcohnTeamSection() {
  return (
    <section className="mb-20" aria-labelledby="equipo-alcohn-heading">
      <div className="technical-sheet">
        <div className="relative z-10 border-b border-[var(--alcohn-line)] p-6 md:p-10 lg:p-12">
          <p className="craft-label mb-4">Equipo</p>
          <h2
            id="equipo-alcohn-heading"
            className="max-w-3xl text-3xl font-semibold tracking-tight leading-tight text-neutral-950 md:text-5xl"
          >
            Las personas detrás de cada sello
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-600 md:text-base">
            Somos cuatro en el equipo. Diseñamos, fabricamos y acompañamos cada proyecto desde
            Mar del Plata con la misma atención que pondríamos en nuestra propia marca.
          </p>
        </div>

        <MobileCarousel
          className="relative z-10 md:hidden"
          rowClassName="gap-4 px-4 py-5"
          hint="Deslizá para conocer al equipo"
        >
          {teamMembers.map((member) => (
            <div key={member.role} className="w-[min(78vw,18rem)] shrink-0">
              <TeamMemberCard member={member} />
            </div>
          ))}
        </MobileCarousel>

        <div className="relative z-10 hidden md:grid md:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member) => (
            <div
              key={member.role}
              className="border-b border-r border-[var(--alcohn-line)] even:md:border-r-0 lg:border-b-0 lg:border-r lg:even:border-r lg:last:border-r-0"
            >
              <TeamMemberCard member={member} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
