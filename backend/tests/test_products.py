def test_get_products_returns_list(client):
    response = client.get('/api/product/')
    assert response.status_code == 200
    payload = response.get_json()
    assert 'data' in payload
    assert isinstance(payload['data'], list)
    assert len(payload['data']) == 1


def test_post_product_requires_fields(client):
    response = client.post('/api/product/', json={'name': 'Incomplete'})
    assert response.status_code == 400
    payload = response.get_json()
    assert 'fields' in payload


def test_put_product_updates_fields(client):
    list_response = client.get('/api/product/')
    product_id = list_response.get_json()['data'][0]['id']

    response = client.put(
        f'/api/product/{product_id}',
        json={'name': 'Updated', 'comment': 'Updated', 'quantity': 5},
    )
    assert response.status_code == 200
    payload = response.get_json()
    assert payload['name'] == 'Updated'
    assert payload['comment'] == 'Updated'
    assert payload['quantity'] == 5


def test_delete_product_removes_row(client):
    list_response = client.get('/api/product/')
    product_id = list_response.get_json()['data'][0]['id']

    response = client.delete(f'/api/product/{product_id}')
    assert response.status_code == 200

    list_response = client.get('/api/product/')
    payload = list_response.get_json()
    assert payload['data'] == []


def test_post_product_requires_payload(client):
    response = client.post('/api/product/', json={})
    assert response.status_code == 400
    payload = response.get_json()
    assert payload['message'] == 'Payload is required'


def test_put_product_requires_payload(client):
    list_response = client.get('/api/product/')
    product_id = list_response.get_json()['data'][0]['id']

    response = client.put(f'/api/product/{product_id}', json={})
    assert response.status_code == 400
    payload = response.get_json()
    assert payload['message'] == 'Payload is required'


def test_put_product_returns_404_for_unknown_id(client):
    response = client.put('/api/product/999', json={'name': 'Missing'})
    assert response.status_code == 404


def test_delete_product_returns_404_for_unknown_id(client):
    response = client.delete('/api/product/999')
    assert response.status_code == 404
    payload = response.get_json()
    assert payload['message'] == 'Product not found'
