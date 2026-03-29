import React from 'react';

const CategoryBadge = ({ category, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };
  
  const getCategoryStyle = (categoryName) => {
    const styles = {
      Food: 'bg-red-100 text-red-800',
      Transportation: 'bg-blue-100 text-blue-800',
      Shopping: 'bg-green-100 text-green-800',
      Entertainment: 'bg-yellow-100 text-yellow-800',
      Utilities: 'bg-purple-100 text-purple-800',
      Healthcare: 'bg-pink-100 text-pink-800',
      Education: 'bg-cyan-100 text-cyan-800',
      Other: 'bg-gray-100 text-gray-800'
    };
    return styles[categoryName] || styles.Other;
  };
  
  const getCategoryIcon = (categoryName) => {
    const icons = {
      Food: '🍔',
      Transportation: '🚗',
      Shopping: '🛍️',
      Entertainment: '🎬',
      Utilities: '💡',
      Healthcare: '🏥',
      Education: '📚',
      Other: '📝'
    };
    return icons[categoryName] || '📝';
  };
  
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${getCategoryStyle(category.name)}`}>
      <span className="mr-1">{getCategoryIcon(category.name)}</span>
      {category.name}
    </span>
  );
};

export default CategoryBadge;