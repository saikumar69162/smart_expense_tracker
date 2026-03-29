import React, { useState } from 'react';
import { FiDownload, FiFileText, FiFile } from 'react-icons/fi';

const ExportData = ({ expenses }) => {
  const [showOptions, setShowOptions] = useState(false);
  
  const exportToCSV = () => {
    const headers = ['Date', 'Category', 'Description', 'Amount'];
    const rows = expenses.map(exp => [
      exp.date,
      exp.category,
      exp.description || '',
      exp.amount
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setShowOptions(false);
  };
  
  const exportToJSON = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      totalExpenses: expenses.length,
      totalAmount: expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0),
      expenses: expenses
    };
    
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expenses_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setShowOptions(false);
  };
  
  const exportToPDF = () => {
    // In a real app, you would use a library like jsPDF or react-pdf
    alert('PDF export would be implemented with a PDF library');
    setShowOptions(false);
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="btn-secondary flex items-center space-x-2"
      >
        <FiDownload size={18} />
        <span>Export Data</span>
      </button>
      
      {showOptions && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-10 animate-fade-in">
          <button
            onClick={exportToCSV}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          >
            <FiFileText size={16} className="mr-2" />
            Export as CSV
          </button>
          <button
            onClick={exportToJSON}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          >
            <FiFile size={16} className="mr-2" />
            Export as JSON
          </button>
          <button
            onClick={exportToPDF}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          >
            <FiFileText size={16} className="mr-2" />
            Export as PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportData;