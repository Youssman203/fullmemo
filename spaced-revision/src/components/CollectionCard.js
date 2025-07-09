import React from 'react';
import { Link } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import styled from 'styled-components';

const CardContainer = styled.div`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background-color: var(--background-card);
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.08);
  }
`;

const CardLink = styled(Link)`
    display: block;
    text-decoration: none;
    color: inherit;
`;

const CardImage = styled.div`
  height: 160px;
  background-image: url(${props => props.imageUrl});
  background-size: cover;
  background-position: center;
`;

const CardBody = styled.div`
  padding: 1.5rem;
`;

const CardTitle = styled.h5`
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--text-main);
`;

const CardDescription = styled.p`
  font-size: 0.9rem;
  color: var(--text-light);
`;

const ActionsDropdown = styled(Dropdown)`
    position: absolute;
    top: 1rem;
    right: 1rem;

    .dropdown-toggle::after {
        display: none;
    }
`;

const CollectionCard = ({ collection, onRename, onDelete }) => {
  return (
    <CardContainer>
        <ActionsDropdown>
            <Dropdown.Toggle variant="link" id={`dropdown-${collection.id}`} className="p-0 text-muted">
                &#x22EE; {/* Vertical ellipsis */}
            </Dropdown.Toggle>
            <Dropdown.Menu>
                <Dropdown.Item onClick={onRename}>Rename</Dropdown.Item>
                <Dropdown.Item onClick={onDelete} className="text-danger">Delete</Dropdown.Item>
            </Dropdown.Menu>
        </ActionsDropdown>

        <CardLink to={`/collections/${collection.id}`}>
            <CardImage imageUrl={collection.imageUrl} />
            <CardBody>
                <CardTitle>{collection.name}</CardTitle>
                <CardDescription>{collection.description || 'No description available.'}</CardDescription>
            </CardBody>
        </CardLink>
    </CardContainer>
  );
};

export default CollectionCard;
