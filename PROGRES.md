# 📊 PROGRES ZMEUREL OS - ERP Agricol

**Proiect:** Zmeurel OS - Aplicație ERP pentru plantații zmeură/mure  
**Developer:** Popa Andrei (cu asistență Claude AI)  
**Tech Stack:** Next.js 15, Supabase, TypeScript, Tailwind CSS v4 alpha, shadcn/ui  
**Última actualizare:** 12 Februarie 2026

---

## 🎯 STATUS GENERAL: **~40% MVP COMPLET**

### ✅ **GATA (100% funcțional):**
- Authentication system (Supabase Auth)
- Database setup (11 tabele + RLS policies)
- **Modul Parcele** - CRUD complet ✅
- Multi-tenant architecture (tenant_id în toate query-urile)
- Supabase connection (@supabase/ssr pentru Next.js 15)

### 🚧 **ÎN LUCRU:**
- Următorul modul (Clienți sau Culegători)

### ⏳ **DE FĂCUT:**
- Recoltări, Vânzări, Activități Agricole, Investiții, Cheltuieli
- Dashboard cu KPIs
- UI Polish (branding Zmeurel)

---

## 📅 ISTORIC SESIUNI DEZVOLTARE

### **SESIUNEA 12 FEBRUARIE 2026** ⭐ MODUL PARCELE COMPLET

**Durată:** ~4 ore  
**Realizări majore:**

#### ✅ **1. FIX SUPABASE CONNECTION**
**Problemă:** Erori `Module not found: Can't resolve './client'` + `Error fetching parcele: {}`

**Soluție implementată:**
- Migrat de la `@supabase/supabase-js` la `@supabase/ssr` (compatibil Next.js 15)
- Creat `lib/supabase/client.ts` - browser client cu `createBrowserClient`
- Creat `lib/supabase/server.ts` - server client cu `createServerClient` + cookies handler
- Fix import în `lib/supabase/queries/parcele.ts`: `import from '../client'` (nu `'./client'`)

**Fișiere create/modificate:**
- `lib/supabase/client.ts` - NEW
- `lib/supabase/server.ts` - NEW
- `lib/supabase/queries/parcele.ts` - FIX import path

**Debugging tools create:**
- `app/test-supabase/page.tsx` - Pagină test conexiune (5 teste: ENV vars, Client, Query, Auth, RLS)
- Console logs extinse în toate funcțiile queries

**Rezultat:** ✅ Conexiune Supabase 100% funcțională, toate testele PASS

---

#### ✅ **2. FIX DIALOG BACKDROP (Tailwind v4 alpha issue)**
**Problemă:** Dialog-urile se deschideau FĂRĂ fundal întunecat (backdrop transparent)

**Root cause:** Tailwind v4 alpha + Next.js 15 Turbopack incompatibility
- Sintaxa `bg-black/80` nu compilează corect cu Turbopack
- Radix UI DialogOverlay se bazează pe clase Tailwind → backdrop invizibil

**Soluție implementată:**
- Înlocuit clase Tailwind cu **style inline** în toate componentele dialog
- `DialogOverlay`: `style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}`
- `DialogContent`: `style={{ backgroundColor: 'white' }}`
- Adăugat div manual redundant în Portal (failsafe)
- z-index hierarchy: backdrop 50, content 60

**Fișiere modificate:**
- `components/ui/dialog.tsx` - Style inline pentru backdrop
- `components/ui/alert-dialog.tsx` - Same fix pentru AlertDialog
- `components/ui/select.tsx` - Background alb forțat pentru dropdown

**Erori rezolvate:**
- React hydration errors (nested `<p>` tags în AlertDialogDescription)
- Dialog backdrop invizibil
- Dropdown menu fără background

**Rezultat:** ✅ Dialog-uri cu backdrop negru 80% opacitate funcțional

---

#### ✅ **3. FIX DELETE HANDLER**
**Problemă:** Eroare `onConfirm is not a function` la ștergere parcelă

**Root cause:** State management greșit în `ParcelaPageClient.tsx`
- `parcelaToDelete` era `string | undefined` (doar ID)
- `onConfirm` primea string în loc de funcție

**Soluție implementată:**
```tsx
// ÎNAINTE (greșit):
const [parcelaToDelete, setParcelaToDelete] = useState<string>();
<DeleteConfirmDialog onConfirm={parcelaToDelete} /> // ❌ String, nu funcție!

// DUPĂ (corect):
const [deletingParcela, setDeletingParcela] = useState<{ id: string; name: string } | null>(null);
const handleConfirmDelete = () => {
  if (deletingParcela) {
    deleteMutation.mutate(deletingParcela.id);
  }
};
<DeleteConfirmDialog onConfirm={handleConfirmDelete} /> // ✅ Funcție validă!
```

**Fișiere modificate:**
- `app/(dashboard)/parcele/ParcelaPageClient.tsx` - State + handlers corectați

**Rezultat:** ✅ Ștergere parcele funcțională cu confirmare

---

#### ✅ **4. FIX DROPDOWN SOIURI**
**Problemă:** Dropdown "Soi Plantat" se deschidea dar nu apăreau opțiunile

**Root cause 1:** Radix UI Select component compatibility issues cu Tailwind v4 alpha

**Soluție 1:** Înlocuit Radix UI Select cu **native HTML `<select>`**
```tsx
<select
  id="soi_plantat"
  {...form.register('soi_plantat')}
  style={{ backgroundColor: 'white', color: 'black' }}
>
  <option value="">Selectează soi...</option>
  {soiuriDisponibile.map((soi) => (
    <option key={soi} value={soi}>{soi}</option>
  ))}
</select>
```

**Root cause 2:** Array `soiuriDisponibile` era GOL (length = 0)

**Debugging implementat:**
- Console logs în `page.tsx` pentru query soiuri
- useEffect în `AddParcelaDialog.tsx` pentru verificare array
- Mesaj "X soiuri disponibile" sub dropdown

**Root cause 3:** Tabelul `nomenclatoare` era GOL - nu conținea soiuri!

**Soluție finală:**
```sql
-- Inserare soiuri în Supabase SQL Editor:
INSERT INTO nomenclatoare (tip, valoare, descriere) VALUES
('Soi', 'Polka', 'Zmeură remontantă, producție iulie-septembrie'),
('Soi', 'Tulameen', 'Zmeură neremontantă, producție iunie-iulie'),
('Soi', 'Heritage', 'Zmeură remontantă, producție toamnă'),
('Soi', 'Loch Ness', 'Mure fără spini, producție iulie-august'),
('Soi', 'Chester', 'Mure fără spini, producție târzie august-septembrie');
```

**Fișiere modificate:**
- `components/parcele/AddParcelaDialog.tsx` - Native select + debugging
- `components/parcele/EditParcelaDialog.tsx` - Same fix
- `app/(dashboard)/parcele/page.tsx` - Debugging logs pentru soiuri query

**SQL rulat în Supabase:**
- `INSERT-SOIURI-SIMPLE.sql` - Populare nomenclatoare

**Rezultat:** ✅ Dropdown funcțional cu 5 soiuri selectabile

---

#### ✅ **5. FIX HYDRATION ERRORS**
**Problemă:** `Hydration failed` - server vs client mismatch

**Root cause:** `toLocaleString()` formatează diferit pe server vs browser
```tsx
// ÎNAINTE:
{parcela.suprafata_m2.toLocaleString()} m²  // 1,000 (client) vs 1.000 (server)

// DUPĂ:
{parcela.suprafata_m2} m²  // 1000 (identic pe server și client)
```

**Fișiere modificate:**
- `components/parcele/ParcelaCard.tsx` - Eliminat toLocaleString

**Rezultat:** ✅ Fără hydration warnings

---

#### ✅ **6. QUERY CLIENT PROVIDER SETUP**
**Problemă:** `No QueryClient set, use QueryClientProvider to set one`

**Soluție implementată:**
- Creat `app/(dashboard)/providers.tsx`:
  ```tsx
  'use client';
  import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
  import { Toaster } from 'sonner';
  
  export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({...}));
    return (
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-right" richColors />
      </QueryClientProvider>
    );
  }
  ```

- Creat `app/(dashboard)/layout.tsx`:
  ```tsx
  import { Providers } from './providers';
  
  export default function DashboardLayout({ children }) {
    return (
      <Providers>
        <header>Zmeurel OS</header>
        <main>{children}</main>
      </Providers>
    );
  }
  ```

**Fișiere create:**
- `app/(dashboard)/providers.tsx` - NEW
- `app/(dashboard)/layout.tsx` - NEW

**Pachete instalate:**
```bash
npm install class-variance-authority @radix-ui/react-label @radix-ui/react-slot
```

**Rezultat:** ✅ React Query funcțional, toast notifications active

---

#### ✅ **7. UI COMPONENTS MISSING**
**Componente shadcn/ui create pentru completitudine:**

**Fișiere create:**
- `components/ui/textarea.tsx` - Pentru câmp Observații
- `components/ui/form.tsx` - React Hook Form integration
- `components/ui/label.tsx` - Labels pentru inputs
- `components/ui/badge.tsx` - Pentru status parcele (Activ/Inactiv)

---

### 📊 **METRICI SESIUNE 12 FEBRUARIE:**

**Fișiere create/modificate:** ~20 fișiere  
**Erori critice rezolvate:** 7 majore  
**Timp total debugging:** ~3 ore  
**Timp implementare features:** ~1 oră  
**Rezultat:** Modul Parcele 100% funcțional ✅

---

## 🗂️ STRUCTURĂ PROIECT CURENTĂ

```
zmeurel/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── layout.tsx           ✅ Layout cu Providers
│   │   ├── providers.tsx        ✅ QueryClient + Toaster
│   │   └── parcele/
│   │       ├── page.tsx         ✅ Server component, fetch data
│   │       └── ParcelaPageClient.tsx  ✅ Client component, CRUD logic
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                      ✅ shadcn components (15 total)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx          ✅ FIX inline styles
│   │   ├── alert-dialog.tsx    ✅ FIX inline styles
│   │   ├── select.tsx          ✅ FIX background white
│   │   ├── input.tsx
│   │   ├── textarea.tsx        ✅ NEW
│   │   ├── form.tsx            ✅ NEW
│   │   ├── label.tsx           ✅ NEW
│   │   └── badge.tsx
│   └── parcele/
│       ├── ParcelaCard.tsx     ✅ Display parcele cu metrici
│       ├── AddParcelaDialog.tsx    ✅ Create parcele
│       ├── EditParcelaDialog.tsx   ✅ Update parcele
│       └── DeleteConfirmDialog.tsx ✅ Delete confirmation
├── lib/
│   ├── supabase/
│   │   ├── client.ts           ✅ Browser client (@supabase/ssr)
│   │   ├── server.ts           ✅ Server client (@supabase/ssr)
│   │   └── queries/
│   │       └── parcele.ts      ✅ CRUD functions cu debugging
│   └── utils.ts
├── .env.local                  ✅ Supabase credentials
├── package.json
└── tsconfig.json
```

---

## 🗄️ DATABASE SCHEMA (Supabase)

### **Tabele active:**

**1. tenants** - Multi-tenancy
- id (UUID, PK)
- nume_ferma (VARCHAR)
- owner_user_id (UUID, FK → auth.users)
- plan (VARCHAR: freemium/starter/pro)

**2. nomenclatoare** - Dropdown values ✅ POPULAT
- id (UUID, PK)
- tip (VARCHAR: 'Soi', 'Categorie_Investitie', etc.)
- valoare (VARCHAR)
- descriere (TEXT)
- **Constraint:** UNIQUE(tip, valoare)

**Date existente:**
- 5 soiuri: Polka, Tulameen, Heritage, Loch Ness, Chester ✅

**3. parcele** - Plantații ✅ CRUD FUNCȚIONAL
- id (UUID, PK)
- tenant_id (UUID, FK → tenants)
- id_parcela (VARCHAR: "P001", "P002"...) - auto-generated
- nume_parcela (VARCHAR)
- suprafata_m2 (DECIMAL)
- soi_plantat (VARCHAR)
- an_plantare (INTEGER)
- nr_plante (INTEGER)
- status (VARCHAR: Activ/Inactiv)
- observatii (TEXT)
- **RLS:** tenant_isolation policy ✅

**4-11. Alte tabele** (schema creată, nefolosite încă):
- culegatori
- recoltari
- clienti
- vanzari
- vanzari_butasi
- investitii
- activitati_agricole
- cheltuieli_diverse

---

## 🔐 AUTENTIFICARE ȘI SECURITATE

**Status:** ✅ Funcțional

**Setup:**
- Supabase Auth enabled
- Email/password authentication
- Row Level Security (RLS) policies active pe toate tabelele
- Tenant isolation: users văd doar datele tenant-ului lor

**Credențiale test:**
- Email: popa.andrei.sv@gmail.com
- Tenant ID: b68a19a7-c5fc-4f30-94a2-b3c17af68f76

**Policy example:**
```sql
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

## 🎨 DESIGN & UI

**Status:** Funcțional MVP (fără branding)

**Culori branded (de implementat în UI Polish):**
- Primary: #F16B6B (Bittersweet)
- Secondary: #312E3F (Charade)
- Background: #FFFFFF

**Font:** System fonts (Nunito/Quicksand pentru branded version)

**Componente UI:**
- shadcn/ui components (Tailwind CSS v4 alpha)
- Responsive design (mobile-first)
- Dialog overlays funcționale cu inline styles

---

## 📦 DEPENDINȚE INSTALATE

```json
{
  "dependencies": {
    "next": "16.1.6",
    "@supabase/ssr": "latest",
    "@tanstack/react-query": "^5.x",
    "react-hook-form": "^7.x",
    "zod": "^3.x",
    "@hookform/resolvers": "^3.x",
    "sonner": "^1.x",
    "lucide-react": "^0.x",
    "tailwindcss": "4.0.0-alpha",
    "class-variance-authority": "^0.7.x",
    "@radix-ui/react-label": "^2.x",
    "@radix-ui/react-slot": "^1.x",
    "@radix-ui/react-dialog": "^1.x",
    "@radix-ui/react-alert-dialog": "^1.x"
  }
}
```

---

## 🐛 ERORI REZOLVATE & LESSONS LEARNED

### **1. Tailwind v4 alpha + Next.js 15 Turbopack = Incompatibilități**

**Simptom:** Clase CSS nu se renderizează (opacity slash notation, backgrounds)

**Soluție:** Style inline cu `style={{ ... }}` override Tailwind când eșuează

**Aplicat în:** dialog.tsx, alert-dialog.tsx, select.tsx

---

### **2. Import paths în folder structures**

**Greșit:** `import from './client'` din `queries/parcele.ts`  
**Corect:** `import from '../client'` (un nivel sus)

**Lesson:** Verifică ÎNTOTDEAUNA filepath relative când ai subfolders

---

### **3. Supabase @supabase/ssr vs @supabase/supabase-js**

**Next.js 15 necesită:** `@supabase/ssr` pentru Server/Client Components separation

**Metode:**
- Browser: `createBrowserClient()`
- Server: `createServerClient()` cu cookies handler

---

### **4. React Hook Form + Zod validation types**

**Problemă:** TypeScript errors cu `z.coerce.number()` → form expects string

**Soluție:** Schema cu strings, conversie la submit:
```tsx
const schema = z.object({
  suprafata_m2: z.string().min(1),  // Form = string
});

const onSubmit = (data) => {
  createParcela({
    suprafata_m2: Number(data.suprafata_m2),  // DB = number
  });
};
```

---

### **5. Server vs Client hydration mismatches**

**Cauze comune:**
- `toLocaleString()` formatează diferit server/client
- `Date.now()` diferă între renders
- Condiții `typeof window !== 'undefined'`

**Soluție:** Evită formatări locale în SSR, folosește valori plain

---

### **6. QueryClient trebuie wrappat în Provider**

**Eroare:** `No QueryClient set, use QueryClientProvider`

**Soluție:** Layout component (client) cu Providers wrapper

```tsx
'use client';
function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient());
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

---

### **7. SQL constraint errors - ON CONFLICT**

**Eroare:** `ERROR: 42P10: there is no unique or exclusion constraint matching the ON CONFLICT`

**Cauză:** UNIQUE constraint lipsește din schema

**Soluție:** 
- Verifică constraints cu `\d table_name` în psql
- SAU folosește INSERT simplu fără ON CONFLICT
- SAU adaugă constraint înainte: `ALTER TABLE ... ADD CONSTRAINT UNIQUE(...)`

---

## 🎯 NEXT STEPS (După backup)

### **Prioritate 1: Module CRUD simple**
- [ ] **Clienți** (nume, telefon, email, preț_negociat)
- [ ] **Culegători** (nume, telefon, tip_angajare, tarif_lei_kg)

**Pattern:** Copy-paste Parcele module, adaptează fields

---

### **Prioritate 2: Module complexe**
- [ ] **Recoltări** (data, culegător, parcelă, cantitate, calcule)
- [ ] **Vânzări** (data, client, cantitate, preț, status_plată)
- [ ] **Activități Agricole** (tratamente, fertilizări, TIMP PAUZĂ)

---

### **Prioritate 3: Dashboard**
- [ ] KPI cards (venituri, cheltuieli, profit, recoltare astăzi)
- [ ] Grafice (producție zilnică, distribuție cheltuieli)
- [ ] Alerte (timp pauză tratamente)

---

### **Prioritate 4: UI Polish**
- [ ] Branded colors (#F16B6B, #312E3F)
- [ ] Navigare între module
- [ ] Header cu logo Zmeurel 🍓
- [ ] Animații, transitions
- [ ] Empty states (ilustrații când nu există date)

---

### **Prioritate 5: Features avansate**
- [ ] PWA (offline mode, service workers)
- [ ] Upload facturi PDF (Supabase Storage)
- [ ] Export rapoarte (PDF, Excel)
- [ ] Multi-user (roles: admin, operator)

---

## 📞 SUPPORT & DEBUGGING

**Când blochezi:**
1. Verifică Console (F12) → tab Console
2. Verifică Terminal (unde rulează `npm run dev`)
3. Screenshot-uri pentru erori
4. Copy-paste error message exact

**Tools create pentru debugging:**
- `app/test-supabase/page.tsx` - Test conexiune Supabase (5 teste)
- Console.log în toate funcțiile queries
- DevTools pentru React components

---

## 🏆 ACHIEVEMENTS SESIUNE 12 FEBRUARIE

✅ Modul Parcele 100% funcțional  
✅ Supabase connection stable (@supabase/ssr)  
✅ Dialog system functional (backdrop fix)  
✅ Native selects working (Tailwind v4 workaround)  
✅ Delete/Edit operations smooth  
✅ Auto-generated IDs (P001, P002...)  
✅ Calculated fields (densitate, vârstă)  
✅ Multi-tenant architecture active  
✅ RLS policies protecting data  

**Progres general:** 35% → 40% MVP ⬆️

---

**NEXT SESSION: Module CRUD simple (Clienți/Culegători)** 🚀

---

## 📝 NOTES FINALE

**Ce merge excelent:**
- Pattern CRUD din Parcele e reutilizabil pentru alte module
- Supabase queries sunt rapide și fiabile
- React Query invalidation funcționează perfect
- TypeScript catching errors early

**Ce necesită atenție:**
- Tailwind v4 alpha instabil → folosim inline styles când e nevoie
- Radix UI components pot avea issues → fallback la native HTML
- Import paths în folder structures → verifică întotdeauna
- SQL schema changes → testează mai întâi în SQL Editor

**Lecții cheie:**
- Debug sistematic (Console + Terminal + DevTools)
- Testează după FIECARE schimbare
- Git commit frecvent (după fiecare feature funcțional)
- Documentează erorile și soluțiile

---

**Zmeurel OS - De la idee la realitate!** 🍓💻✨
