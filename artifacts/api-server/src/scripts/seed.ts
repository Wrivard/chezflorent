import {
  db,
  adminUsersTable,
  eventsTable,
  menuCategoriesTable,
  menuItemsTable,
  hoursTable,
  sitePhotosTable,
  groupContentTable,
  aboutContentTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword } from "../lib/auth";
import { logger } from "../lib/logger";
import { DEFAULT_GROUP_CONTENT, GROUP_CONTENT_ID } from "../lib/groupContent";
import { DEFAULT_ABOUT_CONTENT, ABOUT_CONTENT_ID } from "../lib/aboutContent";
import { MENU_SEED } from "./menuSeed";

async function seedAdmin(): Promise<void> {
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!email || !password) {
    logger.warn(
      "ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin user seed.",
    );
    return;
  }
  const [existing] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.email, email));
  const passwordHash = hashPassword(password);
  if (existing) {
    await db
      .update(adminUsersTable)
      .set({ passwordHash })
      .where(eq(adminUsersTable.id, existing.id));
    logger.info({ email }, "Admin user password updated");
  } else {
    await db.insert(adminUsersTable).values({ email, passwordHash });
    logger.info({ email }, "Admin user created");
  }
}

async function seedHours(): Promise<void> {
  const rows = [
    { dayOfWeek: 0, closed: false, openHour: 17,   closeHour: 21 }, // Dimanche
    { dayOfWeek: 1, closed: false, openHour: 11.5, closeHour: 21 }, // Lundi
    { dayOfWeek: 2, closed: false, openHour: 11.5, closeHour: 21 }, // Mardi
    { dayOfWeek: 3, closed: false, openHour: 11.5, closeHour: 21 }, // Mercredi
    { dayOfWeek: 4, closed: false, openHour: 11.5, closeHour: 23 }, // Jeudi
    { dayOfWeek: 5, closed: false, openHour: 11.5, closeHour: 23 }, // Vendredi
    { dayOfWeek: 6, closed: false, openHour: 17,   closeHour: 23 }, // Samedi
  ];
  for (const row of rows) {
    await db
      .insert(hoursTable)
      .values(row)
      .onConflictDoUpdate({
        target: hoursTable.dayOfWeek,
        set: { closed: row.closed, openHour: row.openHour, closeHour: row.closeHour },
      });
  }
  logger.info("Hours seeded");
}

async function seedEvents(): Promise<void> {
  const existing = await db.select().from(eventsTable);
  if (existing.length > 0) return;
  const rows = [
    {
      isoDate: "2026-07-03",
      title: "5 à 7 — Découvertes du jour",
      description:
        "Le sommelier ouvre quelques bouteilles à découvrir, planche de charcuteries en accompagnement. Passe faire un tour !",
      tag: "5 à 7 · 17h–19h",
      soldOut: false,
    },
    {
      isoDate: "2026-07-16",
      title: "Soirée Cocktails du Sapinage",
      description:
        "Cinq cocktails signature au sapin baumier, à découvrir au 5 à 7. Bouchées chaudes incluses.",
      tag: "5 à 7 · 17h–19h",
      soldOut: false,
    },
    {
      isoDate: "2026-07-25",
      title: "Trio Jazz Manouche",
      description:
        "Trois instrumentistes du Sud-Ouest, en visite pour une soirée. Entrée libre, bon vin recommandé.",
      tag: "Live · 20h",
      soldOut: false,
    },
    {
      isoDate: "2026-08-01",
      title: "Dégustation de vins québécois",
      description:
        "Six vins d'ici présentés par le sommelier, bouchées d'accompagnement incluses. Places limitées.",
      tag: "Soirée · 19h",
      soldOut: false,
    },
    {
      isoDate: "2026-08-08",
      title: "Huîtres & bulles",
      description:
        "Trois variétés de la Côte-Nord, accord avec champagnes et pétillants québécois.",
      tag: "Soirée · 19h",
      soldOut: false,
    },
    {
      isoDate: "2026-08-12",
      title: "Soirée jeux de société géants",
      description:
        "Version XL de nos classiques, en équipes. Pintes de microbrasserie pour les gagnants.",
      tag: "Dès 18h",
      soldOut: false,
    },
    {
      isoDate: "2026-08-15",
      title: "Brunch gourmand — 4 services",
      description:
        "Menu 4 services, mimosas maison, places limitées. Réservation fortement suggérée.",
      tag: "Menu spécial · 38 $",
      soldOut: true,
    },
    {
      isoDate: "2026-08-20",
      title: "5 à 7 des microbrasseries",
      description:
        "Quatre brasseries de la région en dégustation, planche de charcuteries incluse.",
      tag: "5 à 7 · 17h–19h",
      soldOut: false,
    },
    {
      isoDate: "2026-08-22",
      title: "Open Mic — Poésie & guitare",
      description:
        "Soirée micro ouvert, ambiance feutrée. Inscrivez-vous sur place.",
      tag: "Acoustique · 20h",
      soldOut: false,
    },
    {
      isoDate: "2026-08-29",
      title: "Table d'hôte à quatre mains",
      description:
        "Notre chef reçoit un invité le temps d'un soir pour un menu dégustation en duo.",
      tag: "Menu spécial · 45 $",
      soldOut: false,
    },
    {
      isoDate: "2026-09-05",
      title: "Buffet & DJ — Fin d'été",
      description:
        "Buffet québécois, DJ jusqu'à 1h. La devanture devient une terrasse-piste.",
      tag: "Toute la soirée",
      soldOut: false,
    },
  ].map((row, index) => ({ ...row, sortOrder: index }));
  await db.insert(eventsTable).values(rows);
  logger.info("Events seeded");
}


async function seedMenu(): Promise<void> {
  const existing = await db.select().from(menuCategoriesTable);
  if (existing.length > 0) return;

  const categories = MENU_SEED;

  for (let c = 0; c < categories.length; c++) {
    const category = categories[c];
    const [inserted] = await db
      .insert(menuCategoriesTable)
      .values({
        slug: category.slug,
        label: category.label,
        tagline: category.tagline,
        sortOrder: c,
      })
      .returning();
    await db.insert(menuItemsTable).values(
      category.items.map((item, index) => ({
        categoryId: inserted.id,
        name: item.name,
        price: item.price,
        description: item.description,
        image: item.image,
        sortOrder: index,
      })),
    );
  }
  logger.info("Menu seeded");
}

async function seedPhotos(): Promise<void> {
  const defaults = [
    {
      slot: "hero",
      url: "/images/interior-bar.jpg",
      alt: "Salle à manger de Chez Florent",
    },
    {
      slot: "about1",
      url: "/images/tap-pour.jpg",
      alt: "Service au comptoir Chez Florent",
    },
    {
      slot: "about2",
      url: "/images/florent-glass.jpg",
      alt: "Verre signature Chez Florent",
    },
    {
      slot: "about3",
      url: "/images/facade-pizza.jpg",
      alt: "La devanture, 57 rue du Roi",
    },
    {
      slot: "press",
      url: "/images/interior-bar.jpg",
      alt: "Salle à manger de Chez Florent",
    },
    {
      slot: "voice1",
      url: "/images/jeux-societe.jpg",
      alt: "Un jeu de société sur une table Chez Florent",
    },
    {
      slot: "voice2",
      url: "/images/run-club.png",
      alt: "Groupe de coureurs réunis après le run club Chez Florent",
    },
    {
      slot: "voice3",
      url: "/images/quiz-gagnant.jpg",
      alt: "Une carte-cadeau gagnée lors d'un quiz Chez Florent",
    },
    {
      slot: "facade",
      url: "/images/facade-pizza.jpg",
      alt: "Devanture de Chez Florent, 57 rue du Roi à Sorel-Tracy",
    },
    { slot: "grp-formule-1", url: "/images/tap-pour.jpg", alt: "Formule — service au comptoir" },
    { slot: "grp-formule-2", url: "/images/bread-tearing.png", alt: "Formule — pain partagé" },
    { slot: "grp-formule-3", url: "/images/dish-charcuterie.png", alt: "Formule — planche de charcuterie" },
    { slot: "grp-formule-4", url: "/images/ambiance-smoke.png", alt: "Formule — ambiance du bistro" },
    { slot: "grp-occasion-1", url: "/images/interior-bar.jpg", alt: "Occasion — la salle Chez Florent" },
    { slot: "grp-occasion-2", url: "/images/tap-pour.jpg", alt: "Occasion — au comptoir" },
    { slot: "grp-occasion-3", url: "/images/florent-glass.jpg", alt: "Occasion — verre signature" },
    { slot: "apropos-hero", url: "/images/hero-interior.png", alt: "Intérieur de Chez Florent" },
    { slot: "apropos-1", url: "/images/suflo-crew-dos.jpg", alt: "L'équipe de Chez Florent" },
    { slot: "apropos-2", url: "/images/equipe-bar.jpg", alt: "L'équipe au bar" },
    { slot: "apropos-3", url: "/images/chef-four-a-bois.jpg", alt: "Le chef au four à bois" },
    { slot: "apropos-chef", url: "/images/chef-four-a-bois.jpg", alt: "Portrait du chef" },
  ];
  const existing = await db.select().from(sitePhotosTable);
  const existingSlots = new Set(existing.map((p) => p.slot));
  const missing = defaults.filter((d) => !existingSlots.has(d.slot));
  if (missing.length === 0) return;
  await db.insert(sitePhotosTable).values(missing);
  logger.info(`Site photos seeded (${missing.length} added)`);
}

async function seedGroupContent(): Promise<void> {
  const [existing] = await db
    .select()
    .from(groupContentTable)
    .where(eq(groupContentTable.id, GROUP_CONTENT_ID));
  if (existing) return;
  await db
    .insert(groupContentTable)
    .values({ id: GROUP_CONTENT_ID, data: DEFAULT_GROUP_CONTENT });
  logger.info("Group content seeded");
}

async function seedAboutContent(): Promise<void> {
  const [existing] = await db
    .select()
    .from(aboutContentTable)
    .where(eq(aboutContentTable.id, ABOUT_CONTENT_ID));
  if (existing) return;
  await db
    .insert(aboutContentTable)
    .values({ id: ABOUT_CONTENT_ID, data: DEFAULT_ABOUT_CONTENT });
  logger.info("About content seeded");
}

async function main(): Promise<void> {
  await seedAdmin();
  await seedHours();
  await seedEvents();
  await seedMenu();
  await seedPhotos();
  await seedGroupContent();
  await seedAboutContent();
  logger.info("Seed complete");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error({ err }, "Seed failed");
    process.exit(1);
  });
