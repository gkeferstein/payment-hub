/**
 * BTCPay Webhook Handler
 * Handles webhook events from BTCPay Server
 * 
 * Events handled:
 * - InvoiceSettled
 * - InvoiceExpired
 * - InvoiceInvalid
 */

import { Request } from 'express';
import crypto from 'crypto';

/**
 * Verify BTCPay webhook signature
 */
export function verifyBTCPaySignature(req: Request): boolean {
  const signature = req.headers['btcpay-sig'] as string;
  const webhookSecret = process.env.BTCPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('BTCPAY_WEBHOOK_SECRET not configured');
    return false;
  }

  if (!signature) {
    console.error('Missing BTCPay signature header');
    return false;
  }

  // BTCPay uses HMAC-SHA256
  // Format: sha256=<hash>
  const parts = signature.split('=');
  if (parts.length !== 2 || parts[0] !== 'sha256') {
    console.error('Invalid BTCPay signature format');
    return false;
  }

  const receivedHash = parts[1];
  const payload = JSON.stringify(req.body);
  const expectedHash = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(receivedHash),
    Buffer.from(expectedHash)
  );
}

