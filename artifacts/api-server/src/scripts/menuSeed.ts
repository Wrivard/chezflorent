// Canonical fixed menu ("Le menu"), transcribed from the restaurant's printed
// menu. Includes the rotating "ardoise" (chef's daily specials) as a real,
// CMS-editable category — it leads the "La cuisine" tab bar on the Menu page
// (formerly a downloadable PDF).
export const MENU_SEED = [
  {
    slug: "encas",
    label: "Encas",
    tagline: "Petites bouchées pour ouvrir la soirée.",
    items: [
      {
        name: "Bol de chips",
        price: "6,00 $",
        description: "Croustilles Covered Bridge.",
        image: "/images/dish-tasting.png",
      },
      {
        name: "Saucissons secs",
        price: "6,25 $",
        description: "Porc Épique.",
        image: "/images/dish-charcuterie.png",
      },
      {
        name: "Bol d'olives",
        price: "6,25 $",
        description: "Olives méli-mélo.",
        image: "/images/dish-charcuterie.png",
      },
      {
        name: "Soupe du jour",
        price: "6,95 $",
        description: "Servie avec pain au levain (Maison Jaune).",
        image: "/images/naan-dip.jpg",
      },
      {
        name: "Frites épicées",
        price: "7,25 $",
        description:
          "Mayonnaise ordinaire, jalapenos ou épicée / sauce ranch au bleu / ketchup.",
        image: "/images/dish-tasting.png",
      },
      {
        name: "Pizza à l'ail",
        price: "15,95 $",
        description: "Trempette marinara.",
        image: "/images/pizza-oven.jpg",
      },
      {
        name: "Trempette et chips de maïs",
        price: "15,95 $",
        description: "Guacamole, salsa maison, crème sûre, fromage râpé.",
        image: "/images/naan-dip.jpg",
      },
      {
        name: "Crostini bruschetta",
        price: "17,00 $",
        description:
          "Pain baguette, cheddar fort, glaze balsamique, mayonnaise lime.",
        image: "/images/bread-tearing.png",
      },
      {
        name: "Choux-fleurs « pop-corn »",
        price: "17,50 $",
        description: "Trempette avocat-lime.",
        image: "/images/dish-tasting.png",
      },
    ],
  },
  {
    slug: "salades",
    label: "Salades",
    tagline: "Prix : accompagnement / repas.",
    items: [
      {
        name: "Verte",
        price: "5,50 $ / 9,50 $",
        description: "Mélange de salade, vinaigre balsamique, huile d'olive.",
        image: "/images/bufarella-mint.jpg",
      },
      {
        name: "Maison",
        price: "7,95 $ / 11,95 $",
        description:
          "Mélange de salade, concombres, tomates, oignons marinés, vinaigrette citron-érable.",
        image: "/images/bufarella-mint.jpg",
      },
      {
        name: "César",
        price: "10,50 $ / 16,50 $",
        description:
          "Laitue romaine, bacon, croutons, parmesan, sauce césar maison.",
        image: "/images/bufarella-mint.jpg",
      },
      {
        name: "Canneberge",
        price: "12,25 $ / 20,50 $",
        description:
          "Mélange de salade, cheddar fort, noix de Grenoble caramélisées, oignons marinés, canneberges séchées.",
        image: "/images/bufarella-mint.jpg",
      },
      {
        name: "Truite fumée",
        price: "14,95 $ / 24,95 $",
        description:
          "Truite fumée (Les Cowboys du BBQ), mélange de salade, radis, concombres, fenouils. Vinaigrette citron-érable ou sauce maison ranch au bleu.",
        image: "/images/bufarella-mint.jpg",
      },
    ],
  },
  {
    slug: "pizzas",
    label: "Pizzas four à bois",
    tagline: "Fromage végétalien +2,00 $ · Pâte sans gluten Oggi +4,95 $.",
    items: [
      {
        name: "Margherita",
        price: "20,95 $",
        description: "Sauce tomate, bufarella, parmesan, basilic.",
        image: "/images/pizza-oven.jpg",
      },
      {
        name: "4 fromages",
        price: "21,95 $",
        description:
          "Mozzarella, cheddar fort, parmesan, provolone. Beurre à l'ail +2,50 $.",
        image: "/images/dish-pizza.png",
      },
      {
        name: "Pesto",
        price: "21,95 $",
        description: "Courgette, roquette, parmesan.",
        image: "/images/pizza-planche.jpg",
      },
      {
        name: "Calabrese",
        price: "22,95 $",
        description:
          "Sauce tomate, mozzarella, oignons blancs, miel (Les Ruchers Bérard).",
        image: "/images/facade-pizza.jpg",
      },
      {
        name: "Pepperoni",
        price: "22,95 $",
        description: "Sauce tomate, mozzarella.",
        image: "/images/chef-four-a-bois.jpg",
      },
      {
        name: "La Toute",
        price: "23,95 $",
        description:
          "Sauce tomate, mozzarella, pepperoni, poivrons, bacon, champignons.",
        image: "/images/pizza-oven.jpg",
      },
      {
        name: "Prosciutto",
        price: "24,95 $",
        description:
          "Sauce tomate, mozzarella, bufarella, roquette, glaze balsamique, parmesan.",
        image: "/images/dish-pizza.png",
      },
      {
        name: "La « Bigflo »",
        price: "24,95 $",
        description:
          "Fromage jaune, viande hachée, cornichons, salade romaine, sauce maison style « bigmac ».",
        image: "/images/pizza-planche.jpg",
      },
      {
        name: "La Québécoise",
        price: "25,95 $",
        description:
          "Sauce tomate, mozzarella, bacon, pepperoni, oignons rouges, chair de saucisses (Ferme J.N Beauchemin), oignons verts.",
        image: "/images/facade-pizza.jpg",
      },
      {
        name: "La Maï Maï",
        price: "25,95 $",
        description:
          "Sauce crème citron-romarin, truite fumée (Les Cowboys du BBQ), oignons verts, roquette, fenouils.",
        image: "/images/chef-four-a-bois.jpg",
      },
      {
        name: "La « Sweet Lou »",
        price: "25,95 $",
        description:
          "Sauce tomate et sauce BBQ, mozzarella, brisket (Les Cowboys du BBQ), fromage de chèvre, oignons marinés.",
        image: "/images/pizza-oven.jpg",
      },
    ],
  },
  {
    slug: "hoagies",
    label: "Hoagies",
    tagline:
      "Servis avec frites ou salade (Verte, Maison, César, Canneberge +1,25 $, Truite fumée +5,50 $). Option « sans accompagnement » disponible à moindre coût.",
    items: [
      {
        name: "BLT su flo'",
        price: "20,95 $",
        description:
          "Mayonnaise jalapenos, bacon, laitue, tomates. Champignons shiitake (protéine végétale) +4,00 $ · option « sans bacon ».",
        image: "/images/sandwich-mac.jpg",
      },
      {
        name: "Légumes et fromage de chèvre",
        price: "21,25 $",
        description:
          "Pesto de tomates séchées, courgettes, poivrons, champignons, roquette.",
        image: "/images/dish-sandwich.png",
      },
      {
        name: "Jambon",
        price: "23,50 $",
        description:
          "Jambon (Porc Épique), mayonnaise moutarde, fromage suisse, roquette.",
        image: "/images/feuillete-ham.jpg",
      },
      {
        name: "Charcuteux",
        price: "24,95 $",
        description:
          "Mayonnaise balsamique, prosciutto, calabrese, bufarella, tomates, roquette.",
        image: "/images/tower-sandwich.jpg",
      },
      {
        name: "Brisket",
        price: "24,95 $",
        description:
          "Brisket (Les Cowboys du BBQ), moutarde maison, cornichons. Fromage provolone +1,00 $.",
        image: "/images/miche-porc.jpg",
      },
    ],
  },
  {
    slug: "desserts",
    label: "Desserts",
    tagline: "Pâtisseries en rotation chaque semaine — prix variable.",
    items: [
      {
        name: "Pâtisseries invitées",
        price: "",
        description:
          "Le Comptoir d'Alexandrine, Christophe, Pâtisserie Aveline — en rotation chaque semaine, prix variable.",
        image: null,
      },
      {
        name: "Croustade maison",
        price: "7,95 $",
        description: "Servie avec crème glacée.",
        image: null,
      },
      {
        name: "Pizza dessert maison",
        price: "9,95 $",
        description: "≈ 10 pouces.",
        image: null,
      },
    ],
  },
  {
    slug: "cafes-thes",
    label: "Cafés & thés",
    tagline: "",
    items: [
      {
        name: "Café décaféiné",
        price: "3,00 $",
        description: "",
        image: null,
      },
      {
        name: "Café filtre",
        price: "3,50 $",
        description: "Wiltor.",
        image: null,
      },
      {
        name: "Thé vert / thé chaï / thé noir",
        price: "3,50 $",
        description: "",
        image: null,
      },
      {
        name: "Tisane gingembre et citron / camomille",
        price: "3,50 $",
        description: "",
        image: null,
      },
    ],
  },
  {
    slug: "alcools",
    label: "Alcools",
    tagline: "Prix : 1 oz / avec café.",
    items: [
      {
        name: "Coureur des bois",
        price: "9,00 $ / 10,00 $",
        description: "Crème d'érable.",
        image: null,
      },
      {
        name: "Crémette espresso",
        price: "9,00 $ / 10,00 $",
        description: "",
        image: null,
      },
      {
        name: "Tioméo, rhum chocolat café",
        price: "10,00 $ / 11,00 $",
        description: "Rosemont.",
        image: null,
      },
    ],
  },
  {
    slug: "extras",
    label: "Extras",
    tagline: "Suppléments à ajouter à vos plats.",
    items: [
      { name: "Viandes", price: "+3,50 $", description: "", image: null },
      { name: "Légumes", price: "+1,75 $", description: "", image: null },
      {
        name: "Champignons shiitake",
        price: "+4,00 $",
        description: "Protéine végétale.",
        image: null,
      },
      { name: "Fromages", price: "+2,75 $", description: "", image: null },
      { name: "Bufarella", price: "+5,50 $", description: "", image: null },
    ],
  },
  {
    slug: "ardoise",
    label: "L'ardoise",
    tagline: "Les spéciaux du chef — au gré des arrivages du marché.",
    items: [
      {
        name: "Trempette de poireaux bacon",
        price: "16,95 $",
        description: "Servi avec pain plat gratiné.",
        image: "/images/naan-dip.jpg",
      },
      {
        name: "Grilled cheese sur baguette",
        price: "5,95 $ / 11,95 $",
        description: "Provolone, mozzarella, fromage jaune, beurre à l'ail.",
        image: "/images/dish-sandwich.png",
      },
      {
        name: "Focaccia",
        price: "19,95 $",
        description:
          "Focaccia maison, miel, huile épicée, huile d'olive (Esporao), mélange de fromages ricotta et chèvre, prosciutto, tomates, glaze balsamique, poivre moulu, basilic frais.",
        image: "/images/bread-tearing.png",
      },
      {
        name: "Bufarella ananananas",
        price: "17,95 $",
        description:
          "Boule de fromage bufarella (Fromagerie Fuoco) accompagnée d'une compote d'ananas, mayonnaise chili épicée maison, crumble d'amandes, de sucre et de coconut, zeste de lime. Servi avec pains naan grillés.",
        image: "/images/bufarella-mint.jpg",
      },
      {
        name: "Le « Choux-Choux »",
        price: "21,95 $",
        description:
          "Pain ciabatta, dinde fumée, salade de choux rouge crémeuse, gelée de betteraves jaunes, roquette.",
        image: "/images/tower-sandwich.jpg",
      },
      {
        name: "« Messieurs patates »",
        price: "9,95 $",
        description:
          "Bouchées de pommes de terre frits, parmesan, huile de truffe, beurre à l'ail confit maison, poivre moulu, sirop d'érable. Servi avec sauce marinara.",
        image: "/images/dish-tasting.png",
      },
      {
        name: "Pizza « Bimi »",
        price: "25,95 $",
        description:
          "Sauce au fromage (Île-aux-Grues, cheddar vieilli 2 ans), broccolini, jambon (Charcuterie Porc Épique), coulis de moutarde et miel, huile d'olive.",
        image: "/images/pizza-oven.jpg",
      },
      {
        name: "Assiette de charcuterie",
        price: "35,95 $",
        description:
          "Calabrese, prosciutto, saucissons secs, olives méli-mélo, fromages du moment, pickle d'onions rouges, petits cornichons. Servi avec pain et croutons.",
        image: "/images/dish-charcuterie.png",
      },
      {
        name: "« Philly T »",
        price: "25,95 $",
        description:
          "Pain baguette, fromages (jaune, mozzarella, provolone), poivrons rouges, onions blancs, brisket (Les Cowboys du BBQ), mayonnaise épicée. Servi avec salade de pâte maison et cup de sauce BBQ.",
        image: "/images/miche-porc.jpg",
      },
    ],
  },
];
