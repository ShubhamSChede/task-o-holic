// verify-supabase.js
// Run this script to test your Supabase connection

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function verifySupabaseConnection() {
  console.log('🔍 Verifying Supabase Connection...\n');
  
  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('📋 Environment Variables:');
  console.log(`   URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Key: ${supabaseKey ? '✅ Set' : '❌ Missing'}`);
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('\n❌ Missing environment variables!');
    console.log('   Please create .env.local file with your Supabase credentials.');
    return;
  }
  
  console.log(`\n🌐 Testing URL: ${supabaseUrl}`);
  
  try {
    // Test URL accessibility
    const response = await fetch(supabaseUrl);
    if (response.ok) {
      console.log('✅ Supabase URL is accessible');
    } else {
      console.log(`❌ Supabase URL returned status: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Cannot reach Supabase URL: ${error.message}`);
    console.log('   This usually means:');
    console.log('   - Project URL is incorrect');
    console.log('   - Project has been paused/deleted');
    console.log('   - Network connectivity issues');
    return;
  }
  
  try {
    // Test Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test auth endpoint
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log(`❌ Supabase client error: ${error.message}`);
    } else {
      console.log('✅ Supabase client working correctly');
    }
    
  } catch (error) {
    console.log(`❌ Supabase client error: ${error.message}`);
  }
  
  console.log('\n🎯 Next Steps:');
  console.log('   1. If URL is not accessible, check your Supabase project');
  console.log('   2. If client error, verify your API keys');
  console.log('   3. Create new project if current one is paused/deleted');
}

verifySupabaseConnection();
