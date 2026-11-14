import { useEffect, useId, useRef } from "react";
import Icon from "./Icon";
import "./forms.css";

export default function Modal({ title, onClose, children, busy = false }) {
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    dialog.showModal();

    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus();
      }
    };
  }, []);

  function handleCancel(event) {
    event.preventDefault();
    if (!busy) onClose();
  }

  function handleBackdrop(event) {
    if (busy || event.target !== dialogRef.current) return;
    const bounds = dialogRef.current.getBoundingClientRect();
    const outside =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;
    if (outside) onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      className="record-modal"
      aria-labelledby={titleId}
      aria-busy={busy}
      onCancel={handleCancel}
      onClick={handleBackdrop}
    >
      <button
        type="button"
        className="record-modal-close"
        aria-label="Close dialog"
        disabled={busy}
        onClick={onClose}
      >
        <Icon name="close" />
      </button>
      <h2 id={titleId} className="record-modal-title">
        {title}
      </h2>
      {children}
    </dialog>
  );
}
