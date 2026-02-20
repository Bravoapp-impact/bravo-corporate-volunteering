
## Obiettivo

Chiudere automaticamente la modale dei dettagli prenotazione subito dopo una cancellazione riuscita, in modo che il toaster "Prenotazione annullata" sia visibile senza la modale davanti.

## Analisi

In `src/pages/MyBookings.tsx`, la funzione `handleCancel`:
1. Chiama il DB per aggiornare lo status a `cancelled`
2. Mostra il toast di successo
3. Richiama `fetchBookings()` per aggiornare la lista

Manca solo `setSelectedBooking(null)` per chiudere la modale dopo il successo.

## Modifica tecnica

**File:** `src/pages/MyBookings.tsx` — funzione `handleCancel`, nel blocco `try` dopo il toast:

```typescript
// Prima (attuale):
toast({
  title: "Prenotazione annullata",
  description: "La tua prenotazione è stata annullata con successo.",
});
fetchBookings();

// Dopo:
toast({
  title: "Prenotazione annullata",
  description: "La tua prenotazione è stata annullata con successo.",
});
setSelectedBooking(null); // ← chiude la modale
fetchBookings();
```

Una singola riga aggiuntiva. La modale si chiuderà e il toaster sarà immediatamente visibile.

## File modificati

- `src/pages/MyBookings.tsx` — aggiunta di `setSelectedBooking(null)` nella funzione `handleCancel` dopo il toast di successo.
