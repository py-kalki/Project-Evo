/**
 * prisma/seed.ts — creates the admin account and 15 sample events.
 * Run with: npx prisma db seed
 *
 * Re-running is safe:
 *  - Admin is upserted (no duplicate).
 *  - Events are deleted and re-created so dates stay relative to "now".
 */
import { PrismaClient, Category } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function main() {
  // ── Admin ────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Admin@123', 12);
  await db.user.upsert({
    where: { email: 'admin@events.test' },
    update: {},
    create: {
      email: 'admin@events.test',
      passwordHash,
      role: 'ADMIN',
    },
  });
  console.log('✓ Admin upserted: admin@events.test / Admin@123');

  // ── Events ────────────────────────────────────────────────────────────────
  // Delete all events first so re-seeding stays clean.
  await db.event.deleteMany();
  console.log('✓ Existing events cleared');

  // Helper: "N days from now" in UTC
  const days = (n: number) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);
  // Helper: "N days ago" in UTC
  const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

  const events: Array<{
    title: string;
    category: Category;
    city: string;
    startsAt: Date;
    price: number;
    description: string;
    imageUrl: string;
    isActive: boolean;
  }> = [
    // ── 9 Active & Upcoming ────────────────────────────────────────────────
    {
      title: 'Unplugged Music Night',
      category: 'MUSIC',
      city: 'Coimbatore',
      startsAt: days(3),
      price: 499,
      description:
        'An acoustic evening with local bands and open mic slots. Bring your guitar or just your ears — either way you will leave humming.',
      imageUrl: 'https://picsum.photos/seed/event-1/800/500',
      isActive: true,
    },
    {
      title: 'Pottery for Beginners',
      category: 'WORKSHOP',
      city: 'Bengaluru',
      startsAt: days(5),
      price: 1200,
      description:
        'Hands-on wheel throwing session. Clay, apron, and firing included. No experience needed — just curiosity and a willingness to get messy.',
      imageUrl: 'https://picsum.photos/seed/event-2/800/500',
      isActive: true,
    },
    {
      title: 'Street Food Festival',
      category: 'FOOD',
      city: 'Chennai',
      startsAt: days(7),
      price: 0,
      description:
        'Over 40 stalls showcasing street food from across South India. Free entry, pay per plate. Vegetarian and vegan options aplenty.',
      imageUrl: 'https://picsum.photos/seed/event-3/800/500',
      isActive: true,
    },
    {
      title: '5K Fun Run — Marina Beach',
      category: 'SPORTS',
      city: 'Chennai',
      startsAt: days(10),
      price: 200,
      description:
        'A casual sunrise run along the longest natural urban beach in India. Timed and untimed waves. Medals for all finishers.',
      imageUrl: 'https://picsum.photos/seed/event-4/800/500',
      isActive: true,
    },
    {
      title: 'Kids Science Fair',
      category: 'KIDS',
      city: 'Coimbatore',
      startsAt: days(12),
      price: 100,
      description:
        'Interactive exhibits and experiments for children aged 5 to 14. Robots, volcanoes, and live demos by young scientists.',
      imageUrl: 'https://picsum.photos/seed/event-5/800/500',
      isActive: true,
    },
    {
      title: 'Indie Jazz Collective',
      category: 'MUSIC',
      city: 'Bengaluru',
      startsAt: days(15),
      price: 800,
      description:
        'A curated night of contemporary jazz with four bands from across Karnataka. Cocktails, low lighting, and zero pretension.',
      imageUrl: 'https://picsum.photos/seed/event-6/800/500',
      isActive: true,
    },
    {
      title: 'Digital Photography Workshop',
      category: 'WORKSHOP',
      city: 'Mumbai',
      startsAt: days(18),
      price: 1500,
      description:
        'From composition to post-processing — a full-day workshop for enthusiasts. Bring your DSLR or mirrorless camera. Laptops with Lightroom welcome.',
      imageUrl: 'https://picsum.photos/seed/event-7/800/500',
      isActive: true,
    },
    {
      title: 'Saturday Farmers Market',
      category: 'FOOD',
      city: 'Mumbai',
      startsAt: days(9),
      price: 0,
      description:
        'Fresh produce, artisan bread, cold-pressed juices, and homemade jams. Meet the farmers, taste before you buy.',
      imageUrl: 'https://picsum.photos/seed/event-8/800/500',
      isActive: true,
    },
    {
      title: 'City Half Marathon',
      category: 'SPORTS',
      city: 'Bengaluru',
      startsAt: days(22),
      price: 650,
      description:
        'The flagship road race through Bengaluru with chip timing, hydration stations, and finish-line celebration. Training plan on the website.',
      imageUrl: 'https://picsum.photos/seed/event-9/800/500',
      isActive: true,
    },

    // ── 3 Inactive (upcoming dates, but hidden from visitors) ──────────────
    {
      title: 'Rooftop Electronic Night',
      category: 'MUSIC',
      city: 'Mumbai',
      startsAt: days(6),
      price: 999,
      description:
        'Three DJs, one rooftop, and a city skyline. Currently under review — check back soon for ticket availability.',
      imageUrl: 'https://picsum.photos/seed/event-10/800/500',
      isActive: false,
    },
    {
      title: 'Candle Making Masterclass',
      category: 'WORKSHOP',
      city: 'Chennai',
      startsAt: days(14),
      price: 750,
      description:
        'Learn to pour soy wax candles with custom scents and natural dyes. Take home six candles you made yourself.',
      imageUrl: 'https://picsum.photos/seed/event-11/800/500',
      isActive: false,
    },
    {
      title: 'Kids Art Camp',
      category: 'KIDS',
      city: 'Bengaluru',
      startsAt: days(20),
      price: 300,
      description:
        'A weekend art camp for ages 6 to 12. Watercolours, collage, and clay sculpting. Snacks provided. Currently being updated.',
      imageUrl: 'https://picsum.photos/seed/event-12/800/500',
      isActive: false,
    },

    // ── 3 Past (active, but start time already passed) ─────────────────────
    {
      title: 'Rock the Stage — Open Mic',
      category: 'MUSIC',
      city: 'Coimbatore',
      startsAt: daysAgo(5),
      price: 0,
      description:
        'Monthly open mic night for musicians, poets, and comedians. Sign up at the door. All genres welcome.',
      imageUrl: 'https://picsum.photos/seed/event-13/800/500',
      isActive: true,
    },
    {
      title: 'Coimbatore Food Walk',
      category: 'FOOD',
      city: 'Coimbatore',
      startsAt: daysAgo(10),
      price: 350,
      description:
        'A guided two-hour walk through the old city sampling local snacks, kothu parotta, and filter coffee from heritage spots.',
      imageUrl: 'https://picsum.photos/seed/event-14/800/500',
      isActive: true,
    },
    {
      title: 'Kids Coding Bootcamp',
      category: 'KIDS',
      city: 'Mumbai',
      startsAt: daysAgo(3),
      price: 500,
      description:
        'A one-day intro to coding for children aged 8 to 14 using Scratch and Python Turtle. Laptops provided.',
      imageUrl: 'https://picsum.photos/seed/event-15/800/500',
      isActive: true,
    },
  ];

  await db.event.createMany({ data: events });
  console.log(`✓ ${events.length} events seeded`);
  console.log(
    '  — 9 active & upcoming, 3 inactive (upcoming), 3 past (active, dates in the past)'
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
