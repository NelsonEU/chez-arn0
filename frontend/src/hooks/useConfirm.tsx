import { useState } from 'react';
import ConfirmModal from '../components/admin/ConfirmModal.tsx';

interface ConfirmOptions {
  confirmLabel?: string;
  danger?: boolean;
}

export function useConfirm() {
  const [pending, setPending] = useState<{
    message: string;
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  function confirm(message: string, options: ConfirmOptions = {}): Promise<boolean> {
    return new Promise((resolve) => setPending({ message, options, resolve }));
  }

  function settle(value: boolean) {
    pending?.resolve(value);
    setPending(null);
  }

  const dialog = pending ? (
    <ConfirmModal
      message={pending.message}
      confirmLabel={pending.options.confirmLabel}
      danger={pending.options.danger}
      onConfirm={() => settle(true)}
      onCancel={() => settle(false)}
    />
  ) : null;

  return { confirm, dialog };
}
