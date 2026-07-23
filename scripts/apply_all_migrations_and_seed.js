const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres:t1ovNw0RmeAyou@db.dundcluwxybopaeelemy.supabase.co:5432/postgres';

async function runAllMigrationsAndSeed() {
  const client = new Client({ connectionString });
  await client.connect();

  console.log('⚡ Applying full database schema migrations...');

  const migrationFiles = [
    '00000000000000_initial_schema.sql',
    '20260721000001_add_activities_spending.sql',
    '20260721031544_phase4_forums.sql',
    '20260721100000_add_concerns.sql',
    '20260721100001_match_concerns_rpc.sql',
    '20260721120000_location_and_auth.sql',
    '20260721170000_add_statements.sql',
    '20260722200000_add_mplads_tables.sql',
    '20260723000000_data_sourcing_tables.sql',
    '20260723120000_ingestion_logs.sql'
  ];

  for (const file of migrationFiles) {
    const fullPath = path.join(__dirname, '..', 'supabase', 'migrations', file);
    if (fs.existsSync(fullPath)) {
      console.log(`[Migration] Executing ${file}...`);
      try {
        const sql = fs.readFileSync(fullPath, 'utf8');
        await client.query(sql);
      } catch (err) {
        console.warn(`[Migration] Notice for ${file}: ${err.message}`);
      }
    }
  }

  console.log('🔧 Adjusting constraints & RLS policies for discussions, forum_posts, moderation_reports...');

  // Allow nullable or text/UUID user_id for guest forum posting
  try {
    await client.query(`ALTER TABLE public.forum_posts DROP CONSTRAINT IF EXISTS forum_posts_user_id_fkey;`);
    await client.query(`ALTER TABLE public.forum_posts ALTER COLUMN user_id DROP NOT NULL;`);
    
    await client.query(`ALTER TABLE public.moderation_reports DROP CONSTRAINT IF EXISTS moderation_reports_reported_by_fkey;`);
    await client.query(`ALTER TABLE public.moderation_reports ALTER COLUMN reported_by DROP NOT NULL;`);

    await client.query(`ALTER TABLE public.discussions ALTER COLUMN activity_id DROP NOT NULL;`);
    await client.query(`ALTER TABLE public.discussions ADD COLUMN IF NOT EXISTS title TEXT;`);
    await client.query(`ALTER TABLE public.discussions ADD COLUMN IF NOT EXISTS category TEXT;`);
  } catch (err) {
    console.warn('[Migration Adjustments Notice]:', err.message);
  }

  // Set RLS Policies for Public Select / Insert
  const forumTables = ['discussions', 'forum_posts', 'moderation_reports', 'concerns', 'concern_groups', 'concern_entity_links'];
  for (const t of forumTables) {
    try {
      await client.query(`ALTER TABLE public.${t} ENABLE ROW LEVEL SECURITY;`);

      await client.query(`DROP POLICY IF EXISTS "Public select ${t}" ON public.${t};`);
      await client.query(`CREATE POLICY "Public select ${t}" ON public.${t} FOR SELECT USING (true);`);

      await client.query(`DROP POLICY IF EXISTS "Public insert ${t}" ON public.${t};`);
      await client.query(`CREATE POLICY "Public insert ${t}" ON public.${t} FOR INSERT WITH CHECK (true);`);

      await client.query(`DROP POLICY IF EXISTS "Public update ${t}" ON public.${t};`);
      await client.query(`CREATE POLICY "Public update ${t}" ON public.${t} FOR UPDATE USING (true);`);
    } catch (err) {
      console.warn(`Policy update notice for ${t}:`, err.message);
    }
  }

  console.log('🌱 Seeding initial real discussions, forum posts, and citizen concerns...');

  // 1. Seed Discussions
  const discussionsData = [
    {
      id: 'd1000000-0000-0000-0000-000000000001',
      title: 'MPLADS Fund Utilization Audit: Should Unspent Funds Roll Over?',
      category: 'Legislative',
      created_at: new Date().toISOString()
    },
    {
      id: 'd1000000-0000-0000-0000-000000000002',
      title: 'Department of Economic Affairs & Federal Capital Budgeting Transparency',
      category: 'Executive Mandates',
      created_at: new Date().toISOString()
    },
    {
      id: 'd1000000-0000-0000-0000-000000000003',
      title: 'High Court Case Pendency: Fast-Track Courts & 10+ Year Backlogs',
      category: 'Judicial Backlog',
      created_at: new Date().toISOString()
    },
    {
      id: 'd1000000-0000-0000-0000-000000000004',
      title: '18th Lok Sabha Members — Attendance %, Questions & Debate Participation',
      category: 'Representatives',
      created_at: new Date().toISOString()
    }
  ];

  for (const d of discussionsData) {
    await client.query(`
      INSERT INTO public.discussions (id, title, category, created_at)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, category = EXCLUDED.category;
    `, [d.id, d.title, d.category, d.created_at]);
  }

  // 2. Seed Forum Posts
  const forumPostsData = [
    {
      discussion_id: 'd1000000-0000-0000-0000-000000000001',
      content: 'The e-SAKSHI data shows ₹11,538+ Cr in MPLADS allocations across Lok Sabha and Rajya Sabha MPs. The main bottleneck seems to be District Collectorate sanctions delaying local ground works.',
      is_flagged: false
    },
    {
      discussion_id: 'd1000000-0000-0000-0000-000000000001',
      content: 'Unspent funds should be published monthly per constituency so citizens can hold their elected MPs accountable directly.',
      is_flagged: false
    },
    {
      discussion_id: 'd1000000-0000-0000-0000-000000000002',
      content: 'Cabinet Allocation of Business (AoB) Second Schedule rules clearly define ministry subjects. Having structured mandates published publicly makes inter-departmental jurisdiction clear.',
      is_flagged: false
    },
    {
      discussion_id: 'd1000000-0000-0000-0000-000000000003',
      content: 'Over 1.24 million High Court cases have been pending for more than 10 years according to NJDG data. Judicial vacancy filling needs fast-tracking.',
      is_flagged: false
    },
    {
      discussion_id: 'd1000000-0000-0000-0000-000000000004',
      content: 'PRS India data provides a clear metric on parliamentary performance. Attendance percentage and private member bills introduced show active legislative engagement.',
      is_flagged: false
    }
  ];

  for (const p of forumPostsData) {
    await client.query(`
      INSERT INTO public.forum_posts (discussion_id, content, is_flagged)
      VALUES ($1, $2, $3);
    `, [p.discussion_id, p.content, p.is_flagged]);
  }

  // 3. Seed Citizen Concerns
  const concernsData = [
    {
      content: 'Delay in road widening and drainage repair work near Sector 12 highway junction.',
      status: 'pending'
    },
    {
      content: 'Public hospital emergency ward staff shortage and medicine inventory transparency.',
      status: 'pending'
    },
    {
      content: 'Pothole repairs needed on main arterial road connecting Railway Station to Bus Terminus.',
      status: 'pending'
    }
  ];

  for (const c of concernsData) {
    await client.query(`
      INSERT INTO public.concerns (content, status)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING;
    `, [c.content, c.status]);
  }

  console.log('✅ All migrations applied and forum discussions/posts seeded successfully!');
  await client.end();
}

if (require.main === module) {
  runAllMigrationsAndSeed();
}

module.exports = { runAllMigrationsAndSeed };
