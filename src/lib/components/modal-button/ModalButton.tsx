import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { EllipsisVertical, SquarePen, Trash, Eye } from 'lucide-react';
import { AdminRoute } from '../AdminRoute';
import { extractQuickFields, type ActiveForm } from '../ApplicantFormModal';
import type { ModalApplicant } from './types';
import { ApplicantRecordModal } from './ApplicantRecordModal';
import { DeleteApplicantDialog } from './DeleteApplicantDialog';

type Props = {
  applicant: ModalApplicant;
  onDeleted?: () => void;
  onUpdated?: () => void;
};

type MenuModalMode = 'view' | 'edit' | null;

export const ModalButton = ({ applicant, onDeleted, onUpdated }: Props) => {
  const [open, setOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [modalMode, setModalMode] = useState<MenuModalMode>(null);
  const [modalClosing, setModalClosing] = useState(false);
  const [activeForm, setActiveForm] = useState<ActiveForm | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>(applicant.formData ?? {});
  const [saving, setSaving] = useState(false);
  const [editCaseNumber, setEditCaseNumber] = useState(applicant.caseNumber ?? '');
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    fetch('http://localhost:3000/forms/active')
      .then((r) => r.json())
      .then((data) => setActiveForm(data))
      .catch(() => {});
  }, []);

  const handleCloseMenu = () => {
    setIsClosing(true);
    setTimeout(() => {
      setOpen(false);
      setIsClosing(false);
    }, 150);
  };

  const handleToggle = () => (open ? handleCloseMenu() : setOpen(true));

  const updatePosition = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const popupWidth = 160;
    const popupHeight = 132;
    const margin = 8;
    let left = rect.left - 150;
    let top = rect.bottom + 5;
    if (left + popupWidth > window.innerWidth - margin) left = window.innerWidth - popupWidth - margin;
    if (left < margin) left = margin;
    if (top + popupHeight > window.innerHeight - margin) top = rect.top - popupHeight - 5;
    if (top < margin) top = margin;
    setPosition({ top, left });
  };

  useEffect(() => {
    if (open) updatePosition();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      )
        handleCloseMenu();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openModal = (mode: Exclude<MenuModalMode, null>) => {
    setValues(applicant.formData ?? {});
    setEditCaseNumber(applicant.caseNumber ?? '');
    setError(null);
    setModalMode(mode);
    handleCloseMenu();
  };

  const closeModal = () => {
    setModalClosing(true);
    setTimeout(() => {
      setModalMode(null);
      setModalClosing(false);
      setError(null);
    }, 150);
  };

  useEffect(() => {
    document.body.style.overflow = modalMode ? 'hidden' : '';
  }, [modalMode]);

  useEffect(() => {
    if (!modalMode) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [modalMode]);

  const handleSave = async () => {
    if (!activeForm) return;
    setSaving(true);
    setError(null);
    try {
      const quick = extractQuickFields(activeForm.fields, values);
      let documents: { name: string; status: 'done' | 'missing'; count?: number }[] = [];
      try {
        const docsRes = await fetch('http://localhost:3000/documents');
        const allDocs = await docsRes.json();
        const allDocNames: string[] = allDocs.map((d: { name: string }) => d.name);
        documents = allDocNames.map((name) => {
          const done = quick.checkedDocuments.includes(name);
          const count = done ? quick.documentCounts?.[name] : undefined;
          return {
            name,
            status: done ? 'done' : 'missing',
            ...(count && count > 0 ? { count } : {}),
          };
        });
      } catch {}

      const res = await fetch(`http://localhost:3000/applicants/${applicant.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          formData: values,
          caseNumber: editCaseNumber,
          ...quick,
          documents,
        }),
      });
      if (!res.ok) throw new Error();
      closeModal();
      onUpdated?.();
    } catch {
      setError('Не удалось сохранить изменения.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`http://localhost:3000/applicants/${applicant.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setConfirmDelete(false);
      onDeleted?.();
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <>
      <button
        type="button"
        ref={buttonRef}
        onClick={handleToggle}
        disabled={deleting}
        className="hover:bg-gray-200 p-2 rounded-full disabled:opacity-50"
      >
        <EllipsisVertical size={24} />
      </button>

      {open &&
        createPortal(
          <div className="fixed z-[9999]" style={{ top: position.top, left: position.left }}>
            <div
              ref={menuRef}
              className={`bg-white w-40 border border-gray-300 rounded-xl shadow-lg overflow-hidden ${
                isClosing ? 'animate-fade-out' : 'animate-fade-in'
              }`}
            >
              <button
                type="button"
                onClick={() => openModal('view')}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                <div className="flex items-center gap-4">
                  <Eye size={20} />
                  <p className="text-sm">Посмотреть</p>
                </div>
              </button>
              <AdminRoute>
                <button
                  type="button"
                  onClick={() => openModal('edit')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  <div className="flex items-center gap-4">
                    <SquarePen size={20} />
                    <p className="text-sm">Изменить</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setConfirmDelete(true);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                >
                  <div className="flex items-center gap-4">
                    <Trash size={20} />
                    <p className="text-sm">Удалить</p>
                  </div>
                </button>
              </AdminRoute>
            </div>
          </div>,
          document.body,
        )}

      {modalMode && (
        <ApplicantRecordModal
          modalMode={modalMode}
          modalClosing={modalClosing}
          applicant={applicant}
          activeForm={activeForm}
          values={values}
          setValues={setValues}
          editCaseNumber={editCaseNumber}
          setEditCaseNumber={setEditCaseNumber}
          error={error}
          saving={saving}
          onClose={closeModal}
          onSave={() => void handleSave()}
          onSwitchToEdit={() => setModalMode('edit')}
          onSwitchToView={() => setModalMode('view')}
        />
      )}

      <DeleteApplicantDialog
        open={confirmDelete}
        applicant={applicant}
        deleting={deleting}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => void handleDelete()}
      />
    </>
  );
};
