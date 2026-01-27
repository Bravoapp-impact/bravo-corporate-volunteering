
# Panoramica Completa: Refactoring per Componenti Riutilizzabili

## Analisi della Duplicazione di Codice

Dopo aver esaminato l'intera codebase, ho identificato **7 aree principali** dove esistono pattern duplicati che possono essere consolidati in componenti riutilizzabili.

---

## 1. Profile Edit Form (Priorita ALTA)

### Duplicazione Trovata
Quattro file condividono circa l'80% dello stesso codice:
- `src/pages/Profile.tsx` (Employee)
- `src/pages/super-admin/SuperAdminProfile.tsx`
- `src/pages/hr/HRProfile.tsx`
- `src/pages/association/AssociationAdminProfile.tsx`

### Codice Duplicato
- Schema Zod identico per validazione nome/cognome
- Stesso stato React (firstName, lastName, saving, errors)
- Stessa logica `handleSave` per aggiornamento profilo
- Stesso form UI con Input per nome/cognome
- Stesso bottone "Salva modifiche" con stato loading

### Soluzione Proposta
Creare `ProfileEditForm.tsx`:

```text
src/components/profile/ProfileEditForm.tsx
Props:
  - profile: Profile
  - onSave: () => void
  - cardClassName?: string (per stili admin vs employee)
```

### Riduzione Stimata
~120 righe di codice per file = ~360 righe totali risparmiate

---

## 2. Admin Layout Parametrizzato (Priorita MEDIA-ALTA)

### Duplicazione Trovata
Tre layout condividono il 90% della struttura:
- `src/components/layout/SuperAdminLayout.tsx` (256 righe)
- `src/components/layout/HRLayout.tsx` (246 righe)
- `src/components/layout/AssociationLayout.tsx` (224 righe)

### Codice Duplicato
- Struttura sidebar identica (mobile overlay, scroll area, user section)
- Logica `isActive()` per evidenziare route corrente
- User dropdown con avatar, profilo link e logout
- Mobile header con hamburger menu
- Funzione `getInitials()` identica

### Soluzione Proposta
Creare `AdminLayout.tsx` parametrizzato:

```text
src/components/layout/AdminLayout.tsx
Props:
  - sidebarItems: { label, icon, href }[]
  - badgeLabel: string (es. "Super Admin", "HR Admin")
  - profilePath: string (es. "/super-admin/profile")
  - basePath: string (es. "/super-admin")
  - showCompanyLogo?: boolean
  - showAssociationBadge?: boolean
  - children: ReactNode
```

I tre layout esistenti diventerebbero wrapper sottili:

```text
// SuperAdminLayout.tsx
export function SuperAdminLayout({ children }) {
  return (
    <AdminLayout
      sidebarItems={superAdminItems}
      badgeLabel="Super Admin"
      profilePath="/super-admin/profile"
      basePath="/super-admin"
    >
      {children}
    </AdminLayout>
  );
}
```

### Riduzione Stimata
~500 righe consolidate in ~300 righe = ~200 righe risparmiate

---

## 3. Page Header Component (Priorita MEDIA)

### Duplicazione Trovata
Ogni pagina admin ripete lo stesso pattern header:

```text
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Titolo</h1>
  <p className="text-muted-foreground mt-1">Descrizione</p>
</motion.div>
```

Trovato in: SuperAdminDashboard, HRDashboard, AssociationDashboard, CompaniesPage, UsersPage, AssociationsPage, Profile pages, etc.

### Soluzione Proposta
Creare `PageHeader.tsx`:

```text
src/components/common/PageHeader.tsx
Props:
  - title: string
  - description?: string
  - actions?: ReactNode (bottoni come "Nuova Azienda")
```

---

## 4. Metric Card Component (Priorita MEDIA)

### Duplicazione Trovata
Pattern identico in:
- `src/pages/super-admin/SuperAdminDashboard.tsx` (statCards array)
- `src/components/hr/MetricsCards.tsx`

### Pattern Comune
- Card con icona, valore numerico, label
- Animazione Framer Motion con delay progressivo
- Stili `bg-card/80 backdrop-blur-sm`
- Icona con colore e background personalizzati

### Soluzione Proposta
Creare `MetricCard.tsx`:

```text
src/components/common/MetricCard.tsx
Props:
  - label: string
  - value: string | number
  - icon: LucideIcon
  - iconColor: string
  - iconBgColor: string
  - subLabel?: string
  - animationDelay?: number
```

---

## 5. Empty State Component (Priorita MEDIA)

### Duplicazione Trovata
Pattern ripetuto in:
- `Experiences.tsx`: "Nessuna esperienza trovata"
- `AssociationDashboard.tsx`: "Nessuna data in programma" con CalendarX icon
- Tabelle CRUD: "Nessuna azienda/utente/associazione trovata"

### Soluzione Proposta
Creare `EmptyState.tsx`:

```text
src/components/common/EmptyState.tsx
Props:
  - icon?: LucideIcon | string (emoji)
  - title: string
  - description?: string
  - action?: ReactNode (bottone opzionale)
```

---

## 6. Loading State Component (Priorita BASSA)

### Duplicazione Trovata
Pattern identico in almeno 10 file:

```text
<div className="flex items-center justify-center min-h-[60vh]">
  <div className="flex flex-col items-center gap-4">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    <p className="text-muted-foreground">Caricamento...</p>
  </div>
</div>
```

### Soluzione Proposta
Creare `LoadingState.tsx`:

```text
src/components/common/LoadingState.tsx
Props:
  - message?: string (default: "Caricamento...")
  - fullHeight?: boolean
```

---

## 7. CRUD Table Pattern (Priorita BASSA - Complesso)

### Duplicazione Trovata
Pagine con pattern CRUD simile:
- `CompaniesPage.tsx`
- `UsersPage.tsx`
- `AssociationsPage.tsx`
- `CitiesPage.tsx`
- `CategoriesPage.tsx`

### Pattern Comune
- Card con titolo "N Entita"
- Barra ricerca con icona Search
- Filtri Select opzionali
- Tabella con TableHeader, TableBody
- Dialog per Create/Edit
- AlertDialog per Delete confirmation

### Valutazione
Questa e' la duplicazione piu' complessa da astrarre perche' ogni tabella ha colonne e campi form diversi. Richiede un approccio piu' sofisticato (es. composable patterns o generics).

**Consiglio**: Rimandare a fase successiva e concentrarsi prima sui componenti 1-6.

---

## Riepilogo Priorita

| # | Componente | Priorita | Righe Risparmiate | Complessita |
|---|------------|----------|-------------------|-------------|
| 1 | ProfileEditForm | ALTA | ~360 | Bassa |
| 2 | AdminLayout | MEDIA-ALTA | ~200 | Media |
| 3 | PageHeader | MEDIA | ~100 | Bassa |
| 4 | MetricCard | MEDIA | ~80 | Bassa |
| 5 | EmptyState | MEDIA | ~60 | Bassa |
| 6 | LoadingState | BASSA | ~40 | Bassa |
| 7 | CRUD Table | BASSA | ~500+ | Alta |

---

## Piano di Implementazione Consigliato

### Fase 1 (Quick Wins)
1. `ProfileEditForm` - Massimo impatto, minima complessita
2. `PageHeader` - Semplicissimo, usato ovunque
3. `LoadingState` - Semplicissimo, usato ovunque

### Fase 2 (Strutturali)
4. `AdminLayout` parametrizzato - Richiede test accurati
5. `MetricCard` - Richiede refactor dashboard

### Fase 3 (Nice to Have)
6. `EmptyState`
7. CRUD Table patterns (valutazione futura)

---

## Note Tecniche

Tutti i nuovi componenti dovrebbero:
- Risiedere in `src/components/common/` o `src/components/profile/`
- Supportare props `className` per override stili
- Usare Framer Motion per animazioni consistenti
- Seguire il design system esistente (docs/design-system.md)
