import { neon } from '@neondatabase/serverless';

// Connect on first query so builds don't need DATABASE_URL
let client;
const db  = () => (client ??= neon(process.env.DATABASE_URL));
const sql = (...args) => db()(...args);

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

// The original seed menu — the v2 migration removes only rows still matching it exactly
const V1_MENU = [
  { category:'coffee',  name:'Espresso',              description:'Rich, bold single shot',                                    price:3,    ingredients:'Espresso',                                              caffeine:63,  calories:5,   badge:'',         featured:false },
  { category:'coffee',  name:'Americano',              description:'Espresso + hot water',                                       price:4,    ingredients:'Espresso, filtered water',                              caffeine:94,  calories:10,  badge:'',         featured:false },
  { category:'coffee',  name:'Latte',                  description:'Espresso + steamed milk — hot or iced',                     price:5,    ingredients:'Espresso, whole milk (or milk alternative)',             caffeine:128, calories:190, badge:'',         featured:false },
  { category:'coffee',  name:'Cappuccino',             description:'Espresso + velvety foam',                                   price:5,    ingredients:'Espresso, whole milk',                                  caffeine:128, calories:120, badge:'',         featured:false },
  { category:'coffee',  name:'Cold Brew',              description:'Slow-steeped, smooth & bold',                               price:5,    ingredients:'Coarse ground coffee, cold filtered water',              caffeine:200, calories:15,  badge:'',         featured:false },
  { category:'coffee',  name:'Macchiato',              description:'Espresso marked with silky milk',                          price:5,    ingredients:'Espresso, whole milk',                                  caffeine:128, calories:50,  badge:'',         featured:false },
  { category:'coffee',  name:'Mocha',                  description:'Espresso + chocolate + steamed milk',                      price:6,    ingredients:'Espresso, chocolate sauce, whole milk',                 caffeine:95,  calories:290, badge:'',         featured:false },
  { category:'coffee',  name:'Seasonal Latte',         description:"Ask us what we're featuring!",                              price:6,    ingredients:'Varies by season',                                      caffeine:128, calories:200, badge:'Seasonal', featured:true  },
  { category:'matcha',  name:'Classic Matcha Latte',   description:'Ceremonial grade matcha + steamed milk — hot or iced',    price:6,    ingredients:'Ceremonial grade matcha, whole milk (or milk alt)',     caffeine:70,  calories:200, badge:'',         featured:false },
  { category:'matcha',  name:'Matcha Espresso Fusion', description:'Matcha meets espresso for the ultimate boost',             price:7,    ingredients:'Ceremonial grade matcha, espresso, whole milk',         caffeine:133, calories:180, badge:'',         featured:false },
  { category:'matcha',  name:'Iced Matcha Lemonade',   description:'Bright, earthy & refreshing',                              price:6,    ingredients:'Ceremonial grade matcha, lemonade, ice',               caffeine:70,  calories:120, badge:'',         featured:false },
  { category:'matcha',  name:'Dirty Matcha',            description:'Iced matcha latte with an espresso shot',                 price:7,    ingredients:'Ceremonial grade matcha, espresso, whole milk, ice',   caffeine:133, calories:220, badge:'Fan Fave', featured:true  },
  { category:'addons',  name:'Oat Milk',                description:'Creamy dairy-free swap',                                   price:1,    ingredients:'Oat milk',                                              caffeine:0,   calories:60,  badge:'',         featured:false },
  { category:'addons',  name:'Almond Milk',             description:'Nutty dairy-free swap',                                    price:1,    ingredients:'Almond milk',                                           caffeine:0,   calories:30,  badge:'',         featured:false },
  { category:'addons',  name:'Vanilla Syrup',           description:'House-made simple syrup',                                  price:0.75, ingredients:'Cane sugar, water, vanilla extract',                   caffeine:0,   calories:45,  badge:'',         featured:false },
  { category:'addons',  name:'Lavender Syrup',          description:'Floral & light',                                           price:0.75, ingredients:'Cane sugar, water, culinary lavender',                 caffeine:0,   calories:40,  badge:'',         featured:false },
  { category:'addons',  name:'Caramel Syrup',           description:'Rich & sweet',                                             price:0.75, ingredients:'Cane sugar, water, caramel flavor',                    caffeine:0,   calories:55,  badge:'',         featured:false },
  { category:'addons',  name:'Extra Shot',              description:'Double the espresso',                                      price:1,    ingredients:'Espresso',                                              caffeine:63,  calories:5,   badge:'',         featured:false },
];
const MENU_VERSION = 2;
const MENU_LOCK_ID = 727001;

// Runs as one transaction behind a lock, so simultaneous requests can't apply it
// twice and a failure leaves the menu untouched. Each step rechecks the version
// because a request that waited on the lock may find the work already done.
function applyDefaultMenu() {
  return db().transaction([
    sql`SELECT pg_advisory_xact_lock(${MENU_LOCK_ID}::bigint)`,
    sql`
      DELETE FROM menu_items m
      USING jsonb_to_recordset(${JSON.stringify(V1_MENU)}::jsonb) AS d(
        category text, name text, description text, price numeric, ingredients text,
        caffeine int, calories int, badge text, featured boolean)
      WHERE COALESCE((SELECT value::int FROM app_meta WHERE key = 'menu_version'), 0) < ${MENU_VERSION}::int
        AND m.category = d.category AND m.name = d.name AND m.price = d.price
        AND m.description IS NOT DISTINCT FROM d.description
        AND m.ingredients IS NOT DISTINCT FROM d.ingredients
        AND m.caffeine    IS NOT DISTINCT FROM d.caffeine
        AND m.calories    IS NOT DISTINCT FROM d.calories
        AND m.badge       IS NOT DISTINCT FROM d.badge
        AND m.featured    IS NOT DISTINCT FROM d.featured
        AND COALESCE(m.image_url, '') = ''`,
    sql`
      INSERT INTO menu_items
        (category, name, description, price, ingredients, caffeine, calories, badge, featured, sort_order)
      SELECT d.category, d.name, d.description, d.price, d.ingredients,
             d.caffeine, d.calories, d.badge, d.featured, d.sort_order
      FROM jsonb_to_recordset(${JSON.stringify(DEFAULT_MENU)}::jsonb) AS d(
        category text, name text, description text, price numeric, ingredients text,
        caffeine int, calories int, badge text, featured boolean, sort_order int)
      WHERE (COALESCE((SELECT value::int FROM app_meta WHERE key = 'menu_version'), 0) < ${MENU_VERSION}::int
             OR NOT EXISTS (SELECT 1 FROM menu_items))
        AND NOT EXISTS (SELECT 1 FROM menu_items m WHERE m.category = d.category AND m.name = d.name)`,
    sql`
      INSERT INTO app_meta (key, value) VALUES ('menu_version', ${String(MENU_VERSION)})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
  ]);
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
  // One-time swap to the current default menu. Hand-added and edited items are kept.
  if (count === 0 || version < MENU_VERSION) await applyDefaultMenu();
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
