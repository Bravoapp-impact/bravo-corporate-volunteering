
# Piano: Correzione Visualizzazione Associazioni nelle Prenotazioni

## Analisi del Problema

Ho verificato i dati nel database e il codice frontend. Il problema **NON sono le policy di sicurezza** ma una disconnessione tra:

1. **I dati che inserisci** (nella tabella `associations` tramite il pannello admin)
2. **I dati che il frontend legge** (dal campo legacy `association_name` nella tabella `experiences`)

### Stato attuale dei dati

| Esperienza | Campo legacy `association_name` | Associazione collegata | Logo presente |
|------------|--------------------------------|------------------------|---------------|
| Aiuta a preparare il pranzo... | **NULL** | Opera Messa della Carità | Si |
| Doposcuola per bambini | Il Balzo ETS (errato!) | SOS Villaggio dei bambini | Si |
| Ridipingi la palestra... | Qiqajon Associazione Francescana | Corretto | Si |
| Aiuta a sistemare la casa... | La Taska Onlus | Corretto | Si |

### Perche il logo non appare

Il frontend (`MyBookings.tsx`) fa questa query:

```typescript
experience_dates (
  experiences (
    association_name,  // <-- legge il campo TEXT legacy
    // NON c'e association_id o join con associations!
  )
)
```

Quindi **il logo non viene mai recuperato** perche non esiste nel campo `experiences`.

---

## Soluzione in 2 Fasi

### Fase 1: Correzione Dati (Database)

Sincronizzare il campo `association_name` con il nome reale dall'associazione collegata:

```sql
UPDATE experiences e
SET association_name = a.name
FROM associations a
WHERE e.association_id = a.id;
```

Questo risolve immediatamente il problema dei nomi mancanti/errati.

### Fase 2: Aggiornamento Frontend (Codice)

Modificare `MyBookings.tsx` per recuperare anche il logo dell'associazione tramite join:

**Query attuale:**
```typescript
experiences (
  association_name,
  ...
)
```

**Query corretta:**
```typescript
experiences (
  association_name,
  associations:association_id (
    name,
    logo_url
  ),
  ...
)
```

E poi usare `associations.logo_url` nel rendering.

---

## File da Modificare

| File | Modifica |
|------|----------|
| Database: `experiences` | Sincronizzare `association_name` (1 UPDATE) |
| `src/pages/MyBookings.tsx` | Aggiungere join con `associations` nella query |
| `src/components/bookings/BookingCard.tsx` | Gia supporta `association_logo_url`, nessuna modifica |

---

## Dettaglio Tecnico

### 1. Query SQL per sincronizzare i dati

```sql
-- Aggiorna association_name per tutte le esperienze
UPDATE experiences e
SET association_name = a.name
FROM associations a
WHERE e.association_id = a.id
  AND (e.association_name IS NULL OR e.association_name != a.name);
```

### 2. Modifica MyBookings.tsx (righe 47-68)

```typescript
const { data, error } = await supabase
  .from("bookings")
  .select(`
    id,
    status,
    created_at,
    experience_dates (
      id,
      start_datetime,
      end_datetime,
      experiences (
        id,
        title,
        description,
        image_url,
        association_name,
        city,
        address,
        category,
        associations:association_id (
          name,
          logo_url
        )
      )
    )
  `)
  .eq("user_id", user.id)
  .order("created_at", { ascending: false });
```

### 3. Trasformazione dati per BookingCard

Dopo il fetch, mappare i dati per passare `association_logo_url`:

```typescript
const transformedBookings = data.map(booking => ({
  ...booking,
  experience_dates: {
    ...booking.experience_dates,
    experiences: {
      ...booking.experience_dates.experiences,
      association_name: 
        booking.experience_dates.experiences.associations?.name || 
        booking.experience_dates.experiences.association_name,
      association_logo_url: 
        booking.experience_dates.experiences.associations?.logo_url || null
    }
  }
}));
```

---

## Risultato Atteso

Dopo l'implementazione:
- Tutte le card delle prenotazioni mostreranno il **nome corretto** dell'associazione
- I **loghi** verranno visualizzati accanto al nome
- I dati saranno sempre sincronizzati con quanto inserito nel pannello admin
