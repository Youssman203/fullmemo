import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, InputGroup } from 'react-bootstrap';
import { FiSearch, FiTrendingUp, FiClock } from 'react-icons/fi';
import '../assets/library.css';

// Import components
import CollectionCard from '../components/library/CollectionCard';
import LoadingCollectionCard from '../components/library/LoadingCollectionCard';
import CategoryFilter from '../components/library/CategoryFilter';

// Import mock data
import { 
  publicCollections, 
  getPopularCollections, 
  getRecentCollections,
  getCollectionsByCategory,
  searchCollections
} from '../mock/publicCollections';

const Library = () => {
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState([]);
  const [popularCollections, setPopularCollections] = useState([]);
  const [recentCollections, setRecentCollections] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  // Check for dark mode preference
  useEffect(() => {
    const isDarkMode = document.body.classList.contains('dark-mode');
    setDarkMode(isDarkMode);
  }, []);

  // Load collections data
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      let filteredCollections = [];
      
      if (searchQuery.trim() !== '') {
        // If there's a search query, filter by that
        filteredCollections = searchCollections(searchQuery);
      } else {
        // Otherwise filter by category
        filteredCollections = getCollectionsByCategory(activeCategory);
      }
      
      setCollections(filteredCollections);
      setPopularCollections(getPopularCollections());
      setRecentCollections(getRecentCollections());
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [activeCategory, searchQuery]);

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    setSearchQuery('');
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Generate loading placeholders
  const renderLoadingCards = (count) => {
    return Array(count).fill(0).map((_, index) => (
      <Col key={`loading-${index}`} xs={12} sm={6} lg={4} xl={3} className="mb-4">
        <LoadingCollectionCard />
      </Col>
    ));
  };

  return (
    <Container className={`library-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="library-header">
        <h1 className="library-title">Explorez les collections d'autres étudiants</h1>
        <p className="library-subtitle">
          Découvrez des milliers de collections créées par la communauté pour améliorer vos connaissances
        </p>
        
        <InputGroup className="search-container">
          <InputGroup.Text className="bg-transparent border-end-0">
            <FiSearch className="search-icon" />
          </InputGroup.Text>
          <Form.Control
            className="search-input"
            placeholder="Rechercher des collections..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </InputGroup>
        
        <CategoryFilter 
          activeCategory={activeCategory} 
          onCategoryChange={handleCategoryChange} 
        />
      </div>
      
      {/* Main collections grid */}
      <Row>
        {loading ? (
          renderLoadingCards(8)
        ) : collections.length > 0 ? (
          collections.map(collection => (
            <Col key={collection.id} xs={12} sm={6} lg={4} xl={3} className="mb-4">
              <CollectionCard collection={collection} />
            </Col>
          ))
        ) : (
          <Col xs={12} className="text-center py-5">
            <h3>Aucune collection trouvée</h3>
            <p className="text-muted">
              Essayez de modifier vos critères de recherche ou de sélectionner une autre catégorie.
            </p>
          </Col>
        )}
      </Row>
      
      {/* Popular collections section */}
      {!loading && searchQuery === '' && (
        <div className="mt-5">
          <h2 className="section-title d-flex align-items-center">
            <FiTrendingUp className="me-2" /> Collections populaires
          </h2>
          <Row>
            {popularCollections.map(collection => (
              <Col key={collection.id} xs={12} sm={6} lg={3} className="mb-4">
                <CollectionCard collection={collection} />
              </Col>
            ))}
          </Row>
        </div>
      )}
      
      {/* Recent collections section */}
      {!loading && searchQuery === '' && (
        <div className="mt-5">
          <h2 className="section-title d-flex align-items-center">
            <FiClock className="me-2" /> Ajouts récents
          </h2>
          <Row>
            {recentCollections.map(collection => (
              <Col key={collection.id} xs={12} sm={6} lg={3} className="mb-4">
                <CollectionCard collection={collection} />
              </Col>
            ))}
          </Row>
        </div>
      )}
    </Container>
  );
};

export default Library;
