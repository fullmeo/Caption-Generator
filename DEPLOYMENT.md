# 🚀 Déploiement - Caption Generator

Guide complet pour déployer Caption Generator sur Netlify.

---

## 📋 Prérequis

- [x] Compte Netlify (gratuit: https://app.netlify.com/signup)
- [x] Repository Git (GitHub, GitLab, ou Bitbucket)
- [x] Frontend build testé localement
- [x] Clés API (OpenAI, Anthropic) prêtes

---

## 🎯 Déploiement Frontend (Netlify)

### Option 1: Déploiement via Git (Recommandé)

#### 1. Préparer le Repository

```bash
# S'assurer que tout est commité
git status
git add .
git commit -m "Ready for production deployment"
git push origin main
```

#### 2. Connecter à Netlify

1. **Aller sur** https://app.netlify.com/
2. **Cliquer** "Add new site" > "Import an existing project"
3. **Choisir** votre provider Git (GitHub)
4. **Autoriser** Netlify à accéder à vos repos
5. **Sélectionner** le repo `Caption-Generator`

#### 3. Configuration du Build

Netlify détectera automatiquement `netlify.toml`, mais vérifiez:

```yaml
Base directory: frontend
Build command: npm run build
Publish directory: frontend/dist
```

**Paramètres avancés:**
- Node version: 18
- NPM version: 9

#### 4. Variables d'Environnement

**Aller dans** Site settings > Environment variables

Ajouter:

| Variable | Valeur | Description |
|----------|--------|-------------|
| `VITE_API_URL` | `https://your-backend-api.com` | URL de votre backend |
| `NODE_VERSION` | `18` | Version Node.js |

**Important**: Les variables `VITE_*` sont accessibles dans le code frontend.

#### 5. Déployer

1. **Cliquer** "Deploy site"
2. **Attendre** ~2 minutes
3. **Site live!** `https://random-name-123.netlify.app`

---

### Option 2: Déploiement Manuel (Drag & Drop)

#### 1. Build Local

```bash
cd frontend
npm run build
```

**Vérifier** que `dist/` contient:
- index.html
- assets/
- manifest.webmanifest
- sw.js
- *.png (icônes)

#### 2. Drag & Drop sur Netlify

1. **Aller sur** https://app.netlify.com/drop
2. **Glisser-déposer** le dossier `frontend/dist/`
3. **Attendre** l'upload
4. **Site live** immédiatement!

**Limitations:**
- Pas de CI/CD automatique
- Pas de preview deploys
- Redéploiement manuel

---

## 🔧 Configuration Netlify (netlify.toml)

Le fichier `netlify.toml` à la racine configure:

### Build Settings

```toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = "dist"
```

### Headers Sécurité

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Cache-Control = "public, max-age=0, must-revalidate"
```

### Cache Static Assets

```toml
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Service Worker (Important!)

```toml
[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
```

**Pourquoi?** Le Service Worker doit être rafraîchi à chaque visite pour détecter les updates.

### SPA Routing

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Pourquoi?** React Router nécessite que toutes les routes renvoient `index.html`.

---

## 🌐 Domaine Personnalisé

### Configurer un Domaine

1. **Site settings** > **Domain management**
2. **Add custom domain**
3. **Entrer** votre domaine: `caption-generator.app`

### DNS Configuration

Chez votre registrar (Namecheap, OVH, etc.):

**Option A: CNAME (Sous-domaine)**
```
Type: CNAME
Name: www
Value: random-name-123.netlify.app
```

**Option B: A Record (Domaine apex)**
```
Type: A
Name: @
Value: 75.2.60.5
```

**Netlify DNS (Recommandé)**
- Nameservers: dns1.p0X.nsone.net, etc.
- DNS automatique
- HTTPS gratuit

### HTTPS / SSL

✅ **Automatique avec Netlify!**
- Let's Encrypt gratuit
- Renouvellement auto
- HTTP → HTTPS redirect

---

## 🔐 Variables d'Environnement

### Frontend (Vite)

Variables accessibles dans le code:

```bash
# Site settings > Environment variables

VITE_API_URL=https://api.caption-generator.app
VITE_APP_NAME=Caption Generator
VITE_VERSION=1.0.0
```

**Usage dans le code:**
```javascript
const API_URL = import.meta.env.VITE_API_URL;
```

### Backend API URL

**Développement:**
```env
VITE_API_URL=http://localhost:8000
```

**Production:**
```env
VITE_API_URL=https://api.caption-generator.app
```

---

## 🎨 PWA sur Netlify

### Vérifications

✅ **Service Worker généré** (`dist/sw.js`)
✅ **Manifest présent** (`dist/manifest.webmanifest`)
✅ **Icônes** (`dist/pwa-*.png`)
✅ **HTTPS activé** (requis pour PWA)

### Test PWA

1. **Déployer** sur Netlify
2. **Ouvrir** le site en HTTPS
3. **Chrome DevTools** > Lighthouse
4. **Générer rapport PWA**

**Score attendu**: 100/100 ✅

### Installation

**Desktop:**
- Aller sur le site
- Attendre 5s → Prompt apparaît
- Cliquer "Installer"

**Mobile:**
- Ouvrir dans Chrome/Safari
- "Ajouter à l'écran d'accueil"

---

## 🚀 Déploiement Backend

### Options Backend

#### Option 1: Netlify Functions (Serverless)

**Avantages:**
- Gratuit jusqu'à 125k requêtes/mois
- Pas de serveur à gérer
- Scale automatique

**Limitations:**
- 10s timeout
- Pas d'IA intensive (GPT-4 Vision lent)

**Setup:**
```bash
# Créer functions/
mkdir netlify/functions

# Convertir FastAPI en Netlify Functions
# (Nécessite refactoring)
```

#### Option 2: Railway / Render

**Railway** (Recommandé pour FastAPI):
```bash
# 1. Créer compte Railway.app
# 2. New Project > Deploy from GitHub
# 3. Select backend/
# 4. Configure:
#    - Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
#    - Variables: OPENAI_API_KEY, ANTHROPIC_API_KEY
```

**Render**:
- Similar à Railway
- Free tier disponible
- Auto-deploy depuis Git

#### Option 3: VPS (Digital Ocean, AWS)

**Si budget OK:**
- Ubuntu 22.04 LTS
- 2GB RAM minimum
- Nginx + Gunicorn + FastAPI
- Setup HTTPS avec Let's Encrypt

---

## 📊 Monitoring & Analytics

### Netlify Analytics

**Site settings** > **Analytics**
- Visiteurs uniques
- Pages vues
- Top pages
- Trafic sources

**Prix**: $9/mois (optionnel)

### Google Analytics

**Ajouter dans** `frontend/index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Plausible Analytics (Privacy-friendly)

Alternative à Google Analytics:
- Conforme RGPD
- Pas de cookies
- Dashboard simple
- $9/mois

---

## 🔄 CI/CD Automatique

### Netlify Deploy Previews

**Pour chaque Pull Request:**
1. Build automatique
2. Deploy preview unique
3. URL: `https://deploy-preview-123--site.netlify.app`
4. Tests automatiques (si configurés)

**Configuration:**
```toml
# netlify.toml
[context.deploy-preview]
  command = "npm run build"

[context.branch-deploy]
  command = "npm run build"
```

### GitHub Actions (Optionnel)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Netlify
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd frontend && npm ci
      - run: cd frontend && npm run build
      - uses: netlify/actions/cli@master
        with:
          args: deploy --prod
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

---

## ⚡ Performance

### Optimisations Netlify

**1. Asset Optimization**
- Automatic Brotli compression
- Smart CDN caching
- Image optimization (add-on)

**2. CDN**
- Global CDN (32 datacenters)
- Automatic HTTPS
- HTTP/2 & HTTP/3

**3. Build Plugins**

```toml
# netlify.toml
[[plugins]]
  package = "@netlify/plugin-lighthouse"

[[plugins]]
  package = "netlify-plugin-cache"
```

---

## 🐛 Troubleshooting

### Build Failed

**Erreur:** `Command failed with exit code 1`

**Solutions:**
1. Vérifier `package.json` scripts
2. Tester build local: `npm run build`
3. Check Node version: `node -v` (doit être 18+)
4. Clear cache: Site settings > Build & deploy > Clear cache

### Page 404

**Erreur:** Routes React retournent 404

**Solution:** Vérifier `_redirects` ou `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### PWA Not Installing

**Causes:**
- HTTPS non activé
- Service Worker manquant
- Manifest invalide

**Solutions:**
1. Vérifier HTTPS: Doit être `https://`
2. Check DevTools > Application > Manifest
3. Check DevTools > Application > Service Workers

### Environment Variables Not Working

**Problème:** `import.meta.env.VITE_API_URL` undefined

**Solutions:**
1. Variables doivent commencer par `VITE_`
2. Rebuild après ajout variables
3. Check Site settings > Environment variables

---

## 📋 Checklist Déploiement

### Avant le Deploy

- [ ] Build local réussi (`npm run build`)
- [ ] Tests passent
- [ ] Icônes PWA générées
- [ ] Variables d'env documentées
- [ ] Backend URL configurée
- [ ] Git push sur main

### Configuration Netlify

- [ ] Repository connecté
- [ ] Build settings corrects
- [ ] Variables d'env ajoutées
- [ ] Domaine configuré (optionnel)
- [ ] HTTPS activé

### Après le Deploy

- [ ] Site accessible
- [ ] PWA installable
- [ ] API fonctionne (si backend déployé)
- [ ] Lighthouse score > 90
- [ ] Test sur mobile
- [ ] Test installation PWA

---

## 💰 Coûts

### Netlify (Frontend)

**Starter (Free):**
- ✅ 100 GB bandwidth/mois
- ✅ 300 build minutes/mois
- ✅ Deploy previews
- ✅ HTTPS gratuit
- ✅ CDN global

**Pro ($19/mois):**
- 400 GB bandwidth
- 25k build minutes
- Analytics
- Background functions

**Pour Caption Generator:** Free tier suffit largement! ✅

### Backend Hosting

**Railway:**
- $5/mois (500 heures)
- $0.01/heure après

**Render:**
- Free tier (limité)
- $7/mois (starter)

**VPS Digital Ocean:**
- $6/mois (basic droplet)

---

## 🎯 Prochaines Étapes

### Immédiat

1. **Déployer** sur Netlify (5 min)
2. **Tester** le site live
3. **Configurer** domaine personnalisé (optionnel)

### Court Terme

1. **Analytics** (Google/Plausible)
2. **Backend** (Railway/Render)
3. **Monitoring** (Sentry pour errors)

### Long Terme

1. **CI/CD** complet
2. **Tests E2E** automatiques
3. **A/B testing**
4. **Feature flags**

---

## 📚 Ressources

- **Netlify Docs**: https://docs.netlify.com/
- **Vite Deploy**: https://vitejs.dev/guide/static-deploy.html
- **PWA on Netlify**: https://www.netlify.com/blog/2019/03/11/netlify-pwa/
- **Custom Domains**: https://docs.netlify.com/domains-https/custom-domains/

---

## 🆘 Support

**Problèmes?**
1. Check Netlify Deploy logs
2. Consulter cette doc
3. Netlify Community: https://answers.netlify.com/

---

**Votre Caption Generator est prêt pour le déploiement!** 🚀

**Temps estimé:** 5-10 minutes pour le premier deploy.
