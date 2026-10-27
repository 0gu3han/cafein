import { initDB, getMenuItems } from '@/lib/db';
import MenuClient from './MenuClient';

export const metadata = {
  title: 'CAFE!N — Menu',
  description: 'Coffee & matcha cart menu. Middle Tennessee events, weddings, and private bookings.',
};

export default async function MenuPage() {
  await initDB();
  const items = await getMenuItems();
  const safeItems = items.map(item => ({
    ...item,
    price:    parseFloat(item.price),
    caffeine: Number(item.caffeine),
    calories: Number(item.calories),
  }));

  return <MenuClient items={safeItems} />;
}
