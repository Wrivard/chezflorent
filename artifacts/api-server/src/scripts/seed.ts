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

  const categories = [
    {
      slug: "partager",
      label: "À partager",
      tagline:
        "Pour ouvrir la soirée — un verre, une planche, le temps qui ralentit.",
      items: [
        {
          name: "Trempette de poireaux rôtis",
          price: "16,95 $",
          description: "Bacon fumé, servi avec pain plat gratiné.",
          image: "/images/naan-dip.jpg",
        },
        {
          name: "Bufarella potato",
          price: "17,95 $",
          description:
            "Boule de fromage bufarella (Fromagerie Fuoco) accompagnée de hummus de patate douce, coulis de bleuets à l'érable, huile épicée, menthe et crumble au parmesan. Servi avec pain naan grillé.",
          image: "/images/bufarella-mint.jpg",
        },
        {
          name: "Assiette de charcuterie",
          price: "35,95 $",
          description:
            "Calabrese, prosciutto, saucissons secs, olives méli-mélo, fromages du moment, pickle d'oignons rouges, petits cornichons. Servi avec pain et croutons.",
          image: "/images/sandwich-mac.jpg",
        },
      ],
    },
    {
      slug: "plats",
      label: "Les plats",
      tagline:
        "Le coeur de l'ardoise — sandwichs travaillés, plats roboratifs, à manger sans manières.",
      items: [
        {
          name: "Grilled cheese sur baguette",
          price: "5,95 $ / 11,95 $",
          description: "Provolone, mozzarella, fromage jaune, beurre à l'ail.",
          image: "/images/tower-sandwich.jpg",
        },
        {
          name: "Feuilleté jambon gruyère",
          price: "9,95 $ / 19,95 $",
          description:
            "Pâte feuilletée, jambon, fromage gruyère, sauce blanche crémeuse avec pomme de terre, poireaux.",
          image: "/images/feuillete-ham.jpg",
        },
        {
          name: "Miche de porc",
          price: "23,95 $",
          description:
            "Miche de pain artisanale, porc effiloché maison, fromage à la crème épicé aux cornichons, laitue iceberg, moutarde au miel. Servi avec salade de carottes crémeuse.",
          image: "/images/miche-porc.jpg",
        },
        {
          name: "« Le Rhé-Actif »",
          price: "24,95 $",
          description:
            "Pain ciabata, provolone, mortadelle, calabrese, capicollo, salade, tomates, oignons rouges, mayonnaise thaï. Servi avec salade de patates maison.",
          image: "/images/sandwich-mac.jpg",
        },
        {
          name: "Pizza « Vodka » 🌶🌶🌶",
          price: "25,95 $",
          description:
            "Sauce rosée à la vodka, saucisses épicées (Ferme J.N Beauchemin), oignons croustillants, mozzarella, huile à l'ail, tomates confites au gras de canard.",
          image: "/images/pizza-oven.jpg",
        },
        {
          name: "« Philly T »",
          price: "25,95 $",
          description:
            "Pain baguette, fromages (jaune, mozzarella, provolone), poivrons rouges, oignons blancs, brisket (Les Cowboys du BBQ), mayonnaise épicée. Servi avec salade de pâte maison et cup de sauce BBQ.",
          image: "/images/tower-sandwich.jpg",
        },
      ],
    },
    {
      slug: "bar",
      label: "Au bar",
      tagline:
        "Cocktails maison, vins choisis, bières du coin — le bar reste ouvert tard.",
      items: [
        {
          name: "Sorel-Spritz",
          price: "14,00 $",
          description:
            "Vin pétillant, Aperol, sirop maison aux canneberges du Lac St-Pierre, branche de romarin frais.",
          image: "/images/tap-pour.jpg",
        },
        {
          name: "Old Fashioned du Florent",
          price: "16,00 $",
          description:
            "Rye canadien, sirop d'érable d'Yamaska, bitter aux noix grillées, zeste d'orange brûlé au chalumeau.",
          image: "/images/florent-glass.jpg",
        },
        {
          name: "Negroni Sapin",
          price: "15,00 $",
          description:
            "Gin local Québec Distillerie, Campari, vermouth maison infusé sapinette des bois — boisé, presque résineux.",
          image: "/images/florent-glass.jpg",
        },
        {
          name: "Vin de la maison",
          price: "9,00 $ / 38,00 $",
          description:
            "Rouge ou blanc, sélection rotative du sommelier — au verre ou à la bouteille. Demandez la suggestion.",
          image: "/images/tap-pour.jpg",
        },
        {
          name: "Pinte Riverbend",
          price: "8,00 $",
          description:
            "Blonde houblonnée brassée à Sorel par Riverbend Brewing Co. — locale, fraîche, désaltérante.",
          image: "/images/florent-glass.jpg",
        },
        {
          name: "Espresso & digestif",
          price: "5,00 $ / 9,00 $",
          description:
            "Café espresso bien serré, accompagné d'un Amaro maison ou d'un cognac à l'ancienne. Pour finir en beauté.",
          image: "/images/interior-bar.jpg",
        },
      ],
    },
  ];

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
      url: "/images/tap-pour.jpg",
      alt: "Service au comptoir Chez Florent",
    },
    {
      slot: "voice2",
      url: "/images/interior-bar.jpg",
      alt: "Salle à manger de Chez Florent",
    },
    {
      slot: "voice3",
      url: "/images/pizza-oven.jpg",
      alt: "Le four à pizza de Chez Florent",
    },
    {
      slot: "facade",
      url: "/images/facade-pizza.jpg",
      alt: "Devanture de Chez Florent, 57 rue du Roi à Sorel-Tracy",
    },
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
