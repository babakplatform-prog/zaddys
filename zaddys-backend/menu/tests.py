import hashlib
import hmac
import json
import base64
import time
import tempfile
from unittest.mock import patch

from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import RequestFactory, TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework.request import Request

from .models import CustomerProfile, DeliveryZone, Order, Product, Category, ResendWebhookEvent
from .serializers import ProductSerializer


class ProductImageUploadTests(TestCase):
	def test_uploaded_image_is_returned_as_frontend_image_url(self):
		with tempfile.TemporaryDirectory() as media_root, override_settings(MEDIA_ROOT=media_root):
			category = Category.objects.create(name='Grills')
			product = Product.objects.create(name='Test Grill', category=category, price=2500)
			product.image_upload.save('test-grill.jpg', SimpleUploadedFile('test-grill.jpg', b'image-data', content_type='image/jpeg'), save=True)

			request = Request(RequestFactory().get('/api/products/'))
			serialized = ProductSerializer(product, context={'request': request}).data

			self.assertTrue(serialized['image'].endswith('/media/products/test-grill.jpg'))


class AccountDeletionTests(TestCase):
	def setUp(self):
		self.client = APIClient()
		self.user = User.objects.create_user(username='customer', email='customer@example.com', password='password')
		CustomerProfile.objects.create(user=self.user)
		self.client.force_authenticate(self.user)

	def test_delete_account_removes_user_and_keeps_order_history_anonymous(self):
		zone, _ = DeliveryZone.objects.get_or_create(name='Test Zone', defaults={'fee': 500})
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


class ResendWebhookTests(TestCase):
	def setUp(self):
		self.client = APIClient()
		self.secret_bytes = b'resend-webhook-secret'
		self.secret = 'whsec_' + base64.b64encode(self.secret_bytes).decode()
		self.settings = patch('menu.views_webhook.settings.RESEND_WEBHOOK_SECRET', self.secret)
		self.settings.start()
		self.addCleanup(self.settings.stop)

	def signed_request(self, event_id='msg-1', timestamp=None):
		timestamp = str(timestamp or int(time.time()))
		body = json.dumps({
			'type': 'email.delivered',
			'data': {'email_id': 'email-1'},
		}).encode()
		signed_content = f'{event_id}.{timestamp}.'.encode() + body
		signature = base64.b64encode(hmac.new(self.secret_bytes, signed_content, hashlib.sha256).digest()).decode()
		return body, {
			'HTTP_SVIX_ID': event_id,
			'HTTP_SVIX_TIMESTAMP': timestamp,
			'HTTP_SVIX_SIGNATURE': f'v1,{signature}',
		}

	def test_valid_event_is_saved_once(self):
		body, headers = self.signed_request()
		response = self.client.post('/api/webhooks/resend/', data=body, content_type='application/json', **headers)
		duplicate = self.client.post('/api/webhooks/resend/', data=body, content_type='application/json', **headers)

		self.assertEqual(response.status_code, 200)
		self.assertEqual(duplicate.json(), {'received': True, 'duplicate': True})
		self.assertEqual(ResendWebhookEvent.objects.count(), 1)

	def test_invalid_signature_is_rejected(self):
		body, headers = self.signed_request()
		headers['HTTP_SVIX_SIGNATURE'] = 'v1,invalid'
		response = self.client.post('/api/webhooks/resend/', data=body, content_type='application/json', **headers)
		self.assertEqual(response.status_code, 401)

	def test_expired_event_is_rejected(self):
		body, headers = self.signed_request(timestamp=int(time.time()) - 301)
		response = self.client.post('/api/webhooks/resend/', data=body, content_type='application/json', **headers)
		self.assertEqual(response.status_code, 401)
