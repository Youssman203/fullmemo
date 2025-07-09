import React from 'react';
import { Carousel } from 'react-bootstrap';

const quotes = [
  {
    text: "The beautiful thing about learning is that nobody can take it away from you.",
    author: "B.B. King"
  },
  {
    text: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
    author: "Mahatma Gandhi"
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  }
];

const QuoteCarousel = () => {
  return (
    <Carousel indicators={false} controls={false} interval={5000} className="quote-carousel">
      {quotes.map((quote, index) => (
        <Carousel.Item key={index}>
          <div className="d-flex flex-column justify-content-center align-items-center h-100">
            <p className="quote-text">"{quote.text}"</p>
            <footer className="quote-author">- {quote.author}</footer>
          </div>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default QuoteCarousel;
