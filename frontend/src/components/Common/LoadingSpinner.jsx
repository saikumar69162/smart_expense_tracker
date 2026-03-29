import React from 'react';

const LoadingSpinner = ({ size = 'md', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };
  
  const spinner = (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-b-2 border-blue-600`}></div>
    </div>
  );
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }
  
  return spinner;
};

export default LoadingSpinner;