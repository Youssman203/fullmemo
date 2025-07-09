import React from 'react';
import { Card, Table, Badge } from 'react-bootstrap';
import { FiAlertTriangle } from 'react-icons/fi';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const TroubleCardsTable = ({ troubleCards }) => {
  return (
    <Card className="shadow-sm h-100">
      <Card.Body>
        <Card.Title className="d-flex align-items-center mb-4">
          <FiAlertTriangle className="me-2 text-warning" />
          <span>Cartes problématiques</span>
        </Card.Title>
        
        {troubleCards && troubleCards.length > 0 ? (
          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>Question</th>
                  <th>Collection</th>
                  <th className="text-center">Échecs</th>
                  <th>Dernière révision</th>
                </tr>
              </thead>
              <tbody>
                {troubleCards.map(card => (
                  <tr key={card.id}>
                    <td>
                      <div className="text-truncate" style={{ maxWidth: '250px' }}>
                        {card.question}
                      </div>
                    </td>
                    <td>
                      <Badge bg="primary" pill>
                        {card.collectionName}
                      </Badge>
                    </td>
                    <td className="text-center">
                      <Badge bg="danger" pill>
                        {card.failCount}
                      </Badge>
                    </td>
                    <td>
                      {card.lastReviewed ? (
                        <span title={format(new Date(card.lastReviewed), 'PPP', { locale: fr })}>
                          {formatDistanceToNow(new Date(card.lastReviewed), { addSuffix: true, locale: fr })}
                        </span>
                      ) : (
                        <span className="text-muted">Jamais</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-4 text-muted">
            <p>Aucune carte problématique pour le moment.</p>
            <p className="small">Continuez à réviser pour voir apparaître les cartes qui nécessitent plus d'attention.</p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default TroubleCardsTable;
