import React from 'react';
import { FiAlertCircle, FiX } from 'react-icons/fi';

const ErrorAlert = ({ message, onClose }) => {
  if (!message) return null;
  
  return (
    <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-4 animate-slide-in">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <FiAlertCircle className="text-red-500" size={20} />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-red-700">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto flex-shrink-0 text-red-500 hover:text-red-700"
          >
            <FiX size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorAlert;