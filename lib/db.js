import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

// ── Default menu (seeds the DB on first run) ──────────────────────────────
const DEFAULT_MENU = [
  { category:'coffee',  name:'Espresso',              description:'Rich, bold single shot',                                    price:3,    ingredients:'Espresso',                                              caffeine:63,  calories:5,   badge:'',         featured:false, sort_order:1 },
  { category:'coffee',  name:'Americano',              description:'Espresso + hot water',                                       price:4,    ingredients:'Espresso, filtered water',                              caffeine:94,  calories:10,  badge:'',         featured:false, sort_order:2 },
  { category:'coffee',  name:'Latte',                  description:'Espresso + steamed milk — hot or iced',                     price:5,    ingredients:'Espresso, whole milk (or milk alternative)',             caffeine:128, calories:190, badge:'',         featured:false, sort_order:3 },
  { category:'coffee',  name:'Cappuccino',             description:'Espresso + velvety foam',                                   price:5,    ingredients:'Espresso, whole milk',                                  caffeine:128, calories:120, badge:'',         featured:false, sort_order:4 },
  { category:'coffee',  name:'Cold Brew',              description:'Slow-steeped, smooth & bold',                               price:5,    ingredients:'Coarse ground coffee, cold filtered water',              caffeine:200, calories:15,  badge:'',         featured:false, sort_order:5 },
  { category:'coffee',  name:'Macchiato',              description:'Espresso marked with silky milk',                          price:5,    ingredients:'Espresso, whole milk',                                  caffeine:128, calories:50,  badge:'',         featured:false, sort_order:6 },
  { category:'coffee',  name:'Mocha',                  description:'Espresso + chocolate + steamed milk',                      price:6,    ingredients:'Espresso, chocolate sauce, whole milk',                 caffeine:95,  calories:290, badge:'',         featured:false, sort_order:7 },
  { category:'coffee',  name:'Seasonal Latte',         description:"Ask us what we're featuring!",                              price:6,    ingredients:'Varies by season',                                      caffeine:128, calories:200, badge:'Seasonal', featured:true,  sort_order:8 },
  { category:'matcha',  name:'Classic Matcha Latte',   description:'Ceremonial grade matcha + steamed milk — hot or iced',    price:6,    ingredients:'Ceremonial grade matcha, whole milk (or milk alt)',     caffeine:70,  calories:200, badge:'',         featured:false, sort_order:1 },
  { category:'matcha',  name:'Matcha Espresso Fusion', description:'Matcha meets espresso for the ultimate boost',             price:7,    ingredients:'Ceremonial grade matcha, espresso, whole milk',         caffeine:133, calories:180, badge:'',         featured:false, sort_order:2 },
  { category:'matcha',  name:'Iced Matcha Lemonade',   description:'Bright, earthy & refreshing',                              price:6,    ingredients:'Ceremonial grade matcha, lemonade, ice',               caffeine:70,  calories:120, badge:'',         featured:false, sort_order:3 },
  { category:'matcha',  name:'Dirty Matcha',            description:'Iced matcha latte with an espresso shot',                 price:7,    ingredients:'Ceremonial grade matcha, espresso, whole milk, ice',   caffeine:133, calories:220, badge:'Fan Fave', featured:true,  sort_order:4 },
  { category:'addons',  name:'Oat Milk',                description:'Creamy dairy-free swap',                                   price:1,    ingredients:'Oat milk',                                              caffeine:0,   calories:60,  badge:'',         featured:false, sort_order:1 },
  { category:'addons',  name:'Almond Milk',             description:'Nutty dairy-free swap',                                    price:1,    ingredients:'Almond milk',                                           caffeine:0,   calories:30,  badge:'',         featured:false, sort_order:2 },
  { category:'addons',  name:'Vanilla Syrup',           description:'House-made simple syrup',                                  price:0.75, ingredients:'Cane sugar, water, vanilla extract',                   caffeine:0,   calories:45,  badge:'',         featured:false, sort_order:3 },
  { category:'addons',  name:'Lavender Syrup',          description:'Floral & light',                                           price:0.75, ingredients:'Cane sugar, water, culinary lavender',                 caffeine:0,   calories:40,  badge:'',         featured:false, sort_order:4 },
  { category:'addons',  name:'Caramel Syrup',           description:'Rich & sweet',                                             price:0.75, ingredients:'Cane sugar, water, caramel flavor',                    caffeine:0,   calories:55,  badge:'',         featured:false, sort_order:5 },
  { category:'addons',  name:'Extra Shot',              description:'Double the espresso',                                      price:1,    ingredients:'Espresso',                                              caffeine:63,  calories:5,   badge:'',         featured:false, sort_order:6 },
];

// ── Schema + seed ─────────────────────────────────────────────────────────
export async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS menu_items (
      id          SERIAL       PRIMARY KEY,
      category    VARCHAR(20)  NOT NULL,
      name        VARCHAR(100) NOT NULL,
      description TEXT         DEFAULT '',
      price       NUMERIC(6,2) NOT NULL,
      ingredients TEXT         DEFAULT '',
      caffeine    INTEGER      DEFAULT 0,
      calories    INTEGER      DEFAULT 0,
      badge       VARCHAR(50)  DEFAULT '',
      featured    BOOLEAN      DEFAULT false,
      sort_order  INTEGER      DEFAULT 0,
      created_at  TIMESTAMPTZ  DEFAULT NOW()
    )`;

  await sql`
    CREATE TABLE IF NOT EXISTS bookings (
      id          SERIAL       PRIMARY KEY,
      name        VARCHAR(100) NOT NULL,
      email       VARCHAR(200) NOT NULL,
      phone       VARCHAR(30)  DEFAULT '',
      event_type  VARCHAR(50)  NOT NULL,
      event_date  DATE         NOT NULL,
      guests      INTEGER,
      location    TEXT         DEFAULT '',
      message     TEXT         DEFAULT '',
      status      VARCHAR(20)  DEFAULT 'pending',
      created_at  TIMESTAMPTZ  DEFAULT NOW()
    )`;

  // Add image_url column if it doesn't exist yet (safe to run on existing tables)
  await sql`ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT ''`;

  // Seed default menu on first run
  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM menu_items`;
  if (count === 0) {
    for (const item of DEFAULT_MENU) {
      await sql`
        INSERT INTO menu_items
          (category, name, description, price, ingredients, caffeine, calories, badge, featured, sort_order)
        VALUES
          (${item.category}, ${item.name}, ${item.description}, ${item.price},
           ${item.ingredients}, ${item.caffeine}, ${item.calories}, ${item.badge},
           ${item.featured}, ${item.sort_order})`;
    }
  }
}

// ── Menu CRUD ─────────────────────────────────────────────────────────────
export function getMenuItems() {
  return sql`SELECT * FROM menu_items ORDER BY category, sort_order, id`;
}

export async function createMenuItem(item) {
  const { category, name, description='', price, ingredients='', caffeine=0, calories=0, badge='', featured=false, image_url='' } = item;
  const [row] = await sql`
    INSERT INTO menu_items (category, name, description, price, ingredients, caffeine, calories, badge, featured, image_url)
    VALUES (${category}, ${name}, ${description}, ${price}, ${ingredients}, ${caffeine}, ${calories}, ${badge}, ${featured}, ${image_url})
    RETURNING *`;
  return row;
}

export async function updateMenuItem(id, item) {
  const { category, name, description='', price, ingredients='', caffeine=0, calories=0, badge='', featured=false, image_url='' } = item;
  const [row] = await sql`
    UPDATE menu_items SET
      category=${category}, name=${name}, description=${description}, price=${price},
      ingredients=${ingredients}, caffeine=${caffeine}, calories=${calories},
      badge=${badge}, featured=${featured}, image_url=${image_url}
    WHERE id=${id} RETURNING *`;
  return row;
}

export async function deleteMenuItem(id) {
  await sql`DELETE FROM menu_items WHERE id=${id}`;
}

// ── Bookings CRUD ─────────────────────────────────────────────────────────
export function getBookings() {
  return sql`SELECT * FROM bookings ORDER BY created_at DESC`;
}

export async function createBooking(b) {
  const [row] = await sql`
    INSERT INTO bookings (name, email, phone, event_type, event_date, guests, location, message)
    VALUES (${b.name}, ${b.email}, ${b.phone||''}, ${b.event_type}, ${b.event_date},
            ${b.guests||null}, ${b.location||''}, ${b.message||''})
    RETURNING *`;
  return row;
}

export async function updateBookingStatus(id, status) {
  const [row] = await sql`
    UPDATE bookings SET status=${status} WHERE id=${id} RETURNING *`;
  return row;
}
