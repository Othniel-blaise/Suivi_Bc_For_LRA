# Suivi Bons de Commande — Guide de démarrage

## Structure du projet
```
SUIVIS-BC/
├── backend/    → API REST (Node.js + Fastify + Prisma + MySQL WAMP)
├── web/        → Dashboard Patron (React + Vite)  → http://localhost:5173
└── mobile/     → App Réceptionniste (Expo)        → Expo Go sur téléphone
```

---

## ÉTAPE 1 — Préparer MySQL (WAMP)

1. Démarrer **WAMP Server** (icône verte dans la barre des tâches)
2. Ouvrir **phpMyAdmin** → `http://localhost/phpmyadmin`
3. Créer une base de données : **`suivi_bc`** (interclassement : `utf8mb4_unicode_ci`)

Si WAMP a un mot de passe root, modifier `backend/.env` :
```
DATABASE_URL="mysql://root:VOTRE_MOT_DE_PASSE@localhost:3306/suivi_bc"
```

---

## ÉTAPE 2 — Lancer le Backend

```bash
cd backend
npm install
npx prisma migrate dev --name init
node prisma/seed.js
npm run dev
```

Vérifier : http://localhost:3001/api/health → doit répondre `{"status":"ok"}`

---

## ÉTAPE 3 — Lancer le Dashboard Web (Patron)

Dans un **nouveau terminal** :
```bash
cd web
npm install
npm run dev
```

Ouvrir : http://localhost:5173
Connexion : **patron / admin123**

---

## ÉTAPE 4 — Lancer l'App Mobile (Réceptionniste)

### Trouver votre IP locale
```
ipconfig
```
→ Chercher "Adresse IPv4" (ex: 192.168.1.45)

### Modifier l'URL dans mobile/src/api/client.js
```js
const BASE_URL = __DEV__
  ? 'http://192.168.180.112:3001/api'   // ← Votre IP ici
  : ...
```

### Démarrer Expo
Dans un **nouveau terminal** :
```bash
cd mobile
npm install
npx expo start
```

→ Scanner le QR code avec **Expo Go** (télécharger sur App Store / Play Store)
→ Le téléphone doit être sur le **même réseau Wi-Fi** que le PC

Connexion mobile : **aminata / 1234** ou **kofi / 1234**

---

## Comptes de test

| Rôle | Identifiant | Mot de passe | Interface |
|------|------------|--------------|-----------|
| Patron | patron | admin123 | Web (localhost:5173) |
| Réceptionniste | aminata | 1234 | Mobile (Expo Go) |
| Réceptionniste | kofi | 1234 | Mobile (Expo Go) |

---

## Workflow

1. **Patron** crée un BC → statut "Transmis"
2. **Réceptionniste** reçoit la livraison → confirme sur mobile avec photo optionnelle
3. **Patron** voit le statut passer à "Livré" en temps réel (rafraîchissement 30s)
