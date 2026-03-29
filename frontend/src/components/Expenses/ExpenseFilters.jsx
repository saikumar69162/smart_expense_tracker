import React from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { FiFilter, FiX } from 'react-icons/fi';

const ExpenseFilters = () => {
  const { filters, setFilters, categories } = useExpenses();
  
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const clearFilters = () => {
    setFilters({
      startDate: null,
      endDate: null,
      category: '',
      minAmount: '',
      maxAmount: ''
    });
  };
  
  const hasActiveFilters = Object.values(filters).some(value => value !== '' && value !== null);
  
  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FiFilter className="text-gray-500 mr-2" />
          <h3 className="font-medium text-gray-800">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-red-600 hover:text-red-800 flex items-center"
          >
            <FiX size={14} className="mr-1" />
            Clear all
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="input-field text-sm"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="input-field text-sm"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="input-field text-sm"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex space-x-2">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Min Amount
            </label>
            <input
              type="number"
              value={filters.minAmount}
              onChange={(e) => handleFilterChange('minAmount', e.target.value)}
              placeholder="£0"
              className="input-field text-sm"
              step="1"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Max Amount
            </label>
            <input
              type="number"
              value={filters.maxAmount}
              onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
              placeholder="£1000"
              className="input-field text-sm"
              step="1"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseFilters;
