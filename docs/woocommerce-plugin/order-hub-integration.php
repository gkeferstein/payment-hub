<?php
/**
 * Plugin Name: Order Hub Integration
 * Plugin URI: https://mojo-institut.de
 * Description: Integriert WooCommerce mit dem Payment Hub für zentrale Order- und Payment-Verwaltung. Läuft parallel zur bestehenden Stripe-Verbindung.
 * Version: 1.0.3
 * Author: MOJO Institut
 * Author URI: https://mojo-institut.de
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: order-hub-integration
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * WC requires at least: 5.0
 * WC tested up to: 8.0
 */

// Verhindere direkten Zugriff
if (!defined('ABSPATH')) {
    exit;
}

// Plugin-Konstanten
define('ORDER_HUB_VERSION', '1.0.3');
define('ORDER_HUB_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('ORDER_HUB_PLUGIN_URL', plugin_dir_url(__FILE__));
define('ORDER_HUB_PLUGIN_BASENAME', plugin_basename(__FILE__));

/**
 * Hauptklasse für Order Hub Integration
 */
class OrderHubIntegration {
    
    /**
     * Singleton-Instanz
     */
    private static $instance = null;
    
    /**
     * Plugin-Optionen
     */
    private $options;
    
    /**
     * Get Singleton-Instanz
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Konstruktor
     */
    private function __construct() {
        $this->options = get_option('order_hub_settings', []);
        $this->initHooks();
    }
    
    /**
     * Initialisiere WordPress Hooks
     */
    private function initHooks() {
        // Admin-Menü
        add_action('admin_menu', [$this, 'addAdminMenu']);
        add_action('admin_init', [$this, 'registerSettings']);
        
        // WooCommerce Hooks
        add_action('woocommerce_checkout_order_processed', [$this, 'sendOrderToPaymentHub'], 20, 1);
        add_action('woocommerce_order_status_changed', [$this, 'syncOrderStatus'], 10, 4);
        add_action('woocommerce_payment_complete', [$this, 'sendPaymentToPaymentHub'], 10, 1);
        
        // REST API für Callbacks
        add_action('rest_api_init', [$this, 'registerRestRoutes']);
        
        // Plugin-Aktivierung
        register_activation_hook(__FILE__, [$this, 'activate']);
        register_deactivation_hook(__FILE__, [$this, 'deactivate']);
        
        // Admin-Notices
        add_action('admin_notices', [$this, 'showAdminNotices']);
        
        // AJAX Handler
        add_action('wp_ajax_order_hub_test_connection', [$this, 'ajaxTestConnection']);
    }
    
    /**
     * Plugin aktivieren
     */
    public function activate() {
        // Standard-Einstellungen setzen
        $defaults = [
            'api_url' => 'https://paymentsapi.mojo-institut.de/api/v1',
            'api_key' => '',
            'enabled' => true,
            'shadow_mode' => true,
            'send_async' => true,
            'log_requests' => true,
            'callback_enabled' => false,
        ];
        
        $existing = get_option('order_hub_settings', []);
        update_option('order_hub_settings', array_merge($defaults, $existing));
        
        // Datenbank-Tabellen erstellen (falls nötig)
        $this->createDatabaseTables();
        
        // Flush rewrite rules für REST API
        flush_rewrite_rules();
    }
    
    /**
     * Plugin deaktivieren
     */
    public function deactivate() {
        // Cleanup (optional)
        flush_rewrite_rules();
    }
    
    /**
     * Admin-Menü hinzufügen
     */
    public function addAdminMenu() {
        add_options_page(
            'Order Hub Settings',
            'Order Hub',
            'manage_options',
            'order-hub-settings',
            [$this, 'renderSettingsPage']
        );
    }
    
    /**
     * Settings registrieren
     */
    public function registerSettings() {
        register_setting('order_hub_settings_group', 'order_hub_settings', [$this, 'sanitizeSettings']);
        
        // General Settings
        add_settings_section(
            'order_hub_general_section',
            'General Settings',
            [$this, 'renderGeneralSection'],
            'order-hub-settings'
        );
        
        add_settings_field(
            'api_url',
            'API URL',
            [$this, 'renderApiUrlField'],
            'order-hub-settings',
            'order_hub_general_section'
        );
        
        add_settings_field(
            'api_key',
            'API Key',
            [$this, 'renderApiKeyField'],
            'order-hub-settings',
            'order_hub_general_section'
        );
        
        add_settings_field(
            'enabled',
            'Enable Integration',
            [$this, 'renderEnabledField'],
            'order-hub-settings',
            'order_hub_general_section'
        );
        
        // Advanced Settings
        add_settings_section(
            'order_hub_advanced_section',
            'Advanced Settings',
            [$this, 'renderAdvancedSection'],
            'order-hub-settings'
        );
        
        add_settings_field(
            'shadow_mode',
            'Shadow Mode',
            [$this, 'renderShadowModeField'],
            'order-hub-settings',
            'order_hub_advanced_section'
        );
        
        add_settings_field(
            'send_async',
            'Send Asynchronously',
            [$this, 'renderAsyncField'],
            'order-hub-settings',
            'order_hub_advanced_section'
        );
        
        add_settings_field(
            'callback_enabled',
            'Enable Callbacks',
            [$this, 'renderCallbackField'],
            'order-hub-settings',
            'order_hub_advanced_section'
        );
        
        add_settings_field(
            'log_requests',
            'Log Requests',
            [$this, 'renderLogField'],
            'order-hub-settings',
            'order_hub_advanced_section'
        );
    }
    
    /**
     * Settings sanitizen
     */
    public function sanitizeSettings($input) {
        $sanitized = [];
        $sanitized['api_url'] = esc_url_raw($input['api_url'] ?? '');
        $sanitized['api_key'] = sanitize_text_field($input['api_key'] ?? '');
        $sanitized['enabled'] = isset($input['enabled']) ? (bool) $input['enabled'] : false;
        $sanitized['shadow_mode'] = isset($input['shadow_mode']) ? (bool) $input['shadow_mode'] : false;
        $sanitized['send_async'] = isset($input['send_async']) ? (bool) $input['send_async'] : true;
        $sanitized['callback_enabled'] = isset($input['callback_enabled']) ? (bool) $input['callback_enabled'] : false;
        $sanitized['log_requests'] = isset($input['log_requests']) ? (bool) $input['log_requests'] : true;
        return $sanitized;
    }
    
    /**
     * Settings-Seite rendern
     */
    public function renderSettingsPage() {
        if (!current_user_can('manage_options')) {
            return;
        }
        
        // Settings werden über Settings API gespeichert (automatisch)
        // Prüfe ob Settings gerade gespeichert wurden
        if (isset($_GET['settings-updated'])) {
            echo '<div class="notice notice-success is-dismissible"><p>Settings saved successfully!</p></div>';
        }
        
        $this->options = get_option('order_hub_settings', []);
        ?>
        <div class="wrap">
            <h1>Order Hub Integration Settings</h1>
            <form method="post" action="options.php">
                <?php
                settings_fields('order_hub_settings_group');
                do_settings_sections('order-hub-settings');
                submit_button('Save Settings');
                ?>
            </form>
            
            <hr>
            
            <h2>Test Connection</h2>
            <button type="button" class="button" id="test-connection">Test API Connection</button>
            <div id="test-result" style="margin-top: 10px;"></div>
            
            <hr>
            
            <h2>Sync Status</h2>
            <p>Last sync: <?php echo $this->getLastSyncTime(); ?></p>
            <p>Total orders sent: <?php echo $this->getTotalOrdersSent(); ?></p>
            <p>Failed requests: <?php echo $this->getFailedRequests(); ?></p>
        </div>
        
        <script>
        jQuery(document).ready(function($) {
            $('#test-connection').on('click', function() {
                var $button = $(this);
                var $result = $('#test-result');
                $button.prop('disabled', true);
                $result.html('<span class="spinner is-active"></span> Testing connection...');
                
                // Get current form values
                var apiUrl = $('input[name="order_hub_settings[api_url]"]').val();
                var apiKey = $('input[name="order_hub_settings[api_key]"]').val();
                
                if (!apiUrl || !apiKey) {
                    $result.html('<div class="notice notice-error"><p>Please enter API URL and API Key first.</p></div>');
                    $button.prop('disabled', false);
                    return;
                }
                
                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    data: {
                        action: 'order_hub_test_connection',
                        nonce: '<?php echo wp_create_nonce('order_hub_test'); ?>',
                        api_url: apiUrl,
                        api_key: apiKey
                    },
                    success: function(response) {
                        if (response.success) {
                            $result.html('<div class="notice notice-success"><p>' + response.data.message + '</p></div>');
                        } else {
                            $result.html('<div class="notice notice-error"><p>' + (response.data?.message || 'Connection test failed') + '</p></div>');
                        }
                    },
                    error: function(xhr, status, error) {
                        $result.html('<div class="notice notice-error"><p>Connection test failed: ' + error + '</p></div>');
                    },
                    complete: function() {
                        $button.prop('disabled', false);
                    }
                });
            });
        });
        </script>
        <?php
    }
    
    /**
     * Section-Renderer
     */
    public function renderGeneralSection() {
        echo '<p>Configure the basic connection settings for Order Hub.</p>';
    }
    
    public function renderAdvancedSection() {
        echo '<p>Advanced settings for fine-tuning the integration behavior.</p>';
    }
    
    /**
     * Field-Renderer
     */
    public function renderApiUrlField() {
        $value = $this->options['api_url'] ?? 'https://paymentsapi.mojo-institut.de/api/v1';
        echo '<input type="url" name="order_hub_settings[api_url]" value="' . esc_attr($value) . '" class="regular-text" required>';
        echo '<p class="description">Base URL of the Order Hub API (e.g., https://paymentsapi.mojo-institut.de/api/v1)</p>';
    }
    
    public function renderApiKeyField() {
        $value = $this->options['api_key'] ?? '';
        echo '<input type="password" name="order_hub_settings[api_key]" value="' . esc_attr($value) . '" class="regular-text" required>';
        echo '<p class="description">API Key for authentication (get from Order Hub Admin)</p>';
    }
    
    public function renderEnabledField() {
        $checked = isset($this->options['enabled']) && $this->options['enabled'] ? 'checked' : '';
        echo '<input type="checkbox" name="order_hub_settings[enabled]" value="1" ' . $checked . '>';
        echo '<p class="description">Enable Order Hub integration</p>';
    }
    
    public function renderShadowModeField() {
        $checked = isset($this->options['shadow_mode']) && $this->options['shadow_mode'] ? 'checked' : '';
        echo '<input type="checkbox" name="order_hub_settings[shadow_mode]" value="1" ' . $checked . '>';
        echo '<p class="description">Shadow Mode: Only monitor orders, don\'t send callbacks</p>';
    }
    
    public function renderAsyncField() {
        $checked = isset($this->options['send_async']) && $this->options['send_async'] ? 'checked' : '';
        echo '<input type="checkbox" name="order_hub_settings[send_async]" value="1" ' . $checked . '>';
        echo '<p class="description">Send requests asynchronously (recommended, doesn\'t block checkout)</p>';
    }
    
    public function renderCallbackField() {
        $checked = isset($this->options['callback_enabled']) && $this->options['callback_enabled'] ? 'checked' : '';
        echo '<input type="checkbox" name="order_hub_settings[callback_enabled]" value="1" ' . $checked . '>';
        echo '<p class="description">Enable callbacks from Order Hub (requires REST API endpoint)</p>';
    }
    
    public function renderLogField() {
        $checked = isset($this->options['log_requests']) && $this->options['log_requests'] ? 'checked' : '';
        echo '<input type="checkbox" name="order_hub_settings[log_requests]" value="1" ' . $checked . '>';
        echo '<p class="description">Log all API requests for debugging</p>';
    }
    
    /**
     * Order an Payment Hub senden
     */
    public function sendOrderToPaymentHub($order_id) {
        // Prüfe ob Integration aktiviert ist
        if (!isset($this->options['enabled']) || !$this->options['enabled']) {
            return;
        }
        
        $order = wc_get_order($order_id);
        if (!$order) {
            $this->log('Order not found: ' . $order_id, 'error');
            return;
        }
        
        // Bereite Order-Daten vor
        $order_data = $this->prepareOrderData($order);
        
        // Idempotency-Key generieren
        $idempotency_key = $this->generateIdempotencyKey($order);
        
        // Prüfe ob Order bereits gesendet wurde
        if ($this->isOrderAlreadySent($order_id, $idempotency_key)) {
            $this->log('Order already sent: ' . $order_id, 'info');
            return;
        }
        
        // Sende Request
        $this->sendRequest('orders', $order_data, $idempotency_key, $order_id);
    }
    
    /**
     * Order-Status synchronisieren
     */
    public function syncOrderStatus($order_id, $old_status, $new_status, $order) {
        // Nur wenn Callbacks deaktiviert sind (Shadow Mode)
        // In Shadow Mode senden wir keine Status-Updates
        if (isset($this->options['shadow_mode']) && $this->options['shadow_mode']) {
            return;
        }
        
        // Optional: Status-Update an Payment Hub senden
        // (wird normalerweise über Callbacks gemacht)
    }
    
    /**
     * Payment an Payment Hub senden
     */
    public function sendPaymentToPaymentHub($order_id) {
        if (!isset($this->options['enabled']) || !$this->options['enabled']) {
            return;
        }
        
        $order = wc_get_order($order_id);
        if (!$order) {
            return;
        }
        
        // Payment-Daten vorbereiten
        $payment_data = $this->preparePaymentData($order);
        
        // Idempotency-Key
        $idempotency_key = $this->generatePaymentIdempotencyKey($order);
        
        // Sende Payment
        $this->sendRequest('payments', $payment_data, $idempotency_key, $order_id);
    }
    
    /**
     * Order-Daten für Payment Hub vorbereiten
     */
    private function prepareOrderData($order) {
        $items = [];
        foreach ($order->get_items() as $item_id => $item) {
            $product = $item->get_product();
            $items[] = [
                'product_id' => $product ? (string) $product->get_id() : null,
                'name' => $item->get_name(),
                'quantity' => (int) $item->get_quantity(),
                'price' => (float) $item->get_total(),
                'subtotal' => (float) $item->get_subtotal(),
                'tax' => (float) $item->get_total_tax(),
                'metadata' => [
                    'woocommerce_item_id' => (string) $item_id,
                    'variation_id' => $item->get_variation_id() ? (string) $item->get_variation_id() : null,
                ],
            ];
        }
        
        return [
            'source' => 'woocommerce',
            'source_order_id' => (string) $order->get_id(),
            'customer_id' => $order->get_customer_id() ? (string) $order->get_customer_id() : null,
            'grand_total' => (float) $order->get_total(),
            'currency' => $order->get_currency(),
            'subtotal' => (float) $order->get_subtotal(),
            'tax_total' => (float) $order->get_total_tax(),
            'shipping_total' => (float) $order->get_shipping_total(),
            'discount_total' => (float) $order->get_total_discount(),
            'status' => $this->mapWooCommerceStatus($order->get_status()),
            'items' => $items,
            'metadata' => [
                'woocommerce_order_id' => $order->get_id(),
                'order_key' => $order->get_order_key(),
                'payment_method' => $order->get_payment_method(),
                'payment_method_title' => $order->get_payment_method_title(),
                'billing_email' => $order->get_billing_email(),
                'billing_phone' => $order->get_billing_phone(),
                'billing_address' => [
                    'first_name' => $order->get_billing_first_name(),
                    'last_name' => $order->get_billing_last_name(),
                    'company' => $order->get_billing_company(),
                    'address_1' => $order->get_billing_address_1(),
                    'address_2' => $order->get_billing_address_2(),
                    'city' => $order->get_billing_city(),
                    'state' => $order->get_billing_state(),
                    'postcode' => $order->get_billing_postcode(),
                    'country' => $order->get_billing_country(),
                ],
                'shipping_address' => [
                    'first_name' => $order->get_shipping_first_name(),
                    'last_name' => $order->get_shipping_last_name(),
                    'company' => $order->get_shipping_company(),
                    'address_1' => $order->get_shipping_address_1(),
                    'address_2' => $order->get_shipping_address_2(),
                    'city' => $order->get_shipping_city(),
                    'state' => $order->get_shipping_state(),
                    'postcode' => $order->get_shipping_postcode(),
                    'country' => $order->get_shipping_country(),
                ],
                'original_stripe_payment_intent' => $order->get_meta('_stripe_payment_intent_id'),
            ],
        ];
    }
    
    /**
     * Payment-Daten vorbereiten
     */
    private function preparePaymentData($order) {
        return [
            'order_id' => $this->getOrderHubOrderId($order->get_id()),
            'source' => 'woocommerce',
            'source_payment_id' => (string) $order->get_id(),
            'provider' => $this->mapPaymentProvider($order->get_payment_method()),
            'amount' => (float) $order->get_total(),
            'currency' => $order->get_currency(),
            'status' => $this->mapPaymentStatus($order->get_status()),
            'metadata' => [
                'woocommerce_order_id' => $order->get_id(),
                'payment_method' => $order->get_payment_method(),
                'transaction_id' => $order->get_transaction_id(),
                'stripe_payment_intent' => $order->get_meta('_stripe_payment_intent_id'),
            ],
        ];
    }
    
    /**
     * HTTP Request senden
     */
    private function sendRequest($endpoint, $data, $idempotency_key, $order_id) {
        $api_url = $this->options['api_url'] ?? '';
        $api_key = $this->options['api_key'] ?? '';
        
        if (empty($api_url) || empty($api_key)) {
            $this->log('API URL or API Key not configured', 'error');
            return false;
        }
        
        $url = rtrim($api_url, '/') . '/' . $endpoint;
        
        $args = [
            'method' => 'POST',
            'headers' => [
                'Authorization' => 'Bearer ' . $api_key,
                'Content-Type' => 'application/json',
                'Idempotency-Key' => $idempotency_key,
            ],
            'body' => json_encode($data),
            'timeout' => 10,
        ];
        
        // Asynchron senden wenn aktiviert
        if (isset($this->options['send_async']) && $this->options['send_async']) {
            $args['blocking'] = false;
        }
        
        $this->log('Sending request to: ' . $url, 'info');
        $this->log('Request data: ' . json_encode($data), 'debug');
        
        $response = wp_remote_request($url, $args);
        
        if (is_wp_error($response)) {
            $this->log('Request failed: ' . $response->get_error_message(), 'error');
            $this->logFailedRequest($order_id, $endpoint, $response->get_error_message());
            return false;
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        
        $this->log('Response code: ' . $response_code, 'info');
        $this->log('Response body: ' . $response_body, 'debug');
        
        if ($response_code >= 200 && $response_code < 300) {
            // Erfolgreich
            $response_data = json_decode($response_body, true);
            if (isset($response_data['data']['id'])) {
                $this->saveOrderHubId($order_id, $response_data['data']['id']);
            }
            $this->logSuccessRequest($order_id, $endpoint);
            return true;
        } else {
            // Fehler
            $this->log('Request failed with code: ' . $response_code, 'error');
            $this->logFailedRequest($order_id, $endpoint, 'HTTP ' . $response_code . ': ' . $response_body);
            return false;
        }
    }
    
    /**
     * Idempotency-Key generieren
     */
    private function generateIdempotencyKey($order) {
        $timestamp = $order->get_date_created() ? $order->get_date_created()->getTimestamp() : time();
        return 'wc_' . $order->get_id() . '_' . $timestamp;
    }
    
    /**
     * Payment Idempotency-Key generieren
     */
    private function generatePaymentIdempotencyKey($order) {
        return 'wc_payment_' . $order->get_id() . '_' . time();
    }
    
    /**
     * Prüfe ob Order bereits gesendet wurde
     */
    private function isOrderAlreadySent($order_id, $idempotency_key) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'order_hub_sync';
        $exists = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM $table_name WHERE order_id = %d AND idempotency_key = %s",
            $order_id,
            $idempotency_key
        ));
        return $exists > 0;
    }
    
    /**
     * Order Hub ID speichern
     */
    private function saveOrderHubId($order_id, $order_hub_id) {
        update_post_meta($order_id, '_order_hub_id', $order_hub_id);
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'order_hub_sync';
        $wpdb->insert(
            $table_name,
            [
                'order_id' => $order_id,
                'order_hub_id' => $order_hub_id,
                'idempotency_key' => $this->generateIdempotencyKey(wc_get_order($order_id)),
                'status' => 'success',
                'created_at' => current_time('mysql'),
            ],
            ['%d', '%s', '%s', '%s', '%s']
        );
    }
    
    /**
     * Order Hub Order ID abrufen
     */
    private function getOrderHubOrderId($order_id) {
        return get_post_meta($order_id, '_order_hub_id', true);
    }
    
    /**
     * Status-Mapping WooCommerce → Order Hub
     */
    private function mapWooCommerceStatus($wc_status) {
        $mapping = [
            'pending' => 'pending',
            'processing' => 'processing',
            'on-hold' => 'pending',
            'completed' => 'delivered',
            'cancelled' => 'cancelled',
            'refunded' => 'refunded',
            'failed' => 'cancelled',
        ];
        return $mapping[$wc_status] ?? 'pending';
    }
    
    /**
     * Payment Provider Mapping
     */
    private function mapPaymentProvider($wc_payment_method) {
        $mapping = [
            'stripe' => 'stripe',
            'stripe_cc' => 'stripe',
            'stripe_sepa' => 'stripe',
            'paypal' => 'paypal',
            'bacs' => 'bank_transfer',
        ];
        return $mapping[$wc_payment_method] ?? 'unknown';
    }
    
    /**
     * Payment Status Mapping
     */
    private function mapPaymentStatus($wc_status) {
        if ($wc_status === 'completed' || $wc_status === 'processing') {
            return 'succeeded';
        }
        if ($wc_status === 'cancelled' || $wc_status === 'failed') {
            return 'failed';
        }
        return 'pending';
    }
    
    /**
     * REST API Routes registrieren (für Callbacks)
     */
    public function registerRestRoutes() {
        if (!isset($this->options['callback_enabled']) || !$this->options['callback_enabled']) {
            return;
        }
        
        register_rest_route('order-hub/v1', '/callback', [
            'methods' => 'POST',
            'callback' => [$this, 'handleCallback'],
            'permission_callback' => [$this, 'verifyCallback'],
        ]);
    }
    
    /**
     * Callback verarbeiten
     */
    public function handleCallback($request) {
        $data = $request->get_json_params();
        
        if (!isset($data['source_order_id'])) {
            return new WP_Error('invalid_data', 'Missing source_order_id', ['status' => 400]);
        }
        
        $order_id = intval($data['source_order_id']);
        $order = wc_get_order($order_id);
        
        if (!$order) {
            return new WP_Error('order_not_found', 'Order not found', ['status' => 404]);
        }
        
        // Status aktualisieren
        if (isset($data['status'])) {
            $wc_status = $this->mapOrderHubStatusToWooCommerce($data['status']);
            $order->update_status($wc_status, 'Status updated by Order Hub');
        }
        
        // Payment-Status aktualisieren
        if (isset($data['payment']['status'])) {
            // Payment-Status verarbeiten
        }
        
        return new WP_REST_Response(['success' => true], 200);
    }
    
    /**
     * Callback verifizieren
     */
    public function verifyCallback($request) {
        // Signature-Verifizierung (optional)
        $signature = $request->get_header('X-Order-Hub-Signature');
        // TODO: Implementiere Signature-Verifizierung
        return true;
    }
    
    /**
     * Status-Mapping Order Hub → WooCommerce
     */
    private function mapOrderHubStatusToWooCommerce($hub_status) {
        $mapping = [
            'pending' => 'pending',
            'confirmed' => 'processing',
            'paid' => 'processing',
            'processing' => 'processing',
            'shipped' => 'processing',
            'delivered' => 'completed',
            'cancelled' => 'cancelled',
            'refunded' => 'refunded',
        ];
        return $mapping[$hub_status] ?? 'pending';
    }
    
    /**
     * Logging
     */
    private function log($message, $level = 'info') {
        if (!isset($this->options['log_requests']) || !$this->options['log_requests']) {
            return;
        }
        
        $log_message = sprintf('[Order Hub] [%s] %s', strtoupper($level), $message);
        
        if (function_exists('wc_get_logger')) {
            $logger = wc_get_logger();
            $logger->log($level, $log_message, ['source' => 'order-hub-integration']);
        } else {
            error_log($log_message);
        }
    }
    
    /**
     * Datenbank-Tabellen erstellen
     */
    private function createDatabaseTables() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'order_hub_sync';
        
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            order_id bigint(20) unsigned NOT NULL,
            order_hub_id varchar(255) DEFAULT NULL,
            idempotency_key varchar(255) NOT NULL,
            status varchar(50) DEFAULT 'pending',
            error_message text DEFAULT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY idempotency_key (idempotency_key),
            KEY order_id (order_id),
            KEY order_hub_id (order_hub_id)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    /**
     * Helper-Methoden für Stats
     */
    private function getLastSyncTime() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'order_hub_sync';
        $last = $wpdb->get_var("SELECT MAX(created_at) FROM $table_name");
        return $last ? date_i18n(get_option('date_format') . ' ' . get_option('time_format'), strtotime($last)) : 'Never';
    }
    
    private function getTotalOrdersSent() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'order_hub_sync';
        return (int) $wpdb->get_var("SELECT COUNT(*) FROM $table_name WHERE status = 'success'");
    }
    
    private function getFailedRequests() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'order_hub_sync';
        return (int) $wpdb->get_var("SELECT COUNT(*) FROM $table_name WHERE status = 'error'");
    }
    
    private function logSuccessRequest($order_id, $endpoint) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'order_hub_sync';
        $wpdb->update(
            $table_name,
            ['status' => 'success'],
            ['order_id' => $order_id],
            ['%s'],
            ['%d']
        );
    }
    
    private function logFailedRequest($order_id, $endpoint, $error) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'order_hub_sync';
        $wpdb->insert(
            $table_name,
            [
                'order_id' => $order_id,
                'status' => 'error',
                'error_message' => $error,
                'created_at' => current_time('mysql'),
            ],
            ['%d', '%s', '%s', '%s']
        );
    }
    
    /**
     * AJAX: Test Connection
     */
    public function ajaxTestConnection() {
        check_ajax_referer('order_hub_test', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => 'Unauthorized']);
            return;
        }
        
        // Allow testing with form values (before saving) or saved values
        $api_url = isset($_POST['api_url']) ? sanitize_text_field($_POST['api_url']) : ($this->options['api_url'] ?? '');
        $api_key = isset($_POST['api_key']) ? sanitize_text_field($_POST['api_key']) : ($this->options['api_key'] ?? '');
        
        if (empty($api_url) || empty($api_key)) {
            wp_send_json_error(['message' => 'API URL or API Key not configured']);
            return;
        }
        
        $url = rtrim($api_url, '/') . '/settings';
        
        $response = wp_remote_get($url, [
            'headers' => [
                'Authorization' => 'Bearer ' . $api_key,
                'Content-Type' => 'application/json',
            ],
            'timeout' => 10,
        ]);
        
        if (is_wp_error($response)) {
            wp_send_json_error(['message' => 'Connection failed: ' . $response->get_error_message()]);
            return;
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        
        if ($response_code === 200) {
            wp_send_json_success(['message' => 'Connection successful! API is reachable.']);
        } else {
            $response_body = wp_remote_retrieve_body($response);
            wp_send_json_error(['message' => 'Connection failed. HTTP ' . $response_code . ': ' . substr($response_body, 0, 100)]);
        }
    }
    
    /**
     * Admin Notices
     */
    public function showAdminNotices() {
        if (!current_user_can('manage_options')) {
            return;
        }
        
        $screen = get_current_screen();
        if ($screen && $screen->id === 'settings_page_order-hub-settings') {
            $api_key = $this->options['api_key'] ?? '';
            if (empty($api_key)) {
                echo '<div class="notice notice-warning"><p>Order Hub: Please configure your API Key in the settings.</p></div>';
            }
        }
    }
}

// Plugin initialisieren
OrderHubIntegration::getInstance();

