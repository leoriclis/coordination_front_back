import pytest

from apps import create_app, db
from apps.config import config_dict
from apps.base.models import Company, Product


@pytest.fixture
def app():
    app = create_app(config_dict['Testing'])
    with app.app_context():
        db.create_all()
        company = Company(name='TestCo')
        db.session.add(company)
        db.session.commit()
        product = Product(name='Widget', comment='ok', quantity=2, company_id=company.id)
        db.session.add(product)
        db.session.commit()
    yield app
    with app.app_context():
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()
