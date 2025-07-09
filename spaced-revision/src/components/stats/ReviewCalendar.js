import React, { useState, useEffect } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { FiCalendar } from 'react-icons/fi';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

const ReviewCalendar = ({ reviewHistory }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  
  useEffect(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    setCalendarDays(days);
  }, [currentMonth]);

  const previousMonth = () => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  };

  const nextMonth = () => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  };

  // Get activity level for a specific day
  const getDayActivity = (day) => {
    if (!reviewHistory) return null;
    
    const dayReviews = reviewHistory.filter(review => 
      isSameDay(new Date(review.reviewedAt), day)
    );
    
    if (dayReviews.length === 0) return null;
    
    // Calculate performance for the day
    const totalReviews = dayReviews.length;
    const goodReviews = dayReviews.filter(review => review.performance > 1).length;
    const performance = goodReviews / totalReviews;
    
    if (performance >= 0.8) return 'high';
    if (performance >= 0.5) return 'medium';
    return 'low';
  };

  // Get CSS class for activity level
  const getActivityClass = (activityLevel) => {
    if (!activityLevel) return 'bg-light';
    
    switch (activityLevel) {
      case 'high': return 'bg-success';
      case 'medium': return 'bg-warning';
      case 'low': return 'bg-danger';
      default: return 'bg-light';
    }
  };

  return (
    <Card className="shadow-sm h-100">
      <Card.Body>
        <Card.Title className="d-flex align-items-center mb-4">
          <FiCalendar className="me-2 text-info" />
          <span>Calendrier d'activité</span>
        </Card.Title>
        
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button 
            className="btn btn-sm btn-outline-secondary" 
            onClick={previousMonth}
          >
            &lt;
          </button>
          <h5 className="mb-0">{format(currentMonth, 'MMMM yyyy')}</h5>
          <button 
            className="btn btn-sm btn-outline-secondary" 
            onClick={nextMonth}
          >
            &gt;
          </button>
        </div>
        
        <Row className="g-0 text-center">
          {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
            <Col key={day} className="p-1">
              <div className="small fw-bold">{day}</div>
            </Col>
          ))}
        </Row>
        
        <Row className="g-0 text-center">
          {/* Empty cells for days before the first day of the month */}
          {Array.from({ length: calendarDays[0]?.getDay() || 0 }).map((_, index) => (
            <Col key={`empty-start-${index}`} className="p-1">
              <div className="calendar-day empty"></div>
            </Col>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map(day => {
            const activityLevel = getDayActivity(day);
            const activityClass = getActivityClass(activityLevel);
            
            return (
              <Col key={day.toString()} className="p-1">
                <div className="position-relative">
                  <div 
                    className={`calendar-day rounded-circle d-flex align-items-center justify-content-center ${activityClass}`}
                    style={{ width: '36px', height: '36px', margin: '0 auto' }}
                  >
                    {format(day, 'd')}
                  </div>
                </div>
              </Col>
            );
          })}
          
          {/* Empty cells for days after the last day of the month */}
          {Array.from({ length: 6 - (calendarDays[calendarDays.length - 1]?.getDay() || 0) }).map((_, index) => (
            <Col key={`empty-end-${index}`} className="p-1">
              <div className="calendar-day empty"></div>
            </Col>
          ))}
        </Row>
        
        <div className="d-flex justify-content-center mt-3">
          <div className="d-flex align-items-center me-3">
            <div className="bg-success rounded-circle me-1" style={{ width: '12px', height: '12px' }}></div>
            <small className="text-muted">Excellent</small>
          </div>
          <div className="d-flex align-items-center me-3">
            <div className="bg-warning rounded-circle me-1" style={{ width: '12px', height: '12px' }}></div>
            <small className="text-muted">Moyen</small>
          </div>
          <div className="d-flex align-items-center">
            <div className="bg-danger rounded-circle me-1" style={{ width: '12px', height: '12px' }}></div>
            <small className="text-muted">À améliorer</small>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ReviewCalendar;
