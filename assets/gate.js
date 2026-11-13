(function() {
  const STORAGE_KEY = 'seitiate_gate_sakme_v1';

  function isAuthed() {
    try {
      const params = new URLSearchParams(window.location.search);
      const qCode = (params.get('code') || params.get('passcode') || '').trim().toUpperCase();
      if (qCode === 'SAKME') {
        try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
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

  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = '/assets/gate.css';
  document.head.appendChild(style);
  const hide = document.createElement('style');
  hide.textContent = 'html.gated body > *:not(#gate-overlay) { display: none !important; }';
  document.head.appendChild(hide);

  function mountGate() {
    if (isAuthed()) {
      document.documentElement.classList.remove('gated');
      return;
    }
    if (document.getElementById('gate-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'gate-overlay';
    overlay.innerHTML = `
      <main class="gate-card" aria-labelledby="gate-title">
        <a class="gate-wordmark" href="/">seitiate<span>·</span></a>
        <p class="gate-kicker">A PRIVATE INTRODUCTION</p>
        <h1 id="gate-title">Good to<br>have you here.</h1>
        <p class="gate-desc">Enter the access code from your invitation.</p>
        <form class="gate-form" id="gate-form">
          <label for="gate-passcode">Access code</label>
          <div class="gate-controls"><input type="text" id="gate-passcode" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-describedby="gate-err" required>
          <button type="submit">Enter <span aria-hidden="true">↗</span></button></div>
          <p id="gate-err" role="status" aria-live="polite" hidden>That code isn’t recognised. Please try again.</p>
        </form>
        <footer class="gate-footer"><span>Seitiate · Georgia</span><a href="mailto:hello@seitiate.com">Get in touch ↗</a></footer>
      </main>
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
        err.hidden = false;
        input.setAttribute('aria-invalid', 'true');

        input.select();
      }
    });

    input.addEventListener('input', function() {
      err.hidden = true;
      input.removeAttribute('aria-invalid');

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
