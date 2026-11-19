import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

// ── Default menu (seeds the DB on first run) ──────────────────────────────
const DEFAULT_MENU = [
  { category:'coffee',  name:'Latte',            description:'Espresso + steamed milk — hot or iced',              price:0, ingredients:'Espresso, whole milk (or milk alternative)',        caffeine:128, calories:190, badge:'',         featured:false, sort_order:1 },
  { category:'coffee',  name:'Seasonal Latte',   description:"Ask us what we're featuring!",                       price:0, ingredients:'Varies by season',                                  caffeine:128, calories:200, badge:'Seasonal', featured:true,  sort_order:2 },
  { category:'coffee',  name:'Cold Brew',        description:'Slow-steeped, smooth & bold',                        price:0, ingredients:'Coarse ground coffee, cold filtered water',          caffeine:200, calories:15,  badge:'',         featured:false, sort_order:3 },
  { category:'matcha',  name:'Classic Matcha',   description:'Ceremonial grade matcha + milk — hot or iced',       price:0, ingredients:'Ceremonial grade matcha, whole milk (or milk alt)', caffeine:70,  calories:200, badge:'',         featured:false, sort_order:1 },
  { category:'matcha',  name:'Seasonal Matcha',  description:"Ask us what we're featuring!",                       price:0, ingredients:'Varies by season',                                  caffeine:70,  calories:210, badge:'Seasonal', featured:true,  sort_order:2 },
  ...['Vanilla','Caramel','Cardamom','Brown Sugar','Cookie Butter','Banana','Earl Grey','Strawberry','Blueberry','White Chocolate','Coconut']
    .map((name, i) => ({ category:'flavors', name, description:'', price:0, ingredients:'', caffeine:0, calories:0, badge:'', featured:false, sort_order:i + 1 })),
];

// Names from the original seed menu — replaced by the v2 menu migration below
const V1_MENU_NAMES = [
  'Espresso','Americano','Latte','Cappuccino','Cold Brew','Macchiato','Mocha','Seasonal Latte',
  'Classic Matcha Latte','Matcha Espresso Fusion','Iced Matcha Lemonade','Dirty Matcha',
  'Oat Milk','Almond Milk','Vanilla Syrup','Lavender Syrup','Caramel Syrup','Extra Shot',
];
const MENU_VERSION = 2;

async function insertMenuItem(item) {
  await sql`
    INSERT INTO menu_items
      (category, name, description, price, ingredients, caffeine, calories, badge, featured, sort_order)
    VALUES
      (${item.category}, ${item.name}, ${item.description}, ${item.price},
       ${item.ingredients}, ${item.caffeine}, ${item.calories}, ${item.badge},
       ${item.featured}, ${item.sort_order})`;
}

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

  // Booking drink + flavor choices
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS drinks  TEXT DEFAULT ''`;
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS flavors TEXT DEFAULT ''`;

  await sql`
    CREATE TABLE IF NOT EXISTS app_meta (
      key   VARCHAR(50) PRIMARY KEY,
      value TEXT        NOT NULL
    )`;
  const [meta] = await sql`SELECT value FROM app_meta WHERE key = 'menu_version'`;
  const version = meta ? Number(meta.value) : 0;

  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM menu_items`;
  if (count === 0 || version < MENU_VERSION) {
    // One-time swap to the current default menu. Items added by hand in the admin are kept.
    if (count > 0) await sql`DELETE FROM menu_items WHERE name = ANY(${V1_MENU_NAMES}) OR category = 'addons'`;
    for (const item of DEFAULT_MENU) await insertMenuItem(item);
    await sql`
      INSERT INTO app_meta (key, value) VALUES ('menu_version', ${String(MENU_VERSION)})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`;
  }
}

// ── Menu CRUD ─────────────────────────────────────────────────────────────
export function getMenuItems() {
  return sql`SELECT * FROM menu_items ORDER BY category, sort_order, id`;
}

export async function createMenuItem(item) {
  const { category, name, description='', price=0, ingredients='', caffeine=0, calories=0, badge='', featured=false, image_url='' } = item;
  const [row] = await sql`
    INSERT INTO menu_items (category, name, description, price, ingredients, caffeine, calories, badge, featured, image_url)
    VALUES (${category}, ${name}, ${description}, ${price}, ${ingredients}, ${caffeine}, ${calories}, ${badge}, ${featured}, ${image_url})
    RETURNING *`;
  return row;
}

export async function updateMenuItem(id, item) {
  const { category, name, description='', price=0, ingredients='', caffeine=0, calories=0, badge='', featured=false, image_url='' } = item;
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
    INSERT INTO bookings (name, email, phone, event_type, event_date, guests, location, drinks, flavors, message)
    VALUES (${b.name}, ${b.email}, ${b.phone||''}, ${b.event_type}, ${b.event_date},
            ${b.guests||null}, ${b.location||''}, ${b.drinks||''}, ${b.flavors||''}, ${b.message||''})
    RETURNING *`;
  return row;
}

export async function updateBookingStatus(id, status) {
  const [row] = await sql`
    UPDATE bookings SET status=${status} WHERE id=${id} RETURNING *`;
  return row;
}
