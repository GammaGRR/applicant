import type { Dispatch, SetStateAction } from 'react';
import { createPortal } from 'react-dom';
import { SquarePen, Eye, X, FileText } from 'lucide-react';
import { AdminRoute } from '../AdminRoute';
import { ApplicantFormContent, type ActiveForm } from '../ApplicantFormModal';
import type { ModalApplicant } from './types';

type ModalMode = 'view' | 'edit';

type Props = {
  modalMode: ModalMode;
  modalClosing: boolean;
  applicant: ModalApplicant;
  activeForm: ActiveForm | null;
  values: Record<string, unknown>;
  setValues: Dispatch<SetStateAction<Record<string, unknown>>>;
  editCaseNumber: string;
  setEditCaseNumber: (v: string) => void;
  error: string | null;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
  onSwitchToEdit: () => void;
  onSwitchToView: () => void;
};

export const ApplicantRecordModal = ({
  modalMode,
  modalClosing,
  applicant,
  activeForm,
  values,
  setValues,
  editCaseNumber,
  setEditCaseNumber,
  error,
  saving,
  onClose,
  onSave,
  onSwitchToEdit,
  onSwitchToView,
}: Props) => {
  const modalTitle =
    modalMode === 'view'
      ? `Анкета: ${applicant.fullName || applicant.caseNumber}`
      : `Редактирование: ${applicant.fullName || applicant.caseNumber}`;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl ${
          modalClosing ? 'animate-fade-out-scale' : 'animate-fade-in-scale'
        }`}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 flex items-center justify-between px-4 py-3 z-10">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <FileText size={20} className="text-blue-600" />
            {modalTitle}
          </h2>
          <div className="flex items-center gap-2">
            {modalMode === 'view' && (
              <AdminRoute>
                <button
                  type="button"
                  onClick={onSwitchToEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  <SquarePen size={14} />
                  Редактировать
                </button>
              </AdminRoute>
            )}
            {modalMode === 'edit' && (
              <button
                type="button"
                onClick={onSwitchToView}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                <Eye size={14} />
                Просмотр
              </button>
            )}
            <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="mb-4">
            {modalMode === 'edit' ? (
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-400 whitespace-nowrap">№ дела:</label>
                <input
                  type="text"
                  value={editCaseNumber}
                  onChange={(e) => setEditCaseNumber(e.target.value)}
                  placeholder="Например: 1/9 ИС"
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                />
              </div>
            ) : (
              <p className="text-xs text-gray-400">
                № дела: <span className="font-medium text-gray-600">{applicant.caseNumber}</span>
              </p>
            )}
          </div>
          {activeForm ? (
            <ApplicantFormContent
              form={activeForm}
              values={values}
              setValues={setValues}
              readOnly={modalMode === 'view'}
            />
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">Загрузка формы...</p>
          )}
          {error && <p className="mt-4 text-sm text-red-500 text-center">{error}</p>}
          {modalMode === 'edit' && activeForm && (
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 transition"
            >
              {saving ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};
