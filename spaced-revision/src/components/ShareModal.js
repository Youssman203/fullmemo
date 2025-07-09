// src/components/ShareModal.js
import React, { useState } from 'react';
import { Modal, Button, InputGroup, FormControl } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';

const ShareModal = ({ show, onHide, collection }) => {
  const [shareCode, setShareCode] = useState('');
  const [copied, setCopied] = useState(false);

  const generateCode = () => {
    // In a real app, this would save the collection data to a sharable ID on the server.
    // Here, we just generate a fake UUID for demonstration.
    const code = uuidv4();
    setShareCode(code);
    setCopied(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  // Generate code when modal is opened
  React.useEffect(() => {
    if (show) {
      generateCode();
    }
  }, [show]);

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Share "{collection.name}"</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Share this code with others to let them import your collection.</p>
        <InputGroup className="mb-3">
          <FormControl
            value={shareCode}
            readOnly
          />
          <Button variant="outline-primary" onClick={copyToClipboard}>
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </InputGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ShareModal;
