import React from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/FinanceView.scss";

export default function FinanceView() {
  const navigate = useNavigate();
  return (
    <div className="finance-container">
      <h1 className="finance-title">Tesorería</h1>
      <h3 className="finance-subtitle">Seleccione una sección para continuar</h3>

      <div className="finance-button-group">
        <button onClick={() => navigate("/cash")} className="finance-button">
          Movimientos de Tesorería
        </button>
        <button onClick={() => navigate("/debts")} className="finance-button">
          Deudas
        </button>
        <button onClick={() => navigate("/payments")} className="finance-button">
          Pagos
        </button>
      </div>

      <button onClick={() => navigate("/dashboard")} className="finance-back">
        Volver al Dashboard
      </button>
    </div>
  );
}
