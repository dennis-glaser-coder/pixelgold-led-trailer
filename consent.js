(function () {
  const GA_ID = 'G-77NPMG3RZP';
  const GOOGLE_ADS_ID = '';
  const GOOGLE_ADS_LEAD_LABEL = '';
  const CONSENT_KEY = 'ledtrailer-consent-v1';

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };

  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted'
  });

  function hasConsent() {
    try { return localStorage.getItem(CONSENT_KEY) === 'granted'; } catch (e) { return false; }
  }

  function loadAnalytics() {
    if (document.querySelector('script[data-ledtrailer-ga]')) return;

    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: GOOGLE_ADS_ID ? 'granted' : 'denied',
      ad_user_data: GOOGLE_ADS_ID ? 'granted' : 'denied',
      ad_personalization: GOOGLE_ADS_ID ? 'granted' : 'denied'
    });
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { send_page_view: true });
    if (GOOGLE_ADS_ID) window.gtag('config', GOOGLE_ADS_ID);

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    script.setAttribute('data-ledtrailer-ga', 'true');
    document.head.appendChild(script);
  }

  function trackEvent(name, params) {
    if (!hasConsent() || typeof window.gtag !== 'function') return;
    window.gtag('event', name, Object.assign({
      page_location: window.location.href,
      page_path: window.location.pathname
    }, params || {}));
  }

  function trackLead(method, label) {
    const params = {
      method: method,
      lead_source: 'led-trailer.com',
      lead_label: label || ''
    };
    trackEvent('generate_lead', params);

    if (GOOGLE_ADS_ID && GOOGLE_ADS_LEAD_LABEL && typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', {
        send_to: GOOGLE_ADS_ID + '/' + GOOGLE_ADS_LEAD_LABEL
      });
    }
  }

  window.ledTrailerTrackEvent = trackEvent;
  window.ledTrailerTrackLead = trackLead;

  function hideBanner() {
    const banner = document.getElementById('lt-consent');
    if (banner) banner.remove();
  }

  function saveChoice(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (e) {}
  }

  function getChoice() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }

  function showBanner() {
    if (document.getElementById('lt-consent')) return;

    const banner = document.createElement('div');
    banner.id = 'lt-consent';
    banner.className = 'lt-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'true');
    banner.setAttribute('aria-label', 'Datenschutz und Cookies');

    banner.innerHTML =
      '<div class="lt-consent__inner">' +
        '<div class="lt-consent__copy">' +
          '<strong>Datenschutz & Cookies</strong>' +
          '<p>Wir verwenden Google Analytics nur mit Ihrer Einwilligung, um die Nutzung unserer Website und Anfragen zu messen. Ohne Zustimmung bleibt Analytics deaktiviert. <a href="./datenschutz.html">Datenschutz</a></p>' +
        '</div>' +
        '<div class="lt-consent__actions">' +
          '<button type="button" class="lt-consent__button lt-consent__button--secondary" data-consent="denied">Ablehnen</button>' +
          '<button type="button" class="lt-consent__button lt-consent__button--primary" data-consent="granted">Akzeptieren</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(banner);

    banner.querySelector('[data-consent="denied"]').addEventListener('click', function () {
      saveChoice('denied');
      hideBanner();
      addSettingsButton();
    });

    banner.querySelector('[data-consent="granted"]').addEventListener('click', function () {
      saveChoice('granted');
      loadAnalytics();
      hideBanner();
      addSettingsButton();
    });
  }

  function addSettingsButton() {
    if (document.getElementById('lt-consent-settings')) return;
    const btn = document.createElement('button');
    btn.id = 'lt-consent-settings';
    btn.className = 'lt-consent-settings';
    btn.type = 'button';
    btn.textContent = 'Datenschutz-Einstellungen';
    btn.addEventListener('click', function () {
      showBanner();
    });
    document.body.appendChild(btn);
  }

  document.addEventListener('click', function (e) {
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (href.startsWith('tel:')) trackLead('phone', 'direct_call');
    else if (href.startsWith('mailto:')) trackLead('email', 'direct_email');
    else if (href.includes('wa.me/')) trackLead('whatsapp', 'direct_whatsapp');
  });

  document.addEventListener('DOMContentLoaded', function () {
    const choice = getChoice();
    if (choice === 'granted') {
      loadAnalytics();
      addSettingsButton();
    } else if (choice === 'denied') {
      addSettingsButton();
    } else {
      showBanner();
    }
  });
})();
