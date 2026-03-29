import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' }) => {
  if (!isOpen) return null;
  
  const typeStyles = {
    danger: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700'
    },
    warning: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700'
    },
    info: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700'
    }
  };
  
  const style = typeStyles[type];
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 animate-slide-in">
        <div className="flex justify-between items-center p-6 border-b">
          <div className={`p-2 rounded-full ${style.bg}`}>
            <FiAlertTriangle className={style.text} size={24} />
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
          <p className="text-gray-600">{message}</p>
        </div>
        
        <div className="flex space-x-3 p-6 border-t">
          <button
            onClick={onClose}
            className="flex-1 btn-secondary"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 ${style.button} text-white px-4 py-2 rounded-lg transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;