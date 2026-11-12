(function() {
  const STORAGE_KEY = 'seitiate_gate_sakme_v1';

  function isAuthed() {
    try {
      const params = new URLSearchParams(window.location.search);
      const qCode = (params.get('code') || params.get('passcode') || '').trim().toUpperCase();
      if (qCode === 'SAKME') {
        localStorage.setItem(STORAGE_KEY, '1');
        return true;
      }
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function setAuthed() {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch (e) {}
  }

  if (isAuthed()) return;

  document.documentElement.classList.add('gated');

  const style = document.createElement('style');
  style.textContent = `
    html.gated body > *:not(#gate-overlay) { display: none !important; }
    #gate-overlay {
      position: fixed; inset: 0; z-index: 100000;
      background: #08090b; display: flex; align-items: center; justify-content: center;
      padding: 20px; font-family: 'Inter', -apple-system, sans-serif;
    }
    .gate-card {
      max-width: 400px; width: 100%; border: 1px solid #1a1c22; background: #0f1114;
      border-radius: 14px; padding: 34px 30px; text-align: center;
      box-shadow: 0 24px 48px rgba(0,0,0,0.6);
    }
    .gate-dot {
      width: 8px; height: 8px; border-radius: 50%; background: #4ade80;
      display: inline-block; margin-bottom: 12px;
      box-shadow: 0 0 12px rgba(74, 222, 128, 0.5);
    }
    .gate-kicker { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: #4ade80; letter-spacing: 0.06em; margin-bottom: 6px; }
    .gate-title { font-size: 1.28rem; font-weight: 600; color: #eceae7; margin-bottom: 8px; letter-spacing: -0.01em; }
    .gate-desc { font-size: 0.86rem; color: #8a8a90; margin-bottom: 22px; line-height: 1.55; }
    .gate-form { display: flex; gap: 8px; }
    .gate-input {
      flex: 1; background: #08090b; border: 1px solid #2a2e39; border-radius: 8px;
      padding: 10px 14px; color: #eceae7; font-family: 'JetBrains Mono', monospace;
      font-size: 1rem; text-transform: uppercase; letter-spacing: 0.14em; text-align: center; outline: none;
      transition: border-color 0.15s ease;
    }
    .gate-input:focus { border-color: #4ade80; }
    .gate-btn {
      background: #4ade80; color: #08090b; border: none; border-radius: 8px;
      padding: 10px 18px; font-size: 0.86rem; font-weight: 600; cursor: pointer; transition: opacity 0.15s;
    }
    .gate-btn:hover { opacity: 0.9; }
    .gate-error { color: #f87171; font-size: 0.76rem; font-family: 'JetBrains Mono', monospace; margin-top: 12px; display: none; }
    .gate-footer { margin-top: 18px; font-size: 0.75rem; color: #56585f; }
    .gate-footer a { color: #8a8a90; text-decoration: underline; }
  `;
  (document.head || document.documentElement).appendChild(style);

  function mountGate() {
    if (isAuthed()) {
      document.documentElement.classList.remove('gated');
      return;
    }
    if (document.getElementById('gate-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'gate-overlay';
    overlay.innerHTML = `
      <div class="gate-card">
        <div class="gate-dot"></div>
        <div class="gate-kicker">SEITIATE &amp; SEITIATE+ · STEALTH PREVIEW</div>
        <div class="gate-title">Partner &amp; Reviewer Access</div>
        <div class="gate-desc">Seitiate is currently in invited stealth preview. Enter your partner or reviewer access code to unlock the full platform showcase.</div>
        <form class="gate-form" id="gate-form">
          <input type="text" id="gate-passcode" class="gate-input" placeholder="ACCESS CODE" autocomplete="off" autofocus>
          <button type="submit" class="gate-btn">Unlock</button>
        </form>
        <div id="gate-err" class="gate-error">Incorrect access code.</div>
        <div class="gate-footer">
          <a href="/terms.html">Terms of Use</a> &middot; <a href="/privacy.html">Privacy Policy</a> &middot; <a href="/login/">Apply as Beta Tester</a>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const form = document.getElementById('gate-form');
    const input = document.getElementById('gate-passcode');
    const err = document.getElementById('gate-err');

    function unlock() {
      setAuthed();
      document.documentElement.classList.remove('gated');
      overlay.remove();
    }

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const code = (input.value || '').trim().toUpperCase();
      if (code === 'SAKME') {
        unlock();
      } else {
        err.style.display = 'block';
        input.style.borderColor = '#f87171';
        input.select();
      }
    });

    input.addEventListener('input', function() {
      err.style.display = 'none';
      input.style.borderColor = '#2a2e39';
      if (this.value.trim().toUpperCase() === 'SAKME') {
        unlock();
      }
    });

    setTimeout(() => { if (input) input.focus(); }, 60);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountGate);
  } else {
    mountGate();
  }
})();
