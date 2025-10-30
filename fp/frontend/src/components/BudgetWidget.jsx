import React, { useEffect, useState } from 'react';
import { OrganizationController } from '../controllers/OrganizationController';

export default function BudgetWidget({ orgId = null }) {
  const [org, setOrg] = useState(null);

  async function load() {
    try {
      const list = await OrganizationController.listOrganizations();
      if (!list || list.length === 0) {
        setOrg(null);
        return;
      }
      // pick by orgId if provided, otherwise first
      const picked = orgId ? list.find(o => Number(o.id) === Number(orgId)) || list[0] : list[0];
      setOrg(picked);
    } catch (e) {
      console.error('Failed to load organization for BudgetWidget', e);
      setOrg(null);
    }
  }

  useEffect(() => {
    load();
    function onBudgetUpdated(e) {
      if (e && e.detail && e.detail.id) {
        // if a specific orgId prop is set, only update when it matches
        if (orgId && Number(e.detail.id) === Number(orgId)) {
          const normalized = { ...e.detail, budget: Number(e.detail.budget || 0) };
          setOrg(normalized);
          return;
        }
        // if no orgId prop, but we have an org loaded, update when ids match
        if (!orgId && org && Number(e.detail.id) === Number(org.id)) {
          const normalized = { ...e.detail, budget: Number(e.detail.budget || 0) };
          setOrg(normalized);
          return;
        }
      }
      // otherwise reload list to pick the right org
      load();
    }
    document.addEventListener('budget-updated', onBudgetUpdated);
    return () => document.removeEventListener('budget-updated', onBudgetUpdated);
  }, [orgId]);

  // defensive normalization of org object before render
  const normalizedOrg = org ? { ...org, budget: Number((org.budget == null) ? 0 : org.budget) } : null;

  async function adjustBudget() {
    if (!org) return;
    const val = prompt('Ingrese un número para ajustar el presupuesto (positivo para aumentar, negativo para reducir)');
    if (!val) return;
    const delta = Number(val);
    if (isNaN(delta)) return alert('Número inválido');
    try {
      // call backend to update budget
      const res = await fetch(`http://localhost:4000/organizations/${org.id}/budget`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error updating budget');
      // emit event globally
      document.dispatchEvent(new CustomEvent('budget-updated', { detail: data, bubbles: true }));
    } catch (e) {
      console.error('Failed to adjust budget', e);
      alert(e.message || 'Error al ajustar presupuesto');
    }
  }

  if (!normalizedOrg) return <div style={{padding:'0.5rem'}}>Presupuesto: --</div>;

  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0.5rem',borderBottom:'1px solid #eee'}}>
      <div>
        <strong>Presupuesto:</strong> {Number(normalizedOrg.budget).toLocaleString()} (Org #{normalizedOrg.id})
      </div>
      <div>
        <button onClick={adjustBudget}>Ajustar presupuesto</button>
      </div>
    </div>
  );
}
