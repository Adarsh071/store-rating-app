import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, onRate = null, readOnly = false, size = 20 }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating || rating;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onRate && onRate(star)}
          onMouseEnter={() => !readOnly && setHoverRating(star)}
          onMouseLeave={() => !readOnly && setHoverRating(0)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: readOnly ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: star <= displayRating ? '#f59e0b' : '#cbd5e1',
            transition: 'transform 0.15s ease',
            transform: !readOnly && star <= hoverRating ? 'scale(1.15)' : 'scale(1)'
          }}
          title={readOnly ? `${rating} Stars` : `Rate ${star} Star${star > 1 ? 's' : ''}`}
        >
          <Star
            size={size}
            fill={star <= displayRating ? '#f59e0b' : 'none'}
            stroke="currentColor"
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
