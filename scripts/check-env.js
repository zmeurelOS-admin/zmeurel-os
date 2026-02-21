// scripts/check-env.js

// 🔹 Încarcă .env.local explicit
require('dotenv').config({ path: '.env.local' });

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];

const missing = required.filter(
  (k) => !process.env[k] || String(process.env[k]).trim() === ""
);

if (missing.length > 0) {
  console.error("\n❌ Lipsesc variabile de mediu necesare pentru Supabase:");
  for (const k of missing) console.error(" - " + k);

  console.error("\n✅ Fix: completează fișierul .env.local din rădăcina proiectului cu:");
  console.error("NEXT_PUBLIC_SUPABASE_URL=...");
  console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY=...\n");

  process.exit(1);
}

console.log("✅ Env vars ok:", required.join(", "));
