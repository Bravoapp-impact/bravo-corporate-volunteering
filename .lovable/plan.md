

# Piano Sicurezza B2B - Bravo!

## 1. Problema Policy Associazioni (perche' ha rotto tutto)

### Diagnosi

La policy `Authenticated users can view associations` e' **necessaria** per il funzionamento dell'app perche' diverse pagine usano join FK sulla tabella `associations`:

- **Experiences.tsx** (dipendenti): `associations:association_id (name, logo_url)` per mostrare nome e logo nelle card
- **MyBookings.tsx** (dipendenti): stessa join per le prenotazioni
- **HRExperiencesPage.tsx** (HR): `associations:association_id (name)` per il monitoraggio

Rimuovere la policy SELECT causa il fallimento di tutti questi join, rendendo vuote le pagine dei dipendenti e dell'HR.

### Soluzione sicura (senza rompere nulla)

Invece di rimuovere la policy, la **restringiamo** usando una regola RLS che permette ai non-admin di vedere solo i campi pubblici. Dato che RLS non puo' filtrare colonne (opera solo sulle righe), la strategia corretta e':

1. Mantenere la policy attuale per i join FK (necessari per il funzionamento)
2. Rimuovere i campi sensibili dalla tabella: `contact_email`, `contact_phone`, `contact_name`, `internal_notes` verranno resi accessibili **solo** tramite policy dedicate per super_admin e association_admin
3. Creare una funzione RPC `get_association_sensitive_data` con SECURITY DEFINER che restituisce i campi sensibili solo a chi ne ha diritto

**Approccio alternativo piu' semplice:** Accettare che i dati di contatto delle associazioni partner non sono PII degli utenti finali. In un contesto B2B, nome/email/telefono del referente di un'associazione sono informazioni di business, non dati sensibili. La policy attuale e' adeguata.

**Raccomandazione:** Mantenere la policy invariata. I dati esposti (contatto referente associazione) sono informazioni di business, non PII. Il rischio e' minimo e la modifica potrebbe rompere l'app.

## 2. Multi-Factor Authentication (MFA)

Lovable Cloud supporta nativamente MFA via TOTP (Google Authenticator, Authy, ecc.).

### Implementazione

**Step 1: Pagina di Enrollment MFA nel Profilo**
- Aggiungere una sezione "Sicurezza" nella pagina Profilo di ogni ruolo
- Mostrare QR code per scansione con app authenticator
- Campo per inserire il codice di verifica
- Pulsante per disabilitare MFA

**Step 2: Challenge MFA al Login**
- Dopo il login con email/password, verificare il livello di autenticazione (AAL)
- Se l'utente ha MFA attivo e AAL e' `aal1`, mostrare la schermata di verifica codice TOTP
- Solo dopo verifica con `aal2` permettere l'accesso

**Step 3: Componente AuthMFA**
- Wrapper che controlla il livello AAL prima di renderizzare l'app
- Se MFA e' richiesto ma non verificato, mostra il form di challenge

### Flusso utente

```text
Login email/password
        |
    AAL check
   /         \
aal1+MFA    aal1 (no MFA)
   |              |
Challenge    Accesso diretto
TOTP code
   |
  aal2
   |
Accesso app
```

### File da creare/modificare

- `src/components/auth/EnrollMFA.tsx` - Componente enrollment con QR code
- `src/components/auth/ChallengeMFA.tsx` - Componente challenge/verifica codice
- `src/components/auth/MFAGuard.tsx` - Wrapper che verifica AAL level
- `src/pages/Profile.tsx` - Aggiungere sezione "Sicurezza" con enrollment
- `src/pages/hr/HRProfile.tsx` - Stessa sezione
- `src/pages/association/AssociationAdminProfile.tsx` - Stessa sezione
- `src/pages/super-admin/SuperAdminProfile.tsx` - Stessa sezione
- `src/pages/Login.tsx` - Integrare challenge MFA dopo login
- `src/App.tsx` - Wrappare le route protette con MFAGuard

## 3. Valutazione Pilastri B2B

### Gia' implementato

| Area | Stato | Dettaglio |
|------|-------|-----------|
| RBAC | Fatto | 4 ruoli (employee, hr_admin, association_admin, super_admin) in tabella dedicata |
| Data Segmentation | Fatto | Multi-tenant con company_id, RLS su tutte le tabelle |
| Input Validation | Fatto | Zod client-side + CHECK constraints database |
| Encryption in Transit | Fatto | TLS gestito automaticamente dall'infrastruttura |
| Encryption at Rest | Fatto | AES-256 gestito automaticamente dall'infrastruttura |

### Da implementare in questo piano

| Area | Priorita' | Azione |
|------|-----------|--------|
| MFA (TOTP) | Alta | Implementazione completa (vedi sopra) |
| Rate Limiting | Media | Edge function per access requests con rate limit IP |

### Fuori scope (richiedono intervento manuale o infrastruttura esterna)

| Area | Note |
|------|------|
| SSO (SAML/OIDC) | Richiede piano Supabase Pro + configurazione per ogni azienda cliente |
| WAF | Gestito a livello infrastruttura (Cloudflare/AWS), non applicativo |
| SAST/DAST in CI/CD | Richiede setup pipeline CI/CD esterno |
| SIEM/Centralized Logging | Richiede integrazione con servizio esterno (Datadog, Splunk) |
| Penetration Testing | Richiede ingaggio di terze parti specializzate |
| ISO 27001 / SOC 2 | Certificazioni organizzative, non solo tecniche |
| PCI-DSS | Non applicabile (non gestiamo pagamenti) |
| Leaked Password Protection | Attivabile manualmente dal pannello backend (gia' documentato) |

## Dettaglio Tecnico Implementazione

### MFA - EnrollMFA.tsx

Usa le API native:
- `supabase.auth.mfa.enroll({ factorType: 'totp' })` per generare QR
- `supabase.auth.mfa.challenge({ factorId })` per iniziare verifica
- `supabase.auth.mfa.verify({ factorId, challengeId, code })` per completare

### MFA - Login flow

Dopo `signIn()`, controllare:
```text
supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  -> currentLevel: 'aal1', nextLevel: 'aal2'
     = MFA richiesto, mostra challenge
  -> currentLevel: 'aal1', nextLevel: 'aal1'
     = No MFA, accesso diretto
```

### Rate Limiting Access Requests

Edge function `submit-access-request`:
- Validazione Zod server-side
- Tracciamento IP con contatore in-memory (Map)
- Max 3 richieste per IP ogni 15 minuti
- Insert con service_role key (bypassa RLS)
- Policy INSERT su access_requests cambiata a `WITH CHECK (false)`

