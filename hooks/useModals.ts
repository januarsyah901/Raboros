import { useState } from "react";

export interface ErrorModalState {
  isOpen: boolean;
  title: string;
  message: string;
  details?: string;
}

export interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  isDangerous?: boolean;
}

export const useModals = () => {
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [errorModal, setErrorModal] = useState<ErrorModalState>({
    isOpen: false,
    title: "",
    message: "",
  });
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Budget Modal handlers
  const openBudgetModal = () => setShowBudgetModal(true);
  const closeBudgetModal = () => setShowBudgetModal(false);

  // Error Modal handlers
  const openErrorModal = (title: string, message: string, details?: string) => {
    setErrorModal({
      isOpen: true,
      title,
      message,
      details,
    });
  };

  const closeErrorModal = () => {
    setErrorModal({
      isOpen: false,
      title: "",
      message: "",
      details: undefined,
    });
  };

  // Confirm Modal handlers
  const openConfirmModal = (
    title: string,
    message: string,
    onConfirm: () => void,
    isDangerous = false
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      isDangerous,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      title: "",
      message: "",
      onConfirm: () => {},
      isDangerous: false,
    });
  };

  return {
    // Budget modal
    showBudgetModal,
    openBudgetModal,
    closeBudgetModal,

    // Error modal
    errorModal,
    openErrorModal,
    closeErrorModal,

    // Confirm modal
    confirmModal,
    openConfirmModal,
    closeConfirmModal,
  };
};
