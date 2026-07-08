import { motion } from "framer-motion";
import {
  Navbar,
  Footer,
  FilmGrain,
  ScrollProgress,
  SectionMarker,
  EASE,
} from "./App";

const UPDATED = "30 juin 2026";

type Section = { heading: string; paragraphs: string[]; bullets?: string[] };

const SECTIONS: Section[] = [
  {
    heading: "1. Responsable de la protection des renseignements personnels",
    paragraphs: [
      "Chez Florent (« nous ») accorde une grande importance à la protection de vos renseignements personnels. Conformément à la Loi 25 (Loi modernisant des dispositions législatives en matière de protection des renseignements personnels), nous avons désigné un responsable de la protection des renseignements personnels.",
      "Pour toute question relative à la présente politique ou à vos renseignements personnels, vous pouvez joindre notre responsable :",
    ],
    bullets: [
      "Responsable : la direction de Chez Florent",
      "Adresse : 57 Rue du Roi, Sorel-Tracy (QC) J3P 4M6",
      "Téléphone : 450 743-1448",
    ],
  },
  {
    heading: "2. Renseignements que nous recueillons",
    paragraphs: [
      "Nous ne recueillons que les renseignements nécessaires aux fins décrites ci-dessous. Lorsque vous communiquez avec nous pour réserver une table ou organiser un événement, nous pouvons recueillir :",
    ],
    bullets: [
      "Votre nom;",
      "Votre numéro de téléphone;",
      "La date, l'heure et le nombre de personnes pour votre réservation;",
      "Toute note ou demande particulière que vous choisissez de nous transmettre (allergies, occasion, etc.).",
    ],
  },
  {
    heading: "3. Fins de la collecte",
    paragraphs: [
      "Vos renseignements personnels sont utilisés uniquement pour :",
    ],
    bullets: [
      "Confirmer, préparer et gérer votre réservation ou votre événement;",
      "Communiquer avec vous au sujet de votre visite (confirmation, modification, rappel);",
      "Répondre à vos questions et demandes;",
      "Respecter nos obligations légales et réglementaires.",
    ],
  },
  {
    heading: "4. Consentement",
    paragraphs: [
      "En nous transmettant vos renseignements, vous consentez à ce que nous les utilisions aux fins décrites dans la présente politique. Votre consentement est demandé de manière claire et libre, et il est limité aux fins énoncées.",
      "Vous pouvez retirer votre consentement à tout moment en nous contactant. Le retrait du consentement peut toutefois nous empêcher de traiter votre réservation.",
    ],
  },
  {
    heading: "5. Communication à des tiers",
    paragraphs: [
      "Nous ne vendons, ne louons ni n'échangeons vos renseignements personnels. Vos renseignements ne sont communiqués à des tiers que lorsque cela est nécessaire à la prestation du service (par exemple, un outil de gestion des réservations) ou lorsque la loi l'exige.",
      "Tout prestataire qui traite des renseignements pour notre compte est tenu de les protéger et de ne les utiliser qu'aux fins prévues. Si des renseignements devaient être communiqués à l'extérieur du Québec, nous procéderions à une évaluation des facteurs relatifs à la vie privée, comme l'exige la Loi 25.",
    ],
  },
  {
    heading: "6. Conservation et destruction",
    paragraphs: [
      "Nous conservons vos renseignements personnels uniquement pendant la durée nécessaire à la réalisation des fins pour lesquelles ils ont été recueillis, puis nous les détruisons de façon sécuritaire, sous réserve des délais de conservation prévus par la loi.",
    ],
  },
  {
    heading: "7. Mesures de sécurité",
    paragraphs: [
      "Nous prenons des mesures de sécurité raisonnables — physiques, organisationnelles et technologiques — pour protéger vos renseignements personnels contre la perte, le vol, l'accès, la communication, la copie ou l'utilisation non autorisés.",
      "En cas d'incident de confidentialité présentant un risque de préjudice sérieux, nous vous en aviserions et aviserions la Commission d'accès à l'information du Québec, conformément à la loi.",
    ],
  },
  {
    heading: "8. Témoins (cookies) et site Web",
    paragraphs: [
      "Notre site Web vise principalement à présenter le restaurant, son menu et ses coordonnées. Il n'utilise pas de témoins de suivi publicitaire. Certains témoins strictement nécessaires peuvent être utilisés pour assurer le bon fonctionnement du site.",
    ],
  },
  {
    heading: "9. Vos droits",
    paragraphs: [
      "Conformément à la Loi 25, vous avez le droit de :",
    ],
    bullets: [
      "Accéder aux renseignements personnels que nous détenons à votre sujet;",
      "Demander la rectification de renseignements inexacts, incomplets ou équivoques;",
      "Retirer votre consentement à leur utilisation;",
      "Demander la suppression de vos renseignements lorsque la loi le permet;",
      "Porter plainte auprès de la Commission d'accès à l'information du Québec.",
    ],
  },
  {
    heading: "10. Exercer vos droits ou porter plainte",
    paragraphs: [
      "Pour exercer l'un de ces droits, communiquez avec notre responsable de la protection des renseignements personnels au 450 743-1448 ou à l'adresse 57 Rue du Roi, Sorel-Tracy (QC) J3P 4M6. Nous répondrons dans les délais prévus par la loi.",
      "Si vous n'êtes pas satisfait de notre réponse, vous pouvez communiquer avec la Commission d'accès à l'information du Québec (cai.gouv.qc.ca).",
    ],
  },
  {
    heading: "11. Modifications de la politique",
    paragraphs: [
      "Nous pouvons modifier la présente politique afin de refléter les changements à nos pratiques ou à la réglementation applicable. La date de mise à jour ci-dessous indique la version en vigueur.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-[100dvh] w-full bg-bg-primary text-cream selection:bg-orange selection:text-bg-primary relative">
      <ScrollProgress />
      <FilmGrain />

      <div className="overflow-x-hidden">
        <Navbar activeSection="" onOtherPage />

        <main>
          {/* Hero / header */}
          <section className="relative bg-bg-primary pt-40 md:pt-52 pb-16 md:pb-20 px-6 md:px-12 overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none mix-blend-multiply"
              style={{
                background:
                  "radial-gradient(120% 90% at 80% 0%, rgba(216,90,44,0.18) 0%, transparent 55%)",
              }}
            />
            <SectionMarker number="✶" />
            <div className="max-w-5xl mx-auto relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-orange mb-6">
                  <span aria-hidden="true">✶ </span>Vie privée — Loi 25 du Québec
                </div>
                <h1 className="font-display text-cream leading-[1.18] pb-[0.28em] text-[clamp(2.75rem,8vw,7rem)]">
                  Politique de confidentialité
                </h1>
                <p className="font-sans italic text-cream-soft/75 max-w-2xl text-lg mt-6">
                  La présente politique explique comment Chez Florent recueille,
                  utilise et protège vos renseignements personnels, conformément
                  à la Loi 25 du Québec.
                </p>
                <p className="font-sans text-cream-soft/55 text-[0.8rem] tracking-[0.12em] uppercase mt-6">
                  Dernière mise à jour : {UPDATED}
                </p>
              </motion.div>
            </div>
          </section>

          {/* Policy body */}
          <section className="bg-cream-soft pt-16 md:pt-20 pb-24 md:pb-28 px-6 md:px-12 relative">
            <div className="max-w-3xl mx-auto relative z-10">
              <div className="space-y-12">
                {SECTIONS.map((section, i) => (
                  <motion.div
                    key={section.heading}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6, ease: EASE, delay: (i % 3) * 0.05 }}
                  >
                    <h2 className="font-serif font-semibold text-bg-primary text-[1.4rem] md:text-[1.65rem] leading-snug mb-4">
                      {section.heading}
                    </h2>
                    <div className="space-y-4">
                      {section.paragraphs.map((p, j) => (
                        <p
                          key={j}
                          className="font-sans text-bg-primary/80 text-[1rem] leading-[1.8]"
                        >
                          {p}
                        </p>
                      ))}
                      {section.bullets && (
                        <ul className="mt-2 space-y-2 border-l-2 border-orange/40 pl-5">
                          {section.bullets.map((b, k) => (
                            <li
                              key={k}
                              className="font-sans text-bg-primary/80 text-[0.975rem] leading-[1.7]"
                            >
                              {b}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
