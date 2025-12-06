<?php
/**
 * WooCommerce Parallel Integration Example
 * 
 * Diese Datei zeigt, wie Sie WooCommerce parallel zum Payment Hub verbinden,
 * OHNE die bestehende Stripe-Verbindung zu ersetzen.
 * 
 * Installation:
 * 1. Diese Datei in wp-content/plugins/order-hub-integration/ speichern
 * 2. Plugin aktivieren
 * 3. API-Key in der Konfiguration setzen
 */

/**
 * Plugin Name: Order Hub Parallel Integration
 * Description: Sendet Orders zusätzlich an Payment Hub (Shadow Mode)
 * Version: 1.0.0
 */

// Verhindere direkten Zugriff
if (!defined('ABSPATH')) {
    exit;
}

class OrderHubParallelIntegration {
    private $api_url = 'https://payment-hub.example.com/api/v1';
    private $api_key = 'test_key_woocommerce'; // Aus wp-config.php oder Options
    
    public function __construct() {
        // Hook nach Order-Erstellung (NACH bestehender Stripe-Verarbeitung)
        add_action('woocommerce_checkout_order_processed', [$this, 'send_order_to_payment_hub'], 20, 1);
        
        // Optional: Hook nach Payment-Status-Änderung
        add_action('woocommerce_order_status_changed', [$this, 'sync_order_status'], 10, 4);
    }
    
    /**
     * Sendet Order zusätzlich an Payment Hub
     * Wird NACH der bestehenden Stripe-Verarbeitung ausgeführt
     */
    public function send_order_to_payment_hub($order_id) {
        $order = wc_get_order($order_id);
        
        if (!$order) {
            return;
        }
        
        // Bestehende Stripe-Verbindung läuft normal weiter
        // (wird nicht geändert - diese Funktion sendet nur ZUSÄTZLICH)
        
        // API-Key aus Konfiguration holen
        $api_key = defined('ORDER_HUB_API_KEY') ? ORDER_HUB_API_KEY : $this->api_key;
        
        // Order-Daten für Payment Hub vorbereiten
        $order_data = [
            'source' => 'woocommerce',
            'source_order_id' => (string)$order_id,
            'customer_id' => $order->get_customer_id() ? (string)$order->get_customer_id() : null,
            'grand_total' => (float)$order->get_total(),
            'currency' => $order->get_currency(),
            'subtotal' => (float)$order->get_subtotal(),
            'tax_total' => (float)$order->get_total_tax(),
            'shipping_total' => (float)$order->get_shipping_total(),
            'discount_total' => (float)$order->get_total_discount(),
            'items' => $this->prepare_order_items($order),
            'metadata' => [
                'woocommerce_order_id' => $order_id,
                'order_key' => $order->get_order_key(),
                'payment_method' => $order->get_payment_method(),
                'payment_method_title' => $order->get_payment_method_title(),
                // Original Stripe Payment Intent (falls vorhanden)
                'original_stripe_payment_intent' => $order->get_meta('_stripe_payment_intent_id'),
            ],
        ];
        
        // Idempotency-Key generieren (verhindert Duplikate)
        $idempotency_key = 'wc_' . $order_id . '_' . $order->get_date_created()->getTimestamp();
        
        // HTTP Request an Payment Hub
        $response = wp_remote_post($this->api_url . '/orders', [
            'headers' => [
                'Authorization' => 'Bearer ' . $api_key,
                'Content-Type' => 'application/json',
                'Idempotency-Key' => $idempotency_key,
            ],
            'body' => json_encode($order_data),
            'timeout' => 10,
            'blocking' => false, // Asynchron senden, blockiert nicht
        ]);
        
        // Log für Debugging (optional)
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Order Hub: Order ' . $order_id . ' sent to Payment Hub');
            if (is_wp_error($response)) {
                error_log('Order Hub Error: ' . $response->get_error_message());
            } else {
                $response_code = wp_remote_retrieve_response_code($response);
                error_log('Order Hub Response Code: ' . $response_code);
            }
        }
        
        // Optional: Payment-Intent-ID speichern für späteren Vergleich
        if (!is_wp_error($response)) {
            $response_body = json_decode(wp_remote_retrieve_body($response), true);
            if (isset($response_body['data']['id'])) {
                $order->update_meta_data('_order_hub_id', $response_body['data']['id']);
                $order->save();
            }
        }
    }
    
    /**
     * Synchronisiert Order-Status mit Payment Hub
     * (Optional - nur wenn Callbacks aktiviert sind)
     */
    public function sync_order_status($order_id, $old_status, $new_status, $order) {
        // Nur wenn Callbacks aktiviert sind (nicht im Shadow Mode)
        // Diese Funktion würde den Status an Payment Hub senden
        // Für Shadow Mode nicht notwendig
    }
    
    /**
     * Bereitet Order-Items für Payment Hub vor
     */
    private function prepare_order_items($order) {
        $items = [];
        
        foreach ($order->get_items() as $item_id => $item) {
            $product = $item->get_product();
            
            $items[] = [
                'product_id' => $product ? (string)$product->get_id() : null,
                'name' => $item->get_name(),
                'quantity' => (int)$item->get_quantity(),
                'price' => (float)$item->get_total(),
                'subtotal' => (float)$item->get_subtotal(),
                'tax' => (float)$item->get_total_tax(),
                'metadata' => [
                    'woocommerce_item_id' => $item_id,
                    'variation_id' => $item->get_variation_id() ? (string)$item->get_variation_id() : null,
                ],
            ];
        }
        
        return $items;
    }
}

// Plugin initialisieren
new OrderHubParallelIntegration();

/**
 * Konfiguration in wp-config.php:
 * 
 * define('ORDER_HUB_API_KEY', 'test_key_woocommerce');
 * define('ORDER_HUB_API_URL', 'https://payment-hub.example.com/api/v1');
 */









