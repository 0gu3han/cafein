// js/menu-data.js
// Default menu data — manage via /admin.html

const MENU_STORAGE_KEY = 'cafein_menu_v1';

const DEFAULT_MENU = [
  {
    id: 'cof-1', category: 'coffee',
    name: 'Espresso',
    description: 'Rich, bold single shot',
    price: 3,
    ingredients: 'Espresso',
    caffeine: 63, calories: 5,
    badge: '', featured: false
  },
  {
    id: 'cof-2', category: 'coffee',
    name: 'Americano',
    description: 'Espresso + hot water',
    price: 4,
    ingredients: 'Espresso, filtered water',
    caffeine: 94, calories: 10,
    badge: '', featured: false
  },
  {
    id: 'cof-3', category: 'coffee',
    name: 'Latte',
    description: 'Espresso + steamed milk — hot or iced',
    price: 5,
    ingredients: 'Espresso, whole milk (or milk alternative)',
    caffeine: 128, calories: 190,
    badge: '', featured: false
  },
  {
    id: 'cof-4', category: 'coffee',
    name: 'Cappuccino',
    description: 'Espresso + velvety foam',
    price: 5,
    ingredients: 'Espresso, whole milk',
    caffeine: 128, calories: 120,
    badge: '', featured: false
  },
  {
    id: 'cof-5', category: 'coffee',
    name: 'Cold Brew',
    description: 'Slow-steeped, smooth & bold',
    price: 5,
    ingredients: 'Coarse ground coffee, cold filtered water',
    caffeine: 200, calories: 15,
    badge: '', featured: false
  },
  {
    id: 'cof-6', category: 'coffee',
    name: 'Macchiato',
    description: 'Espresso marked with silky milk',
    price: 5,
    ingredients: 'Espresso, whole milk',
    caffeine: 128, calories: 50,
    badge: '', featured: false
  },
  {
    id: 'cof-7', category: 'coffee',
    name: 'Mocha',
    description: 'Espresso + chocolate + steamed milk',
    price: 6,
    ingredients: 'Espresso, chocolate sauce, whole milk',
    caffeine: 95, calories: 290,
    badge: '', featured: false
  },
  {
    id: 'cof-8', category: 'coffee',
    name: 'Seasonal Latte',
    description: "Ask us what we're featuring!",
    price: 6,
    ingredients: 'Varies by season',
    caffeine: 128, calories: 200,
    badge: 'Seasonal', featured: true
  },
  {
    id: 'mat-1', category: 'matcha',
    name: 'Classic Matcha Latte',
    description: 'Ceremonial grade matcha + steamed milk — hot or iced',
    price: 6,
    ingredients: 'Ceremonial grade matcha, whole milk (or milk alternative)',
    caffeine: 70, calories: 200,
    badge: '', featured: false
  },
  {
    id: 'mat-2', category: 'matcha',
    name: 'Matcha Espresso Fusion',
    description: 'Matcha meets espresso for the ultimate boost',
    price: 7,
    ingredients: 'Ceremonial grade matcha, espresso, whole milk',
    caffeine: 133, calories: 180,
    badge: '', featured: false
  },
  {
    id: 'mat-3', category: 'matcha',
    name: 'Iced Matcha Lemonade',
    description: 'Bright, earthy & refreshing',
    price: 6,
    ingredients: 'Ceremonial grade matcha, lemonade, ice',
    caffeine: 70, calories: 120,
    badge: '', featured: false
  },
  {
    id: 'mat-4', category: 'matcha',
    name: 'Dirty Matcha',
    description: 'Iced matcha latte with an espresso shot',
    price: 7,
    ingredients: 'Ceremonial grade matcha, espresso, whole milk, ice',
    caffeine: 133, calories: 220,
    badge: 'Fan Fave', featured: true
  },
  {
    id: 'add-1', category: 'addons',
    name: 'Oat Milk',
    description: 'Creamy dairy-free swap',
    price: 1,
    ingredients: 'Oat milk',
    caffeine: 0, calories: 60,
    badge: '', featured: false
  },
  {
    id: 'add-2', category: 'addons',
    name: 'Almond Milk',
    description: 'Nutty dairy-free swap',
    price: 1,
    ingredients: 'Almond milk',
    caffeine: 0, calories: 30,
    badge: '', featured: false
  },
  {
    id: 'add-3', category: 'addons',
    name: 'Vanilla Syrup',
    description: 'House-made simple syrup',
    price: 0.75,
    ingredients: 'Cane sugar, water, vanilla extract',
    caffeine: 0, calories: 45,
    badge: '', featured: false
  },
  {
    id: 'add-4', category: 'addons',
    name: 'Lavender Syrup',
    description: 'Floral & light',
    price: 0.75,
    ingredients: 'Cane sugar, water, culinary lavender',
    caffeine: 0, calories: 40,
    badge: '', featured: false
  },
  {
    id: 'add-5', category: 'addons',
    name: 'Caramel Syrup',
    description: 'Rich & sweet',
    price: 0.75,
    ingredients: 'Cane sugar, water, caramel flavor',
    caffeine: 0, calories: 55,
    badge: '', featured: false
  },
  {
    id: 'add-6', category: 'addons',
    name: 'Extra Shot',
    description: 'Double the espresso',
    price: 1,
    ingredients: 'Espresso',
    caffeine: 63, calories: 5,
    badge: '', featured: false
  }
];

function getMenuData() {
  try {
    const raw = localStorage.getItem(MENU_STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_MENU;
  } catch {
    return DEFAULT_MENU;
  }
}

function saveMenuData(items) {
  localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(items));
}

function resetMenuData() {
  localStorage.removeItem(MENU_STORAGE_KEY);
}
