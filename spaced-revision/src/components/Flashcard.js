// src/components/Flashcard.js
import React, { useState, useEffect } from 'react';

const Flashcard = ({ card, onNextCard, current, total }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    // Reset flip state when card changes
    setIsFlipped(false);
  }, [card]);

  const handlePerformance = (quality) => {
    // quality: 0: Again, 1: Hard, 2: Good, 3: Easy
    onNextCard(card.id, quality);
  };

  if (!card) {
    return <div>Loading card...</div>;
  }

  const progressPercentage = total > 0 ? ((current + 1) / total) * 100 : 0;

  return (
    <div className="review-container mx-auto" style={{ maxWidth: '700px' }}>
      <div className="progress mb-4">
        <div 
          className="progress-bar bg-success"
          role="progressbar" 
          style={{ width: `${progressPercentage}%` }}
          aria-valuenow={progressPercentage}
          aria-valuemin="0" 
          aria-valuemax="100">
        </div>
      </div>

      <div className="flashcard-container mb-4" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`flashcard ${isFlipped ? 'is-flipped' : ''}`}>
          <div className="flashcard-face flashcard-front duo-card fs-2">
            {card.question}
          </div>
          <div className="flashcard-face flashcard-back duo-card fs-4">
            {card.answer}
          </div>
        </div>
      </div>

      {isFlipped && (
        <div className="review-actions">
          <p className="text-center text-muted mb-3">How well did you know this?</p>
          <div className="d-grid gap-3 d-md-flex justify-content-md-center">
            <button className="btn btn-danger" onClick={() => handlePerformance(0)}>Again</button>
            <button className="btn btn-warning" onClick={() => handlePerformance(1)}>Hard</button>
            <button className="btn btn-info" onClick={() => handlePerformance(2)}>Good</button>
            <button className="btn btn-success" onClick={() => handlePerformance(3)}>Easy</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Flashcard;
