import React, { useState } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { FaEye, FaEyeSlash, FaTags } from 'react-icons/fa';

const FlashcardDisplay = ({ flashcard, showAnswer = false, onToggleAnswer, compact = false }) => {
  const [isAnswerVisible, setIsAnswerVisible] = useState(showAnswer);

  const handleToggleAnswer = () => {
    const newState = !isAnswerVisible;
    setIsAnswerVisible(newState);
    if (onToggleAnswer) {
      onToggleAnswer(newState);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'facile':
      case 'easy':
        return 'success';
      case 'moyen':
      case 'medium':
        return 'warning';
      case 'difficile':
      case 'hard':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  if (!flashcard) {
    return (
      <Card className="h-100">
        <Card.Body className="d-flex align-items-center justify-content-center">
          <p className="text-muted">Aucune carte à afficher</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className={`h-100 ${compact ? 'mb-2' : 'mb-3'}`}>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          {flashcard.difficulty && (
            <Badge bg={getDifficultyColor(flashcard.difficulty)}>
              {flashcard.difficulty}
            </Badge>
          )}
          {flashcard.category && (
            <Badge bg="info">{flashcard.category}</Badge>
          )}
        </div>
        
        {flashcard.tags && flashcard.tags.length > 0 && (
          <div className="d-flex align-items-center gap-1">
            <FaTags className="text-muted" size={14} />
            <div className="d-flex gap-1 flex-wrap">
              {flashcard.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} bg="light" text="dark" className="small">
                  {tag}
                </Badge>
              ))}
              {flashcard.tags.length > 3 && (
                <Badge bg="light" text="dark" className="small">
                  +{flashcard.tags.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}
      </Card.Header>

      <Card.Body className={compact ? 'py-2' : 'py-3'}>
        <div className="mb-3">
          <h6 className="text-muted mb-2">Question :</h6>
          <p className="mb-0">{flashcard.question}</p>
        </div>

        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="text-muted mb-0">Réponse :</h6>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleToggleAnswer}
              className="d-flex align-items-center gap-1"
            >
              {isAnswerVisible ? <FaEyeSlash /> : <FaEye />}
              {isAnswerVisible ? 'Masquer' : 'Révéler'}
            </Button>
          </div>
          
          {isAnswerVisible ? (
            <div className="p-3 bg-light rounded">
              <p className="mb-0">{flashcard.answer}</p>
            </div>
          ) : (
            <div className="p-3 bg-light rounded text-center">
              <p className="text-muted mb-0">
                <em>Cliquez sur "Révéler" pour voir la réponse</em>
              </p>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default FlashcardDisplay;
