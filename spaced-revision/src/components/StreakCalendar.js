import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Import calendar styles
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

const StreakCalendar = () => {
  const { user } = useAuth();
  const { getReviewHistory } = useData();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDays, setActiveDays] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        if (user && user.id) {
          const data = await getReviewHistory(user.id);
          setHistory(data);
          // Get unique days with activity
          setActiveDays([...new Set(data.map(item => 
            new Date(item.reviewedAt).toDateString()
          ))]);
        } else {
          setHistory([]);
          setActiveDays([]);
        }
      } catch (error) {
        console.error("Error fetching review history for calendar:", error);
        setHistory([]);
        setActiveDays([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, [user, getReviewHistory]);

  const tileContent = ({ date, view }) => {
    if (view === 'month' && activeDays.includes(date.toDateString())) {
      return <span className="streak-flame">🔥</span>;
    }
    return null;
  };

  return (
    <div className="streak-calendar-card">
      <h5>Your Streak</h5>
      {loading ? (
        <div className="text-center py-3">
          <p>Loading calendar data...</p>
        </div>
      ) : (
        <Calendar
          tileContent={tileContent}
          className="w-100 border-0"
        />
      )}
    </div>
  );
};

export default StreakCalendar;
