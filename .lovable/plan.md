
# Piano: Design System Unificato per Aree Admin

## Obiettivo
Creare una struttura coerente e un design system unificato per tutte le pagine admin (Super Admin, HR Admin, Association Admin), basandosi sull'attuale implementazione del Super Admin come riferimento principale.

---

## Analisi delle Inconsistenze Trovate

### 1. Layout Sidebar
| Layout | Problema |
|--------|----------|
| SuperAdminLayout | Logo come testo, badge semplice |
| HRLayout | Logo come immagine, badge con border-bottom |
| AssociationLayout | Avatar con nome, badge variant diverso |

### 2. Struttura Header Pagine
- Spacing inconsistente (`space-y-6` vs `space-y-8`)
- Animazioni diverse (`y: -10` vs `y: -20`)
- Titoli con dimensioni diverse (`text-2xl sm:text-3xl` vs `text-3xl`)

### 3. Stile Card e Contenitori
- Alcune usano `bg-card/80 backdrop-blur-sm`
- Altre usano Card senza classi aggiuntive
- Inconsistenza nel bordo: `border-border/50` vs default

---

## Soluzione: Template Unificato

### A. Layout Admin Standardizzato

Creare un componente base `AdminLayoutBase` che tutti i layout admin estendono:

```text
AdminLayoutBase
├── Sidebar
│   ├── Header (h-16): Logo Bravo! + Close button mobile
│   ├── Identity Badge (p-4): Badge ruolo/entità centrato
│   ├── Navigation (ScrollArea): Menu items
│   └── User Footer (fixed bottom): Dropdown utente
├── Mobile Header (sticky, h-16): Hamburger + Logo + Badge
└── Main Content (p-4 sm:p-6 lg:p-8)
```

**Regole Layout:**
- Sidebar: `w-64`, `bg-card/95 backdrop-blur-md`, `border-r border-border/50`
- Header sidebar: `h-16`, Logo sempre come immagine (`bravoLogo`)
- Badge identità: `bg-primary/10 text-primary`, centrato, `py-1.5`
- Navigazione: `space-y-1`, item attivo `bg-primary text-primary-foreground`
- ScrollArea: `h-[calc(100vh-12rem)]` per dare spazio a header e footer

### B. Struttura Pagina Standard

Ogni pagina admin segue questo template:

```text
<Layout>
  <div className="space-y-6">
    
    {/* 1. HEADER - Sempre presente */}
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Titolo</h1>
          <p className="text-muted-foreground mt-1">Descrizione breve</p>
        </div>
        {/* Azioni opzionali (es. "Nuovo Item") */}
      </div>
    </motion.div>

    {/* 2. METRICHE - Se dashboard o pagina con KPI */}
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Metric Cards */}
      </div>
    </motion.div>

    {/* 3. FILTRI - Se lista con ricerca/filtri */}
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardContent className="p-4 sm:p-6">
        {/* Filtri inline */}
      </CardContent>
    </Card>

    {/* 4. CONTENUTO PRINCIPALE */}
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        {/* Table o Grid */}
      </Card>
    </motion.div>

  </div>
</Layout>
```

### C. Componenti Standard

**Metric Card (dashboard):**
```text
<Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-md transition-shadow">
  <CardContent className="p-4 sm:p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-2xl sm:text-3xl font-bold mt-2">{value}</p>
      </div>
      <div className={`p-2.5 sm:p-3 rounded-xl ${bgColor}`}>
        <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${textColor}`} />
      </div>
    </div>
  </CardContent>
</Card>
```

**Table Container:**
```text
<Card className="border-border/50 bg-card/80 backdrop-blur-sm">
  <CardHeader className="pb-4">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <CardTitle className="text-lg">{count} {entityName}</CardTitle>
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Cerca..." className="pl-10" />
      </div>
    </div>
  </CardHeader>
  <CardContent>
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            ...
          </TableRow>
        </TableHeader>
        ...
      </Table>
    </div>
  </CardContent>
</Card>
```

**Empty State:**
```text
<div className="flex flex-col items-center justify-center py-12 text-center">
  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
    <Icon className="h-8 w-8 text-muted-foreground/50" />
  </div>
  <h3 className="text-lg font-medium text-foreground mb-1">Titolo empty state</h3>
  <p className="text-sm text-muted-foreground max-w-sm">Descrizione</p>
</div>
```

**Loading State:**
```text
<div className="flex items-center justify-center min-h-[60vh]">
  <div className="flex flex-col items-center gap-4">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    <p className="text-muted-foreground">Caricamento...</p>
  </div>
</div>
```

---

## Modifiche File per File

### 1. HRLayout.tsx
- Uniformare sezione badge: rimuovere `border-b border-border/50` dal div del badge
- Mantenere logo aziendale (è corretto per HR)
- ScrollArea: cambiare a `h-[calc(100vh-10rem)]` come SuperAdmin

### 2. AssociationLayout.tsx
- Rimuovere Avatar e struttura complessa dal badge
- Usare stesso pattern SuperAdmin: Badge centrato `bg-primary/10 text-primary`
- Spostare nome associazione nel mobile header accanto al badge
- Usare logo associazione nel header sidebar se disponibile

### 3. SuperAdminDashboard.tsx
- Cambiare header da `space-y-8` a `space-y-6` per consistenza
- Animazione `y: -10` invece di `y: -20`
- Titolo: aggiungere `text-2xl sm:text-3xl` per responsività

### 4. AssociationDashboard.tsx
- Aggiungere stile card: `border-border/50 bg-card/80 backdrop-blur-sm`
- Pattern già corretto per header

### 5. AssociationExperiencesPage.tsx
- Wrappare grid in Card container come da template
- Aggiungere search/filtri se necessari in futuro

### 6. HRDashboard.tsx
- Uniformare spacing a `space-y-6`
- Verificare che MetricsCards segua il pattern standard

### 7. Tutte le pagine Super Admin (Companies, Users, etc.)
- Verificare che seguano il template standard
- Uniformare animazioni a `y: -10` per header, `y: 10` per contenuto

---

## Documentazione da Aggiornare

Aggiornare `docs/design-system.md` con nuova sezione:

```text
## Aree Admin - Template Struttura Pagina

### Layout
Tutti i pannelli admin usano lo stesso pattern di layout:
- Sidebar fissa a sinistra (w-64)
- Main content con padding responsive (p-4 sm:p-6 lg:p-8)
- Mobile: sidebar nascosta con overlay

### Struttura Pagina
1. Header (titolo + descrizione + azioni opzionali)
2. Metriche (se dashboard)
3. Filtri (se lista)
4. Contenuto principale (table/grid)

### Animazioni Standard
- Header: initial={{ opacity: 0, y: -10 }}
- Contenuto: initial={{ opacity: 0, y: 10 }}, delay: 0.1-0.2
- Items lista: delay: index * 0.05

### Card Container
Tutte le card usano:
- className="border-border/50 bg-card/80 backdrop-blur-sm"
- hover:shadow-md transition-shadow (se interattive)
```

---

## File da Modificare

| File | Tipo Modifica | Priorità |
|------|---------------|----------|
| `src/components/layout/HRLayout.tsx` | Uniformare badge e scroll area | Alta |
| `src/components/layout/AssociationLayout.tsx` | Semplificare badge, usare pattern standard | Alta |
| `src/pages/super-admin/SuperAdminDashboard.tsx` | Uniformare spacing e animazioni | Media |
| `src/pages/association/AssociationDashboard.tsx` | Aggiungere stile card standard | Media |
| `src/pages/association/AssociationExperiencesPage.tsx` | Wrappare in card container | Bassa |
| `src/pages/HRDashboard.tsx` | Verificare consistenza spacing | Bassa |
| `docs/design-system.md` | Aggiungere sezione aree admin | Media |

---

## Risultato Atteso

Dopo l'implementazione:
- Tutte le aree admin avranno lo stesso look & feel
- Navigazione e branding coerenti tra i ruoli
- Pattern di pagina ripetibili e manutenibili
- Documentazione di riferimento per future pagine
