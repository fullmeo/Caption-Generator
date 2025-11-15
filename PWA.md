# 📱 Progressive Web App (PWA) - Caption Generator

## Vue d'ensemble

Caption Generator est maintenant une **Progressive Web App** complète, offrant une expérience native sur tous les appareils avec support offline.

---

## ✨ Fonctionnalités PWA

### 1. **Installation Native** 📥
- Installation sur ordinateur (Windows, macOS, Linux)
- Installation sur mobile (iOS, Android)
- Icône sur l'écran d'accueil/bureau
- Lancement comme une application native

### 2. **Mode Hors Ligne** 🔌
- Fonctionne sans connexion internet
- Cache intelligent des pages et ressources
- Cache API avec stratégie NetworkFirst
- Synchronisation automatique à la reconnexion

### 3. **Mises à Jour Automatiques** 🔄
- Détection automatique des nouvelles versions
- Prompt élégant pour mettre à jour
- Mise à jour en arrière-plan
- Pas besoin de réinstaller

### 4. **Performance Optimale** ⚡
- Chargement instantané avec Service Worker
- Cache des polices Google Fonts
- Pré-cache des ressources statiques
- Réponse rapide même sur réseau lent

---

## 🏗️ Architecture Technique

### Service Worker
Configuration dans `vite.config.js`:

```javascript
workbox: {
  // Cache strategy
  runtimeCaching: [
    {
      // API calls: NetworkFirst (5 min cache)
      urlPattern: /\/api\/.*$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: { maxAgeSeconds: 300 }
      }
    },
    {
      // Fonts: CacheFirst (1 year cache)
      urlPattern: /^https:\/\/fonts\..*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-cache',
        expiration: { maxAgeSeconds: 31536000 }
      }
    }
  ]
}
```

### Composants PWA

#### **PWAInstallPrompt.jsx**
- Détecte la possibilité d'installation
- Affiche un prompt élégant après 5 secondes
- Instructions spécifiques iOS/Android
- Stocke la préférence utilisateur (ne montre qu'une fois)

#### **PWAUpdatePrompt.jsx**
- Détecte les nouvelles versions
- Affiche un prompt de mise à jour
- Indicateur de statut connexion (online/offline)
- Mise à jour au clic

---

## 📦 Fichiers Générés

Après `npm run build`, le plugin PWA génère:

```
dist/
├── manifest.webmanifest    # Manifest PWA auto-généré
├── sw.js                   # Service Worker
├── workbox-*.js            # Workbox runtime
└── pwa-*.png              # Icônes (à créer)
```

---

## 🎨 Icônes PWA - À Créer

### Icônes Requises

Placez ces icônes dans `/frontend/public/`:

| Fichier | Taille | Usage |
|---------|--------|-------|
| `pwa-192x192.png` | 192x192 | Android, petite icône |
| `pwa-512x512.png` | 512x512 | Android, grande icône |
| `apple-touch-icon.png` | 180x180 | iOS écran d'accueil |
| `favicon-32x32.png` | 32x32 | Favicon desktop |
| `favicon-16x16.png` | 16x16 | Favicon petit |
| `og-image.png` | 1200x630 | Partage social |

### Comment Créer les Icônes

**Option 1: Design Manual**
1. Créez un logo 512x512 avec fond transparent ou couleur `#9333ea`
2. Utilisez un outil comme Photoshop/Figma
3. Exportez en différentes tailles

**Option 2: Générateur en Ligne**
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator
- Téléchargez votre logo, générez tous les formats

**Option 3: CLI (pwa-asset-generator)**
```bash
npx pwa-asset-generator logo.svg public --scrape false
```

### Design Recommandé

```
Couleurs:
- Fond: #9333ea (purple-600)
- Icône: Blanc (#FFFFFF)
- Style: Moderne, minimaliste
- Thème: Musical (notes, micro, instruments)
```

---

## 🚀 Installation

### Sur Desktop (Chrome, Edge, Brave)

1. **Automatique**: Un prompt apparaîtra après 5 secondes
   - Cliquez sur "Installer"

2. **Manuel**:
   - Cliquez sur l'icône ➕ dans la barre d'adresse
   - Ou Menu > "Installer Caption Generator"

### Sur Android

1. **Automatique**: Prompt apparaît en bas de l'écran
2. **Manuel**: Menu (⋮) > "Ajouter à l'écran d'accueil"

### Sur iOS (Safari)

1. Appuyez sur le bouton **Partager** (⬆️)
2. Faites défiler et sélectionnez **"Sur l'écran d'accueil"**
3. Appuyez sur **"Ajouter"**

*Note: L'instruction apparaît automatiquement sur iOS*

---

## 🔧 Configuration PWA

### Manifest (vite.config.js)

```javascript
manifest: {
  name: 'Caption Generator - Générateur IA de Légendes Instagram',
  short_name: 'Caption Generator',
  description: 'Générateur IA pour musiciens...',
  theme_color: '#9333ea',
  background_color: '#ffffff',
  display: 'standalone',
  start_url: '/',
  icons: [...]
}
```

### Meta Tags (index.html)

Tous les meta tags nécessaires sont configurés:
- Theme color
- Apple mobile web app capable
- Open Graph (Facebook/LinkedIn)
- Twitter Cards

---

## 📊 Cache Strategy

| Ressource | Stratégie | Durée | Raison |
|-----------|-----------|-------|--------|
| Pages HTML | NetworkFirst | 24h | Contenu dynamique |
| API calls | NetworkFirst | 5 min | Données fraîches |
| JS/CSS | CacheFirst | Permanent | Versionné par hash |
| Fonts | CacheFirst | 1 an | Statiques |
| Images | CacheFirst | 7 jours | Peu de changements |

---

## 🧪 Tests

### Test en Développement

```bash
npm run dev
```

Le service worker est activé même en dev grâce à:
```javascript
devOptions: {
  enabled: true,
  type: 'module'
}
```

### Test de Production

```bash
npm run build
npm run preview
```

### Tester l'Installation

1. Ouvrez Chrome DevTools (F12)
2. Application > Manifest
   - Vérifiez que le manifest est chargé
3. Application > Service Workers
   - Vérifiez que le SW est actif
4. Application > Storage
   - Vérifiez les caches Workbox

### Tester le Mode Offline

1. Dans DevTools > Network
2. Cochez "Offline"
3. Rafraîchissez la page
4. L'app devrait fonctionner!

---

## 🐛 Dépannage

### Le prompt d'installation n'apparaît pas

**Causes possibles:**
- Déjà installé
- L'utilisateur a déjà refusé (`pwa-install-dismissed` dans localStorage)
- Navigateur non compatible
- HTTPS requis (pas en localhost)

**Solutions:**
```javascript
// Réinitialiser le prompt
localStorage.removeItem('pwa-install-dismissed');
// Rafraîchir la page
```

### Service Worker ne se met pas à jour

**Solutions:**
```javascript
// Dans DevTools > Application > Service Workers
// Cliquez sur "Unregister"
// Puis "Update on reload"
// Rafraîchissez la page
```

### Erreur "Failed to load module"

Vérifiez que `vite-plugin-pwa` est installé:
```bash
npm install -D vite-plugin-pwa workbox-window
```

---

## 📱 Compatibilité

| Plateforme | Installation | Offline | Notifications |
|------------|-------------|---------|---------------|
| Chrome Desktop | ✅ | ✅ | ✅ |
| Edge Desktop | ✅ | ✅ | ✅ |
| Firefox Desktop | ⚠️ Limitée | ✅ | ✅ |
| Safari Desktop | ⚠️ Limitée | ✅ | ❌ |
| Chrome Android | ✅ | ✅ | ✅ |
| Safari iOS | ✅ | ✅ | ❌ |

✅ = Support complet | ⚠️ = Support partiel | ❌ = Non supporté

---

## 🔐 Sécurité

### HTTPS Requis

En production, la PWA nécessite HTTPS (sauf localhost):
- Utilisez Netlify/Vercel (HTTPS automatique)
- Ou configurez Let's Encrypt sur votre serveur

### Permissions

L'app demande:
- 📦 Stockage local (cache)
- 🔔 Notifications (futur)
- 📸 Accès caméra (upload photos)

---

## 🚀 Déploiement

### Build Production

```bash
cd frontend
npm run build
```

Génère `dist/` avec:
- HTML/CSS/JS optimisés
- Service Worker configuré
- Manifest PWA
- Icônes PWA

### Déployer

**Netlify/Vercel:**
```bash
# Drag & drop dist/ folder
# Ou connecter le repo Git
```

**Serveur manuel:**
```bash
# Copier dist/ vers votre serveur web
scp -r dist/* user@server:/var/www/caption-generator/
```

### Configuration Serveur

Assurez-vous que:
1. HTTPS est activé
2. Headers CORS configurés si API séparée
3. Service Worker est servi avec bon MIME type

---

## 📈 Métriques PWA

### Lighthouse Score Attendu

- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 100
- **PWA**: 100

### Tester avec Lighthouse

```bash
# Chrome DevTools > Lighthouse
# Sélectionner "Progressive Web App"
# Générer le rapport
```

---

## 🎯 Prochaines Étapes

### Phase 1 ✅ (Actuel)
- [x] Service Worker
- [x] Manifest PWA
- [x] Installation prompt
- [x] Mode offline
- [x] Update prompt

### Phase 2 🔜 (Futur)
- [ ] Push Notifications
- [ ] Background Sync
- [ ] Share Target API
- [ ] Shortcuts API
- [ ] Badge API

---

## 📚 Ressources

- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [web.dev: PWA](https://web.dev/progressive-web-apps/)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Workbox](https://developers.google.com/web/tools/workbox)

---

## 🤝 Support

Pour toute question PWA:
1. Vérifiez cette documentation
2. Consultez les DevTools > Application
3. Vérifiez les logs Console
4. Ouvrez une issue GitHub

---

**Caption Generator PWA** - Propulsé par Vite PWA Plugin & Workbox 🚀
