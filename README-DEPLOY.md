# 🚀 Déploiement RH Studio sur Proxmox

## Pré-requis
- Un LXC ou VM avec **Docker** et **Docker Compose** installés
- Accès SSH au serveur

---

## Étape 1 — Cloner le projet

```bash
git clone https://github.com/Crapoto94/Studio-RH.git /opt/rh-studio
cd /opt/rh-studio
```

---

## Étape 2 — Créer le fichier de configuration

Copiez-collez la commande complète ci-dessous. Elle crée directement le fichier `.env` avec vos valeurs :

```bash
cat > .env << 'EOF'
# Base de données (SQLite, persistée dans le volume Docker)
DATABASE_URL=file:/app/prisma/dev.db

# Sécurité NextAuth — CHANGEZ cette valeur par une chaîne aléatoire d'au moins 32 caractères
NEXTAUTH_SECRET=REMPLACEZ-PAR-UNE-CLE-SECRETE-32-CHARS-MIN
# URL publique de l'application (adresse IP ou nom de domaine de votre serveur Proxmox)
NEXTAUTH_URL=http://IP_DE_VOTRE_SERVEUR:5010

# Port de l'application (modifiable)
APP_PORT=5010

# Active Directory
AD_SERVER=ldap://dc1.ivry.local
AD_BASE_DN=DC=ivry,DC=local
AD_USER=CN=svc-rh-studio,OU=Services,DC=ivry,DC=local
AD_PASSWORD=VOTRE_MOT_DE_PASSE_AD

# Azure / Microsoft Entra
AZURE_TENANT_ID=VOTRE_TENANT_ID
AZURE_CLIENT_ID=VOTRE_CLIENT_ID
AZURE_CLIENT_SECRET=VOTRE_CLIENT_SECRET

# API Ville (RH Oracle)
API_VILLE_URL=https://api.ivry.local/api
API_VILLE_TOKEN=VOTRE_TOKEN_API
API_VILLE_VUE=V_AGENTS

# Si l'API utilise une AC interne ou un certificat auto-signé, fournir le
# certificat de l'AC (pas le certificat serveur seul) à Node.js :
# NODE_EXTRA_CA_CERTS=/chemin/vers/ca-api-ville.pem
# Bypass temporaire (à éviter en production) : API_VILLE_TLS_INSECURE=true

# Mail
MAIL_API_URL=https://api.ivry.local/api/mail
EOF
```

> ⚠️ **Modifiez les valeurs** `REMPLACEZ-PAR-...` et `IP_DE_VOTRE_SERVEUR` avant de lancer.

### Alternative : éditer à la main

Si vous préférez, créez le fichier avec un éditeur :

```bash
cp .env.example .env
vi .env
```
Dans `vi` : appuyez `i` pour éditer, `Echap` puis `:wq` pour sauvegarder et quitter.

---

## Étape 3 — Lancer l'application

```bash
docker compose up -d --build
```

> Le premier build prend ~3-5 minutes (compilation Next.js).

---

## Étape 4 — Vérifier que l'app tourne

```bash
# Voir les logs en temps réel
docker compose logs -f

# Vérifier le statut du container
docker compose ps
```

L'app est accessible sur : `http://IP_DE_VOTRE_SERVEUR:5010`

---

## Commandes utiles

```bash
# Arrêter
docker compose down

# Redémarrer
docker compose restart

# Mettre à jour depuis Git
git pull
docker compose up -d --build

# Voir les logs
docker compose logs -f rhstudio-app
```

---

## En cas de problème

```bash
# Entrer dans le container
docker exec -it rhstudio-app sh

# Vérifier la base de données
docker exec rhstudio-app ls /app/prisma/
```

---

## Structure des données

La base SQLite est stockée dans un **volume Docker nommé `rhstudio_data`**.
Elle survit aux redémarrages et mises à jour de l'application.

```bash
# Localiser le volume sur le host
docker volume inspect rhstudio_data
```
