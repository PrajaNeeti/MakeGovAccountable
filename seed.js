const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:t1ovNw0RmeAyou@db.dundcluwxybopaeelemy.supabase.co:5432/postgres'
});

async function seed() {
  await client.connect();
  
  try {
    // 1. Insert Politicians
    console.log('Inserting politicians...');
    const polRes = await client.query(`
      INSERT INTO politicians (first_name, last_name, bio)
      VALUES 
        ('Jane', 'Smith', 'Mayor of Techville'),
        ('John', 'Doe', 'City Council Member')
      RETURNING id, first_name;
    `);
    const pols = polRes.rows;

    // 2. Insert Departments
    console.log('Inserting departments...');
    const depRes = await client.query(`
      INSERT INTO departments (name, description, branch)
      VALUES 
        ('Department of Education', 'Manages schools and education policy', 'Executive'),
        ('Department of Transportation', 'Manages roads and public transit', 'Executive')
      RETURNING id, name;
    `);
    const deps = depRes.rows;

    // 3. Insert Courts
    console.log('Inserting courts...');
    const courtRes = await client.query(`
      INSERT INTO courts (name, jurisdiction, branch)
      VALUES 
        ('Supreme Court of Techville', 'Appellate', 'Judicial')
      RETURNING id, name;
    `);
    
    // 4. Insert Roles
    console.log('Inserting roles...');
    await client.query(`
      INSERT INTO roles (politician_id, title, department_id, valid_from)
      VALUES 
        ($1, 'Mayor', $2, '2022-01-01'),
        ($3, 'Head of Transit', $4, '2023-01-01')
    `, [pols[0].id, deps[0].id, pols[1].id, deps[1].id]);

    // 5. Insert Activities
    console.log('Inserting activities...');
    await client.query(`
      INSERT INTO activities (entity_id, title, description, date, type)
      VALUES 
        ($1, 'Signed Education Bill', 'Mayor signed the new education funding bill into law.', '2026-07-20', 'Legislative Action'),
        ($2, 'Approved Transit Budget', 'City Council Member approved the new subway line budget.', '2026-07-21', 'Budget Approval'),
        ($3, 'Launched AI Curriculum', 'New AI curriculum introduced in public schools.', '2026-07-21', 'Policy Change')
    `, [pols[0].id, pols[1].id, deps[0].id]);

    // 6. Insert Spending
    console.log('Inserting spending...');
    await client.query(`
      INSERT INTO spending (department_id, amount, category, date, description)
      VALUES 
        ($1, 1500000.00, 'Infrastructure', '2026-07-20', 'New school building construction'),
        ($2, 500000.00, 'Operations', '2026-07-20', 'Subway maintenance'),
        ($1, 200000.00, 'Technology', '2026-07-21', 'Tablets for students'),
        ($2, 1000000.00, 'Infrastructure', '2026-07-21', 'Highway repair')
    `, [deps[0].id, deps[1].id]);

    console.log('Successfully seeded database with mock data!');
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    await client.end();
  }
}

seed();
