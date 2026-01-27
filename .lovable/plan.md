
# Piano: Unificare l'Accesso al Profilo per gli Admin

## Problema Identificato

Attualmente esiste una situazione di duplicazione:
- Gli **employee** accedono al profilo tramite `/app/profile` (con `AppLayout`)
- Gli **admin** hanno le loro pagine profilo specifiche:
  - Super Admin: `/super-admin/profile`
  - HR Admin: `/hr/profile`
  - Association Admin: `/association/my-profile`

Il problema e' che `ProtectedRoute` non controlla il ruolo, quindi un admin potrebbe navigare a `/app/profile` e trovarsi in un'interfaccia con il layout sbagliato (navigazione employee invece della sidebar admin).

## Soluzione Proposta

**Implementare una redirezione automatica basata sul ruolo** nella pagina `/app/profile`:

Quando un utente accede a `/app/profile`:
1. Se e' un **employee** --> rimane sulla pagina Profile.tsx normale
2. Se e' un **super_admin** --> redirect automatico a `/super-admin/profile`
3. Se e' un **hr_admin** --> redirect automatico a `/hr/profile`
4. Se e' un **association_admin** --> redirect automatico a `/association/my-profile`

Questo approccio:
- Mantiene un unico punto di ingresso logico (`/app/profile`)
- Garantisce che ogni utente veda il profilo nel contesto del proprio layout
- Non richiede modifiche ai link esistenti

## Dettagli Implementazione

### Modifica a `src/pages/Profile.tsx`

Aggiungere all'inizio del componente una logica di redirect:

```text
function Profile() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect admin users to their specific profile pages
  useEffect(() => {
    if (!loading && profile) {
      if (profile.role === "super_admin") {
        navigate("/super-admin/profile", { replace: true });
      } else if (profile.role === "hr_admin") {
        navigate("/hr/profile", { replace: true });
      } else if (profile.role === "association_admin") {
        navigate("/association/my-profile", { replace: true });
      }
    }
  }, [profile, loading, navigate]);

  // Show loading while redirecting
  if (loading || (profile?.role && profile.role !== "employee")) {
    return <LoadingSpinner />;
  }

  // ... resto del componente per employee
}
```

## File da Modificare

| File | Modifica |
|------|----------|
| `src/pages/Profile.tsx` | Aggiungere redirect automatico basato sul ruolo |

## Vantaggi

1. **Un solo punto di accesso**: l'URL `/app/profile` funziona per tutti
2. **Context corretto**: ogni utente vede il profilo nel proprio layout (employee vede AppLayout, admin vedono la loro sidebar)
3. **Nessuna confusione UX**: gli admin non vedranno mai l'interfaccia employee
4. **Retrocompatibile**: link esistenti continuano a funzionare
