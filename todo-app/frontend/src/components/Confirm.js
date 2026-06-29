import React from "react";

export default function Confirm({ title, message, onConfirm, onCancel, confirmLabel = "Delete", danger = true }) {
  return (
    <div className="confirm-overlay">
      <div className="confirm-box">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-btns">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button
            className={danger ? "btn-danger" : "btn-primary"}
            style={{ padding: "9px 18px" }}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
