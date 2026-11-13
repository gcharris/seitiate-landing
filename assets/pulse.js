(() => {
  'use strict';
  const panel = document.getElementById('estate-pulse');
  if (!panel) return;
  const status = document.getElementById('pulse-status');
  const refresh = document.getElementById('pulse-refresh');
  const notice = document.getElementById('pulse-analytics');
  const keys = ['active_repositories', 'merged_changes_7d', 'commits_24h'];
  let config, serviceURL, busy = false, lastSnapshot;
  async function getJSON(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(url, {cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer', signal: controller.signal});
      if (!response.ok) throw new Error('Unavailable');
      return await response.json();
    } finally { clearTimeout(timer); }
  }
  function timestamp(data) {
    const date = new Date(data.observed_at);
    if (!Number.isFinite(date.getTime()) || date.getTime() > Date.now() + 60000) throw new Error('Invalid date');
    return date;
  }
  function describe(data) {
    const date = timestamp(data);
    const age = Date.now() - date.getTime();
    return `${age > 15 * 60 * 1000 ? 'Last available snapshot' : 'Snapshot updated'} ${date.toLocaleString([], {dateStyle: 'medium', timeStyle: 'short'})}.`;
  }
  async function load(event) {
    if (busy) return;
    busy = true; refresh.disabled = true; panel.setAttribute('aria-busy', 'true');
    status.textContent = 'Checking the latest snapshot…';
    try {
      config = config || await getJSON('/assets/pulse-config.json');
      const service = config.service_url ? new URL(config.service_url) : null;
      if (service && (service.protocol !== 'https:' || service.username || service.password)) throw new Error('Invalid service');
      serviceURL = service;
      notice.hidden = !service;
      const url = service ? new URL('/pulse', service).href : config.snapshot_url;
      const data = await getJSON(url);
      timestamp(data);
      if (data.version !== 1 || !keys.every(k => Number.isSafeInteger(data.metrics?.[k]) && data.metrics[k] >= 0)) throw new Error('Invalid snapshot');
      if (lastSnapshot && timestamp(data) < timestamp(lastSnapshot)) throw new Error('Older snapshot');
      keys.forEach(k => { document.querySelector(`[data-pulse="${k}"]`).textContent = data.metrics[k].toLocaleString(); });
      lastSnapshot = data; status.textContent = describe(data);
    } catch (_) {
      status.textContent = lastSnapshot ? `${describe(lastSnapshot)} Refresh is temporarily unavailable.` : 'The activity snapshot is temporarily unavailable. Please try again shortly.';
    } finally {
      busy = false; refresh.disabled = false; panel.removeAttribute('aria-busy');
    }
    // Explicit interaction only. Never send invitation codes, page URLs, referrers or browser identifiers.
    if (serviceURL && !navigator.globalPrivacyControl && navigator.doNotTrack !== '1') {
      const requested = new URLSearchParams(location.search).get('via');
      const source = (config.sources || []).includes(requested) ? requested : 'direct';
      try {
        await fetch(new URL('/engagement', serviceURL), {
          method: 'POST', headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({event, source}), credentials: 'omit', referrerPolicy: 'no-referrer',
          signal: AbortSignal.timeout(8000)
        });
      } catch (_) { /* The counters remain useful if notifications cannot be delivered. */ }
    }
  }
  panel.addEventListener('toggle', () => { if (panel.open) load('open'); });
  refresh.addEventListener('click', () => load('refresh'));
})();
