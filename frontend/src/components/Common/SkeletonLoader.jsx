import React from 'react';

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const skeletons = {
    card: (
      <div className="card p-6">
        <div className="skeleton h-32 w-full mb-4"></div>
        <div className="skeleton h-4 w-3/4 mb-2"></div>
        <div className="skeleton h-4 w-1/2"></div>
      </div>
    ),
    list: (
      <div className="flex items-center space-x-4 p-4">
        <div className="skeleton h-12 w-12 rounded-full"></div>
        <div className="flex-1">
          <div className="skeleton h-4 w-3/4 mb-2"></div>
          <div className="skeleton h-3 w-1/2"></div>
        </div>
      </div>
    ),
    table: (
      <div className="space-y-3">
        <div className="skeleton h-10 w-full"></div>
        <div className="skeleton h-10 w-full"></div>
        <div className="skeleton h-10 w-full"></div>
      </div>
    ),
  };

  return (
    <>
      {Array(count).fill().map((_, i) => (
        <div key={i}>{skeletons[type]}</div>
      ))}
    </>
  );
};

export default SkeletonLoader;