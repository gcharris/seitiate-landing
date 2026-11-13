(() => {
  'use strict';
  const form = document.getElementById('access-form');
  const status = document.getElementById('access-status');
  const draft = document.getElementById('access-draft');
  const recipient = 'agentcsakme@gmail.com';
  form.querySelector('button[type="submit"]').disabled = false;
  const tiers = ['Starter', 'Pro', 'Max'];
  const requested = new URLSearchParams(location.search).get('plan');
  const selected = tiers.find(t => t.toLowerCase() === requested?.toLowerCase());
  if (selected) form.elements.tier.value = selected;
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const tier = form.elements.tier.value;
    if (!name || !tiers.includes(tier)) { status.textContent = 'Please enter your name and select a starting point.'; return; }
    const subject = `Seitiate early access — ${tier}`;
    const body = `Hello Seitiate,\n\nI’d like to request early access.\n\nName: ${name}\nEmail: ${email}\nInterested in: ${tier}\n\nWhat I have in mind:\n${form.elements.idea.value.trim() || 'I would like to explore the possibilities.'}\n\nThank you,\n${name}`;
    draft.value = `To: ${recipient}\nSubject: ${subject}\n\n${body}`;
    document.getElementById('access-fallback').hidden = false;
    status.textContent = 'Your email draft is ready. Send it from your email app to submit your request; nothing has been submitted by this page.';
    location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
  document.getElementById('access-copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(draft.value); status.textContent = 'Request copied. Paste it into an email and send it to agentcsakme@gmail.com.'; }
    catch (_) { draft.focus(); draft.select(); status.textContent = 'Select and copy the prepared request below, then send it by email.'; }
  });
})();
