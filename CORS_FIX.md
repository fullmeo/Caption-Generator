# 🔧 CORS Fix - Instructions de Redémarrage

## Problème Résolu ✅

Le problème CORS a été corrigé dans `backend/app/main.py`.

**Ce qui a été changé:**
- Ajout de `http://localhost:5174` dans les origines autorisées
- Ajout de `http://127.0.0.1:5173` et `http://127.0.0.1:5174`
- Support de plusieurs ports Vite

## Action Requise

**Vous devez redémarrer le backend pour appliquer les changements:**

### Option 1: Redémarrage Simple

```bash
# 1. Arrêter le backend (Ctrl+C dans le terminal)

# 2. Redémarrer
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Option 2: Vérifier que le Backend Tourne

```bash
# Vérifier si le backend répond
curl http://localhost:8000

# Vous devriez voir:
# {"message":"🎵 Caption Generator API","status":"running",...}
```

### Option 3: Kill et Restart

```bash
# Trouver le process
lsof -ti:8000

# Kill le process (remplacer PID par le numéro affiché)
kill -9 PID

# Redémarrer
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Vérification

Une fois le backend redémarré:

1. **Rafraîchir le frontend** (F5 dans le navigateur)
2. **Tester l'upload** d'une image
3. **Vérifier la console** - plus d'erreur CORS!

## Origines Maintenant Autorisées

✅ http://localhost:5173
✅ http://localhost:5174 (nouveau)
✅ http://localhost:3000
✅ http://127.0.0.1:5173
✅ http://127.0.0.1:5174 (nouveau)
✅ GitHub Preview URLs

## Logs Attendus

Après redémarrage, vous devriez voir:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

## Si le Problème Persiste

1. **Vérifier le port du frontend**:
   ```javascript
   // Dans la console DevTools
   console.log(window.location.origin)
   // Devrait être http://localhost:5174
   ```

2. **Vérifier que le backend a redémarré**:
   ```bash
   curl -I http://localhost:8000
   # Devrait retourner 200 OK
   ```

3. **Vider le cache du navigateur**:
   - Chrome: Ctrl+Shift+Delete
   - Ou mode navigation privée

## Backend Alternatif (si problème)

Si vous préférez autoriser TOUTES les origines localhost (SEULEMENT EN DEV):

```python
# Dans backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://localhost:\d+",  # Tous les ports localhost
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Notes

- Le `--reload` dans uvicorn détecte normalement les changements
- Mais CORS est configuré au démarrage, donc un restart est nécessaire
- En production, utilisez des origines spécifiques (pas de wildcard)

---

**Après le redémarrage, votre app devrait fonctionner parfaitement!** 🚀
