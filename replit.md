# LNT Paris – Gestion de Stock

## Overview

pnpm workspace monorepo using TypeScript. Application de gestion de stock pour LNT Paris (magasin de lunettes).

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Mobile**: Expo (React Native) with Expo Router

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (caisse, inventory, ventes)
│   └── mobile/             # Expo React Native app (LNT Paris)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## App Features (LNT Paris - Gestion de Stock)

### Écran Principal
- 2 options : Ouvrir la Caisse et Inventaire
- Mot de passe (1234) requis pour les 2 sections

### Caisse
- Choix du mode de paiement : Cash ou Carte Bancaire
- Enregistrement des sessions avec date, heure et localisation GPS
- Affichage du stock en temps réel
- Enregistrement rapide des ventes (- 1 paire) ou via modal

### Inventaire
- Gestion des collections (Santorini, Riviera, etc.)
- Gestion des produits par couleur dans chaque collection
- Modification des quantités
- Suppression de collections et produits
- Statistiques (total collections, produits, paires)

### Gestion du Stock
- Soustraction automatique lors de chaque vente
- Indicateurs visuels : vert (OK), orange (stock bas ≤2), rouge (vide)

## Database Schema

- `sessions_caisse` — sessions d'ouverture de caisse (date, heure, localisation, type_paiement)
- `collections` — collections de lunettes (nom, description)
- `produits` — produits par collection (couleur, quantite)
- `ventes` — historique des ventes (produit_id, quantite_vendue, type_paiement)

## API Endpoints

- `GET/POST /api/caisse/sessions` — sessions de caisse
- `GET/POST /api/collections` — collections d'inventaire
- `DELETE /api/collections/:id` — supprimer une collection
- `POST /api/produits` — ajouter un produit
- `PUT /api/produits/:id` — modifier quantité/couleur
- `DELETE /api/produits/:id` — supprimer un produit
- `POST /api/ventes` — enregistrer une vente (soustrait le stock)

## Password

Le mot de passe pour accéder à la caisse et à l'inventaire est : **1234**

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server with routes for caisse, inventory, ventes, and SumUp payment integration.

- **SumUp routes**: `POST /api/caisse/sumup/checkout` creates a checkout, `GET /api/caisse/sumup/checkout/:id` polls status
- **Merchant code**: MC4VDM6U (LNT Paris)
- **Env vars**: `SUMUP_API_KEY`, `SUMUP_MERCHANT_CODE`
- **Checkout URL pattern**: `https://pay.sumup.com/b2c/{checkoutId}`
- Ventes table stores `sumupCheckoutId`, `sumupTransactionId`, `paymentStatus`, `paidAt` for card payments

### `artifacts/mobile` (`@workspace/mobile`)

Expo React Native app for LNT Paris stock management.

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL.

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI 3.1 spec and Orval codegen config.

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec.
