import React from 'react';

const CropBatchCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl shadow-lg p-5 animate-pulse border border-gray-200">
    {/* Image skeleton */}
    <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
    
    {/* Title skeleton */}
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
    
    {/* Description skeleton */}
    <div className="space-y-2 mb-4">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>
    
    {/* Attributes skeleton */}
    <div className="space-y-1 mb-4">
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
    
    {/* Button skeleton */}
    <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
  </div>
);

export default CropBatchCardSkeleton;