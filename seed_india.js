const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  connectionString: 'postgresql://postgres:t1ovNw0RmeAyou@db.dundcluwxybopaeelemy.supabase.co:5432/postgres'
});

async function run() {
  await client.connect();
  
  try {
    console.log('Running migration...');
    const migrationSql = fs.readFileSync(path.join(__dirname, 'supabase', 'migrations', '20260721170000_add_statements.sql'), 'utf8');
    await client.query(migrationSql);
    console.log('Migration added successfully!');

    // Insert Indian Politicians
    console.log('Inserting Indian politicians...');
    const polRes = await client.query(`
      INSERT INTO politicians (first_name, last_name, bio)
      VALUES 
        ('Narendra', 'Modi', 'Prime Minister of India, MP from Varanasi'),
        ('Rahul', 'Gandhi', 'Member of Parliament, Raebareli'),
        ('Amit', 'Shah', 'Minister of Home Affairs, MP from Gandhinagar'),
        ('Mamata', 'Banerjee', 'Chief Minister of West Bengal, MLA from Bhabanipur')
      RETURNING id, first_name;
    `);
    const pols = polRes.rows;

    console.log('Inserting statements...');
    await client.query(`
      INSERT INTO statements (politician_id, statement_text, date_made, source_url, context)
      VALUES 
        ($1, 'We are committed to making India a developed nation by 2047.', '2026-01-26', 'https://example.com/speech1', 'Republic Day Address'),
        ($2, 'We need to focus on employment and youth empowerment.', '2026-03-15', 'https://example.com/speech2', 'Public Rally in UP'),
        ($3, 'Internal security is our top priority and we will not compromise.', '2026-04-10', 'https://example.com/speech3', 'Parliament Session'),
        ($4, 'The state government is ensuring welfare schemes reach every household.', '2026-05-20', 'https://example.com/speech4', 'State Assembly')
    `, [pols[0].id, pols[1].id, pols[2].id, pols[3].id]);

    console.log('Successfully seeded Indian politicians and statements!');
  } catch (err) {
    console.error('Error running script:', err);
  } finally {
    await client.end();
  }
}

run();
