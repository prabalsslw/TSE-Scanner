// Domain whitelist - Configurable array
const ALLOWED_DOMAINS = [
  // Add your allowed domains here
];

export const isValidURL = (url, enableWhitelist = false) => {
  try {
    const parsed = new URL(url);
    
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    if (enableWhitelist && ALLOWED_DOMAINS.length > 0) {
      const hostname = parsed.hostname.replace('www.', '');
      return ALLOWED_DOMAINS.some(domain => {
        if (domain.startsWith('*.')) {
          const baseDomain = domain.slice(2);
          return hostname.endsWith(baseDomain);
        }
        return hostname === domain;
      });
    }

    return true;
  } catch {
    return false;
  }
};