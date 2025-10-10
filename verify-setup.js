#!/usr/bin/env node

/**
 * Supabase Setup Verification Script
 * Run this to check if your Supabase configuration is correct
 * 
 * Usage: node verify-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Verifying Supabase Setup...\n');

let hasErrors = false;

// 1. Check if .env.local exists
console.log('1️⃣ Checking .env.local file...');
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('   ❌ .env.local file NOT found');
  console.log('   → Create .env.local file in project root');
  console.log('   → Copy from env.example and fill in your values\n');
  hasErrors = true;
} else {
  console.log('   ✅ .env.local file exists');
  
  // Read and check environment variables
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  console.log('\n2️⃣ Checking environment variables...');
  requiredVars.forEach(varName => {
    const regex = new RegExp(`${varName}\\s*=\\s*(.+)`);
    const match = envContent.match(regex);
    
    if (!match) {
      console.log(`   ❌ ${varName} is missing`);
      hasErrors = true;
    } else {
      const value = match[1].trim();
      if (value.includes('your-') || value.includes('example') || value.length < 10) {
        console.log(`   ⚠️  ${varName} looks like a placeholder`);
        console.log(`      Current value: ${value.substring(0, 30)}...`);
        hasErrors = true;
      } else if (varName === 'NEXT_PUBLIC_SUPABASE_URL') {
        if (!value.startsWith('https://') || !value.includes('supabase.co')) {
          console.log(`   ⚠️  ${varName} doesn't look like a Supabase URL`);
          console.log(`      Should be: https://[project-ref].supabase.co`);
          hasErrors = true;
        } else {
          console.log(`   ✅ ${varName} is set`);
        }
      } else {
        console.log(`   ✅ ${varName} is set`);
      }
    }
  });
}

// 3. Check Supabase client files exist
console.log('\n3️⃣ Checking Supabase client files...');
const requiredFiles = [
  'src/lib/supabase/client.ts',
  'src/lib/supabase/server.ts',
  'src/lib/supabase/client-fetcher.ts'
];

requiredFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) {
    console.log(`   ❌ ${file} NOT found`);
    hasErrors = true;
  } else {
    console.log(`   ✅ ${file} exists`);
  }
});

// 4. Check if @supabase packages are installed
console.log('\n4️⃣ Checking dependencies...');
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredPackages = [
    '@supabase/supabase-js',
    '@supabase/ssr'
  ];
  
  requiredPackages.forEach(pkg => {
    if (deps[pkg]) {
      console.log(`   ✅ ${pkg} is installed (${deps[pkg]})`);
    } else {
      console.log(`   ❌ ${pkg} is NOT installed`);
      console.log(`      Run: npm install ${pkg}`);
      hasErrors = true;
    }
  });
}

// 5. Check if schema file exists
console.log('\n5️⃣ Checking restoration files...');
const schemaFile = path.join(process.cwd(), 'supabase-restore-schema.sql');
if (!fs.existsSync(schemaFile)) {
  console.log('   ⚠️  supabase-restore-schema.sql NOT found');
  console.log('      This should have been created during setup');
} else {
  console.log('   ✅ supabase-restore-schema.sql exists');
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ Setup has issues that need to be fixed\n');
  console.log('📚 Next steps:');
  console.log('   1. Fix the issues listed above');
  console.log('   2. See TROUBLESHOOTING_ERRORS.md for help');
  console.log('   3. Restart your dev server after fixing\n');
  process.exit(1);
} else {
  console.log('✅ Basic setup looks good!\n');
  console.log('📚 If you\'re still having issues:');
  console.log('   1. Make sure you ran supabase-restore-schema.sql in Supabase');
  console.log('   2. Check that RLS policies are set up');
  console.log('   3. Verify you\'re logged in');
  console.log('   4. See TROUBLESHOOTING_ERRORS.md for detailed help\n');
  process.exit(0);
}

