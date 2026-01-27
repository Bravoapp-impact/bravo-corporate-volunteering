
# Piano: Armonizzazione Stile Cards e Modal Bookings

## Obiettivo

Uniformare lo stile visivo della pagina `/app/bookings` a quello della pagina `/app/experiences`, creando componenti base riutilizzabili per evitare duplicazioni di codice future.

---

## Analisi delle Differenze Attuali

### Cards

| Aspetto | ExperienceCardCompact | BookingCard (attuale) |
|---------|----------------------|----------------------|
| Immagine | Quadrata, rounded-2xl | Rettangolare h-32, badge data overlay |
| Layout | Verticale compatto | Verticale con più elementi |
| Info | Titolo, associazione+logo, data/durata/posti | Categoria, titolo, orario, location, CTA cancella |
| Animazione | motion.button, hover su titolo | motion.div, hover scale su immagine |
| Past state | Non esiste | Riga compatta orizzontale |

### Modal

| Aspetto | ExperienceDetailModal | BookingDetailModal (attuale) |
|---------|----------------------|------------------------------|
| Posizione | Bottom sheet mobile, centered desktop | Sempre centered |
| Corners | rounded-3xl | rounded-2xl |
| Background | bg-background | bg-card |
| Immagine | Square aspect-ratio | Fixed h-48 |
| Close button | In-image corner | In-image corner |
| Contenuto | Due step (detail, dates) | Single view con tips |

---

## Strategia di Implementazione

### Fase 1: Componenti Base Riutilizzabili

Creare due componenti astratti in `src/components/common/`:

#### 1.1 `BaseCardImage.tsx`
Componente per la gestione uniforme delle immagini nelle card.

```text
Props:
  - imageUrl: string | null
  - alt: string
  - aspectRatio?: "square" | "video" | "portrait"  // default: "square"
  - fallbackEmoji?: string                          // default: "🤝"
  - badge?: ReactNode                               // overlay badge (categoria, data, etc.)
  - className?: string
```

**Caratteristiche:**
- Gestione fallback con emoji
- Supporto per overlay badges
- Transizione hover uniforme (scale-105)
- Rounded-2xl standard

#### 1.2 `BaseModal.tsx`
Componente wrapper per modal in stile Airbnb/bottom-sheet.

```text
Props:
  - open: boolean
  - onClose: () => void
  - children: ReactNode
  - showBackButton?: boolean
  - onBack?: () => void
  - title?: string                // header title (quando presente)
  - className?: string
```

**Caratteristiche:**
- Bottom sheet su mobile (y: 100%), centered su desktop
- rounded-t-3xl mobile, rounded-3xl desktop
- bg-background uniforme
- Gestione header con back/close buttons
- max-h-[95vh] mobile, max-h-[90vh] desktop

---

### Fase 2: Refactoring BookingCard

#### 2.1 `BookingCardCompact.tsx` (Future bookings - stile Airbnb)

Nuova versione della card per prenotazioni future, ispirata a `ExperienceCardCompact`:

```text
Layout:
  - Immagine quadrata con badge data (top-left)
  - Titolo (max 2 righe, line-clamp-2)
  - Associazione con logo circolare
  - Info: Orario + Durata + Location
  - Badge stato se cancelled
  - Tap per dettaglio
```

**Differenze rispetto a ExperienceCardCompact:**
- Badge data overlay invece di categoria
- Mostra orario invece di posti disponibili
- Bottone cancellazione nel modal, non nella card

#### 2.2 `BookingCardPast.tsx` (Past bookings)

Mantenere layout riga compatta attuale (gia in stile corretto).

---

### Fase 3: Refactoring BookingDetailModal

Aggiornare `BookingDetailModal.tsx` per usare:

1. **BaseModal** come wrapper (bottom-sheet style)
2. **Immagine quadrata** come ExperienceDetailModal
3. **Layout contenuto allineato** con sezioni:
   - Badge categoria + status
   - Titolo
   - Data/orario (card highlight)
   - Location con link Maps
   - Descrizione (se disponibile)
   - Tips section (mantenere - gia presente)
   - CTA Annulla (se possibile) + Chiudi

---

## Struttura File

```text
src/components/common/
  BaseCardImage.tsx      <- NUOVO
  BaseModal.tsx          <- NUOVO
  EmptyState.tsx         (esistente)
  LoadingState.tsx       (esistente)
  MetricCard.tsx         (esistente)
  PageHeader.tsx         (esistente)

src/components/bookings/
  BookingCard.tsx        <- REFACTOR (usa BaseCardImage)
  BookingDetailModal.tsx <- REFACTOR (usa BaseModal)
```

---

## Dettaglio Implementazione

### BaseCardImage.tsx

```text
Rendering:
  <div className="relative {aspectRatio} rounded-2xl overflow-hidden bg-muted">
    {imageUrl ? (
      <img className="w-full h-full object-cover transition-transform 
                     duration-300 group-hover:scale-105" />
    ) : (
      <div className="fallback emoji centered" />
    )}
    {badge && (
      <div className="absolute positioning">{badge}</div>
    )}
  </div>

Aspect Ratio Classes:
  - square: aspect-square
  - video: aspect-video
  - portrait: aspect-[3/4]
```

### BaseModal.tsx

```text
Struttura:
  <AnimatePresence>
    <motion.div backdrop onClick={onClose}>
      <motion.div 
        modal-container
        initial={{ y: "100%" }}  // bottom sheet mobile
        animate={{ y: 0 }}
        className="bg-background w-full sm:max-w-lg 
                   rounded-t-3xl sm:rounded-3xl"
      >
        {/* Optional header with back/close */}
        {(showBackButton || title) && (
          <div className="header flex items-center justify-between">
            {showBackButton && <BackButton />}
            {title && <h3>{title}</h3>}
            <CloseButton />
          </div>
        )}
        
        {/* Content slot */}
        {children}
      </motion.div>
    </motion.div>
  </AnimatePresence>
```

### BookingCard.tsx (Refactored)

```text
Future Booking Card:
  <motion.button onClick={() => onView(booking)} className="...">
    <BaseCardImage
      imageUrl={experience.image_url}
      alt={experience.title}
      aspectRatio="square"
      badge={
        <div className="date-badge">
          {format(startDate, "MMM")} / {format(startDate, "d")}
        </div>
      }
    />
    <div className="content pt-3 space-y-1.5">
      <h3 className="title line-clamp-2">{experience.title}</h3>
      <AssociationWithLogo />
      <InfoRow: orario + durata + citta />
    </div>
  </motion.button>

Past Booking (invariato):
  <motion.div className="flex items-center gap-4 p-4 rounded-xl...">
    ...layout riga esistente...
  </motion.div>
```

### BookingDetailModal.tsx (Refactored)

```text
<BaseModal open={!!booking} onClose={onClose}>
  <div className="flex flex-col max-h-[95vh] sm:max-h-[90vh]">
    {/* Close button overlay */}
    <CloseButton absolute />
    
    {/* Scrollable content */}
    <div className="flex-1 overflow-y-auto">
      {/* Square Image */}
      <BaseCardImage
        imageUrl={experience.image_url}
        aspectRatio="square"
        badge={booking.status === "cancelled" && <Badge>Annullata</Badge>}
      />
      
      {/* Content sections - aligned with ExperienceDetailModal */}
      <div className="p-5 space-y-4">
        <Badge>{experience.category}</Badge>
        <h2>{experience.title}</h2>
        
        {/* Date/Time highlight card */}
        <div className="p-4 rounded-xl bg-primary/5">
          <Calendar /> {fullDate}
          <Clock /> {startTime} - {endTime}
        </div>
        
        {/* Location with Maps link */}
        <LocationSection />
        
        {/* Description if available */}
        {experience.description && <Description />}
        
        {/* Tips section - mantenere esistente */}
        <TipsSection />
      </div>
    </div>
    
    {/* Fixed footer */}
    <div className="p-5 border-t bg-background">
      {canCancel ? (
        <Button variant="destructive">Annulla prenotazione</Button>
      ) : (
        <Button onClick={onClose}>Chiudi</Button>
      )}
    </div>
  </div>
</BaseModal>
```

---

## Riuso dei Componenti Base

Una volta creati `BaseCardImage` e `BaseModal`, potranno essere usati anche per:

| Componente Esistente | Refactoring Possibile |
|---------------------|----------------------|
| ExperienceCardCompact | Usare BaseCardImage |
| ExperienceCard | Usare BaseCardImage |
| ExperienceDetailModal | Usare BaseModal |
| HRExperienceCard | Usare BaseCardImage |

Questo porta a un risparmio stimato di ~150-200 righe duplicate e garantisce coerenza visiva.

---

## Ordine di Implementazione

| Step | Azione | File |
|------|--------|------|
| 1 | Creare BaseCardImage | src/components/common/BaseCardImage.tsx |
| 2 | Creare BaseModal | src/components/common/BaseModal.tsx |
| 3 | Refactorare BookingCard | src/components/bookings/BookingCard.tsx |
| 4 | Refactorare BookingDetailModal | src/components/bookings/BookingDetailModal.tsx |
| 5 | Test visivo su /app/bookings | - |
| 6 | (Opzionale) Refactorare ExperienceCardCompact | Per usare BaseCardImage |

---

## Note Tecniche

- `BaseCardImage` e `BaseModal` vanno in `src/components/common/` insieme agli altri componenti riutilizzabili
- Mantenere retrocompatibilita: le card past bookings rimangono con layout riga
- Il bottone "Annulla prenotazione" si sposta dalla card al modal per un'interfaccia piu pulita
- Z-index BaseModal: z-[100] come ExperienceDetailModal

---

## Preview Atteso

Dopo il refactoring, la pagina `/app/bookings` avra:

**Cards prenotazioni future:**
- Immagine quadrata con angoli arrotondati
- Badge data in alto a sinistra (stile calendario)
- Titolo + associazione con logo
- Info compatte (orario, durata, location)
- Tap apre modal dettaglio

**Modal dettaglio:**
- Bottom sheet su mobile
- Immagine grande quadrata
- Contenuto allineato a ExperienceDetailModal
- CTA Annulla nel footer (non nella card)

**Cards prenotazioni passate:**
- Mantengono layout riga compatta (gia appropriato)
