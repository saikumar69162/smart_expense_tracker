import React from 'react';
import { FiDownload } from 'react-icons/fi';
import { useNotifications } from '../../context/NotificationsContext';

const ExportData = ({ expenses }) => {
  const { addNotification } = useNotifications();

  const exportToExcel = () => {
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
    
    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expenses_${new Date().toISOString().split('T')[0]}.xls`;
    link.click();
    URL.revokeObjectURL(url);
    addNotification({
      title: 'Excel export completed',
      message: `${expenses.length} expense records were exported to Excel.`,
      type: 'success',
      dedupeKey: `excel-export-${new Date().toISOString()}`
    });
  };
  
  return (
    <button
      onClick={exportToExcel}
      className="btn-secondary flex items-center space-x-2"
    >
      <FiDownload size={18} />
      <span>Export Excel</span>
    </button>
  );
};

export default ExportData;
