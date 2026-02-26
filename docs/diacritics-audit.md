# Diacritics Audit (Romanian UI)

Scope: `src/**/*.ts`, `src/**/*.tsx`, `src/**/*.mdx` (UI-visible text only).
Mode: conservative; no DB keys/routes/query keys/enum values changed.

## Summary
- SAFE UI TEXT found: 64
- SAFE UI TEXT patched in this pass: 52
- REVIEW NEEDED (ambiguous/context-sensitive): 12

## SAFE UI TEXT (patched in this pass)

| File | Line | Original snippet | Suggested/Applied | Class |
|---|---:|---|---|---|
| src/app/(auth)/login/page.tsx | 57 | `Email sau parola incorecta.` | `Email sau parolă incorectă.` | SAFE UI TEXT |
| src/app/(auth)/login/page.tsx | 81 | `Parola trebuie sa aiba minim 8 caractere.` | `Parola trebuie să aibă minim 8 caractere.` | SAFE UI TEXT |
| src/app/(auth)/login/page.tsx | 106 | `Verifica emailul pentru confirmare.` | `Verifică emailul pentru confirmare.` | SAFE UI TEXT |
| src/app/(auth)/login/page.tsx | 115 | `Autentificare si creare cont fermier` | `Autentificare și creare cont fermier` | SAFE UI TEXT |
| src/app/(auth)/login/page.tsx | 119 | `Verificare email in asteptare...` | `Verificare email în așteptare...` | SAFE UI TEXT |
| src/app/(auth)/login/page.tsx | 125 | `Creeaza cont` | `Creează cont` | SAFE UI TEXT |
| src/app/(auth)/login/page.tsx | 147 | `Parola` | `Parolă` | SAFE UI TEXT |
| src/app/(auth)/login/page.tsx | 166 | `Se autentifica...` | `Se autentifică...` | SAFE UI TEXT |
| src/app/(auth)/login/page.tsx | 166 | `Intra in cont` | `Intră în cont` | SAFE UI TEXT |
| src/app/(auth)/login/page.tsx | 188 | `Nume ferma` | `Nume fermă` | SAFE UI TEXT |
| src/app/(auth)/login/page.tsx | 205 | `Confirma parola` | `Confirmă parola` | SAFE UI TEXT |
| src/app/(auth)/login/page.tsx | 210 | `Repeta parola` | `Repetă parola` | SAFE UI TEXT |
| src/app/(auth)/update-password/page.tsx | 23 | `Parola trebuie sa aiba...` | `Parola trebuie să aibă...` | SAFE UI TEXT |
| src/app/(auth)/update-password/page.tsx | 41 | `Parola a fost actualizata.` | `Parola a fost actualizată.` | SAFE UI TEXT |
| src/app/(auth)/update-password/page.tsx | 47 | `Actualizare parola` | `Actualizare parolă` | SAFE UI TEXT |
| src/app/(auth)/update-password/page.tsx | 48 | `Seteaza o parola noua...` | `Setează o parolă nouă...` | SAFE UI TEXT |
| src/app/(auth)/update-password/page.tsx | 53 | `Parola noua` | `Parolă nouă` | SAFE UI TEXT |
| src/app/(auth)/update-password/page.tsx | 64 | `Confirma parola` | `Confirmă parola` | SAFE UI TEXT |
| src/app/(auth)/update-password/page.tsx | 69 | `Repeta parola` | `Repetă parola` | SAFE UI TEXT |
| src/app/(auth)/update-password/page.tsx | 76 | `Se actualizeaza...` | `Se actualizează...` | SAFE UI TEXT |
| src/app/(auth)/update-password/page.tsx | 76 | `Salveaza parola` | `Salvează parola` | SAFE UI TEXT |
| src/app/(auth)/reset-password-request/page.tsx | 44 | `Resetare parola` | `Resetare parolă` | SAFE UI TEXT |
| src/app/(auth)/reset-password-request/page.tsx | 45 | `Primeste pe email...` | `Primește pe email...` | SAFE UI TEXT |
| src/app/(auth)/reset-password-request/page.tsx | 49 | `Daca adresa exista...` | `Dacă adresa există...` | SAFE UI TEXT |
| src/app/(auth)/reset-password-request/page.tsx | 76 | `Inapoi la login` | `Înapoi la login` | SAFE UI TEXT |
| src/app/(dashboard)/settings/page.tsx | 56 | `Parola trebuie sa aiba...` | `Parola trebuie să aibă...` | SAFE UI TEXT |
| src/app/(dashboard)/settings/page.tsx | 205 | `Cont & Setari` | `Cont & Setări` | SAFE UI TEXT |
| src/app/(dashboard)/settings/page.tsx | 205 | `si preferinte UI` | `și preferințe UI` | SAFE UI TEXT |
| src/app/(dashboard)/settings/page.tsx | 221 | `Schimba parola` | `Schimbă parola` | SAFE UI TEXT |
| src/app/(dashboard)/settings/page.tsx | 287 | `Schimba ferma` | `Schimbă fermă` | SAFE UI TEXT |
| src/app/(dashboard)/settings/page.tsx | 322 | `Anuleaza` | `Anulează` | SAFE UI TEXT |
| src/app/(dashboard)/settings/page.tsx | 330 | `Salveaza` | `Salvează` | SAFE UI TEXT |
| src/components/layout/Sidebar.tsx | 31 | `OPERATIUNI` | `OPERAȚIUNI` | SAFE UI TEXT |
| src/components/layout/Sidebar.tsx | 37 | `Recoltari` | `Recoltări` | SAFE UI TEXT |
| src/components/layout/Sidebar.tsx | 39 | `Activitati Agricole` | `Activități Agricole` | SAFE UI TEXT |
| src/components/layout/Sidebar.tsx | 43 | `RELATII` | `RELAȚII` | SAFE UI TEXT |
| src/components/layout/Sidebar.tsx | 45 | `Culegatori` | `Culegători` | SAFE UI TEXT |
| src/components/layout/Sidebar.tsx | 46 | `Clienti` | `Clienți` | SAFE UI TEXT |
| src/components/layout/Sidebar.tsx | 52 | `Vanzari Fructe` | `Vânzări Fructe` | SAFE UI TEXT |
| src/components/layout/Sidebar.tsx | 53 | `Vanzari Butasi` | `Vânzări Butași` | SAFE UI TEXT |
| src/components/layout/Sidebar.tsx | 54 | `Investitii` | `Investiții` | SAFE UI TEXT |
| src/components/app/BottomTabBar.tsx | 10 | `Activitati` | `Activități` | SAFE UI TEXT |
| src/components/app/BottomTabBar.tsx | 13 | `Vanzari` | `Vânzări` | SAFE UI TEXT |
| src/components/app/BottomTabBar.tsx | 14 | `Recoltari` | `Recoltări` | SAFE UI TEXT |
| src/components/app/BottomTabBar.tsx | 26 | `Navigare principala` | `Navigare principală` | SAFE UI TEXT |
| src/components/app/MoreMenuDrawer.tsx | 43 | `Operatiuni` | `Operațiuni` | SAFE UI TEXT |
| src/components/app/MoreMenuDrawer.tsx | 48 | `Vanzari butasi` | `Vânzări butași` | SAFE UI TEXT |
| src/components/app/MoreMenuDrawer.tsx | 54 | `Clienti` | `Clienți` | SAFE UI TEXT |
| src/components/app/MoreMenuDrawer.tsx | 55 | `Culegatori` | `Culegători` | SAFE UI TEXT |
| src/components/app/MoreMenuDrawer.tsx | 144 | `Cont & Setari` | `Cont & Setări` | SAFE UI TEXT |
| src/components/app/TopBar.tsx | 49 | `Schimba ferma` | `Schimbă fermă` | SAFE UI TEXT |
| src/components/app/FarmSwitcher.tsx | 14 | `Ferma curenta` | `Ferma curentă` | SAFE UI TEXT |
| src/components/app/FarmSwitcher.tsx | 58 | `Schimba ferma` | `Schimbă fermă` | SAFE UI TEXT |
| src/components/app/FarmSwitcher.tsx | 69 | `Ferma activa` | `Ferma activă` | SAFE UI TEXT |
| src/components/app/ConfirmDeleteDialog.tsx | 28 | `Confirmi stergerea?` | `Confirmi ștergerea?` | SAFE UI TEXT |
| src/components/app/ConfirmDeleteDialog.tsx | 29 | `Sterge` | `Șterge` | SAFE UI TEXT |
| src/components/app/ConfirmDeleteDialog.tsx | 30 | `Anuleaza` | `Anulează` | SAFE UI TEXT |
| src/components/app/CompactListCard.tsx | 44 | `Editeaza` | `Editează` | SAFE UI TEXT |
| src/components/app/CompactListCard.tsx | 56 | `Sterge` | `Șterge` | SAFE UI TEXT |
| src/app/(dashboard)/vanzari/VanzariPageClient.tsx | 142 | `Vanzari Fructe` | `Vânzări Fructe` | SAFE UI TEXT |
| src/app/(dashboard)/recoltari/RecoltariPageClient.tsx | 103 | `Recoltari` | `Recoltări` | SAFE UI TEXT |
| src/app/(dashboard)/clienti/ClientPageClient.tsx | 150 | `Clienti` | `Clienți` | SAFE UI TEXT |
| src/app/(dashboard)/vanzari-butasi/VanzariButasiPageClient.tsx | 122 | `Vanzari Butasi` | `Vânzări Butași` | SAFE UI TEXT |
| src/components/admin/AnalyticsDashboard.tsx | 111 | `Recoltari / Vanzari` | `Recoltări / Vânzări` | SAFE UI TEXT |

## REVIEW NEEDED (do not auto-change yet)

| File | Line | Original snippet | Suggested diacritics | Class |
|---|---:|---|---|---|
| src/components/vanzari-butasi/VanzareButasiCard.tsx | 28 | `Anulata` | `Anulată` | REVIEW NEEDED |
| src/components/vanzari-butasi/EditVanzareButasiDialog.tsx | 47 | `Anulata` | `Anulată` | REVIEW NEEDED |
| src/components/vanzari-butasi/AddVanzareButasiDialog.tsx | 39 | `Anulata` | `Anulată` | REVIEW NEEDED |
| src/components/parcele/ParcelaForm.tsx | 151 | `Selecteaza mai intai tipul culturii` | `Selectează mai întâi tipul culturii` | REVIEW NEEDED |
| src/components/parcele/ParcelaForm.tsx | 199 | `In Pregatire` | `În pregătire` | REVIEW NEEDED (may be persisted enum value) |
| src/components/parcele/EditParcelaDialog.tsx | 168 | `In Pregatire` | `În pregătire` | REVIEW NEEDED (may be persisted enum value) |
| src/components/parcele/ParcelePageClient.tsx | 336 | `Inchide` | `Închide` | REVIEW NEEDED (button only, but verify translation consistency) |
| src/components/admin/AdminTenantsPlanTable.tsx | 169 | `Schimba plan` | `Schimbă plan` | REVIEW NEEDED (simple UI, safe likely) |
| src/app/(dashboard)/rapoarte/RapoartePageClient.tsx | 500 | `Vanzari per client` | `Vânzări per client` | REVIEW NEEDED (report key display coupling) |
| src/components/app/LoadingState.tsx | 10 | `Se incarca...` | `Se încarcă...` | REVIEW NEEDED (global default copy) |
| src/lib/ui/delete-labels.ts | multiple | `selectata / stearsa` forms | `selectată / ștearsă` etc. | REVIEW NEEDED (used by multiple contexts) |
| src/components/parcele/ParceleList.tsx | 70 | `Nu exista stropiri active...` | `Nu există stropiri active...` | REVIEW NEEDED |

## Notes
- No replacements were applied in `supabase/` migrations or SQL files.
- No route segments, query keys, status codes, enum values, DB field names were intentionally changed.
- Romanian comma diacritics used: `ș`, `ț` (not `ş`, `ţ`).
- Font support check: current app uses Inter (`next/font/google`), which supports Romanian diacritics.
