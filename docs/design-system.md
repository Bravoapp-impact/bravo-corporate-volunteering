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

## 📚 Riferimenti

- **Tailwind Config**: `tailwind.config.ts`
- **CSS Variables**: `src/index.css`
- **UI Components**: `src/components/ui/`
