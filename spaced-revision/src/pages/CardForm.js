// src/pages/CardForm.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';

const CardForm = () => {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const { collections, getCardById, createFlashcard, updateFlashcard } = useData();
  
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [collectionId, setCollectionId] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (cardId) {
      const card = getCardById(cardId);
      if (card) {
        setQuestion(card.question);
        setAnswer(card.answer);
        setCollectionId(card.collectionId);
        setIsEditing(true);
      }
    } else {
        if (collections.length > 0) {
            setCollectionId(collections[0].id);
        }
    }
  }, [cardId, getCardById, collections]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question || !answer || !collectionId) {
        alert('Please fill all fields');
        return;
    }

    if (isEditing) {
      updateFlashcard(cardId, { question, answer, collection: collectionId });
    } else {
      createFlashcard({ question, answer, collection: collectionId });
    }
    navigate(-1); // Go back to the previous page
  };

  return (
    <div className="container py-5" style={{ maxWidth: '700px' }}>
      <div className="card duo-card p-4">
        <div className="card-body">
          <h1 className="text-center mb-4">{isEditing ? 'Edit Card' : 'Create New Card'}</h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="question" className="form-label fw-bold">Question</label>
              <textarea 
                id="question" 
                className="form-control"
                rows="3"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="answer" className="form-label fw-bold">Answer</label>
              <textarea 
                id="answer" 
                className="form-control"
                rows="3"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="collection" className="form-label fw-bold">Collection</label>
              <select 
                id="collection" 
                className="form-select"
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
                required
              >
                {collections.map(col => (
                  <option key={col.id} value={col.id}>{col.name}</option>
                ))}
              </select>
            </div>
            <div className="d-grid">
              <button type="submit" className="btn btn-primary btn-lg">{isEditing ? 'Save Changes' : 'Add Card'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CardForm;
