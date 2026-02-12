# 🍓 Zmeurel OS - ERP Agricol pentru Plantații Zmeură & Mure

**Aplicație ERP specializată** pentru managementul plantațiilor de zmeură și mure, cu focus pe tracking operațiuni zilnice, profitabilitate, și conformitate legală.

---

## 📊 STATUS PROIECT

**Progres MVP:** ~40% complet  
**Ultima actualizare:** 12 Februarie 2026  

### ✅ **Module funcționale:**
- **Parcele** - CRUD complet (Create, Read, Update, Delete) ✅
- **Authentication** - Supabase Auth cu RLS policies ✅
- **Database** - 11 tabele cu multi-tenant architecture ✅

### 🚧 **În dezvoltare:**
- Clienți, Culegători (next up)
- Recoltări, Vânzări
- Dashboard cu KPIs

---

## 🚀 QUICK START

### **Prerequisites:**

- Node.js 18+ (https://nodejs.org)
- Git (https://git-scm.com)
- Cont Supabase (https://supabase.com)
- Editor: VS Code sau Cursor (recomandat)

---

### **1. Clone repository:**

```bash
git clone https://github.com/zmeurelOS-admin/zmeurel-os.git
cd zmeurel-os
```

---

### **2. Install dependencies:**

```bash
npm install
```

**Pachete principale:**
- Next.js 16.1.6 (Turbopack)
- @supabase/ssr
- @tanstack/react-query
- shadcn/ui components
- Tailwind CSS v4 alpha

---

### **3. Configure environment variables:**

Creează fișier `.env.local` în root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ilybohhdeplwcrbpblqw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ Obține credențiale din:**
- Supabase Dashboard → Settings → API
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

### **4. Start development server:**

```bash
npm run dev
```

**Aplicația va rula pe:** http://localhost:3000

---

### **5. Access aplicația:**

**Login:**
- Email: popa.andrei.sv@gmail.com
- Password: [solicită la developer]

**Primera pagină:** http://localhost:3000/parcele

---

## 🗄️ DATABASE SETUP

### **Schema SQL (Supabase):**

**Rulează în SQL Editor (Supabase Dashboard):**

```sql
-- Creare tabele (vezi schema completă în documentație)

-- Populare nomenclatoare cu soiuri:
INSERT INTO nomenclatoare (tip, valoare, descriere) VALUES
('Soi', 'Polka', 'Zmeură remontantă, producție iulie-septembrie'),
('Soi', 'Tulameen', 'Zmeură neremontantă, producție iunie-iulie'),
('Soi', 'Heritage', 'Zmeură remontantă, producție toamnă'),
('Soi', 'Loch Ness', 'Mure fără spini, producție iulie-august'),
('Soi', 'Chester', 'Mure fără spini, producție târzie august-septembrie');
```

**RLS Policies:**
```sql
-- Tenant isolation (users văd doar datele lor)
CREATE POLICY "tenant_isolation" ON parcele
FOR SELECT
USING (
  tenant_id IN (
    SELECT id FROM tenants 
    WHERE owner_user_id = auth.uid()
  )
);
```

---

## 📂 PROJECT STRUCTURE

```
zmeurel/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/         # Main app
│   │   ├── layout.tsx       # Dashboard layout + Providers
│   │   ├── providers.tsx    # QueryClient + Toaster
│   │   └── parcele/         # ✅ Parcele module (CRUD)
│   │       ├── page.tsx
│   │       └── ParcelaPageClient.tsx
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                  # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── ...
│   └── parcele/             # Parcele-specific components
│       ├── ParcelaCard.tsx
│       ├── AddParcelaDialog.tsx
│       ├── EditParcelaDialog.tsx
│       └── DeleteConfirmDialog.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # Browser Supabase client
│   │   ├── server.ts        # Server Supabase client
│   │   └── queries/
│   │       └── parcele.ts   # CRUD operations
│   └── utils.ts
├── .env.local               # Environment variables (NOT in git)
├── package.json
└── README.md
```

---

## 🎨 TECH STACK

### **Frontend:**
- **Framework:** Next.js 16.1.6 (App Router + Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 alpha
- **UI Components:** shadcn/ui (Radix UI primitives)
- **State Management:** TanStack Query (React Query v5)
- **Forms:** React Hook Form + Zod validation
- **Icons:** Lucide React

### **Backend:**
- **Database:** Supabase PostgreSQL
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage (pentru facturi/documente)
- **Realtime:** Supabase Realtime (sync multi-device)

### **Deployment:**
- **Frontend:** Vercel (zmeurel.ro)
- **Backend:** Supabase Cloud
- **CI/CD:** GitHub Actions (planned)

---

## 🔐 AUTHENTICATION & SECURITY

**Authentication:**
- Email/Password (Supabase Auth)
- Google OAuth (planned)

**Security:**
- Row Level Security (RLS) on all tables
- Multi-tenant isolation (tenant_id filtering)
- Server-side validation
- Environment variables for secrets

**User roles (planned):**
- Owner (full access)
- Admin (manage all data)
- Operator (limited access)

---

## 🛠️ DEVELOPMENT WORKFLOW

### **Branching strategy:**

```bash
main         # Production (auto-deploy Vercel)
develop      # Staging
feature/*    # Feature branches → PR → develop
```

### **Commit messages:**

```bash
feat: Add clienți CRUD module
fix: Recoltari calculation bug
docs: Update README
style: Format with Prettier
```

### **Testing:**

```bash
# Unit tests (planned):
npm test

# E2E tests (planned):
npm run test:e2e

# Linting:
npm run lint
```

---

## 📚 AVAILABLE SCRIPTS

```bash
# Development:
npm run dev              # Start dev server (localhost:3000)

# Build:
npm run build            # Production build
npm run start            # Start production server

# Code quality:
npm run lint             # ESLint
npm run format           # Prettier format
npm run type-check       # TypeScript check
```

---

## 🐛 DEBUGGING & TROUBLESHOOTING

### **Common issues:**

**1. Module not found errors:**
```bash
# Clear cache and reinstall:
rm -rf node_modules .next
npm install
```

**2. Supabase connection errors:**
- Check `.env.local` has correct credentials
- Verify Supabase project is running
- Test connection: http://localhost:3000/test-supabase (if page exists)

**3. Tailwind CSS not working:**
- Clear Turbopack cache: Delete `.next` folder
- Restart dev server

**4. TypeScript errors:**
```bash
npm run type-check
```

### **Debug tools:**

**Browser DevTools (F12):**
- Console tab → JavaScript errors
- Network tab → API calls
- React DevTools extension

**Terminal logs:**
- All Supabase queries logged with 🔍 emoji
- Errors logged with ❌ emoji

---

## 📖 DOCUMENTATION

**Full documentation:**
- `PROGRES.md` - Detailed development progress log
- `BACKUP-INSTRUCTIONS.md` - Backup and recovery guide
- Supabase docs: https://supabase.com/docs
- Next.js docs: https://nextjs.org/docs

---

## 🤝 CONTRIBUTING

**Acest proiect este personal momentan.**

Dacă vrei să contribui în viitor:
1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📞 SUPPORT

**Developer:** Popa Andrei  
**Email:** popa.andrei.sv@gmail.com  
**GitHub:** https://github.com/zmeurelOS-admin/zmeurel-os

**AI Assistant:** Claude (Anthropic)

---

## 📄 LICENSE

**Proprietar / Private** (momentan)

Planificat pentru viitor: MIT License când devine open-source / SaaS public.

---

## 🎯 ROADMAP

### **Q1 2026 (Febr-Mar) - MVP Core:**
- [x] Setup proiect + Supabase
- [x] Authentication system
- [x] Modul Parcele (CRUD complet) ✅
- [ ] Module CRUD simple: Clienți, Culegători
- [ ] Module complexe: Recoltări, Vânzări
- [ ] Dashboard basic cu KPIs

### **Q2 2026 (Apr-Jun) - Feature Completeness:**
- [ ] Activități Agricole (tratamente, timp pauză)
- [ ] Investiții și Cheltuieli
- [ ] Vânzări Butași
- [ ] Upload facturi (Supabase Storage)
- [ ] Export rapoarte (PDF, Excel)

### **Q3 2026 (Jul-Sep) - Polish & Testing:**
- [ ] UI Polish (branding Zmeurel)
- [ ] PWA (offline mode)
- [ ] Multi-user support
- [ ] Beta testing (5-10 fermieri)

### **Q4 2026 (Oct-Dec) - Public Launch:**
- [ ] Landing page (zmeurel.ro)
- [ ] Pricing tiers (Freemium, Starter, Pro)
- [ ] Stripe integration
- [ ] Marketing & SEO

---

## 🏆 ACHIEVEMENTS

**Sesiunea 12 Februarie 2026:**
- ✅ Modul Parcele 100% funcțional
- ✅ Supabase @supabase/ssr migration complete
- ✅ Dialog system cu backdrop fix (Tailwind v4 workaround)
- ✅ Native select dropdown working
- ✅ Delete/Edit operations smooth
- ✅ Auto-generated IDs (P001, P002...)
- ✅ Multi-tenant architecture active

**Progress:** 35% → 40% MVP ⬆️

---

## 💡 FUN FACTS

**Numele "Zmeurel"** vine de la:
- 🍓 **Zmeură** (românește) = Raspberry (engleza)
- **-el** suffix = diminutiv afectuos (ca "căsuță", "iepuraș")

**Logo:** 🍓 (emoji zmeură până la design final)

**Culori branded:**
- Primary: #F16B6B (Bittersweet)
- Secondary: #312E3F (Charade)

---

**De la fermă la digital - Zmeurel OS! 🍓💻✨**

*Built with ❤️ și foarte mult debugging în Suceava, România*
