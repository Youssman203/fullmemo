// src/components/JoinClassButton.js
import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { FiUsers } from 'react-icons/fi';
import JoinClassModal from './JoinClassModal';

const JoinClassButton = ({ variant = "outline-secondary", size = "md", className = "", onClassJoined }) => {
  const [showModal, setShowModal] = useState(false);

  const handleClassJoined = (classData) => {
    if (onClassJoined) {
      onClassJoined(classData);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={`d-flex align-items-center justify-content-center ${className}`}
        onClick={() => setShowModal(true)}
      >
        <FiUsers className="me-2" />
        Rejoindre une classe
      </Button>

      <JoinClassModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onClassJoined={handleClassJoined}
      />
    </>
  );
};

export default JoinClassButton;
