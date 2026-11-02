// Booking form: validates input, builds a readable WhatsApp message and opens wa.me.
import { CONFIG } from './config.js';

const MESSAGES = {
  name: 'Please enter your name.',
  phone: 'Please enter a valid phone number.',
  email: 'That email address doesn’t look right.',
  service: 'Please choose a service.',
  location: 'Please tell me where the job is.',
  date: 'Please pick a date from today onwards.',
  message: 'Please add a few details (at least 10 characters).',
};

export function waLink(text = '') {
  const base = `https://wa.me/${CONFIG.whatsapp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

function formatDate(value) {
  if (!value) return '';
  const d = new Date(`${value}T00:00:00`);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export function buildMessage(data) {
  const lines = [
    '⚡ *New Service Request*',
    '',
    `*Name:* ${data.name}`,
    `*Phone:* ${data.phone}`,
    data.email ? `*Email:* ${data.email}` : null,
    `*Service:* ${data.service}`,
    `*Location:* ${data.location}`,
    data.date ? `*Preferred date:* ${formatDate(data.date)}` : null,
    '',
    '*Details:*',
    data.message,
    '',
    '— Sent from mdnayemxyz.com',
  ];
  return lines.filter((l) => l !== false && l !== undefined && l !== null).join('\n');
}

function validateField(field) {
  const wrap = field.closest('.field');
  const error = wrap?.querySelector('.field-error');
  let valid = field.checkValidity();

  // Whitespace-only input passes native `required`; treat it as empty.
  if (valid && field.required && !field.value.trim()) valid = false;
  if (valid && field.minLength > 0 && field.value && field.value.trim().length < field.minLength) valid = false;

  if (valid && field.name === 'date' && field.value) {
    valid = field.value >= field.min;
  }
  if (valid && field.name === 'phone') {
    valid = field.value.replace(/\D/g, '').length >= 7;
  }

  wrap?.classList.toggle('has-error', !valid);
  field.setAttribute('aria-invalid', String(!valid));
  if (error) error.textContent = valid ? '' : MESSAGES[field.name] || 'Please check this field.';
  return valid;
}

export function initBooking() {
  const form = document.getElementById('booking');
  if (!form) return;
  const status = document.getElementById('form-status');
  const fields = [...form.querySelectorAll('input, select, textarea')];

  const date = form.querySelector('#f-date');
  const today = new Date();
  date.min = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  fields.forEach((f) => {
    f.addEventListener('blur', () => { if (f.value || f.required) validateField(f); });
    f.addEventListener('input', () => { if (f.closest('.field').classList.contains('has-error')) validateField(f); });
  });

  // "Book this" links on service cards preselect the service.
  document.querySelectorAll('[data-service]').forEach((a) => {
    a.addEventListener('click', () => {
      const select = form.querySelector('#f-service');
      const match = [...select.options].find((o) => o.text === a.dataset.service);
      if (match) select.value = match.value || match.text;
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const results = fields.map(validateField);
    const firstInvalid = fields[results.indexOf(false)];
    if (firstInvalid) {
      firstInvalid.focus();
      status.textContent = 'Please fix the highlighted fields.';
      status.classList.remove('is-success');
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    Object.keys(data).forEach((k) => { data[k] = String(data[k]).trim(); });
    const url = waLink(buildMessage(data));
    // Without 'noopener' in features so we can detect a blocked popup, then cut the opener link manually.
    const win = window.open(url, '_blank');
    if (win) win.opener = null;
    else window.location.href = url;

    status.textContent = 'WhatsApp is opening with your request — just press send.';
    status.classList.add('is-success');
  });
}
