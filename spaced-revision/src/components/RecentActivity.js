import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const RecentActivity = () => {
  const { user } = useAuth();
  const { getReviewHistory } = useData();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        if (user && user.id) {
          const data = await getReviewHistory(user.id);
          setHistory(data.slice(0, 5)); // Get last 5 reviews
        } else {
          setHistory([]);
        }
      } catch (error) {
        console.error("Error fetching review history:", error);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, [user, getReviewHistory]);

  if (loading) {
    return (
      <div className="recent-activity-card">
        <h5>Recent Activity</h5>
        <p>Loading activity...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="recent-activity-card">
        <h5>Recent Activity</h5>
        <p>No recent reviews. Time to start a session!</p>
      </div>
    );
  }

  return (
    <div className="recent-activity-card">
      <h5>Recent Activity</h5>
      <ul className="list-group list-group-flush">
        {history.map(item => (
          <li key={item.id} className="list-group-item">
            Reviewed "{item.cardQuestion}" 
            <span className="text-muted float-end">
              {formatDistanceToNow(new Date(item.reviewedAt), { addSuffix: true })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivity;
