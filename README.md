# Coordination frontend / backend

## Contenu du repository
Ce repository est constitué d'une application fullstack :
- Base de donnée **Postgresql** accessible sur le port `5440`
- Backend **Flask** accessible sur le port `5005`
- Frontend **Next JS** accessible sur le port `3000`

Le backend utilise l'ORM SQLAlchemy et possède trois modèles :
- User
- Company
- Product

Le frontend permet le CRUD du modèle *Product*

## Prérequis
La stack nécessite `docker` et `docker compose` pour fonctionner.

## Lancement de la stack
Veuillez réaliser les étapes suivantes pour executer la stack :
- **Backend** : Créez un fichier `.env` à partir du `.env-template` et complétez le avec les informations nécessaires.
- **Frontend** : Créez un fichier `.env.local` à partir du `.env-template` et complétez le avec les informations nécessaires.

Pour lancer la stack, executez la commande suivante :  
`docker compose watch`

Au lancement, le service `db_migration_tp_coord_front_back` s'occupera d'appliquer les migrations de base de données managées par `SQLAlchemy`.

## Utilisation
Après le lancement, accèdez au backend flask à l'URL suivante pour vous créer un compte http://localhost:5005/register. Vous pourrez ensuite aller sur http://localhost:5005/login pour vous connecter.
L'API swagger est disponible à l'URL suivante :  
http://localhost:5005/apidocs

## Hasura (GraphQL)
Un service Hasura est ajoute via `docker-compose.yaml` et expose GraphQL sur `http://localhost:8080/v1/graphql`.

1. Completez le fichier `.env` avec :
   - `HASURA_GRAPHQL_ADMIN_SECRET`
   - `HASURA_GRAPHQL_JWT_SECRET`
   - `JWT_SECRET` (partage avec le backend)
2. Demarrez la stack : `docker compose watch`
3. Ouvrez la console Hasura : http://localhost:8080
4. Appliquez les metadonnees (permissions) :
   - Avec le CLI : `hasura metadata apply --endpoint http://localhost:8080 --admin-secret <secret>`
   - Ou manuellement via la console (cf. `hasura/README.md`)

## JWT pour Hasura
Un endpoint JSON permet de recuperer un JWT avec les claims Hasura :
`POST http://localhost:5005/api/auth/token` avec `{ "username": "...", "password": "..." }`.

Les claims incluent `x-hasura-company-id`, utilise pour filtrer Company et Product.

## Typage GraphQL (frontend)
Les requetes GraphQL sont dans `frontend/src/graphql/**/*.graphql` et le typage est genere par :

```bash
cd frontend
set HASURA_GRAPHQL_URL=http://localhost:8080/v1/graphql
set HASURA_GRAPHQL_ADMIN_SECRET=<secret>
npm run codegen
```
