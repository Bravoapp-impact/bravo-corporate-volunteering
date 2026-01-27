# Bravo! Design System

Guida completa al design system di Bravo!, ispirato allo stile pulito e minimalista di Airbnb.

---

## 🎨 Filosofia di Design

- **Semplicità**: Interfacce pulite, senza elementi superflui
- **Neutralità**: Hover states e sfondi neutri (grigi), colori usati con parsimonia
- **Consistenza**: Stesso look & feel in tutta l'applicazione
- **Accessibilità**: Contrasti adeguati, focus states visibili

---

## 🎭 Colori

### Background

| Token | Valore HSL | Hex | Utilizzo |
|-------|-----------|-----|----------|
| `--background` | `0 0% 98%` | `#FAFAFA` | Background principale di tutta l'app |
| `--card` | `0 0% 100%` | `#FFFFFF` | Card e superfici elevate |
| `--muted` | `0 0% 96%` | `#F5F5F5` | Background hover, stati disabilitati |

### Testo

| Token | Valore HSL | Utilizzo |
|-------|-----------|----------|
| `--foreground` | `0 0% 10%` | Testo principale |
| `--muted-foreground` | `0 0% 45%` | Testo secondario, descrizioni |

### Brand Bravo!

| Token | Valore HSL | Nome | Utilizzo |
|-------|-----------|------|----------|
| `--primary` | `274 100% 50%` | Viola Bravo! | CTA principali, link, icone di brand |
| `--bravo-magenta` | `290 67% 46%` | Magenta | Accent decorativo (solo su hero/auth) |
| `--bravo-pink` | `330 56% 53%` | Rosa | Accent decorativo (solo su hero/auth) |
| `--bravo-orange` | `26 100% 65%` | Arancione | Accent decorativo |
| `--bravo-yellow` | `45 96% 61%` | Giallo | Accent decorativo |

### Stati

| Token | Valore HSL | Utilizzo |
|-------|-----------|----------|
| `--success` | `142 71% 45%` | Conferme, stati positivi |
| `--warning` | `38 92% 50%` | Avvisi |
| `--destructive` | `0 84% 60%` | Errori, azioni distruttive |

### Interazione

| Token | Valore HSL | Utilizzo |
|-------|-----------|----------|
| `--accent` | `0 0% 96%` | **Hover states** (grigio neutro!) |
| `--ring` | `0 0% 20%` | Focus ring (grigio scuro) |
| `--border` | `0 0% 90%` | Bordi elementi |

---

## 🎯 Colori Icone per Metriche

Le icone nelle card metriche usano colori **tematici** per identificare visivamente il tipo di dato.

**IMPORTANTE**: Non usare `text-accent` o `text-secondary` per le icone (sono grigi per gli hover states).

| Metrica | Icona | Colore | Background |
|---------|-------|--------|------------|
| Dipendenti / Persone | `Users`, `UserCheck` | `text-bravo-purple` | `bg-bravo-purple/10` |
| Esperienze / Eventi | `Calendar`, `Award` | `text-bravo-purple` | `bg-bravo-purple/10` |
| Tempo / Ore | `Clock` | `text-bravo-orange` | `bg-bravo-orange/10` |
| Beneficiari / Cuore | `Heart`, `Users` (beneficiari) | `text-bravo-pink` | `bg-bravo-pink/10` |
| Trend / Crescita | `TrendingUp` | `text-success` | `bg-success/10` |
| Partecipazioni | `CheckCircle`, `CalendarCheck` | `text-bravo-purple` | `bg-bravo-purple/10` |

### Pattern per Card Metriche

```tsx
// ✅ Corretto - colori tematici
<div className="p-2.5 sm:p-3 rounded-xl bg-bravo-orange/10">
  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-bravo-orange" />
</div>

// ❌ Non fare - accent/secondary sono grigi
<div className="p-2.5 sm:p-3 rounded-xl bg-accent/10">
  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
</div>
```

---

## 🏷️ Colori per Categorie Esperienze

Le categorie di esperienze usano colori tematici per identificarle visivamente nelle card e nei filtri.

| Categoria | Colore | Classe Testo | Classe Background |
|-----------|--------|--------------|-------------------|
| Ambiente / Natura | Verde | `text-emerald-600` | `bg-emerald-500/10` |
| Sociale / Comunità | Rosa | `text-bravo-pink` | `bg-bravo-pink/10` |
| Educazione / Formazione | Blu | `text-blue-600` | `bg-blue-500/10` |
| Animali | Arancione | `text-bravo-orange` | `bg-bravo-orange/10` |
| Cultura / Arte | Viola | `text-bravo-purple` | `bg-bravo-purple/10` |
| Salute / Benessere | Rosso tenue | `text-rose-600` | `bg-rose-500/10` |
| Sport / Attività fisiche | Ciano | `text-cyan-600` | `bg-cyan-500/10` |
| Gastronomia | Giallo | `text-bravo-yellow` | `bg-bravo-yellow/10` |
| Orti e apicoltura | Verde lime | `text-lime-600` | `bg-lime-500/10` |
| Inclusione | Magenta | `text-bravo-magenta` | `bg-bravo-magenta/10` |
| Default | Grigio neutro | `text-muted-foreground` | `bg-muted` |

### Pattern per Badge Categoria

```tsx
// ✅ Corretto - colori tematici per categoria
<Badge className="bg-emerald-500/10 text-emerald-600 border-0">
  Ambiente
</Badge>

// Oppure con sfondo più neutro
<Badge variant="secondary" className="text-emerald-600">
  Ambiente
</Badge>
```

### Mapping Categorie (esempio)

```tsx
const CATEGORY_COLORS: Record<string, { text: string; bg: string }> = {
  ambiente: { text: "text-emerald-600", bg: "bg-emerald-500/10" },
  sociale: { text: "text-bravo-pink", bg: "bg-bravo-pink/10" },
  educazione: { text: "text-blue-600", bg: "bg-blue-500/10" },
  animali: { text: "text-bravo-orange", bg: "bg-bravo-orange/10" },
  cultura: { text: "text-bravo-purple", bg: "bg-bravo-purple/10" },
  salute: { text: "text-rose-600", bg: "bg-rose-500/10" },
  sport: { text: "text-cyan-600", bg: "bg-cyan-500/10" },
  gastronomia: { text: "text-bravo-yellow", bg: "bg-bravo-yellow/10" },
  orti: { text: "text-lime-600", bg: "bg-lime-500/10" },
  inclusione: { text: "text-bravo-magenta", bg: "bg-bravo-magenta/10" },
};

// Utilizzo
const colors = CATEGORY_COLORS[categoryKey] ?? { text: "text-muted-foreground", bg: "bg-muted" };
```

---

## ✏️ Tipografia

### Font Family
```css
font-family: 'Outfit', sans-serif;
```

### Dimensioni

| Utilizzo | Classe Tailwind | Esempio |
|----------|-----------------|---------|
| Titolo pagina | `text-2xl md:text-3xl font-bold` | "Dashboard HR" |
| Titolo sezione | `text-lg font-semibold` | "Date programmate" |
| Testo card value | `text-xl sm:text-2xl font-bold` | "245" |
| Testo label | `text-xs sm:text-sm text-muted-foreground` | "Ore Volontariato" |
| Testo body | `text-sm text-muted-foreground` | Descrizioni |

---

## 📐 Spacing

### Padding Standard

| Componente | Mobile | Desktop |
|------------|--------|---------|
| Card content | `p-4` | `p-5` o `p-6` |
| Page container | `px-4 py-6` | `p-6` |
| Section gap | `space-y-4` | `space-y-6` |

### Gap tra elementi

| Contesto | Classe |
|----------|--------|
| Card grid | `gap-3 sm:gap-4` |
| Elementi inline | `gap-2` |
| Icon + text | `gap-1.5` o `gap-2` |

---

## 🧩 Componenti

### Card

```tsx
// ✅ Corretto
<Card className="border bg-card">
  <CardContent className="p-4 sm:p-5">
    ...
  </CardContent>
</Card>

// ❌ Non fare
<Card className="bg-gradient-to-br from-primary/10 ...">
<Card className="hover:border-primary/30 hover:shadow-primary/5">
```

**Regole Card:**
- Background: `bg-card` (bianco) o nessuna classe (default)
- Bordo: `border` o `border-border/50`
- Hover: `hover:shadow-md` (ombre neutre, MAI colorate)
- NO gradienti colorati
- NO bordi colorati al hover

### Button

```tsx
// Varianti disponibili
<Button>Primary (default)</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="link">Link</Button>
```

**Hover States:**
- `default`: `hover:bg-primary/90`
- `outline` / `ghost`: `hover:bg-muted` (grigio chiaro, MAI colorato)
- `secondary`: `hover:bg-muted`

### Badge

```tsx
// Varianti
<Badge>Default (viola)</Badge>
<Badge variant="secondary">Secondary (grigio)</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Destructive</Badge>
```

**Regole Badge:**
- `secondary`: sfondo `bg-muted text-foreground` (grigio neutro)
- `outline`: bordo `border-border` (visibile ma discreto)
- NO hover effects sui badge (non sono interattivi)

### Input / Select

```tsx
// Focus state standard
className="focus:ring-ring" // Ring grigio scuro, non viola
```

**Regole Form Elements:**
- Focus ring: grigio scuro (`--ring: 0 0% 20%`)
- Hover su opzioni: `hover:bg-muted` o `focus:bg-muted`
- NO `focus:bg-accent` se accent è colorato

### Toggle / Navigation

```tsx
// Stato attivo
className="data-[state=on]:bg-muted data-[state=on]:text-foreground"

// Hover
className="hover:bg-muted"
```

---

## 🔲 Hover States

### Regola Generale

**Tutti gli hover devono essere neutri (grigi), MAI colorati.**

| Elemento | Hover State Corretto |
|----------|---------------------|
| Bottoni outline/ghost | `hover:bg-muted` |
| Card cliccabili | `hover:shadow-md` |
| Righe tabella | `hover:bg-muted/50` |
| Link testuali | `hover:underline` |
| Select/Dropdown items | `focus:bg-muted` |
| Navigation items | `hover:bg-muted` |
| Toggle/Tab | `hover:bg-muted` |

### Pattern da Evitare

```tsx
// ❌ NON FARE
hover:bg-accent          // Se accent è colorato
hover:border-primary/50  // Bordi colorati
hover:shadow-primary/5   // Ombre colorate
hover:text-primary       // Cambio colore testo

// ✅ FARE
hover:bg-muted           // Grigio chiaro
hover:shadow-md          // Ombra neutra
hover:underline          // Per link
```

---

## 📱 Responsive

### Breakpoints

Utilizziamo i breakpoint standard di Tailwind:

| Breakpoint | Min-width | Utilizzo |
|------------|-----------|----------|
| `sm:` | 640px | Tablet portrait |
| `md:` | 768px | Tablet landscape |
| `lg:` | 1024px | Desktop |
| `xl:` | 1280px | Desktop large |

### Pattern Mobile-First

```tsx
// Sempre partire da mobile
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
  ...
</div>

// Padding responsive
<CardContent className="p-4 sm:p-5">
  ...
</CardContent>
```

---

## 🚫 Cosa NON Fare

### Colori

- ❌ Non usare `bg-white` → usa `bg-card` o `bg-background`
- ❌ Non usare `text-black` → usa `text-foreground`
- ❌ Non usare colori hex diretti → usa sempre token CSS
- ❌ Non usare `bg-gradient-*` sulle card normali

### Hover

- ❌ Non usare `hover:bg-accent` se accent è colorato
- ❌ Non usare `hover:border-primary/X`
- ❌ Non usare `hover:shadow-primary/X`
- ❌ Non usare `group-hover:text-primary` sui titoli

### Stile

- ❌ Non usare `bg-pattern` (rimosso dal design system)
- ❌ Non usare gradienti colorati per card informative
- ❌ Non usare badge troppo saturi per info neutrali

---

## ✅ Checklist per Nuovi Componenti

1. [ ] Background usa token semantici (`bg-card`, `bg-background`, `bg-muted`)
2. [ ] Testo usa token semantici (`text-foreground`, `text-muted-foreground`)
3. [ ] Hover states sono neutri (grigi)
4. [ ] Focus ring usa `--ring` (grigio scuro)
5. [ ] Card non hanno gradienti colorati
6. [ ] Ombre sono neutre (`shadow-sm`, `shadow-md`)
7. [ ] Badge usa varianti appropriate
8. [ ] Componente è responsive (mobile-first)

---

## 🔄 Migrazione da Vecchio Stile

Se trovi componenti con il vecchio stile, aggiornali così:

| Vecchio | Nuovo |
|---------|-------|
| `hover:bg-accent` | `hover:bg-muted` |
| `hover:border-primary/50` | rimuovi |
| `hover:shadow-primary/5` | `hover:shadow-md` |
| `bg-gradient-to-br from-primary/10` | `bg-card` |
| `focus:bg-accent` | `focus:bg-muted` |
| `bg-pattern` | rimuovi |
| `bg-white` | `bg-card` |

---

## 🏢 Aree Admin - Template Struttura Pagina

### Layout Sidebar Unificato

Tutti i pannelli admin (Super Admin, HR Admin, Association Admin) usano lo stesso pattern di layout:

```text
AdminLayout
├── Sidebar (w-64, bg-card/95 backdrop-blur-md, border-r border-border/50)
│   ├── Header (h-16): Logo Bravo! + Close button mobile
│   ├── Identity Badge (p-4): Badge ruolo/entità centrato (bg-primary/10 text-primary)
│   ├── Navigation (ScrollArea h-[calc(100vh-10rem)]): Menu items (space-y-1)
│   └── User Footer (fixed bottom): Dropdown utente con avatar
├── Mobile Header (sticky, h-16): Hamburger + Logo + Badge
└── Main Content (p-4 sm:p-6 lg:p-8)
```

**Regole Sidebar:**
- Larghezza: `w-64`
- Sfondo: `bg-card/95 backdrop-blur-md`
- Bordo: `border-r border-border/50`
- Header: `h-16` con Logo Bravo! (come immagine o testo)
- Badge identità: `bg-primary/10 text-primary`, centrato, `py-1.5`, larghezza piena
- Item attivo: `bg-primary text-primary-foreground`
- Item hover: `hover:bg-muted hover:text-foreground`

### Struttura Pagina Standard

Ogni pagina admin segue questo template:

```tsx
<Layout>
  <div className="space-y-6">
    
    {/* 1. HEADER - Sempre presente */}
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Titolo</h1>
      <p className="text-muted-foreground mt-1 text-sm sm:text-base">
        Descrizione breve
      </p>
    </motion.div>

    {/* 2. METRICHE (opzionale) - Per dashboard con KPI */}
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Metric Cards */}
      </div>
    </motion.div>

    {/* 3. CONTENUTO PRINCIPALE */}
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        {/* Table, Grid o altro contenuto */}
      </Card>
    </motion.div>

  </div>
</Layout>
```

### Animazioni Standard

| Elemento | Animazione |
|----------|------------|
| Header pagina | `initial={{ opacity: 0, y: -10 }}` |
| Contenuto | `initial={{ opacity: 0, y: 10 }}, transition={{ delay: 0.1-0.2 }}` |
| Items lista/grid | `transition={{ delay: index * 0.05 }}` |
| Card metriche | `transition={{ delay: index * 0.1 }}` |

### Card Container Standard

Tutte le card admin usano:

```tsx
<Card className="border-border/50 bg-card/80 backdrop-blur-sm">
  <CardContent className="p-4 sm:p-6">
    ...
  </CardContent>
</Card>

// Con hover (per card cliccabili)
<Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-md transition-shadow">
```

---

## 🧱 Componenti Riutilizzabili

Una serie di componenti condivisi è disponibile in `src/components/common/` e `src/components/profile/` per garantire consistenza e ridurre la duplicazione di codice.

### PageHeader

Header standard per tutte le pagine con titolo, descrizione e azioni opzionali.

**Path:** `src/components/common/PageHeader.tsx`

```tsx
import { PageHeader } from "@/components/common/PageHeader";

<PageHeader
  title="Aziende"
  description="Gestisci le aziende clienti della piattaforma"
  actions={
    <Button onClick={handleCreate}>
      <Plus className="h-4 w-4 mr-2" />
      Nuova Azienda
    </Button>
  }
/>
```

**Props:**
| Prop | Tipo | Obbligatorio | Descrizione |
|------|------|--------------|-------------|
| `title` | `string` | ✅ | Titolo principale (h1) |
| `description` | `string` | ❌ | Sottotitolo descrittivo |
| `actions` | `ReactNode` | ❌ | Bottoni o azioni (allineati a destra su desktop) |
| `className` | `string` | ❌ | Classi CSS aggiuntive |

---

### MetricCard

Card per visualizzare metriche/KPI con icona tematica e animazione.

**Path:** `src/components/common/MetricCard.tsx`

```tsx
import { MetricCard } from "@/components/common/MetricCard";

<MetricCard
  label="Ore di Volontariato"
  value={245}
  icon={Clock}
  iconColor="text-bravo-orange"
  iconBgColor="bg-bravo-orange/10"
  subLabel="ultimo mese"
  animationDelay={0.1}
/>
```

**Props:**
| Prop | Tipo | Obbligatorio | Descrizione |
|------|------|--------------|-------------|
| `label` | `string` | ✅ | Etichetta della metrica |
| `value` | `string \| number` | ✅ | Valore numerico o testuale |
| `icon` | `LucideIcon` | ✅ | Icona Lucide da mostrare |
| `iconColor` | `string` | ✅ | Classe colore testo icona (es. `text-bravo-orange`) |
| `iconBgColor` | `string` | ✅ | Classe colore sfondo icona (es. `bg-bravo-orange/10`) |
| `subLabel` | `string` | ❌ | Etichetta secondaria sotto il valore |
| `animationDelay` | `number` | ❌ | Delay animazione Framer Motion (default: 0) |
| `className` | `string` | ❌ | Classi CSS aggiuntive |

---

### LoadingState

Stato di caricamento standard con spinner e messaggio.

**Path:** `src/components/common/LoadingState.tsx`

```tsx
import { LoadingState } from "@/components/common/LoadingState";

// Uso base
<LoadingState />

// Con messaggio custom
<LoadingState message="Caricamento dipendenti..." />

// Altezza ridotta (non full viewport)
<LoadingState message="Attendere..." fullHeight={false} />
```

**Props:**
| Prop | Tipo | Obbligatorio | Default | Descrizione |
|------|------|--------------|---------|-------------|
| `message` | `string` | ❌ | `"Caricamento..."` | Messaggio sotto lo spinner |
| `fullHeight` | `boolean` | ❌ | `true` | Se `true`, occupa `min-h-[60vh]` |

---

### EmptyState

Stato vuoto standard per liste, tabelle e sezioni senza dati.

**Path:** `src/components/common/EmptyState.tsx`

```tsx
import { EmptyState } from "@/components/common/EmptyState";

// Con icona Lucide
<EmptyState
  icon={Users}
  title="Nessun dipendente trovato"
  description="Non ci sono dipendenti che corrispondono ai filtri."
/>

// Con emoji
<EmptyState
  icon="🎉"
  title="Nessuna notifica"
  description="Sei tutto in pari!"
/>

// Con azione
<EmptyState
  icon={Calendar}
  title="Nessuna esperienza"
  description="Non hai ancora prenotato esperienze."
  action={
    <Button onClick={handleExplore}>
      Esplora esperienze
    </Button>
  }
/>
```

**Props:**
| Prop | Tipo | Obbligatorio | Descrizione |
|------|------|--------------|-------------|
| `icon` | `LucideIcon \| string` | ❌ | Icona Lucide o emoji |
| `title` | `string` | ✅ | Titolo dello stato vuoto |
| `description` | `string` | ❌ | Descrizione aggiuntiva |
| `action` | `ReactNode` | ❌ | Bottone o link per azione |
| `className` | `string` | ❌ | Classi CSS aggiuntive |

---

### ProfileEditForm

Form riutilizzabile per la modifica del profilo utente (nome, cognome).

**Path:** `src/components/profile/ProfileEditForm.tsx`

```tsx
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";

<ProfileEditForm
  profile={profile}
  onSave={refreshProfile}
  cardClassName="border-0 shadow-none" // opzionale per stili custom
/>
```

**Props:**
| Prop | Tipo | Obbligatorio | Descrizione |
|------|------|--------------|-------------|
| `profile` | `Profile` | ✅ | Oggetto profilo utente |
| `onSave` | `() => void` | ✅ | Callback chiamata dopo salvataggio |
| `cardClassName` | `string` | ❌ | Classi CSS per la Card container |

**Funzionalità incluse:**
- Validazione Zod (nome e cognome obbligatori, min 2 caratteri)
- Gestione stato di salvataggio
- Toast di feedback (successo/errore)
- Integrazione diretta con Supabase

---

## 🔄 Quando Usare i Componenti Riutilizzabili

| Situazione | Componente da usare |
|------------|---------------------|
| Header di una pagina admin | `PageHeader` |
| Visualizzare KPI/metriche | `MetricCard` |
| Stato di caricamento dati | `LoadingState` |
| Lista/tabella vuota | `EmptyState` |
| Form modifica profilo | `ProfileEditForm` |

**Vantaggi:**
- ✅ Consistenza visiva garantita
- ✅ Animazioni e stili pre-configurati
- ✅ Responsive out-of-the-box
- ✅ Meno codice duplicato
- ✅ Manutenzione centralizzata

---

## 📚 Riferimenti

- **Tailwind Config**: `tailwind.config.ts`
- **CSS Variables**: `src/index.css`
- **UI Components (shadcn)**: `src/components/ui/`
- **Componenti Riutilizzabili**: `src/components/common/`, `src/components/profile/`
- **Layout Admin**: `src/components/layout/AdminLayout.tsx`
