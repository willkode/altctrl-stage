import { useState, useCallback } from "react";

let _setToasts = null;

export function useAppToast() {
  const toast = useCallback((type, message) => {
    if (_setToasts) {
      const id = Date.now();
      _setToasts(prev => [...prev, { id, type, message }]);
      setTimeout(() => _setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    }
  }, []);

  return {
    saved: (msg = "Saved") => toast("saved", msg),
    copied: (msg = "Copied to clipboard") => toast("copied", msg),
    deleted: (msg = "Deleted") => toast("deleted", msg),
    regenerated: (msg = "Regenerated") => toast("regenerated", msg),
    error: (msg = "Something went wrong") => toast("error", msg),
    info: (msg) => toast("info", msg),
  };
}

export function useToastRegister(setter) {
  _setToasts = setter;
}