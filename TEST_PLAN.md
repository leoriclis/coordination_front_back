# Test plan

## Frontend (ProductManager)
- Load: verify the product list renders and displays company name and quantity.
- Create: submit valid payload and confirm the list updates with the new row.
- Update: edit an existing product and verify the updated values render.
- Delete: remove a product and confirm it disappears from the list.
- Errors: trigger missing fields and confirm the validation message appears.

## Backend (/api/product)
- GET /api/product returns HTTP 200 and a list of products.
- POST /api/product rejects missing fields with HTTP 400.
- POST /api/product rejects missing payload with HTTP 400.
- PUT /api/product/{id} updates name/comment/quantity and returns HTTP 200.
- PUT /api/product/{id} rejects missing payload with HTTP 400.
- PUT /api/product/{id} returns HTTP 404 for unknown ids.
- DELETE /api/product/{id} returns HTTP 200 and removes the row.
- DELETE /api/product/{id} returns HTTP 404 for unknown ids.
