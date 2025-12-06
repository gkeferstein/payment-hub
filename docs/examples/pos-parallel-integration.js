/**
 * POS Parallel Integration Example
 * 
 * Diese Datei zeigt, wie Sie Ihren POS-Service parallel zum Payment Hub verbinden,
 * OHNE die bestehende Stripe-Verbindung zu ersetzen.
 * 
 * Installation:
 * 1. Diese Funktion in Ihr POS-System integrieren
 * 2. API-Key konfigurieren
 * 3. Nach Order-Erstellung aufrufen
 */

const PAYMENT_HUB_API_URL = process.env.PAYMENT_HUB_API_URL || 'https://payment-hub.example.com/api/v1';
const PAYMENT_HUB_API_KEY = process.env.PAYMENT_HUB_API_KEY || 'test_key_pos';

/**
 * Sendet Order zusätzlich an Payment Hub
 * Wird NACH der bestehenden Stripe-Verarbeitung aufgerufen
 * 
 * @param {Object} order - Order-Objekt aus POS-System
 * @param {string} order.id - Order-ID
 * @param {string} order.customerId - Customer-ID
 * @param {number} order.total - Gesamtbetrag
 * @param {string} order.currency - Währung
 * @param {Array} order.items - Order-Items
 * @param {string} order.stripePaymentIntentId - Original Stripe Payment Intent ID
 */
async function sendOrderToPaymentHub(order) {
    try {
        // Bestehende Stripe-Verbindung läuft normal weiter
        // (wird nicht geändert - diese Funktion sendet nur ZUSÄTZLICH)
        
        // Order-Daten für Payment Hub vorbereiten
        const orderData = {
            source: 'pos',
            source_order_id: order.id.toString(),
            customer_id: order.customerId ? order.customerId.toString() : null,
            grand_total: parseFloat(order.total),
            currency: order.currency || 'EUR',
            subtotal: parseFloat(order.subtotal || order.total),
            tax_total: parseFloat(order.tax || 0),
            shipping_total: parseFloat(order.shipping || 0),
            discount_total: parseFloat(order.discount || 0),
            items: order.items.map(item => ({
                product_id: item.productId?.toString() || null,
                name: item.name,
                quantity: parseInt(item.quantity),
                price: parseFloat(item.price),
                subtotal: parseFloat(item.subtotal || item.price * item.quantity),
                tax: parseFloat(item.tax || 0),
                metadata: {
                    pos_item_id: item.id?.toString(),
                },
            })),
            metadata: {
                pos_order_id: order.id.toString(),
                pos_location_id: order.locationId?.toString(),
                pos_terminal_id: order.terminalId?.toString(),
                // Original Stripe Payment Intent (falls vorhanden)
                original_stripe_payment_intent: order.stripePaymentIntentId,
            },
        };
        
        // Idempotency-Key generieren (verhindert Duplikate)
        const idempotencyKey = `pos_${order.id}_${Date.now()}`;
        
        // HTTP Request an Payment Hub
        const response = await fetch(`${PAYMENT_HUB_API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PAYMENT_HUB_API_KEY}`,
                'Content-Type': 'application/json',
                'Idempotency-Key': idempotencyKey,
            },
            body: JSON.stringify(orderData),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Payment Hub Error: ${response.status} - ${errorText}`);
            return null;
        }
        
        const responseData = await response.json();
        
        // Log für Debugging
        console.log(`Order Hub: Order ${order.id} sent to Payment Hub`, {
            orderHubId: responseData.data?.id,
            status: response.status,
        });
        
        // Optional: Payment Hub Order-ID speichern für späteren Vergleich
        if (responseData.data?.id) {
            order.orderHubId = responseData.data.id;
            // Speichern in Ihrer Datenbank
            // await saveOrderHubId(order.id, responseData.data.id);
        }
        
        return responseData;
    } catch (error) {
        console.error('Error sending order to Payment Hub:', error);
        // WICHTIG: Fehler sollte bestehende Stripe-Verbindung nicht beeinträchtigen
        return null;
    }
}

/**
 * Beispiel: Integration in bestehende Order-Erstellung
 */
async function createOrderWithPaymentHub(orderData) {
    // 1. Order in POS-System erstellen (bestehender Code)
    const order = await createOrderInPOS(orderData);
    
    // 2. Stripe Payment Intent erstellen (bestehender Code - UNVERÄNDERT)
    const stripePaymentIntent = await createStripePaymentIntent({
        amount: order.total,
        currency: order.currency,
        metadata: {
            pos_order_id: order.id,
        },
    });
    
    // Payment Intent ID speichern
    order.stripePaymentIntentId = stripePaymentIntent.id;
    
    // 3. ZUSÄTZLICH: Order an Payment Hub senden (NEU)
    // Wird asynchron ausgeführt, blockiert nicht
    sendOrderToPaymentHub(order).catch(error => {
        console.error('Payment Hub sync failed (non-critical):', error);
        // Fehler wird geloggt, aber Order-Erstellung ist nicht betroffen
    });
    
    return {
        order,
        stripePaymentIntent,
    };
}

/**
 * Beispiel: Webhook-Handler für Stripe
 * Optional: Webhooks auch an Payment Hub weiterleiten
 */
async function handleStripeWebhook(webhookEvent) {
    // 1. Bestehender Webhook-Handler (UNVERÄNDERT)
    await handleStripeWebhookInPOS(webhookEvent);
    
    // 2. ZUSÄTZLICH: Webhook an Payment Hub weiterleiten (NEU)
    // Nur wenn Payment Hub aktiv ist
    if (process.env.PAYMENT_HUB_ENABLED === 'true') {
        try {
            await fetch(`${PAYMENT_HUB_API_URL}/webhooks/stripe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'stripe-signature': webhookEvent.headers['stripe-signature'],
                },
                body: JSON.stringify(webhookEvent.body),
            });
        } catch (error) {
            console.error('Payment Hub webhook forwarding failed (non-critical):', error);
        }
    }
}

// Export für Verwendung
module.exports = {
    sendOrderToPaymentHub,
    createOrderWithPaymentHub,
    handleStripeWebhook,
};

/**
 * Konfiguration in .env:
 * 
 * PAYMENT_HUB_API_URL=https://payment-hub.example.com/api/v1
 * PAYMENT_HUB_API_KEY=test_key_pos
 * PAYMENT_HUB_ENABLED=true  # Für Webhook-Forwarding
 */









