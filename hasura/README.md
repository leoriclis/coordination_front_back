# Hasura metadata

This folder contains a minimal metadata export for table tracking and the
`user` role permissions. Apply it with the Hasura CLI:

```bash
hasura metadata apply --endpoint http://localhost:8080 --admin-secret <HASURA_GRAPHQL_ADMIN_SECRET>
```

If you prefer the console, you can re-create the same permissions manually:
- Track `company` and `product` tables.
- Create role `user` with select permissions restricted to
  `X-Hasura-Company-Id` on both tables.
