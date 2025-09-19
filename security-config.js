/**
 * Security Configuration for Gentle Souls
 * This file contains security utilities and configurations
 */

// Security configuration object
const SecurityConfig = {
    // Content Security Policy settings
    csp: {
        'default-src': ["'self'"],
        'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
        'font-src': ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
        'img-src': ["'self'", "data:", "https:"],
        'script-src': ["'self'", "'unsafe-inline'"],
        'connect-src': ["'self'"],
        'frame-src': ["'none'"],
        'object-src': ["'none'"]
    },

    // Input validation patterns
    validation: {
        maxContentLength: 1000,
        allowedTags: [], // No HTML tags allowed
        blockedPatterns: [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /data:text\/html/gi
        ]
    },

    // Local storage security
    storage: {
        prefix: 'gentleSouls_',
        encryption: false, // Set to true if implementing encryption
        maxSize: 1024 * 1024 // 1MB limit
    }
};

// Security utility functions
const SecurityUtils = {
    /**
     * Sanitize user input to prevent XSS
     * @param {string} input - User input to sanitize
     * @returns {string} - Sanitized input
     */
    sanitizeInput: function(input) {
        if (typeof input !== 'string') return '';
        
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    },

    /**
     * Validate user input against security patterns
     * @param {string} input - User input to validate
     * @returns {boolean} - True if input is safe
     */
    validateInput: function(input) {
        if (typeof input !== 'string') return false;
        
        // Check length
        if (input.length > SecurityConfig.validation.maxContentLength) {
            return false;
        }
        
        // Check for blocked patterns
        for (const pattern of SecurityConfig.validation.blockedPatterns) {
            if (pattern.test(input)) {
                return false;
            }
        }
        
        return true;
    },

    /**
     * Create safe DOM elements
     * @param {string} tag - HTML tag name
     * @param {string} content - Text content
     * @param {string} className - CSS class name
     * @returns {HTMLElement} - Safe DOM element
     */
    createSafeElement: function(tag, content, className = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        element.textContent = content;
        return element;
    },

    /**
     * Safe localStorage operations with error handling
     * @param {string} key - Storage key
     * @param {any} value - Value to store
     * @returns {boolean} - Success status
     */
    safeStorageSet: function(key, value) {
        try {
            const fullKey = SecurityConfig.storage.prefix + key;
            const serialized = JSON.stringify(value);
            
            // Check size limit
            if (serialized.length > SecurityConfig.storage.maxSize) {
                console.error('Storage size limit exceeded');
                return false;
            }
            
            localStorage.setItem(fullKey, serialized);
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    },

    /**
     * Safe localStorage retrieval with validation
     * @param {string} key - Storage key
     * @returns {any} - Retrieved value or null
     */
    safeStorageGet: function(key) {
        try {
            const fullKey = SecurityConfig.storage.prefix + key;
            const value = localStorage.getItem(fullKey);
            
            if (value === null) return null;
            
            const parsed = JSON.parse(value);
            return parsed;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            // Remove corrupted data
            localStorage.removeItem(SecurityConfig.storage.prefix + key);
            return null;
        }
    },

    /**
     * Generate secure random ID
     * @returns {string} - Secure random ID
     */
    generateSecureId: function() {
        return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    },

    /**
     * Log security events
     * @param {string} event - Security event description
     * @param {any} data - Additional data
     */
    logSecurityEvent: function(event, data = null) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event: event,
            data: data,
            userAgent: navigator.userAgent
        };
        
        console.warn('Security Event:', logEntry);
        
        // In production, this would send to a security monitoring service
        // Example: sendToSecurityService(logEntry);
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SecurityConfig, SecurityUtils };
} else {
    // Browser environment
    window.SecurityConfig = SecurityConfig;
    window.SecurityUtils = SecurityUtils;
}
