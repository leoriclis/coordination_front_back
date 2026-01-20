# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""

from apps.base.models.company import Company
from flask import render_template, redirect, request, url_for, current_app, jsonify
import os
from datetime import datetime, timedelta, timezone
import jwt
from flask_login import (
    current_user,
    login_user,
    logout_user
)

from apps import db, login_manager
from apps.authentication import blueprint
from apps.authentication.forms import LoginForm, CreateAccountForm

from apps.authentication.util import verify_pass

from apps.authentication.models import Users
from flasgger.utils import swag_from


@blueprint.route('/')
def route_default():
    return redirect(url_for('authentication_blueprint.login'))


# Login & Registration

@blueprint.route('/login', methods=['GET', 'POST'])
@swag_from('swagger/login_specs.yml', methods=['GET'])
@swag_from('swagger/login_specs.yml', methods=['POST'])
def login():
    login_form = LoginForm(request.form)

    if 'login' in request.form:

        # read form data
        username = request.form['username']
        password = request.form['password']

        # Locate user
        user = Users.query.filter_by(username=username).first()

        # Check the password
        if user and verify_pass(password, user.password):

            login_user(user)
            return redirect('/apidocs')

        # Something (user or pass) is not ok
        return render_template('accounts/login.html',
                               msg='Mauvais pseudo ou mot de passe',
                               form=login_form)

    logout_user()
    return render_template('accounts/login.html',
                               form=login_form)


@blueprint.route('/register', methods=['GET', 'POST'])
def register():
    create_account_form = CreateAccountForm(request.form)
    if 'register' in request.form:

        form_data = request.form.copy()

        username = request.form['username']
        email = request.form['email']
        company_id = int(request.form['company']) if request.form['company'] else None
        form_data['company_id'] = company_id
        form_data.pop('company', None)

        # Check usename exists
        user = Users.query.filter_by(username=username).first()
        if user:
            return render_template('accounts/register.html',
                                   msg='Pseudo déjà utilisé',
                                   success=False,
                                   form=create_account_form)

        # Check email exists
        user = Users.query.filter_by(email=email).first()
        if user:
            return render_template('accounts/register.html',
                                   msg='Adresse mail déjà utilisée',
                                   success=False,
                                   form=create_account_form)

        # else we can create the user
        user = Users(**form_data)
        db.session.add(user)
        db.session.commit()

        return render_template('accounts/register.html',
                               msg='Utilisateur créé, <a href="/login">se connecter</a>',
                               success=True,
                               form=create_account_form)

    else:
        companies = Company.query.all()
        create_account_form.company.choices = [('', 'Select a company...')] + [(str(company.id), company.name) for company in companies]
        return render_template('accounts/register.html', form=create_account_form)


@blueprint.route('/api/auth/token', methods=['POST'])
def token():
    payload = request.get_json(silent=True) or {}
    username = payload.get('username')
    password = payload.get('password')

    if not username or not password:
        return jsonify({'message': 'username and password are required'}), 400

    user = Users.query.filter_by(username=username).first()
    if not user or not verify_pass(password, user.password):
        return jsonify({'message': 'invalid credentials'}), 401

    if not user.company_id:
        return jsonify({'message': 'user must be linked to a company'}), 400

    secret = os.getenv('JWT_SECRET') or current_app.config.get('SECRET_KEY')
    if not secret:
        return jsonify({'message': 'JWT secret not configured'}), 500

    expires_minutes = int(os.getenv('JWT_EXPIRES_MINUTES', '60'))
    now = datetime.now(timezone.utc)
    exp = now + timedelta(minutes=expires_minutes)

    token = jwt.encode(
        {
            'sub': str(user.id),
            'iat': int(now.timestamp()),
            'exp': int(exp.timestamp()),
            'https://hasura.io/jwt/claims': {
                'x-hasura-default-role': 'user',
                'x-hasura-allowed-roles': ['user'],
                'x-hasura-user-id': str(user.id),
                'x-hasura-company-id': str(user.company_id),
            },
        },
        secret,
        algorithm='HS256',
    )

    return jsonify({'access_token': token, 'token_type': 'Bearer', 'expires_at': int(exp.timestamp())})


@blueprint.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('authentication_blueprint.login'))


# Errors

@login_manager.unauthorized_handler
def unauthorized_handler():
    return render_template('home/page-403.html'), 403


@blueprint.errorhandler(403)
def access_forbidden(error):
    return render_template('home/page-403.html'), 403


@blueprint.errorhandler(404)
def not_found_error(error):
    return render_template('home/page-404.html'), 404


@blueprint.errorhandler(500)
def internal_error(error):
    return render_template('home/page-500.html'), 500
