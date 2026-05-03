const mongoose = require('mongoose');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Review = require('../models/Review');

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const standardHours = DAYS.map((day) => ({
  day,
  open: day === 'Sunday' ? '12:00' : '11:00',
  close: ['Friday', 'Saturday'].includes(day) ? '00:00' : '23:00',
  closed: false
}));

const restaurantsBlueprint = [
  {
    name: 'Maison Lumière',
    cuisine: 'French',
    description: 'A Michelin-starred temple of contemporary French cuisine, where every plate is a study in restraint and luxury.',
    location: '5th Avenue, Midtown',
    address: '1421 5th Avenue',
    city: 'New York',
    priceRange: '$$$$',
    averageRating: 4.9,
    featured: true,
    tags: ['fine-dining', 'romantic', 'wine-pairing', 'tasting-menu'],
    capacity: 60,
    depositRequired: true,
    depositAmount: 75,
    heroImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80',
      'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=1200&q=80'
    ],
    menu: [
      { title: 'Hors-d\'œuvre', items: [
        { name: 'Caviar & Blini', description: 'Imperial Osetra, crème fraîche, chive.', price: 95, tags: ['signature'], image: 'https://images.unsplash.com/photo-1432139509613-5c4255815697?w=600&q=80' },
        { name: 'Foie Gras Torchon', description: 'Sauternes gelée, brioche.', price: 38, tags: ['classic'], image: 'https://images.unsplash.com/photo-1580554530778-ca36943938b2?w=600&q=80' }
      ]},
      { title: 'Plats Principaux', items: [
        { name: 'Dover Sole Meunière', description: 'Brown butter, capers, parsley, lemon.', price: 78, tags: ['signature', 'seafood'], image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80' },
        { name: 'Wagyu Tournedos Rossini', description: 'A5 Wagyu, foie gras, truffle, Madeira jus.', price: 145, tags: ['signature', 'beef'], image: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=600&q=80' },
        { name: 'Canard à l\'Orange', description: 'Roast duck, bigarade sauce, gratin dauphinois.', price: 64, tags: ['classic'], image: 'https://images.unsplash.com/photo-1432139509613-5c4255815697?w=600&q=80' }
      ]},
      { title: 'Desserts', items: [
        { name: 'Soufflé Grand Marnier', description: 'Made to order. Allow 25 minutes.', price: 22, tags: ['signature'], image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80' },
        { name: 'Tarte au Citron', description: 'Italian meringue, candied lemon.', price: 18, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80' }
      ]}
    ]
  },
  {
    name: 'Azure Seafood Atelier',
    cuisine: 'Seafood',
    description: 'Daily catch from the Atlantic prepared with Mediterranean simplicity. Floor-to-ceiling views of the harbor.',
    location: 'Hudson Yards',
    address: '20 Hudson Yards',
    city: 'New York',
    priceRange: '$$$',
    averageRating: 4.8,
    featured: true,
    tags: ['seafood', 'oysters', 'view', 'romantic'],
    capacity: 80,
    depositRequired: true,
    depositAmount: 50,
    heroImage: 'https://images.unsplash.com/photo-1535007813616-79dc02ba4021?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1535007813616-79dc02ba4021?w=1200&q=80',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80',
      'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=1200&q=80'
    ],
    menu: [
      { title: 'Raw Bar', items: [
        { name: 'Oyster Plateau (12)', description: 'East coast and west coast selection, mignonette.', price: 64, tags: ['signature'], image: 'https://images.unsplash.com/photo-1516684669134-de6f7c473a2a?w=600&q=80' },
        { name: 'Tuna Crudo', description: 'Yuzu, white soy, Marcona almond.', price: 28, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80' }
      ]},
      { title: 'From the Sea', items: [
        { name: 'Whole Branzino', description: 'Salt-baked, fennel pollen, lemon oil.', price: 58, tags: ['signature'], image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80' },
        { name: 'Lobster Spaghetti', description: 'Maine lobster, datterini, basil.', price: 72, tags: ['pasta'], image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&q=80' }
      ]},
      { title: 'Sweet', items: [
        { name: 'Olive Oil Cake', description: 'Sicilian lemon, mascarpone.', price: 14, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80' }
      ]}
    ]
  },
  {
    name: 'Sakura Omakase',
    cuisine: 'Japanese',
    description: 'Twelve-seat counter showcasing Edomae sushi by Chef Hiroshi. Reservations released 30 days in advance.',
    location: 'TriBeCa',
    address: '88 Franklin Street',
    city: 'New York',
    priceRange: '$$$$',
    averageRating: 4.95,
    featured: true,
    tags: ['omakase', 'sushi', 'chef-counter', 'tasting-menu'],
    capacity: 12,
    depositRequired: true,
    depositAmount: 150,
    heroImage: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1200&q=80',
      'https://images.unsplash.com/photo-1553621042-f6e147245754?w=1200&q=80',
      'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=1200&q=80'
    ],
    menu: [
      { title: 'Omakase', items: [
        { name: 'Hiroshi Omakase (18 courses)', description: 'A guided tasting through the season. Pairings available.', price: 295, tags: ['signature'], image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=600&q=80' }
      ]},
      { title: 'Premium A La Carte', items: [
        { name: 'O-Toro Nigiri (2pc)', description: 'Bluefin belly, Kyoto soy.', price: 38, image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&q=80' },
        { name: 'Uni & Caviar Hand Roll', description: 'Hokkaido uni, Osetra caviar, nori.', price: 45, tags: ['signature'], image: 'https://images.unsplash.com/photo-1606731321180-b6f4a09c45a4?w=600&q=80' }
      ]}
    ]
  },
  {
    name: 'Trattoria del Borgo',
    cuisine: 'Italian',
    description: 'Hand-rolled pasta and wood-fired pizzas in a restored 1920s townhouse. House wine straight from the cask.',
    location: 'West Village',
    address: '210 Bleecker Street',
    city: 'New York',
    priceRange: '$$',
    averageRating: 4.6,
    featured: false,
    tags: ['pasta', 'pizza', 'wine-bar', 'family-friendly'],
    capacity: 70,
    heroImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=80',
      'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=1200&q=80'
    ],
    menu: [
      { title: 'Antipasti', items: [
        { name: 'Burrata Pugliese', description: '24-hour burrata, heirloom tomato, basil oil.', price: 22, image: 'https://images.unsplash.com/photo-1610614491077-9c12fc6cb3e5?w=600&q=80' },
        { name: 'Carpaccio di Manzo', description: 'Aged beef, arugula, parmigiano.', price: 24 }
      ]},
      { title: 'Pasta', items: [
        { name: 'Tagliatelle al Tartufo', description: 'Hand-cut pasta, black truffle, butter, parmigiano.', price: 38, tags: ['signature'], image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&q=80' },
        { name: 'Cacio e Pepe', description: 'Tonnarelli, pecorino romano, black pepper.', price: 24, image: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=600&q=80' }
      ]},
      { title: 'Pizze', items: [
        { name: 'Margherita D.O.P.', description: 'San Marzano, fior di latte, basil.', price: 19, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80' }
      ]}
    ]
  },
  {
    name: 'The Velvet Steakhouse',
    cuisine: 'Steakhouse',
    description: 'Dry-aged American beef, an extraordinary cellar, and a 100-year-old mahogany bar.',
    location: 'Upper East Side',
    address: '76 Madison Avenue',
    city: 'New York',
    priceRange: '$$$$',
    averageRating: 4.7,
    featured: true,
    tags: ['steakhouse', 'cellar', 'business-dining'],
    capacity: 100,
    depositRequired: true,
    depositAmount: 50,
    heroImage: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=1200&q=80',
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80'
    ],
    menu: [
      { title: 'Steaks', items: [
        { name: 'Bone-In Ribeye 22oz', description: '60-day dry-aged USDA Prime.', price: 98, tags: ['signature', 'beef'], image: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=600&q=80' },
        { name: 'Filet Mignon 8oz', description: 'Center cut, butter-basted.', price: 72, image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=600&q=80' }
      ]},
      { title: 'Sides', items: [
        { name: 'Lobster Mac & Cheese', description: 'Maine lobster, gruyère.', price: 28 },
        { name: 'Truffle Fries', description: 'Hand-cut, parmigiano, truffle oil.', price: 16 }
      ]}
    ]
  },
  {
    name: 'Casa de Mole',
    cuisine: 'Mexican',
    description: 'Modern Oaxacan cooking, mezcal flights, and a courtyard mural by Diego Lima.',
    location: 'Williamsburg',
    address: '143 N 7th Street, Brooklyn',
    city: 'New York',
    priceRange: '$$',
    averageRating: 4.4,
    featured: false,
    tags: ['mezcal', 'oaxacan', 'courtyard', 'group-friendly'],
    capacity: 90,
    heroImage: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1200&q=80',
      'https://images.unsplash.com/photo-1552332386-f8dd00bc2f85?w=1200&q=80'
    ],
    menu: [
      { title: 'Para Empezar', items: [
        { name: 'Guacamole de la Casa', description: 'Tableside, smoked chiles, fresh masa.', price: 18, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80' },
        { name: 'Tuna Tostada', description: 'Avocado, chipotle aioli, micro-cilantro.', price: 16 }
      ]},
      { title: 'Tacos', items: [
        { name: 'Cochinita Pibil', description: '24-hour roasted pork, pickled onion.', price: 22, tags: ['signature'], image: 'https://images.unsplash.com/photo-1552332386-f8dd00bc2f85?w=600&q=80' },
        { name: 'Wagyu Carne Asada', description: 'A5 wagyu, smoked salsa.', price: 32 }
      ]},
      { title: 'Mezcal', items: [
        { name: 'Tasting Flight', description: 'Three artisanal mezcals, sal de gusano.', price: 38 }
      ]}
    ]
  },
  {
    name: 'The Indus Crown',
    cuisine: 'Indian',
    description: 'Refined Mughal-era cuisine cooked over charcoal tandoor. Saffron, gold leaf, and live tabla.',
    location: 'Murray Hill',
    address: '345 Park Avenue South',
    city: 'New York',
    priceRange: '$$$',
    averageRating: 4.6,
    featured: true,
    tags: ['tandoor', 'biryani', 'live-music', 'mughlai'],
    capacity: 75,
    heroImage: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&q=80',
      'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=1200&q=80'
    ],
    menu: [
      { title: 'From the Tandoor', items: [
        { name: 'Murgh Malai Tikka', description: 'Cream-marinated chicken, cardamom.', price: 26, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80' },
        { name: 'Lamb Seekh Kebab', description: 'House masala, mint chutney.', price: 28 }
      ]},
      { title: 'Curries', items: [
        { name: 'Butter Chicken', description: '24-hour tomato gravy, fenugreek butter.', price: 28, tags: ['signature'], image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80' },
        { name: 'Lamb Rogan Josh', description: 'Kashmiri chiles, slow-braised lamb.', price: 32 }
      ]},
      { title: 'Biryani', items: [
        { name: 'Hyderabadi Lamb Biryani', description: 'Sealed clay pot, saffron, raita.', price: 36, tags: ['signature'] }
      ]}
    ]
  },
  {
    name: 'Sky Garden Vegan',
    cuisine: 'Vegan',
    description: 'Plant-based fine dining on a rooftop garden. Most ingredients grown in our greenhouse.',
    location: 'NoMad',
    address: '1170 Broadway',
    city: 'New York',
    priceRange: '$$$',
    averageRating: 4.5,
    featured: false,
    tags: ['vegan', 'farm-to-table', 'rooftop', 'gluten-free-options'],
    capacity: 50,
    heroImage: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&q=80',
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=80'
    ],
    menu: [
      { title: 'Garden', items: [
        { name: 'Heirloom Tomato Composition', description: 'Eight varieties, basil oil, sea salt.', price: 22, image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80' },
        { name: 'Grilled Hen-of-the-Woods', description: 'Smoked maitake, garlic confit.', price: 24 }
      ]},
      { title: 'Mains', items: [
        { name: 'Beetroot Wellington', description: 'Roasted beet, mushroom duxelle, puff pastry.', price: 38, tags: ['signature'] }
      ]}
    ]
  },
  {
    name: 'Le Bistro Quinze',
    cuisine: 'French',
    description: 'A neighborhood bistro with a wine list that punches above its weight. Tin ceilings, zinc bar, jazz on Tuesdays.',
    location: 'East Village',
    address: '15 Avenue B',
    city: 'New York',
    priceRange: '$$',
    averageRating: 4.4,
    featured: false,
    tags: ['bistro', 'wine-list', 'jazz', 'late-night'],
    capacity: 55,
    heroImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80'
    ],
    menu: [
      { title: 'Bistro Classics', items: [
        { name: 'Steak Frites', description: 'Hanger steak, herb butter, hand-cut frites.', price: 32, tags: ['signature'] },
        { name: 'Coq au Vin', description: 'Braised chicken, lardons, mushrooms, red wine.', price: 30 }
      ]}
    ]
  },
  {
    name: 'Dragon Pearl',
    cuisine: 'Chinese',
    description: 'Modern Cantonese cuisine. Live seafood tanks, hand-pulled noodles, dim sum until 4pm.',
    location: 'Chinatown',
    address: '88 Mott Street',
    city: 'New York',
    priceRange: '$$',
    averageRating: 4.5,
    featured: false,
    tags: ['dim-sum', 'cantonese', 'group-dining', 'late-lunch'],
    capacity: 120,
    heroImage: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1200&q=80',
      'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=1200&q=80'
    ],
    menu: [
      { title: 'Dim Sum', items: [
        { name: 'Har Gow (4pc)', description: 'Crystal shrimp dumplings.', price: 14, image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&q=80' },
        { name: 'Char Siu Bao (3pc)', description: 'Pillowy buns, honey-glazed pork.', price: 12 }
      ]},
      { title: 'Specialities', items: [
        { name: 'Peking Duck (whole)', description: 'Carved tableside. 24-hour notice preferred.', price: 95, tags: ['signature'] }
      ]}
    ]
  },
  {
    name: 'Brunch Atelier',
    cuisine: 'American',
    description: 'All-day brunch and natural wines in a sun-drenched conservatory. Bottomless mimosas on weekends.',
    location: 'SoHo',
    address: '450 West Broadway',
    city: 'New York',
    priceRange: '$$',
    averageRating: 4.3,
    featured: false,
    tags: ['brunch', 'natural-wine', 'all-day', 'weekend'],
    capacity: 60,
    heroImage: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=1200&q=80',
      'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=1200&q=80'
    ],
    menu: [
      { title: 'Eggs', items: [
        { name: 'Truffle Eggs Benedict', description: 'Black truffle hollandaise, smoked ham.', price: 24, tags: ['signature'] },
        { name: 'Avocado Toast', description: 'Sourdough, poached egg, chili crisp.', price: 18 }
      ]}
    ]
  },
  {
    name: 'Amber & Smoke',
    cuisine: 'Lebanese',
    description: 'Charcoal-fired Levantine kitchen. Twenty mezze, an open-fire oven, and a candlelit terrace.',
    location: 'Astoria',
    address: '32 Steinway Street, Queens',
    city: 'New York',
    priceRange: '$$',
    averageRating: 4.5,
    featured: false,
    tags: ['mezze', 'mediterranean', 'group-dining', 'terrace'],
    capacity: 65,
    heroImage: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=1200&q=80'
    ],
    menu: [
      { title: 'Mezze', items: [
        { name: 'Hummus Beiruti', description: 'Tahini, garlic, parsley, olive oil.', price: 14, image: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=600&q=80' },
        { name: 'Muhammara', description: 'Roasted red pepper, walnut, pomegranate.', price: 14 }
      ]},
      { title: 'From the Coals', items: [
        { name: 'Lamb Kofta Mishwi', description: 'Hand-minced, charcoal-grilled.', price: 28, tags: ['signature'] }
      ]}
    ]
  }
];

const sampleReviews = [
  { rating: 5, comment: 'A flawless evening from the first bite to the last. The wine pairings were inspired.', tags: ['food', 'service'] },
  { rating: 5, comment: 'Service was attentive without being intrusive — exactly the standard you hope for.', tags: ['service', 'ambience'] },
  { rating: 4, comment: 'Beautiful room and confident cooking. The mains shone; desserts were merely good.', tags: ['food', 'ambience'] },
  { rating: 5, comment: 'Booked for an anniversary. They remembered the occasion and made it unforgettable.', tags: ['service'] },
  { rating: 4, comment: 'Excellent value at this level. Will return.', tags: ['value'] },
  { rating: 5, comment: 'Among the best meals I\'ve had this year. The signature dish lives up to the hype.', tags: ['food'] }
];

exports.autoSeed = async (force = false) => {
  try {
    if (mongoose.connection.readyState !== 1) return;

    const restaurantCount = await Restaurant.countDocuments();
    const reviewCount = await Review.countDocuments();
    const sample = await Restaurant.findOne({});
    const needsReseed = !sample || !sample.menu || sample.menu.length === 0 || restaurantCount < 12 || reviewCount === 0;
    if (!needsReseed && !force) return;

    await Promise.all([
      Restaurant.deleteMany({}),
      Review.deleteMany({})
    ]);

    console.log('🌱 Seeding Maison...');

    let admin = await User.findOne({ email: 'admin@luxury.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Maison Admin',
        email: 'admin@luxury.com',
        password: 'admin1234',
        role: 'admin'
      });
    }

    let demoUser = await User.findOne({ email: 'guest@maison.com' });
    if (!demoUser) {
      demoUser = await User.create({
        name: 'Olivia Carter',
        email: 'guest@maison.com',
        password: 'guest1234',
        role: 'user',
        phone: '+1 (212) 555-0188',
        dietaryPreferences: ['Pescatarian'],
        favoriteCuisines: ['French', 'Japanese', 'Italian']
      });
      console.log('👤 Demo user: guest@maison.com / guest1234');
    }

    let secondUser = await User.findOne({ email: 'james@maison.com' });
    if (!secondUser) {
      secondUser = await User.create({
        name: 'James Whitman',
        email: 'james@maison.com',
        password: 'guest1234',
        role: 'user'
      });
    }

    const blueprint = restaurantsBlueprint.map((r) => ({
      ...r, admin: admin._id, hours: standardHours, numReviews: 0, averageRating: r.averageRating || 0
    }));
    const inserted = await Restaurant.insertMany(blueprint);

    for (const r of inserted) {
      const reviewers = [demoUser, secondUser];
      const picks = sampleReviews
        .sort(() => 0.5 - Math.random())
        .slice(0, 2 + Math.floor(Math.random() * 2));
      let totalRating = 0;
      for (let i = 0; i < picks.length; i++) {
        const reviewer = reviewers[i % reviewers.length];
        const exists = await Review.findOne({ user: reviewer._id, restaurant: r._id });
        if (exists) continue;
        await Review.create({
          user: reviewer._id,
          restaurant: r._id,
          rating: picks[i].rating,
          comment: picks[i].comment,
          tags: picks[i].tags
        });
        totalRating += picks[i].rating;
      }
      const created = await Review.find({ restaurant: r._id });
      r.numReviews = created.length;
      r.averageRating = created.length ? created.reduce((s, x) => s + x.rating, 0) / created.length : 0;
      await r.save();
    }

    console.log(`✅ Seeded ${inserted.length} restaurants with menus & reviews`);
  } catch (error) {
    console.error('❌ Seed Failed:', error.message);
  }
};
