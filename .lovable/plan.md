
## Obiettivo

Impedire che il form "reinvia email di conferma" invii email a indirizzi non registrati nel sistema tramite codice di accesso.

## Approccio

Prima di chiamare `supabase.auth.resend()`, fare una query sulla tabella `profiles` per verificare che esista un utente con quell'email. Se non esiste, **non** inviare l'email.

**Nota sulla privacy (security best practice):** Il messaggio mostrato all'utente sarà identico sia in caso di email trovata che non trovata ("Se questa email è registrata, riceverai il link di conferma"). Questo evita di rivelare quali email sono presenti nel sistema a chi tenta email a caso.

## Modifica tecnica

`src/pages/Login.tsx` — funzione `handleResendConfirmation`:

```
// Prima della chiamata a supabase.auth.resend():
const { data: profileExists } = await supabase
  .from("profiles")
  .select("id")
  .eq("email", resendEmail)
  .maybeSingle();

if (!profileExists) {
  // Mostra stesso messaggio di successo (privacy)
  toast({ title: "Email inviata!", description: "..." });
  setShowResend(false);
  setResendEmail("");
  return;
}

// Solo se esiste → procedi con resend
await supabase.auth.resend({ type: "signup", email: resendEmail, ... });
```

Il toast di successo mostrerà: *"Se questa email è registrata nel sistema, riceverai il link di conferma. Controlla anche la cartella spam."*

## File modificati

- `src/pages/Login.tsx` — solo la funzione `handleResendConfirmation` e il messaggio del toast
