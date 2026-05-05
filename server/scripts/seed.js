require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

async function seed() {
  console.log('Seeding TaskFlow...');

  // Users
  const adminHash = await bcrypt.hash('Admin@123', 10);
  const memberHash = await bcrypt.hash('Member@123', 10);

  const { data: adminUser, error: e1 } = await supabase
    .from('users')
    .upsert({ name: 'Admin User', email: 'admin@taskflow.dev', password_hash: adminHash, role: 'admin' }, { onConflict: 'email' })
    .select()
    .single();
  if (e1) throw e1;

  const { data: memberUser, error: e2 } = await supabase
    .from('users')
    .upsert({ name: 'Alex Chen', email: 'member@taskflow.dev', password_hash: memberHash, role: 'member' }, { onConflict: 'email' })
    .select()
    .single();
  if (e2) throw e2;

  console.log('✓ Users created');

  // Projects
  const { data: proj1, error: e3 } = await supabase
    .from('projects')
    .insert({ name: 'Payments Platform v2', description: 'Powering the v2 ledger and faster settlements.', status: 'active', owner_id: adminUser.id, key: 'PAY' })
    .select()
    .single();
  if (e3) throw e3;

  const { data: proj2, error: e4 } = await supabase
    .from('projects')
    .insert({ name: 'Mobile App Redesign', description: 'Full redesign of the consumer-facing mobile app.', status: 'active', owner_id: adminUser.id, key: 'MOB' })
    .select()
    .single();
  if (e4) throw e4;

  console.log('✓ Projects created');

  // Members
  await supabase.from('project_members').upsert([
    { project_id: proj1.id, user_id: adminUser.id, role: 'admin' },
    { project_id: proj1.id, user_id: memberUser.id, role: 'member' },
    { project_id: proj2.id, user_id: adminUser.id, role: 'admin' },
    { project_id: proj2.id, user_id: memberUser.id, role: 'member' },
  ], { onConflict: 'project_id,user_id' });

  console.log('✓ Project members created');

  // Tasks
  const tasks = [
    { project_id: proj1.id, title: 'Set up Plaid bank connection API', status: 'done', priority: 'high', created_by: adminUser.id, assigned_to: memberUser.id, due_date: '2025-04-15', tags: ['backend', 'api'] },
    { project_id: proj1.id, title: 'Implement v2 ledger reconciliation engine', status: 'in_progress', priority: 'critical', created_by: adminUser.id, assigned_to: adminUser.id, due_date: '2025-05-20', tags: ['backend'] },
    { project_id: proj1.id, title: 'Write integration tests for payment flows', status: 'todo', priority: 'medium', created_by: memberUser.id, assigned_to: memberUser.id, due_date: '2025-06-01', tags: ['testing'] },
    { project_id: proj1.id, title: 'Update API docs for v2 endpoints', status: 'review', priority: 'low', created_by: adminUser.id, assigned_to: memberUser.id, due_date: '2025-05-10', tags: ['docs'] },
    { project_id: proj1.id, title: 'Performance test settlement batch jobs', status: 'todo', priority: 'high', created_by: adminUser.id, assigned_to: adminUser.id, due_date: '2025-04-01', tags: ['performance'] },
    { project_id: proj2.id, title: 'Design new onboarding flow screens', status: 'done', priority: 'high', created_by: adminUser.id, assigned_to: memberUser.id, due_date: '2025-04-10', tags: ['design', 'ux'] },
    { project_id: proj2.id, title: 'Implement push notification system', status: 'in_progress', priority: 'medium', created_by: memberUser.id, assigned_to: memberUser.id, due_date: '2025-05-25', tags: ['mobile'] },
    { project_id: proj2.id, title: 'Build offline mode with local cache', status: 'todo', priority: 'high', created_by: adminUser.id, assigned_to: adminUser.id, due_date: '2025-06-15', tags: ['mobile', 'cache'] },
  ];

  const { error: e5 } = await supabase.from('tasks').insert(tasks);
  if (e5) throw e5;

  console.log('✓ Tasks created');
  console.log('\n✅ Seed complete!\n');
  console.log('Test accounts:');
  console.log('  admin@taskflow.dev / Admin@123  (role: admin)');
  console.log('  member@taskflow.dev / Member@123  (role: member)');
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
