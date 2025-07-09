import React from 'react';
import { Button } from 'react-bootstrap';
import { FiBookOpen, FiPlus } from 'react-icons/fi';

const EmptyCollectionsState = ({ onAddCollection }) => {
  return (
    <div className="collections-empty">
      <FiBookOpen className="collections-empty-icon" />
      <h3 className="collections-empty-title">Vous n'avez pas encore de collections</h3>
      <p className="collections-empty-text">
        Les collections vous permettent d'organiser vos cartes par thème ou par sujet.
        Créez votre première collection pour commencer à apprendre !
      </p>
      <Button size="lg" onClick={onAddCollection}>
        <FiPlus className="me-2" /> Créer ma première collection
      </Button>
    </div>
  );
};

export default EmptyCollectionsState;
