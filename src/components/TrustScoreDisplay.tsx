import React from 'react';

interface TrustScoreDisplayProps {
  trustScore: number;
  className?: string;
}

function getTrustLabel(score: number) {
  if (score >= 90) return { label: 'Excellent', color: 'bg-green-500' };
  if (score >= 80) return { label: 'Very Good', color: 'bg-green-400' };
  if (score >= 70) return { label: 'Good', color: 'bg-yellow-400' };
  if (score >= 60) return { label: 'Fair', color: 'bg-orange-400' };
  return { label: 'Poor', color: 'bg-red-500' };
}

const TrustScoreDisplay: React.FC<TrustScoreDisplayProps> = ({ trustScore, className }) => {
  const { label, color } = getTrustLabel(trustScore);
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold text-white ${color} ${className || ''}`}
      title={`Trust Score: ${trustScore}`}
    >
      {label} ({trustScore})
    </span>
  );
};

export default TrustScoreDisplay; 