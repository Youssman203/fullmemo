import React from 'react';
import { Container, Alert } from 'react-bootstrap';

const TestShared = () => {
  return (
    <Container className="mt-4">
      <Alert variant="success">
        <h2>🎉 Test Route Shared Fonctionne !</h2>
        <p>Si vous voyez cette page, cela signifie que :</p>
        <ul>
          <li>✅ La route /test-shared fonctionne</li>
          <li>✅ Le routage React Router est opérationnel</li>
          <li>✅ Les composants peuvent être chargés</li>
        </ul>
        <hr />
        <p><strong>URL actuelle :</strong> {window.location.href}</p>
        <p><strong>Pathname :</strong> {window.location.pathname}</p>
      </Alert>
    </Container>
  );
};

export default TestShared;
