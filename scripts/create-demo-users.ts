/**
 * PharmSync Demo Users Creation Script
 * 
 * This script creates demo users for each role:
 * - Associate (full access)
 * - Admin (store-level management)
 * - Regular (day-to-day operations)
 * - Driver (SMS notifications only)
 * 
 * Run with: npm run db:seed
 * Or: npx tsx scripts/create-demo-users.ts
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing')
  console.log('SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? '✓ Set' : '✗ Missing')
  console.log('\nMake sure your .env file contains these values')
  process.exit(1)
}

console.log('🔗 Connecting to:', supabaseUrl)

// Create admin client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
})

// Demo user configurations
const demoUsers = [
  {
    email: 'associate@pharmsync.demo',
    password: 'Demo@123456',
    fullName: 'Alex Associate',
    role: 'associate',
    phone: '519-555-0001',
    storeCode: null  // Associates have access to all stores
  },
  {
    email: 'admin@pharmsync.demo',
    password: 'Demo@123456',
    fullName: 'Adam Admin',
    role: 'admin',
    phone: '519-555-0002',
    storeCode: '1021'  // Grand Ave Pharmacy
  },
  {
    email: 'regular@pharmsync.demo',
    password: 'Demo@123456',
    fullName: 'Rachel Regular',
    role: 'regular',
    phone: '519-555-0003',
    storeCode: '1021'  // Grand Ave Pharmacy
  },
  {
    email: 'driver@pharmsync.demo',
    password: 'Demo@123456',
    fullName: 'Derek Driver',
    role: 'driver',
    phone: '519-555-0004',
    storeCode: '1021'  // Grand Ave Pharmacy
  },
  // Additional users for other stores
  {
    email: 'admin2@pharmsync.demo',
    password: 'Demo@123456',
    fullName: 'Amy Admin',
    role: 'admin',
    phone: '416-555-0001',
    storeCode: '0713'  // Nortown Pharmacy
  },
  {
    email: 'regular2@pharmsync.demo',
    password: 'Demo@123456',
    fullName: 'Ryan Regular',
    role: 'regular',
    phone: '416-555-0002',
    storeCode: '0713'  // Nortown Pharmacy
  }
]

async function getStoreIdByCode(code: string | null): Promise<string | null> {
  if (!code) return null
  
  const { data, error } = await supabase
    .from('stores')
    .select('id')
    .eq('code', code)
    .single()
  
  if (error) {
    console.error(`❌ Error finding store ${code}:`, error.message)
    return null
  }
  
  return data?.id || null
}

async function createDemoUser(user: typeof demoUsers[0]) {
  console.log(`\n📝 Creating user: ${user.email}`)
  
  // Get store ID if applicable
  const storeId = await getStoreIdByCode(user.storeCode)
  
  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const existingUser = existingUsers?.users?.find(u => u.email === user.email)
  
  let userId: string
  
  if (existingUser) {
    console.log(`   ⚠️ User already exists, updating profile...`)
    userId = existingUser.id
  } else {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,  // Auto-confirm email
      user_metadata: {
        full_name: user.fullName
      }
    })
    
    if (authError) {
      console.error(`   ❌ Error creating auth user:`, authError.message)
      return null
    }
    
    userId = authData.user.id
    console.log(`   ✅ Auth user created: ${userId}`)
  }
  
  // Update profile with role and store
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      email: user.email,
      full_name: user.fullName,
      phone: user.phone,
      role: user.role,
      store_id: storeId
    }, {
      onConflict: 'id'
    })
  
  if (profileError) {
    console.error(`   ❌ Error updating profile:`, profileError.message)
    return null
  }
  
  console.log(`   ✅ Profile updated: ${user.role} ${storeId ? `(Store: ${user.storeCode})` : '(All Stores)'}`)
  
  // Create driver record if this is a driver
  if (user.role === 'driver' && storeId) {
    const { error: driverError } = await supabase
      .from('drivers')
      .upsert({
        user_id: userId,
        store_id: storeId,
        name: user.fullName,
        phone: user.phone,
        is_available: true,
        shift_status: 'off_duty'
      }, {
        onConflict: 'user_id'
      })
    
    if (driverError && !driverError.message.includes('duplicate')) {
      console.error(`   ❌ Error creating driver record:`, driverError.message)
    } else {
      console.log(`   ✅ Driver record created`)
    }
  }
  
  return userId
}

async function main() {
  console.log('🚀 PharmSync Demo Users Setup')
  console.log('================================')
  
  // Verify stores exist
  const { data: stores, error: storesError } = await supabase
    .from('stores')
    .select('id, name, code')
  
  if (storesError) {
    console.error('❌ Error fetching stores:', storesError.message)
    console.log('\n⚠️ Make sure to run the schema.sql first!')
    process.exit(1)
  }
  
  if (!stores || stores.length === 0) {
    console.error('❌ No stores found in database')
    console.log('\n⚠️ Make sure to run the reset-and-seed.sql first!')
    process.exit(1)
  }
  
  console.log('\n📦 Found stores:')
  stores.forEach(store => {
    console.log(`   - ${store.name} (${store.code})`)
  })
  
  // Create demo users
  console.log('\n👥 Creating demo users...')
  
  const createdUsers = []
  for (const user of demoUsers) {
    const userId = await createDemoUser(user)
    if (userId) {
      createdUsers.push({ ...user, id: userId })
    }
  }
  
  // Summary
  console.log('\n================================')
  console.log('✅ Demo Users Setup Complete!')
  console.log('================================')
  console.log('\n📋 Login Credentials:')
  console.log('─────────────────────────────────────────────────────────────')
  console.log('| Role      | Email                      | Password      |')
  console.log('─────────────────────────────────────────────────────────────')
  demoUsers.forEach(user => {
    const roleStr = user.role.padEnd(9)
    const emailStr = user.email.padEnd(26)
    console.log(`| ${roleStr} | ${emailStr} | ${user.password} |`)
  })
  console.log('─────────────────────────────────────────────────────────────')
  console.log('\n🔐 All demo users use password: Demo@123456')
  console.log('\n🏪 Store Assignments:')
  console.log('   - Grand Ave Pharmacy (1021): Admin, Regular, Driver')
  console.log('   - Nortown Pharmacy (0713): Admin2, Regular2')
  console.log('   - Associate has access to ALL stores')
}

main().catch(console.error)
