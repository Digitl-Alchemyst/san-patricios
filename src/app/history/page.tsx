import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";

export default function HistoryPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />

      <main className="flex-1">
        <section className="border-b border-border/80">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-sp-gold">
              History
            </p>
            <h1 className="mt-3 text-3xl font-bold text-bone sm:text-4xl">
              El Batallón de San Patricio
            </h1>
            <p className="mt-2 font-mono text-sm text-smoke">1846 &ndash; 1847</p>
            <p className="mt-6 text-base leading-relaxed text-smoke">
              The Saint Patrick&apos;s Battalion was a unit of several hundred
              men, mostly Irish Catholic immigrants and other European
              Catholics, who left the United States Army during the
              Mexican&ndash;American War and fought for Mexico. Mexico remembers
              them as heroes. The U.S. Army tried most of them for desertion
              and hanged the largest number of soldiers it has ever executed
              for a single offense. Both things are true, and the reasons why
              are the reason this organization carries their name.
            </p>
          </div>
        </section>

        <section className="border-b border-border/80 bg-surface/40">
          <div className="mx-auto max-w-3xl px-6 py-10">
            <Image
              src="/images.jpg"
              alt="Historical depiction related to the Batallón de San Patricio"
              width={1200}
              height={900}
              sizes="(min-width: 768px) 48rem, 100vw"
              className="h-auto w-full rounded-sm border border-border"
            />
          </div>
        </section>

        <Section eyebrow="Origins" title="Why They Deserted">
          <p>
            By the 1840s, a large share of the U.S. Army&apos;s enlisted ranks
            were recent immigrants, many of them Irish and German Catholics
            who had fled famine and poverty. Nativist prejudice against
            Catholics was common in the army&apos;s officer corps at the time,
            and discipline was harsh by any standard &mdash; flogging and other
            corporal punishments for minor infractions were routine. Many of
            these soldiers found a surprising kinship on the other side of
            the Rio Grande: Mexico was an overwhelmingly Catholic country,
            and Mexican commanders knew it. Mexican generals distributed
            leaflets appealing directly to Irish and Catholic soldiers,
            promising deserters land, money, and rank if they crossed over.
          </p>
          <p>
            Not every San Patricio was a U.S. Army deserter. The battalion
            also included Irish and other European immigrants who were
            already living in Mexico when the war broke out, Mexican
            soldiers, and a smaller number of escaped slaves and other
            Americans. What held the unit together wasn&apos;t a single
            story of desertion, but a shared refusal to fight a war they
            didn&apos;t believe in, against a Catholic country, on the side
            that had treated them as outsiders.
          </p>
        </Section>

        <Section eyebrow="Formation" title="The Battalion">
          <p>
            The unit was organized and led by John Riley (Seán Ó Raghallaigh),
            an Irish immigrant and former British Army drillmaster who had
            deserted from the U.S. Army at Matamoros in April 1846, before war
            was formally declared &mdash; a technicality that would later
            matter a great deal. Riley is credited with naming the unit the
            Batallón de San Patricio and designing its banner: a green flag
            bearing an image of Saint Patrick, a harp, and shamrocks, with
            the words &ldquo;Erin go Bragh&rdquo; on one side and Mexican
            symbols and the motto &ldquo;Libertad por la República
            Mexicana&rdquo; on the other &mdash; two flags&apos; worth of
            loyalty on one piece of cloth.
          </p>
          <p>
            As an artillery unit, the San Patricios fought at Monterrey
            (September 1846), Buena Vista (February 1847), and Cerro Gordo
            (April 1847), earning a reputation as some of the most skilled
            gunners in the Mexican army.
          </p>
        </Section>

        <Section eyebrow="August 20, 1847" title="Churubusco: The Last Stand">
          <p>
            The battalion&apos;s defining moment came at the Battle of
            Churubusco, where some 200 San Patricios held a fortified convent
            against advancing U.S. forces. Accounts from the battle describe
            Mexican officers trying three separate times to raise a white
            flag of surrender &mdash; and San Patricios tearing it down each
            time. They fought until they ran out of ammunition. When the
            position finally fell, an American officer had to intervene to
            stop U.S. soldiers from killing the San Patricios they&apos;d
            just captured, John Riley among them.
          </p>
        </Section>

        <Section eyebrow="Aftermath" title="Trial and Punishment">
          <p>
            General Winfield Scott convened courts-martial for about 72
            captured San Patricios. Roughly 50 were sentenced to death. Most
            were hanged in groups in the weeks that followed; the largest
            group &mdash; around 30 men &mdash; was executed near Chapultepec
            Castle on September 13, 1847, deliberately timed so the condemned
            would see the U.S. flag raised over the castle as they died. It
            remains the largest single mass execution in U.S. military
            history.
          </p>
          <p>
            John Riley was not among them. Because he had deserted before war
            was officially declared, military law at the time spared him the
            death penalty &mdash; he was instead flogged and branded with a
            &ldquo;D&rdquo; on his cheek. Several other San Patricios received
            the same punishment instead of execution, for the same technical
            reason.
          </p>
        </Section>

        <Section eyebrow="Legacy" title="Remembered on Both Sides">
          <p>
            In the United States, the San Patricios were historically
            remembered, when they were remembered at all, as traitors. In
            Mexico, they are honored as heroes who chose conscience over
            nationality. Mexico commemorates them every year on September 12
            at Plaza San Jacinto in the San Ángel district of Mexico City,
            where a plaque lists the names of the executed. A street nearby
            is named Calle Mártires Irlandeses &mdash; Street of the Irish
            Martyrs. In Clifden, County Galway &mdash; John Riley&apos;s
            hometown &mdash; the connection is marked as well, a reminder
            that this is one story, not two separate ones.
          </p>
        </Section>

        <Section eyebrow="Today" title="Why We Carry This Name">
          <p>
            The San Patricios crossed a line most people were told was fixed
            &mdash; between Irish and Mexican, between one nation and
            another &mdash; because they recognized a shared fight when they
            saw one. That&apos;s the inheritance this organization claims:
            not the war itself, but the refusal to let an arbitrary line
            decide who you stand with. We&apos;re Irish, Mexican, and
            Indigenous people and allies, organizing mutual aid, community
            defense, and cultural education together, because the
            communities we come from have always been told their fights were
            separate &mdash; and they&apos;ve never actually been that.
          </p>
          <p>
            Read more about{" "}
            <Link href="/mission" className="text-sp-gold hover:underline">
              what that looks like today
            </Link>{" "}
            on our mission page, or{" "}
            <Link href="/join" className="text-sp-gold hover:underline">
              apply to join
            </Link>
            .
          </p>
        </Section>

        <section className="border-t border-border/80 bg-surface/40">
          <div className="mx-auto max-w-3xl px-6 py-12">
            <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-sp-gold">
              Further Reading
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-smoke">
              <li>
                <a
                  href="https://en.wikipedia.org/wiki/Saint_Patrick%27s_Battalion"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sp-gold hover:underline"
                >
                  Saint Patrick&apos;s Battalion &mdash; Wikipedia
                </a>
              </li>
              <li>
                <a
                  href="https://www.smithsonianmag.com/history/mexican-american-war-irish-immigrants-deserted-us-army-fight-against-america-180971713/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sp-gold hover:underline"
                >
                  &ldquo;The Mexican-American War Irish Immigrants Who
                  Deserted the U.S. Army to Fight Against America&rdquo;
                  &mdash; Smithsonian Magazine
                </a>
              </li>
              <li>
                <a
                  href="https://en.wikipedia.org/wiki/Battle_of_Churubusco"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sp-gold hover:underline"
                >
                  Battle of Churubusco &mdash; Wikipedia
                </a>
              </li>
            </ul>
            <p className="mt-6 text-xs text-smoke/70">
              Historical accounts of exact casualty and execution counts vary
              by source; figures above reflect the ranges most commonly cited
              across the sources listed here.
            </p>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-border/80">
      <div className="mx-auto max-w-3xl px-6 py-14">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-sp-gold">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-bold text-bone">{title}</h2>
        <div className="mt-5 space-y-4 text-base leading-relaxed text-smoke">
          {children}
        </div>
      </div>
    </section>
  );
}
