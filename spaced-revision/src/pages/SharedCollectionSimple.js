import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Alert } from 'react-bootstrap';

const SharedCollectionSimple = () => {
  const { token } = useParams();

  return (
    <Container className="mt-4">
      <Alert variant="success">
        <h2>🎉 SUCCÈS ! Route Shared Collection Fonctionne !</h2>
        <p>Si vous voyez cette page, cela signifie que :</p>
        <ul>
          <li>✅ La route /shared/:token fonctionne</li>
          <li>✅ Le routage React Router est opérationnel</li>
          <li>✅ Le composant SharedCollection peut être chargé</li>
          <li>✅ Les paramètres d'URL sont accessibles</li>
        </ul>
        <hr />
        <p><strong>Token reçu :</strong> <code>{token}</code></p>
        <p><strong>URL actuelle :</strong> {window.location.href}</p>
        <p><strong>Pathname :</strong> {window.location.pathname}</p>
        
        <Alert variant="info" className="mt-3">
          <h5>Prochaines étapes :</h5>
          <p>Maintenant que le routage fonctionne, nous pouvons :</p>
          <ol>
            <li>Restaurer le vrai composant SharedCollection</li>
            <li>Tester l'appel API avec le token</li>
            <li>Déboguer la logique de chargement</li>
          </ol>
        </Alert>
      </Alert>
    </Container>
  );
};

export default SharedCollectionSimple;
