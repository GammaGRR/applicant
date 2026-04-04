import { createPortal } from 'react-dom';
import type { ModalApplicant } from './types';

type Props = {
  open: boolean;
  applicant: ModalApplicant;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export const DeleteApplicantDialog = ({ open, applicant, deleting, onCancel, onConfirm }: Props) => {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
        <h3 className="text-base font-semibold text-gray-800 mb-2">Удалить абитуриента?</h3>
        <p className="text-sm text-gray-500 mb-6">
          {applicant.fullName || applicant.caseNumber} будет удалён без возможности восстановления.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
          >
            {deleting ? 'Удаление...' : 'Удалить'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
