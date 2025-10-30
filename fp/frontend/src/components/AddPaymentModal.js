// Web component: <add-payment-modal>
// Usage: include module to register. Toggle by setting attribute 'open'.
import { TransactionController } from '../controllers/TransactionController';
import { OrganizationController } from '../controllers/OrganizationController';

class AddPaymentModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._open = false;
    this.debts = [];
    this.selectedDebtId = '';
    this.selectedDebt = null;
  }

  connectedCallback() {
    this.render();
    this.loadDebts();
    this.loadOrganizations();
  }

  static get observedAttributes() { return ['open']; }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'open') {
      this._open = this.hasAttribute('open');
      this.toggleVisibility();
    }
  }

  toggleVisibility() {
    const container = this.shadowRoot.getElementById('container');
    if (!container) return;
    container.style.display = this._open ? 'block' : 'none';
  }

  async loadDebts() {
    try {
      const data = await TransactionController.listDebts();
      // Show unpaid debts only
      this.debts = (data || []).filter(d => Number(d.amount_remaining) > 0);
      this.updateDebtList();
    } catch (e) {
      console.error('Failed to load debts for modal', e);
      this.showMessage('No se pudieron cargar deudas');
    }
  }

  async loadOrganizations() {
    try {
      const list = await OrganizationController.listOrganizations();
      this.organizations = list || [];
      this.updateOrgList();
    } catch (e) {
      console.error('Failed to load organizations for modal', e);
    }
  }

  updateOrgList() {
    const sel = this.shadowRoot.getElementById('org_select');
    if (!sel) return;
    sel.innerHTML = '';
    (this.organizations || []).forEach(o => {
      const opt = document.createElement('option');
      opt.value = o.id;
      opt.textContent = `${o.name} #${o.id}`;
      sel.appendChild(opt);
    });
  }

  updateDebtList() {
    const list = this.shadowRoot.getElementById('debt-list');
    if (!list) return;
    list.innerHTML = '';
    this.debts.forEach(d => {
      const row = document.createElement('div');
      row.className = 'debt-row';
      row.innerHTML = `<span class="origin">${d.entity_type || d.creditor}</span>
        <span class="id">#${d.id}</span>
        <span class="amt">${d.amount_remaining}</span>`;
      row.addEventListener('click', () => {
        this.selectDebt(d.id);
      });
      list.appendChild(row);
    });
  }

  selectDebt(id) {
    this.selectedDebtId = id;
    const input = this.shadowRoot.getElementById('debt_id');
    if (input) input.value = id;
    this.selectedDebt = this.debts.find(d => Number(d.id) === Number(id)) || null;
    this.updateSelectedInfo();
  }

  close() {
    this.removeAttribute('open');
  }

  async submitForm(e) {
    e && e.preventDefault();
    const debtId = Number(this.shadowRoot.getElementById('debt_id').value);
    const amount = Number(this.shadowRoot.getElementById('amount').value);
    const description = this.shadowRoot.getElementById('description').value || '';
    if (!debtId || !amount || amount <= 0) {
      this.showMessage('Rellene ID de deuda y monto válido');
      return;
    }
    const orgSel = this.shadowRoot.getElementById('org_select');
    const orgId = orgSel ? Number(orgSel.value) : null;
    try {
      const body = await TransactionController.createPayment({ debt_id: debtId, amount, description, organization_id: orgId });
      // If backend returned updated organization (budget changed), emit global event so BudgetWidget updates
      if (body && body.organization) {
        document.dispatchEvent(new CustomEvent('budget-updated', { detail: body.organization, bubbles: true }));
      }
      this.dispatchEvent(new CustomEvent('payment-added', { detail: body, bubbles: true, composed: true }));
      this.showMessage('Pago creado', true);
      setTimeout(()=> this.close(), 600);
    } catch (err) {
      console.error(err);
      // Friendly handling for overpayment: if server indicates remaining amount, show actionable text
      const msg = err && err.message ? String(err.message) : 'Error al crear pago';
      // If we have selectedDebt info, use it to craft a friendly message
      if (this.selectedDebt && msg.toLowerCase().includes('exceed')) {
        this.showMessage(`El monto supera el saldo restante de la deuda #${this.selectedDebt.id}: ${this.selectedDebt.amount_remaining}. Ajuste el monto ≤ ${this.selectedDebt.amount_remaining}`);
      } else if (/exceed|exced/i.test(msg)) {
        // try to extract numeric remaining from message like '(22999)'
        const m = msg.match(/\(([-\d\.]+)\)/);
        const remaining = m ? m[1] : null;
        if (remaining) {
          this.showMessage(`El monto supera el saldo restante (${remaining}). Ajuste el monto a ≤ ${remaining}`);
        } else {
          this.showMessage(msg);
        }
      } else {
        this.showMessage(msg);
      }
    }
  }

  showMessage(msg, success=false) {
    const el = this.shadowRoot.getElementById('msg');
    if (!el) return;
    el.textContent = msg;
    el.style.color = success ? 'green' : 'crimson';
  }

  updateSelectedInfo() {
    const info = this.shadowRoot.getElementById('selected-info');
    if (!info) return;
    if (this.selectedDebt) {
      info.textContent = `Saldo restante deuda #${this.selectedDebt.id}: ${this.selectedDebt.amount_remaining}`;
    } else {
      info.textContent = '';
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        #container { position: fixed; inset: 0; display: none; align-items: center; justify-content: center; z-index:1000; }
        .backdrop { position: absolute; inset:0; background: rgba(0,0,0,0.4); }
        .modal { position: relative; background: white; padding: 1rem; border-radius:6px; width: 420px; max-height: 80vh; overflow:auto; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        .debt-row { display:flex; justify-content:space-between; padding:0.4rem; border-bottom:1px solid #eee; cursor:pointer; }
        .debt-row:hover{background:#f9f9f9}
        .fields { display:flex; flex-direction:column; gap:0.5rem; margin-bottom:0.5rem }
        .toolbar { display:flex; gap:0.5rem; justify-content:flex-end; margin-top:0.5rem }
        #msg { min-height: 1.2rem; margin-top:0.5rem }
      </style>
      <div id="container">
        <div class="backdrop" id="backdrop"></div>
          <div class="modal" role="dialog" aria-modal="true">
          <h3>Añadir pago</h3>
          <form id="form">
            <div class="fields">
              <label>Debt ID <input id="debt_id" name="debt_id" type="number" /></label>
              <label>Organization <select id="org_select"><option value="">(default)</option></select></label>
              <label>Monto <input id="amount" name="amount" type="number" step="0.01"/></label>
                <div id="selected-info" style="font-size:0.9rem;color:#333"></div>
              <label>Descripción <input id="description" name="description" type="text"/></label>
            </div>
            <div style="font-weight:bold;margin-bottom:0.4rem">Deudas sin pagar (click para seleccionar)</div>
            <div id="debt-list" style="border:1px solid #eee; max-height:200px; overflow:auto; margin-bottom:0.5rem"></div>
            <div id="msg"></div>
            <div class="toolbar">
              <button type="button" id="cancel">Cancelar</button>
              <button type="submit" id="submit">Crear pago</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // events
    const container = this.shadowRoot.getElementById('container');
    const backdrop = this.shadowRoot.getElementById('backdrop');
    const form = this.shadowRoot.getElementById('form');
    const cancel = this.shadowRoot.getElementById('cancel');
    backdrop && backdrop.addEventListener('click', ()=> this.close());
    cancel && cancel.addEventListener('click', ()=> this.close());
    form && form.addEventListener('submit', (e)=> this.submitForm(e));
    this.toggleVisibility();
  }
}

if (!customElements.get('add-payment-modal')) {
  customElements.define('add-payment-modal', AddPaymentModal);
}

export default AddPaymentModal;
