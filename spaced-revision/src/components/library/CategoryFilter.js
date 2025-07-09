import React from 'react';
import { Badge } from 'react-bootstrap';
import { categories } from '../../mock/publicCollections';

const CategoryFilter = ({ activeCategory, onCategoryChange }) => {
  return (
    <div className="category-tags">
      {categories.map(category => (
        <Badge
          key={category.id}
          bg={activeCategory === category.id ? category.color || 'primary' : 'light'}
          text={activeCategory === category.id ? 'white' : 'dark'}
          className="category-tag px-3 py-2 me-2 mb-2"
          onClick={() => onCategoryChange(category.id)}
          style={{ cursor: 'pointer' }}
        >
          {category.label}
        </Badge>
      ))}
    </div>
  );
};

export default CategoryFilter;
