
# Piano: Sistema Raccolta Richieste di Accesso

## Obiettivo
Implementare un sistema completo per raccogliere e gestire richieste di accesso da utenti senza codice, con modale multi-step nella pagina di registrazione e pagina di gestione nel pannello Super Admin.

---

## 1. Database: Nuova Tabella `access_requests`

Creare una nuova tabella per salvare tutte le richieste di accesso.

```sql
CREATE TYPE public.access_request_type AS ENUM (
  'employee_needs_code',
  'company_lead', 
  'association_lead',
  'individual_waitlist'
);

CREATE TYPE public.access_request_status AS ENUM (
  'pending',
  'contacted',
  'closed'
);

CREATE TABLE public.access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type access_request_type NOT NULL,
  status access_request_status NOT NULL DEFAULT 'pending',
  
  -- Campi comuni
  first_name text,
  last_name text,
  email text NOT NULL,
  phone text,
  city text,
  message text,
  
  -- Campi specifici per aziende/associazioni
  company_name text,
  association_name text,
  role_in_company text,
  
  -- Metadati
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  notes text -- Per appunti interni del Super Admin
);

-- Trigger per updated_at
CREATE TRIGGER update_access_requests_updated_at
  BEFORE UPDATE ON public.access_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

-- Chiunque puo inserire (form pubblico)
CREATE POLICY "Anyone can insert access requests"
  ON public.access_requests FOR INSERT
  WITH CHECK (true);

-- Solo Super Admin puo vedere/modificare
CREATE POLICY "Super admin can manage access requests"
  ON public.access_requests FOR ALL
  USING (is_super_admin(auth.uid()));
```

---

## 2. Componente: `AccessRequestModal`

Nuovo componente in `src/components/auth/AccessRequestModal.tsx`

### Struttura del componente:
- State per step corrente (1 o 2)
- State per tipo di richiesta selezionato
- State per dati del form

### Step 1 - Selezione Tipo:
| Opzione | request_type | Icona suggerita |
|---------|--------------|-----------------|
| "Lavoro in un'azienda che usa Bravo" | employee_needs_code | Building2 |
| "Vorrei portare Bravo nella mia azienda" | company_lead | Briefcase |
| "Rappresento un'associazione" | association_lead | Heart |
| "Sono interessato come privato" | individual_waitlist | User |

### Step 2 - Form Dinamico:

| request_type | Campi | Messaggio post-invio |
|--------------|-------|---------------------|
| employee_needs_code | Nome, Cognome, Email aziendale, Nome azienda | "Ti metteremo in contatto con il referente della tua azienda per farti avere il codice di accesso" |
| company_lead | Nome, Cognome, Email, Telefono (opt), Nome azienda, Ruolo | "Ti va se ci prendiamo qualche minuto per approfondire tutti i dettagli? Prenota una chiamata con noi a questo link: https://app.cal.com/bravoapp/" |
| association_lead | Nome referente, Email, Nome associazione, Citta, Messaggio (opt) | "Grazie per aver richiesto di far parte dell'ecosistema Bravo!. Prendiamo subito in carico la tua richiesta e ti ricontattiamo al piu presto" |
| individual_waitlist | Nome, Email, Citta (opt) | "Grazie davvero per il tuo interesse. Stiamo lavorando per aprire Bravo! anche ai privati. Ti avviseremo non appena sara tutto pronto!" |

### Design mobile-first:
- Usa il `BaseModal` esistente con bottom sheet su mobile
- Card cliccabili con hover/active states
- Form con spacing adeguato e input touch-friendly
- Bottone "Indietro" per tornare allo Step 1

---

## 3. Modifica: Pagina Registrazione

**File: `src/pages/Register.tsx`**

Modifiche:
1. Cambiare il testo del link da "Non hai il codice di accesso? Richiedilo via email" a "Non hai il codice di accesso?"
2. Rimuovere il `mailto:` link
3. Aggiungere state per gestire apertura modale
4. Al click, aprire `AccessRequestModal`
5. Importare e renderizzare il nuovo componente

```tsx
// Esempio struttura
const [accessRequestModalOpen, setAccessRequestModalOpen] = useState(false);

// Nel JSX, sostituire il link mailto con:
<button
  type="button"
  onClick={() => setAccessRequestModalOpen(true)}
  className="text-xs text-muted-foreground underline hover:text-foreground transition-colors"
>
  Non hai il codice di accesso?
</button>

// E aggiungere la modale:
<AccessRequestModal 
  open={accessRequestModalOpen} 
  onClose={() => setAccessRequestModalOpen(false)} 
/>
```

---

## 4. Pagina Super Admin: `AccessRequestsPage`

**File: `src/pages/super-admin/AccessRequestsPage.tsx`**

### Struttura:
- Usa `SuperAdminLayout` come wrapper
- Usa pattern CRUD esistente con `useCrudState` (custom, non il generico, perche serve logica specifica)
- Header con titolo e contatore richieste pendenti

### Tabella con colonne:
| Colonna | Contenuto |
|---------|-----------|
| Data | created_at formattato |
| Tipo | Badge colorato per request_type |
| Nome | first_name + last_name o nome referente |
| Email | email |
| Organizzazione | company_name o association_name |
| Status | Badge con pending/contacted/closed |
| Azioni | Bottone per aprire dettagli |

### Filtri:
- Dropdown per tipo richiesta (tutti / employee_needs_code / company_lead / association_lead / individual_waitlist)
- Dropdown per status (tutti / pending / contacted / closed)

### Dialog Dettagli:
- Mostra tutti i campi della richiesta
- Select per cambiare status
- Textarea per aggiungere note interne
- Bottone "Salva modifiche"

---

## 5. Modifica: Sidebar Super Admin

**File: `src/components/layout/SuperAdminLayout.tsx`**

Aggiungere nuova voce nella sidebar dopo "Codici Accesso":

```tsx
{
  label: "Richieste Accesso",
  icon: Inbox,
  href: "/super-admin/access-requests",
}
```

---

## 6. Modifica: Router App.tsx

Aggiungere nuova route protetta:

```tsx
<Route
  path="/super-admin/access-requests"
  element={
    <ProtectedSuperAdminRoute>
      <AccessRequestsPage />
    </ProtectedSuperAdminRoute>
  }
/>
```

---

## 7. Riepilogo File

| File | Azione |
|------|--------|
| Database migration | Creare tabella `access_requests` con enum types e RLS |
| `src/components/auth/AccessRequestModal.tsx` | NUOVO - Modale multi-step |
| `src/pages/Register.tsx` | Modificare link e aggiungere modale |
| `src/pages/super-admin/AccessRequestsPage.tsx` | NUOVO - Pagina gestione richieste |
| `src/components/layout/SuperAdminLayout.tsx` | Aggiungere voce sidebar |
| `src/App.tsx` | Aggiungere route |

---

## Note Tecniche

### Inserimento senza autenticazione
La policy RLS `FOR INSERT WITH CHECK (true)` permette inserimenti anonimi. Questo e necessario perche gli utenti che inviano richieste non sono ancora autenticati.

### Validazione input
- Email obbligatoria e validata client-side
- Campi obbligatori variabili in base al tipo di richiesta
- Uso di zod per validazione form

### UX Mobile
- BaseModal gia ottimizzato per bottom-sheet su mobile
- Card di selezione con touch targets di almeno 48px
- Form con `autocomplete` attributes appropriati

### Mapping Tipi → Etichette (per badges)
```typescript
const REQUEST_TYPE_LABELS = {
  employee_needs_code: "Dipendente",
  company_lead: "Lead Azienda", 
  association_lead: "Lead Associazione",
  individual_waitlist: "Privato"
};

const STATUS_LABELS = {
  pending: "In attesa",
  contacted: "Contattato",
  closed: "Chiuso"
};
```
