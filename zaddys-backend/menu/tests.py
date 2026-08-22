import hashlib
import hmac
import json
from unittest.mock import patch

from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from .models import CustomerProfile, DeliveryZone, Order, Product, Category


class AccountDeletionTests(TestCase):
	def setUp(self):
		self.client = APIClient()
		self.user = User.objects.create_user(username='customer', email='customer@example.com', password='password')
		CustomerProfile.objects.create(user=self.user)
		self.client.force_authenticate(self.user)

	def test_delete_account_removes_user_and_keeps_order_history_anonymous(self):
		zone = DeliveryZone.objects.create(name='Tanke', fee=500)
		order = Order.objects.create(
			user=self.user,
			customer_name='Customer',
			email=self.user.email,
			phone='08000000000',
			delivery_address='Somewhere',
			delivery_zone=zone,
			total_price=500,
		)

		response = self.client.delete('/api/profile/')

		self.assertEqual(response.status_code, 204)
		self.assertFalse(User.objects.filter(pk=self.user.pk).exists())
		order.refresh_from_db()
		self.assertIsNone(order.user)


class PaystackWebhookTests(TestCase):
	def setUp(self):
		self.client = APIClient()
		self.secret = 'webhook-secret'
		self.settings = patch('menu.views_webhook.settings.PAYSTACK_SECRET_KEY', self.secret)
		self.settings.start()
		self.addCleanup(self.settings.stop)

	def test_invalid_signature_is_rejected(self):
		response = self.client.post('/api/webhooks/paystack/', data='{}', content_type='application/json')
		self.assertEqual(response.status_code, 401)

	def test_success_event_updates_existing_order(self):
		user = User.objects.create_user(username='buyer', email='buyer@example.com')
		order = Order.objects.create(
			user=user,
			customer_name='Buyer',
			email=user.email,
			phone='08000000000',
			delivery_address='Somewhere',
			payment_reference='ref-123',
			total_price=1000,
		)
		body = json.dumps({'event': 'charge.success', 'data': {'reference': 'ref-123', 'id': 42, 'channel': 'card'}}).encode()
		signature = hmac.new(self.secret.encode(), body, hashlib.sha512).hexdigest()

		response = self.client.post('/api/webhooks/paystack/', data=body, content_type='application/json', HTTP_X_PAYSTACK_SIGNATURE=signature)

		self.assertEqual(response.status_code, 200)
		order.refresh_from_db()
		self.assertTrue(order.is_paid)
		self.assertEqual(order.transaction_id, '42')
