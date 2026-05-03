(function () {
    const defaultSettings = {
        site_title: 'CLK Teknoloji',
        whatsapp_number: '+905071561515',
        contact_email: 'info@clkteknoloji.com',
        contact_address: 'Bagcilar, Istanbul',
        about_short: ''
    };

    function normalizeWhatsApp(number) {
        return String(number || '').replace(/[^0-9]/g, '');
    }

    function applySettings(settings) {
        document.querySelectorAll('[data-setting]').forEach((el) => {
            const key = el.getAttribute('data-setting');
            if (!key) return;
            const value = settings[key];
            if (value === undefined || value === null || value === '') return;

            const attr = el.getAttribute('data-setting-attr');
            const format = el.getAttribute('data-setting-format');
            let output = value;

            if (format === 'wa') {
                const number = normalizeWhatsApp(value);
                output = number ? `https://wa.me/${number}` : '';
            } else if (format === 'tel') {
                output = `tel:${value}`;
            } else if (format === 'mailto') {
                output = `mailto:${value}`;
            }

            if (attr) {
                el.setAttribute(attr, output);
            } else {
                el.textContent = output;
            }
        });
    }

    async function loadSettings() {
        let settings = { ...defaultSettings };
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const data = await res.json();
                settings = { ...settings, ...data };
            }
        } catch (err) {
            // Keep defaults on error.
        }

        window.siteSettings = settings;
        window.getWhatsAppNumber = function () {
            return settings.whatsapp_number || defaultSettings.whatsapp_number;
        };
        window.buildWhatsAppLink = function (message) {
            const number = normalizeWhatsApp(settings.whatsapp_number || defaultSettings.whatsapp_number);
            const text = message ? `?text=${encodeURIComponent(message)}` : '';
            return `https://wa.me/${number}${text}`;
        };

        applySettings(settings);
    }

    document.addEventListener('DOMContentLoaded', loadSettings);
})();
