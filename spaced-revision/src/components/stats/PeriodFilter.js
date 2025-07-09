import React from 'react';
import { ButtonGroup, Button } from 'react-bootstrap';
import { FiFilter } from 'react-icons/fi';

const PeriodFilter = ({ activePeriod, onPeriodChange }) => {
  const periods = [
    { id: '7d', label: '7 jours' },
    { id: '30d', label: '30 jours' },
    { id: '90d', label: '90 jours' },
    { id: 'all', label: 'Tout' }
  ];

  return (
    <div className="d-flex align-items-center mb-4">
      <div className="me-3 text-muted d-flex align-items-center">
        <FiFilter className="me-1" /> Période:
      </div>
      <ButtonGroup>
        {periods.map(period => (
          <Button
            key={period.id}
            variant={activePeriod === period.id ? 'primary' : 'outline-primary'}
            onClick={() => onPeriodChange(period.id)}
            size="sm"
          >
            {period.label}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  );
};

export default PeriodFilter;
