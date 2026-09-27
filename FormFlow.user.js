
// ==UserScript==
// @name         FormFlow — Web Form Speed-Filler
// @namespace    https://github.com/hggruppi94
// @version      1.0
// @description  Detects form fields on any webpage and creates a streamlined overlay for fast form filling with presets and auto-fill.
// @author       Hayden Gruppi
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  'use strict';

  // ==================== CONFIG ====================
  const STORAGE_KEY = 'formflow_presets';
  const MIN_FIELDS = 2; // Minimum fields to activate FormFlow

  // ==================== STYLES ====================
  GM_addStyle(`
    #ff-trigger {
      position: fixed; bottom: 24px; right: 24px; z-index: 99999;
      width: 52px; height: 52px; border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6, #a855f7);
      border: none; cursor: pointer; display: flex; align-items: center;
      justify-content: center; font-size: 24px; color: #fff;
      box-shadow: 0 4px 20px rgba(59,130,246,.4);
      transition: all .2s; opacity: .9;
    }
    #ff-trigger:hover { transform: scale(1.1); opacity: 1; }

    #ff-overlay {
      position: fixed; top: 0; right: -420px; width: 400px; height: 100vh;
      background: #0f172a; border-left: 1px solid #1e293b;
      z-index: 100000; transition: right .3s ease;
      display: flex; flex-direction: column; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #ff-overlay.open { right: 0; }

    #ff-header {
      padding: 16px 20px; border-bottom: 1px solid #1e293b;
      display: flex; justify-content: space-between; align-items: center;
    }
    #ff-header h2 { font-size: 16px; font-weight: 700; color: #e2e8f0; margin: 0; }
    #ff-header h2 span { color: #3b82f6; }
    .ff-header-btns { display: flex; gap: 6px; }
    .ff-icon-btn {
      width: 32px; height: 32px; border-radius: 6px; border: 1px solid #1e293b;
      background: transparent; color: #94a3b8; cursor: pointer; font-size: 14px;
      display: flex; align-items: center; justify-content: center; transition: all .2s;
    }
    .ff-icon-btn:hover { border-color: #3b82f6; color: #3b82f6; }

    #ff-toolbar {
      padding: 12px 20px; border-bottom: 1px solid #1e293b;
      display: flex; gap: 8px; flex-wrap: wrap;
    }
    .ff-tool-btn {
      padding: 6px 14px; border-radius: 6px; border: 1px solid #1e293b;
      background: transparent; color: #94a3b8; cursor: pointer; font-size: 12px;
      font-weight: 500; transition: all .2s;
    }
    .ff-tool-btn:hover { border-color: #3b82f6; color: #3b82f6; }
    .ff-tool-btn.active { background: #3b82f6; color: #fff; border-color: #3b82f6; }

    #ff-body {
      flex: 1; overflow-y: auto; padding: 16px 20px;
    }

    #ff-stats {
      padding: 12px 20px; border-bottom: 1px solid #1e293b;
      display: flex; gap: 12px; flex-wrap: wrap;
    }
    .ff-stat {
      background: #111827; border: 1px solid #1e293b; border-radius: 8px;
      padding: 8px 14px; flex: 1; min-width: 80px;
    }
    .ff-stat-label { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: .5px; }
    .ff-stat-value { font-size: 16px; font-weight: 700; color: #e2e8f0; margin-top: 2px; }

    .ff-field-group {
      margin-bottom: 16px; background: #111827; border: 1px solid #1e293b;
      border-radius: 10px; padding: 14px; transition: all .2s;
    }
    .ff-field-group:hover { border-color: #2a4060; }
    .ff-field-group.highlighted { border-color: #3b82f6; box-shadow: 0 0 0 1px rgba(59,130,246,.3); }

    .ff-field-label {
      font-size: 11px; color: #94a3b8; margin-bottom: 6px;
      display: flex; justify-content: space-between; align-items: center;
    }
    .ff-field-label .ff-type-badge {
      font-size: 9px; padding: 2px 6px; border-radius: 3px; font-weight: 600;
    }
    .ff-type-text { background: rgba(59,130,246,.15); color: #3b82f6; }
    .ff-type-select { background: rgba(168,85,247,.15); color: #a855f7; }
    .ff-type-checkbox { background: rgba(34,197,94,.15); color: #22c55e; }
    .ff-type-radio { background: rgba(245,158,11,.15); color: #f59e0b; }
    .ff-type-textarea { background: rgba(20,184,166,.15); color: #14b8a6; }
    .ff-type-date { background: rgba(236,72,153,.15); color: #ec4899; }
    .ff-type-number { background: rgba(99,102,241,.15); color: #6366f1; }
    .ff-type-email { background: rgba(239,68,68,.15); color: #ef4444; }

    .ff-input {
      width: 100%; padding: 8px 12px; border-radius: 6px;
      border: 1px solid #1e293b; background: #0a0f1a; color: #e2e8f0;
      font-size: 13px; transition: border-color .2s; outline: none;
    }
    .ff-input:focus { border-color: #3b82f6; }
    .ff-select { appearance: none; cursor: pointer; }
    .ff-textarea { resize: vertical; min-height: 60px; font-family: inherit; }

    .ff-checkbox-row {
      display: flex; align-items: center; gap: 8px; padding: 6px 0;
    }
    .ff-checkbox-row input { accent-color: #3b82f6; width: 16px; height: 16px; cursor: pointer; }
    .ff-checkbox-row label { font-size: 13px; color: #e2e8f0; cursor: pointer; }

    .ff-radio-group { display: flex; flex-direction: column; gap: 6px; }

    #ff-footer {
      padding: 14px 20px; border-top: 1px solid #1e293b;
      display: flex; gap: 8px;
    }
    .ff-btn {
      flex: 1; padding: 10px; border-radius: 8px; border: none;
      font-size: 13px; font-weight: 600; cursor: pointer; transition: all .2s;
    }
    .ff-btn-primary { background: #3b82f6; color: #fff; }
    .ff-btn-primary:hover { background: #2563eb; }
    .ff-btn-secondary { background: #1e293b; color: #94a3b8; }
    .ff-btn-secondary:hover { background: #2a4060; color: #e2e8f0; }
    .ff-btn-success { background: #22c55e; color: #fff; }
    .ff-btn-success:hover { background: #16a34a; }

    /* PRESET MODAL */
    #ff-preset-modal {
      display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,.6); z-index: 100001; align-items: center; justify-content: center;
    }
    #ff-preset-modal.open { display: flex; }
    .ff-modal-box {
      background: #0f172a; border: 1px solid #1e293b; border-radius: 12px;
      padding: 24px; width: 360px; max-height: 80vh; overflow-y: auto;
    }
    .ff-modal-box h3 { font-size: 16px; color: #e2e8f0; margin-bottom: 16px; }
    .ff-preset-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 12px; background: #111827; border: 1px solid #1e293b;
      border-radius: 8px; margin-bottom: 8px; cursor: pointer; transition: all .2s;
    }
    .ff-preset-item:hover { border-color: #3b82f6; }
    .ff-preset-item .name { font-size: 13px; color: #e2e8f0; font-weight: 500; }
    .ff-preset-item .meta { font-size: 11px; color: #64748b; }
    .ff-preset-delete {
      background: none; border: none; color: #ef4444; cursor: pointer;
      font-size: 14px; padding: 4px; opacity: .6;
    }
    .ff-preset-delete:hover { opacity: 1; }
    .ff-save-preset-row { display: flex; gap: 8px; margin-top: 12px; }
    .ff-save-preset-row input {
      flex: 1; padding: 8px 12px; border-radius: 6px; border: 1px solid #1e293b;
      background: #0a0f1a; color: #e2e8f0; font-size: 13px; outline: none;
    }

    /* HIGHLIGHT ANIMATION */
    @keyframes ff-pulse {
      0% { box-shadow: 0 0 0 0 rgba(59,130,246,.4); }
      70% { box-shadow: 0 0 0 8px rgba(59,130,246,0); }
      100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
    }
    .ff-field-group.highlighted { animation: ff-pulse 1s; }

    /* TOAST */
    .ff-toast {
      position: fixed; bottom: 90px; right: 24px; z-index: 100002;
      background: #22c55e; color: #fff; padding: 10px 20px; border-radius: 8px;
      font-size: 13px; font-weight: 500; opacity: 0; transition: opacity .3s;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .ff-toast.show { opacity: 1; }
  `);

  // ==================== SCAN FORM FIELDS ====================
  function scanFields() {
    const fields = [];
    const seen = new Set();

    // Inputs
    document.querySelectorAll('input, select, textarea').forEach(el => {
      if (el.closest('#ff-overlay') || el.closest('#ff-preset-modal')) return;
      if (el.type === 'hidden' || el.type === 'submit' || el.type === 'button') return;
      if (el.offsetParent === null && el.type !== 'radio' && el.type !== 'checkbox') return;

      const id = el.id || el.name || '';
      const label = getLabel(el);
      const key = label + '_' + el.type + '_' + id;
      if (seen.has(key) && el.type !== 'radio') return;
      seen.add(key);

      const field = {
        element: el,
        type: getFieldType(el),
        label: label,
        id: id,
        name: el.name || '',
        required: el.required,
        options: [],
        value: el.value || ''
      };

      if (el.tagName === 'SELECT') {
        field.options = [...el.options].map(o => ({ value: o.value, text: o.text }));
      }

      if (el.type === 'radio') {
        const existing = fields.find(f => f.name === el.name && f.type === 'radio');
        if (existing) {
          existing.options.push({ value: el.value, text: getLabel(el) || el.value, element: el });
          return;
        }
        field.options = [{ value: el.value, text: getLabel(el) || el.value, element: el }];
      }

      fields.push(field);
    });

    return fields;
  }

  function getLabel(el) {
    // Check for associated label
    if (el.id) {
      const label = document.querySelector(`label[for="${el.id}"]`);
      if (label) return label.textContent.trim();
    }
    // Check parent label
    const parentLabel = el.closest('label');
    if (parentLabel) {
      const text = parentLabel.textContent.trim();
      if (text.length < 80) return text;
    }
    // Check aria-label
    if (el.getAttribute('aria-label')) return el.getAttribute('aria-label');
    // Check placeholder
    if (el.placeholder) return el.placeholder;
    // Check preceding text
    const prev = el.previousElementSibling;
    if (prev && prev.textContent.trim().length < 60) return prev.textContent.trim();
    // Fallback to name/id
    return el.name || el.id || 'Unnamed Field';
  }

  function getFieldType(el) {
    if (el.tagName === 'SELECT') return 'select';
    if (el.tagName === 'TEXTAREA') return 'textarea';
    const type = (el.type || 'text').toLowerCase();
    if (['date', 'datetime-local', 'time', 'month', 'week'].includes(type)) return 'date';
    if (type === 'number' || type === 'range') return 'number';
    if (type === 'email') return 'email';
    if (type === 'checkbox') return 'checkbox';
    if (type === 'radio') return 'radio';
    if (type === 'tel') return 'text';
    if (type === 'url') return 'text';
    if (type === 'password') return 'text';
    return 'text';
  }

  // ==================== BUILD UI ====================
  let fields = [];
  let isOpen = false;

  function buildTrigger() {
    const btn = document.createElement('button');
    btn.id = 'ff-trigger';
    btn.innerHTML = '⚡';
    btn.title = 'FormFlow — Speed-Fill Forms';
    btn.addEventListener('click', toggleOverlay);
    document.body.appendChild(btn);
  }

  function toggleOverlay() {
    const overlay = document.getElementById('ff-overlay');
    if (!overlay) {
      fields = scanFields();
      if (fields.length < MIN_FIELDS) {
        showToast('⚠️ Only ' + fields.length + ' field(s) found on this page');
        return;
      }
      buildOverlay();
    } else {
      isOpen = !isOpen;
      overlay.classList.toggle('open', isOpen);
    }
  }

  function buildOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'ff-overlay';
    overlay.innerHTML = `
      <div id="ff-header">
        <h2>Form<span>Flow</span></h2>
        <div class="ff-header-btns">
          <button class="ff-icon-btn" id="ff-rescan" title="Rescan fields">🔄</button>
          <button class="ff-icon-btn" id="ff-close" title="Close">✕</button>
        </div>
      </div>
      <div id="ff-stats"></div>
      <div id="ff-toolbar">
        <button class="ff-tool-btn" id="ff-btn-presets">📋 Presets</button>
        <button class="ff-tool-btn" id="ff-btn-clear">🗑️ Clear All</button>
        <button class="ff-tool-btn" id="ff-btn-highlight">🔦 Highlight</button>
      </div>
      <div id="ff-body"></div>
      <div id="ff-footer">
        <button class="ff-btn ff-btn-primary" id="ff-fill">⚡ Fill Form</button>
        <button class="ff-btn ff-btn-success" id="ff-fill-submit">⚡ Fill & Submit</button>
      </div>
    `;
    document.body.appendChild(overlay);

    // Preset modal
    const modal = document.createElement('div');
    modal.id = 'ff-preset-modal';
    modal.innerHTML = `
      <div class="ff-modal-box">
        <h3>📋 Saved Presets</h3>
        <div id="ff-preset-list"></div>
        <div class="ff-save-preset-row">
          <input type="text" id="ff-preset-name" placeholder="Preset name..." class="ff-input">
          <button class="ff-btn ff-btn-primary" id="ff-save-preset" style="flex:none;padding:8px 16px;">Save</button>
        </div>
        <button class="ff-btn ff-btn-secondary" id="ff-close-modal" style="width:100%;margin-top:12px;">Close</button>
      </div>
    `;
    document.body.appendChild(modal);

    // Events
    document.getElementById('ff-close').addEventListener('click', () => {
      isOpen = false;
      overlay.classList.remove('open');
    });
    document.getElementById('ff-rescan').addEventListener('click', rescan);
    document.getElementById('ff-btn-clear').addEventListener('click', clearAll);
    document.getElementById('ff-btn-highlight').addEventListener('click', highlightFields);
    document.getElementById('ff-btn-presets').addEventListener('click', () => {
      document.getElementById('ff-preset-modal').classList.add('open');
      renderPresets();
    });
    document.getElementById('ff-close-modal').addEventListener('click', () => {
      document.getElementById('ff-preset-modal').classList.remove('open');
    });
    document.getElementById('ff-save-preset').addEventListener('click', savePreset);
    document.getElementById('ff-fill').addEventListener('click', () => fillForm(false));
    document.getElementById('ff-fill-submit').addEventListener('click', () => fillForm(true));

    renderFields();
    isOpen = true;
    overlay.classList.add('open');
  }

  function renderFields() {
    const body = document.getElementById('ff-body');
    const stats = document.getElementById('ff-stats');

    // Stats
    const typeCounts = {};
    fields.forEach(f => { typeCounts[f.type] = (typeCounts[f.type] || 0) + 1; });
    stats.innerHTML = `
      <div class="ff-stat"><div class="ff-stat-label">Fields</div><div class="ff-stat-value">${fields.length}</div></div>
      <div class="ff-stat"><div class="ff-stat-label">Required</div><div class="ff-stat-value">${fields.filter(f => f.required).length}</div></div>
      <div class="ff-stat"><div class="ff-stat-label">Types</div><div class="ff-stat-value">${Object.keys(typeCounts).length}</div></div>
    `;

    // Fields
    let html = '';
    fields.forEach((field, i) => {
      const req = field.required ? ' *' : '';
      html += `<div class="ff-field-group" data-index="${i}">`;
      html += `<div class="ff-field-label">
        <span>${field.label}${req}</span>
        <span class="ff-type-badge ff-type-${field.type}">${field.type}</span>
      </div>`;

      switch (field.type) {
        case 'select':
          html += `<select class="ff-input ff-select" data-index="${i}">`;
          field.options.forEach(o => {
            const sel = o.value === field.value ? ' selected' : '';
            html += `<option value="${o.value}"${sel}>${o.text}</option>`;
          });
          html += `</select>`;
          break;

        case 'checkbox':
          const checked = field.element.checked ? ' checked' : '';
          html += `<div class="ff-checkbox-row">
            <input type="checkbox" id="ff-cb-${i}" data-index="${i}"${checked}>
            <label for="ff-cb-${i}">${field.label}</label>
          </div>`;
          break;

        case 'radio':
          html += `<div class="ff-radio-group">`;
          field.options.forEach((o, j) => {
            const checked = o.element && o.element.checked ? ' checked' : '';
            html += `<div class="ff-checkbox-row">
              <input type="radio" name="ff-radio-${i}" id="ff-radio-${i}-${j}" value="${o.value}" data-index="${i}" data-option="${j}"${checked}>
              <label for="ff-radio-${i}-${j}">${o.text}</label>
            </div>`;
          });
          html += `</div>`;
          break;

        case 'textarea':
          html += `<textarea class="ff-input ff-textarea" data-index="${i}" rows="3">${field.value}</textarea>`;
          break;

        case 'date':
          const dateType = field.element.type || 'date';
          html += `<input type="${dateType}" class="ff-input" data-index="${i}" value="${field.value}">`;
          break;

        case 'number':
          html += `<input type="number" class="ff-input" data-index="${i}" value="${field.value}"
            ${field.element.min ? 'min="' + field.element.min + '"' : ''}
            ${field.element.max ? 'max="' + field.element.max + '"' : ''}
            ${field.element.step ? 'step="' + field.element.step + '"' : ''}>`;
          break;

        default:
          html += `<input type="text" class="ff-input" data-index="${i}" value="${field.value}" placeholder="Enter ${field.label.toLowerCase()}...">`;
      }

      html += `</div>`;
    });

    body.innerHTML = html;

    // Focus highlight: clicking a FormFlow field highlights the real field
    body.querySelectorAll('.ff-field-group').forEach(group => {
      group.addEventListener('click', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
        const idx = parseInt(group.dataset.index);
        const el = fields[idx].element;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.outline = '2px solid #3b82f6';
        setTimeout(() => el.style.outline = '', 2000);
      });
    });
  }

  // ==================== ACTIONS ====================
  function fillForm(andSubmit) {
    const overlay = document.getElementById('ff-overlay');
    let filled = 0;

    fields.forEach((field, i) => {
      const ffInput = overlay.querySelector(`[data-index="${i}"]`);
      if (!ffInput) return;

      const el = field.element;
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value'
      )?.set;
      const nativeSelectValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLSelectElement.prototype, 'value'
      )?.set;
      const nativeTextareaValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype, 'value'
      )?.set;

      switch (field.type) {
        case 'checkbox':
          if (el.checked !== ffInput.checked) {
            el.click();
            filled++;
          }
          break;

        case 'radio':
          const selectedRadio = overlay.querySelector(`input[name="ff-radio-${i}"]:checked`);
          if (selectedRadio) {
            const optIdx = parseInt(selectedRadio.dataset.option);
            const radioEl = field.options[optIdx]?.element;
            if (radioEl && !radioEl.checked) {
              radioEl.click();
              filled++;
            }
          }
          break;

        case 'select':
          if (el.value !== ffInput.value) {
            if (nativeSelectValueSetter) nativeSelectValueSetter.call(el, ffInput.value);
            else el.value = ffInput.value;
            el.dispatchEvent(new Event('change', { bubbles: true }));
            filled++;
          }
          break;

        case 'textarea':
          if (el.value !== ffInput.value) {
            if (nativeTextareaValueSetter) nativeTextareaValueSetter.call(el, ffInput.value);
            else el.value = ffInput.value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
            filled++;
          }
          break;

        default:
          if (el.value !== ffInput.value) {
            if (nativeInputValueSetter) nativeInputValueSetter.call(el, ffInput.value);
            else el.value = ffInput.value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
            filled++;
          }
      }
    });

    showToast(`⚡ Filled ${filled} field(s)`);

    if (andSubmit) {
      setTimeout(() => {
        const submitBtn = document.querySelector(
          'button[type="submit"], input[type="submit"], form button:last-of-type'
        );
        if (submitBtn) {
          submitBtn.click();
          showToast('✅ Form submitted!');
        } else {
          showToast('⚠️ No submit button found — fill only');
        }
      }, 500);
    }
  }

  function clearAll() {
    const overlay = document.getElementById('ff-overlay');
    overlay.querySelectorAll('.ff-input').forEach(el => {
      if (el.tagName === 'SELECT') el.selectedIndex = 0;
      else el.value = '';
    });
    overlay.querySelectorAll('input[type="checkbox"]').forEach(el => el.checked = false);
    overlay.querySelectorAll('input[type="radio"]').forEach(el => el.checked = false);
    showToast('🗑️ All fields cleared');
  }

  function highlightFields() {
    fields.forEach(f => {
      f.element.style.outline = '2px solid #3b82f6';
      f.element.style.outlineOffset = '2px';
    });
    showToast('🔦 ' + fields.length + ' fields highlighted on page');
    setTimeout(() => {
      fields.forEach(f => {
        f.element.style.outline = '';
        f.element.style.outlineOffset = '';
      });
    }, 3000);
  }

  function rescan() {
    fields = scanFields();
    renderFields();
    showToast('🔄 Rescanned — found ' + fields.length + ' fields');
  }

  // ==================== PRESETS ====================
  function getPageKey() {
    return window.location.hostname + window.location.pathname;
  }

  function getAllPresets() {
    try {
      return JSON.parse(GM_getValue(STORAGE_KEY, '{}'));
    } catch { return {}; }
  }

  function savePreset() {
    const nameInput = document.getElementById('ff-preset-name');
    const name = nameInput.value.trim();
    if (!name) return showToast('⚠️ Enter a preset name');

    const overlay = document.getElementById('ff-overlay');
    const values = {};
    fields.forEach((field, i) => {
      const ffInput = overlay.querySelector(`[data-index="${i}"]`);
      if (!ffInput) return;
      if (field.type === 'checkbox') values[i] = ffInput.checked;
      else if (field.type === 'radio') {
        const sel = overlay.querySelector(`input[name="ff-radio-${i}"]:checked`);
        values[i] = sel ? sel.value : '';
      }
      else values[i] = ffInput.value;
    });

    const presets = getAllPresets();
    const pageKey = getPageKey();
    if (!presets[pageKey]) presets[pageKey] = [];
    presets[pageKey].push({ name, values, date: new Date().toLocaleDateString() });
    GM_setValue(STORAGE_KEY, JSON.stringify(presets));

    nameInput.value = '';
    renderPresets();
    showToast('💾 Preset "' + name + '" saved');
  }

  function loadPreset(presetIdx) {
    const presets = getAllPresets();
    const pagePresets = presets[getPageKey()] || [];
    const preset = pagePresets[presetIdx];
    if (!preset) return;

    const overlay = document.getElementById('ff-overlay');
    Object.entries(preset.values).forEach(([i, val]) => {
      const ffInput = overlay.querySelector(`[data-index="${i}"]`);
      if (!ffInput) return;
      if (fields[i].type === 'checkbox') ffInput.checked = val;
      else if (fields[i].type === 'radio') {
        const radio = overlay.querySelector(`input[name="ff-radio-${i}"][value="${val}"]`);
        if (radio) radio.checked = true;
      }
      else ffInput.value = val;
    });

    document.getElementById('ff-preset-modal').classList.remove('open');
    showToast('📋 Loaded "' + preset.name + '"');
  }

  function deletePreset(presetIdx) {
    const presets = getAllPresets();
    const pageKey = getPageKey();
    if (presets[pageKey]) {
      presets[pageKey].splice(presetIdx, 1);
      GM_setValue(STORAGE_KEY, JSON.stringify(presets));
      renderPresets();
      showToast('🗑️ Preset deleted');
    }
  }

  function renderPresets() {
    const list = document.getElementById('ff-preset-list');
    const presets = getAllPresets();
    const pagePresets = presets[getPageKey()] || [];

    if (pagePresets.length === 0) {
      list.innerHTML = '<p style="color:#64748b;font-size:13px;text-align:center;padding:12px;">No presets saved for this page yet.</p>';
      return;
    }

    list.innerHTML = pagePresets.map((p, i) => `
      <div class="ff-preset-item">
        <div onclick="document.dispatchEvent(new CustomEvent('ff-load-preset',{detail:${i}}))">
          <div class="name">${p.name}</div>
          <div class="meta">${p.date} · ${Object.keys(p.values).length} fields</div>
        </div>
        <button class="ff-preset-delete" onclick="document.dispatchEvent(new CustomEvent('ff-delete-preset',{detail:${i}}))">✕</button>
      </div>
    `).join('');
  }

  document.addEventListener('ff-load-preset', e => loadPreset(e.detail));
  document.addEventListener('ff-delete-preset', e => deletePreset(e.detail));

  // ==================== TOAST ====================
  function showToast(msg) {
    let toast = document.querySelector('.ff-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'ff-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  // ==================== INIT ====================
  // Wait for page to load, then add trigger button
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildTrigger);
  } else {
    buildTrigger();
  }

})();

