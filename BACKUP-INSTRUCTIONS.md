# 💾 BACKUP ZMEUREL OS - Instrucțiuni Complete

**Data:** 12 Februarie 2026  
**Status proiect:** Modul Parcele 100% funcțional  

---

## 📂 FIȘIERE CRITICE (DE SALVAT OBLIGATORIU)

### **1. Environment Variables**
```
.env.local
```
**⚠️ ATENȚIE:** Conține credențiale Supabase - NU pune pe GitHub public!

---

### **2. Supabase Configuration**
```
lib/supabase/
├── client.ts        ← Browser client (@supabase/ssr)
├── server.ts        ← Server client (@supabase/ssr)
└── queries/
    └── parcele.ts   ← CRUD operations cu debugging
```

---

### **3. Modul Parcele (100% funcțional)**
```
app/(dashboard)/
├── layout.tsx           ← Dashboard layout cu Providers
├── providers.tsx        ← QueryClient + Toaster setup
└── parcele/
    ├── page.tsx         ← Server component, data fetching
    └── ParcelaPageClient.tsx  ← Client component, UI logic

components/parcele/
├── ParcelaCard.tsx      ← Display card cu metrici
├── AddParcelaDialog.tsx ← Create dialog
├── EditParcelaDialog.tsx ← Update dialog
└── DeleteConfirmDialog.tsx ← Delete confirmation
```

---

### **4. UI Components (shadcn/ui customizate)**
```
components/ui/
├── dialog.tsx           ← FIX inline styles pentru backdrop
├── alert-dialog.tsx     ← FIX inline styles
├── select.tsx           ← FIX background white
├── button.tsx
├── card.tsx
├── input.tsx
├── textarea.tsx         ← NEW pentru Observații
├── form.tsx             ← NEW pentru React Hook Form
├── label.tsx            ← NEW pentru form labels
└── badge.tsx            ← Pentru status (Activ/Inactiv)
```

---

### **5. Configuration Files**
```
package.json             ← Dependințe (IMPORTANT!)
tsconfig.json
next.config.js
tailwind.config.ts
.gitignore
```

---

### **6. Documentație**
```
PROGRES.md              ← Acest fișier (tracking progres)
README.md               ← Instrucțiuni quick start
```

---

## 🗄️ DATABASE BACKUP (Supabase)

### **Schema SQL de salvat:**

**Tabele:**
- tenants
- nomenclatoare
- parcele
- culegatori, recoltari, clienti, vanzari, vanzari_butasi
- investitii, activitati_agricole, cheltuieli_diverse

### **Cum să faci backup SQL din Supabase:**

1. Mergi la https://supabase.com/dashboard
2. Selectează project **zmeurel-os**
3. **Database** → **Backups** (sidebar)
4. Click **Download backup** (cel mai recent)

**SAU** export manual cu SQL:

```sql
-- Export nomenclatoare (soiuri importante!)
COPY (SELECT * FROM nomenclatoare WHERE tip = 'Soi') 
TO '/tmp/nomenclatoare_soiuri.csv' 
WITH CSV HEADER;

-- Export parcele
COPY (SELECT * FROM parcele) 
TO '/tmp/parcele_backup.csv' 
WITH CSV HEADER;
```

**Salvează:**
- `nomenclatoare_soiuri.csv` - Soiurile (Polka, Tulameen, etc.)
- `parcele_backup.csv` - Toate parcelele

---

## 💻 GIT BACKUP (GitHub)

### **PASUL 1: Verifică status**

```bash
cd C:\Users\Andrei\Desktop\zmeurel

git status
```

**Ar trebui să vezi fișierele modificate:**
- `lib/supabase/client.ts` (NEW)
- `lib/supabase/server.ts` (NEW)
- `lib/supabase/queries/parcele.ts` (MODIFIED)
- `app/(dashboard)/layout.tsx` (NEW)
- `app/(dashboard)/providers.tsx` (NEW)
- `components/ui/dialog.tsx` (MODIFIED)
- `components/parcele/AddParcelaDialog.tsx` (MODIFIED)
- etc.

---

### **PASUL 2: Adaugă toate fișierele**

```bash
git add .
```

**⚠️ Verifică .gitignore exclude .env.local:**

```bash
# .gitignore ar trebui să conțină:
.env.local
.env*.local
node_modules/
.next/
```

---

### **PASUL 3: Commit cu mesaj descriptiv**

```bash
git commit -m "✅ Modul Parcele 100% funcțional - Sesiunea 12 Feb 2026

FEATURES:
- CRUD complet parcele (Create, Read, Update, Delete)
- Auto-generated IDs (P001, P002...)
- Dropdown soiuri funcțional (5 soiuri)
- Calcule automate (densitate, vârstă plantație)
- Delete confirmation dialog

FIXES:
- Supabase connection cu @supabase/ssr (Next.js 15 compatible)
- Dialog backdrop cu inline styles (Tailwind v4 alpha fix)
- Dropdown native select (Radix UI workaround)
- Hydration errors (eliminat toLocaleString)
- QueryClient Provider setup
- Import paths în queries/parcele.ts

TECH STACK:
- Next.js 16.1.6 (Turbopack)
- Supabase (@supabase/ssr)
- React Query (TanStack Query v5)
- shadcn/ui + Tailwind CSS v4 alpha
- TypeScript + Zod validation

STATUS: ~40% MVP complet"
```

---

### **PASUL 4: Push la GitHub**

```bash
git push origin main
```

**Dacă e prima oară sau branch nou:**

```bash
git branch -M main
git remote add origin https://github.com/zmeurelOS-admin/zmeurel-os.git
git push -u origin main
```

---

### **PASUL 5: Verifică pe GitHub**

Mergi la: https://github.com/zmeurelOS-admin/zmeurel-os

**Ar trebui să vezi:**
- Commit-ul nou cu mesajul
- Toate fișierele actualizate
- **NU** ar trebui să vezi `.env.local` (exclus prin .gitignore)

---

## 📦 BACKUP LOCAL (ZIP arhivă)

### **Windows File Explorer:**

1. Deschide `C:\Users\Andrei\Desktop`
2. Click dreapta pe folder `zmeurel`
3. **Send to** → **Compressed (zipped) folder**
4. Redenumește: `zmeurel-backup-12feb2026.zip`
5. Copiază pe USB / Google Drive / OneDrive

**SAU Command Prompt:**

```bash
cd C:\Users\Andrei\Desktop

# Arhivează cu WinRAR (dacă e instalat):
"C:\Program Files\WinRAR\WinRAR.exe" a -r zmeurel-backup-12feb2026.rar zmeurel

# SAU arhivează cu 7-Zip (dacă e instalat):
"C:\Program Files\7-Zip\7z.exe" a -tzip zmeurel-backup-12feb2026.zip zmeurel
```

---

## ☁️ CLOUD BACKUP (Google Drive / OneDrive)

### **Google Drive:**

1. Mergi la https://drive.google.com
2. **New** → **Folder upload**
3. Selectează `C:\Users\Andrei\Desktop\zmeurel`
4. **Upload**

**Folder structure în Drive:**
```
Zmeurel OS Backups/
└── 2026-02-12-modul-parcele-complete/
    ├── zmeurel/ (tot proiectul)
    └── PROGRES.md
```

---

### **OneDrive:**

Dacă ai OneDrive sync:

1. Copiază folder `zmeurel` în `C:\Users\Andrei\OneDrive\`
2. Așteaptă sync automat
3. Verifică pe https://onedrive.live.com

---

## 🔐 BACKUP CREDENȚIALE (SECURIZAT!)

### **Supabase Credentials:**

**⚠️ NU pune pe GitHub public!**

**Salvează într-un fișier SECURIZAT (Password Manager sau fisier local criptat):**

```
ZMEUREL OS - Supabase Credentials
==================================

Project URL: https://ilybohhdeplwcrbpblqw.supabase.co
Anon/Public Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Database Password: [password_aici]

Email login: popa.andrei.sv@gmail.com
Tenant ID: b68a19a7-c5fc-4f30-94a2-b3c17af68f76
```

**Opțiuni salvare securizată:**
1. **LastPass / 1Password / Bitwarden** (Password Manager)
2. **VeraCrypt** encrypted volume
3. **Windows Credential Manager** (Control Panel → Credential Manager)
4. **Excel file** cu parolă (Save As → Tools → General Options → Password)

---

## ✅ CHECKLIST BACKUP COMPLET

**VERIFICĂ:**

- [ ] Git commit cu mesaj descriptiv
- [ ] Git push la GitHub (verificat în browser)
- [ ] .env.local salvat separat (SECURIZAT)
- [ ] ZIP arhivă locală (`zmeurel-backup-12feb2026.zip`)
- [ ] Cloud backup (Google Drive / OneDrive)
- [ ] Database backup din Supabase (Download backup)
- [ ] PROGRES.md actualizat
- [ ] Credențiale salvate în Password Manager

---

## 🔄 RESTORE DIN BACKUP (Când e nevoie)

### **Scenariul 1: Proiect șters accidental**

```bash
# Clone din GitHub:
git clone https://github.com/zmeurelOS-admin/zmeurel-os.git
cd zmeurel-os

# Instalează dependințe:
npm install

# Creează .env.local cu credențiale salvate (din Password Manager)
# Copiază:
NEXT_PUBLIC_SUPABASE_URL=https://ilybohhdeplwcrbpblqw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# Rulează:
npm run dev
```

---

### **Scenariul 2: Database șters**

1. Mergi la Supabase Dashboard → Database → Backups
2. Click **Restore** pe backup-ul dorit
3. Confirm restore

**SAU** import manual CSV:

```sql
-- În SQL Editor:
COPY nomenclatoare(id, tip, valoare, descriere)
FROM '/path/to/nomenclatoare_soiuri.csv'
WITH CSV HEADER;
```

---

### **Scenariul 3: Fișier corupt**

1. Găsește commit-ul bun pe GitHub
2. Click pe fișier → **History**
3. Găsește versiunea funcțională
4. **Copy raw contents**
5. Înlocuiește în proiect

**SAU** revert commit:

```bash
git log  # Găsește commit ID bun
git checkout <commit-id> -- lib/supabase/client.ts
git commit -m "Revert client.ts la versiune funcțională"
```

---

## 📊 BACKUP SCHEDULE (Recomandare)

**După fiecare sesiune dezvoltare:**
- ✅ Git commit + push
- ✅ Actualizează PROGRES.md

**Săptămânal:**
- ✅ Database backup din Supabase
- ✅ ZIP arhivă locală

**Lunar:**
- ✅ Cloud backup complet (Google Drive)
- ✅ Test restore (verifică că backup-ul merge)

---

## 🆘 RECOVERY ÎN CAZ DE URGENȚĂ

**Dacă TOTUL e pierdut (laptop furat/stricat):**

1. **GitHub** → Clone proiect
2. **Password Manager** → Recuperează credențiale Supabase
3. **Supabase** → Restore database din backup
4. **npm install** → Reinstalează dependințe
5. **npm run dev** → Aplicația ar trebui să meargă

**Timp estimat recovery:** 30 minute (dacă ai backup-urile corecte)

---

**BACKUP = LINIȘTE SUFLETEASCĂ!** 💾✅

Nu mai pierzi niciodată munca! 🚀
