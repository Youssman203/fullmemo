import React from 'react';
import { FiPlus } from 'react-icons/fi';

const AddCollectionCard = ({ onClick }) => {
  return (
    <div className="add-collection-card" onClick={onClick}>
      <FiPlus className="add-collection-icon" />
      <div className="add-collection-text">Créer une collection</div>
    </div>
  );
};

export default AddCollectionCard;
