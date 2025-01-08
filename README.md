# Coda Bank - Application Bancaire CLI

Une application bancaire en ligne de commande développée avec TypeScript.

## 🌟 Fonctionnalités

- 🔐 **Authentification sécurisée**
  - PIN à 4 chiffres
  - Limite de 3 tentatives
  - Hachage sécurisé avec bcrypt

- 💰 **Gestion de compte courant**
  - Dépôt d'argent
  - Retrait d'argent
  - Consultation du solde
  - Découvert autorisé

- 🏦 **Compte épargne (en cours de développement non fonctionnel !!!)**
  - Transfert vers l'épargne
  - Retrait de l'épargne
  - Taux d'intérêt de 2%

- 📝 **Historique des opérations**
  - Affichage des 10 dernières opérations
  - Détails complets (date, type, montant, solde)
  - Statut des opérations

- 💾 **Persistance des données**
  - Sauvegarde automatique dans des fichiers JSON
  - Conservation de l'historique complet
  - Restauration des données au redémarrage

## 🛠️ Prérequis

- Node.js (v18 ou supérieur)
- npm (inclus avec Node.js)

## 📥 Installation

1. Clonez le dépôt :

2. Installez les dépendances :
```bash
npm install
```

## 🚀 Démarrage

1. Compilez le projet :
```bash
npm run build
```

2. Lancez l'application :
```bash
npm start
```

## 🔑 Utilisation

- **PIN par défaut** : 1234
- Suivez les instructions à l'écran pour naviguer dans le menu
- Utilisez les flèches ↑/↓ pour sélectionner une option
- Appuyez sur Entrée pour valider votre choix

## 📋 Structure du projet

```
coda-bank/
├── src/
│   ├── models/
│   │   └── User.ts
│   ├── services/
│   │   ├── BankService.ts
│   │   └── StorageService.ts
│   ├── CLI.ts
│   └── index.ts
├── data/
│   ├── user.json
│   └── transactions.json
├── package.json
└── tsconfig.json
```

## 🔒 Sécurité

- Les PINs sont hashés avec bcrypt
- Les données sensibles sont stockées de manière sécurisée
- Limitation des tentatives de connexion

## 📝 Notes techniques

- Développé en TypeScript
- Utilisation de la bibliothèque `prompts` pour l'interface CLI
- Architecture modulaire et maintenable
- Gestion asynchrone des opérations
- Validation des entrées utilisateur

## 🤝 Contribution

Ce projet est un test technique et n'accepte pas de contributions externes.
