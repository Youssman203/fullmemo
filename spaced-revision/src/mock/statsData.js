// src/mock/statsData.js
import { subDays, format, addDays } from 'date-fns';

// Generate mock review history data for the last 90 days
const generateReviewHistory = (userId) => {
  const history = [];
  const now = new Date();
  
  // Generate random review sessions for the past 90 days
  for (let i = 90; i >= 0; i--) {
    const date = subDays(now, i);
    
    // Skip some days randomly to simulate non-continuous usage
    if (Math.random() > 0.7) continue;
    
    // Generate 1-10 reviews for this day
    const reviewCount = Math.floor(Math.random() * 10) + 1;
    
    for (let j = 0; j < reviewCount; j++) {
      const performance = Math.floor(Math.random() * 4); // 0-3 performance score
      
      history.push({
        id: `review-${i}-${j}`,
        userId,
        cardId: `card-${Math.floor(Math.random() * 100)}`,
        cardQuestion: `Question de test ${Math.floor(Math.random() * 100)}`,
        reviewedAt: date.toISOString(),
        performance
      });
    }
  }
  
  return history;
};

// Generate mock data for stats calculations
export const generateStatsData = (userId, period = '30d') => {
  const reviewHistory = generateReviewHistory(userId);
  const now = new Date();
  let startDate;
  
  // Determine start date based on period
  switch (period) {
    case '7d':
      startDate = subDays(now, 7);
      break;
    case '30d':
      startDate = subDays(now, 30);
      break;
    case '90d':
      startDate = subDays(now, 90);
      break;
    case 'all':
    default:
      startDate = subDays(now, 365); // Use a year as "all" for mock data
      break;
  }
  
  // Filter history by period
  const filteredHistory = reviewHistory.filter(
    item => new Date(item.reviewedAt) >= startDate
  );
  
  // Calculate stats
  const totalReviews = filteredHistory.length;
  const goodReviews = filteredHistory.filter(item => item.performance > 1).length;
  const correctAnswersAvg = totalReviews > 0 ? Math.round((goodReviews / totalReviews) * 100) : 0;
  
  // Calculate active days percentage
  const periodDays = period === 'all' ? 365 : parseInt(period);
  const uniqueDays = new Set(filteredHistory.map(item => 
    format(new Date(item.reviewedAt), 'yyyy-MM-dd')
  )).size;
  const activeDaysPercentage = Math.round((uniqueDays / periodDays) * 100);
  
  // Generate mock card levels
  const levelData = {
    level1: Math.floor(Math.random() * 20) + 5,
    level2: Math.floor(Math.random() * 15) + 5,
    level3: Math.floor(Math.random() * 10) + 5,
    level4: Math.floor(Math.random() * 10) + 5,
    level5Plus: Math.floor(Math.random() * 30) + 10
  };
  
  const totalCards = 
    levelData.level1 + 
    levelData.level2 + 
    levelData.level3 + 
    levelData.level4 + 
    levelData.level5Plus;
  
  const masteredCards = levelData.level5Plus;
  const masteredPercentage = Math.round((masteredCards / totalCards) * 100);
  
  // Generate status data
  const statusData = {
    toReview: levelData.level1 + Math.floor(levelData.level2 / 2),
    mastered: masteredCards,
    waiting: totalCards - (levelData.level1 + Math.floor(levelData.level2 / 2) + masteredCards)
  };
  
  // Generate review line chart data
  const reviewLineData = {
    labels: [],
    counts: []
  };
  
  // Generate data for the last 14 days
  for (let i = 13; i >= 0; i--) {
    const date = subDays(now, i);
    const formattedDate = format(date, 'dd/MM');
    reviewLineData.labels.push(formattedDate);
    
    const dayReviews = filteredHistory.filter(item => 
      format(new Date(item.reviewedAt), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    ).length;
    
    reviewLineData.counts.push(dayReviews);
  }
  
  // Generate trouble cards
  const troubleCards = Array.from({ length: 5 }, (_, i) => ({
    id: `trouble-${i}`,
    question: `Question difficile ${i + 1}`,
    collectionName: ['React', 'JavaScript', 'CSS', 'HTML', 'Node.js'][Math.floor(Math.random() * 5)],
    failCount: Math.floor(Math.random() * 5) + 3,
    lastReviewed: subDays(now, Math.floor(Math.random() * 10) + 1).toISOString()
  }));
  
  // Generate skill scores
  const memorizationScore = Math.min(100, Math.round(correctAnswersAvg * (1 + Math.random() * 0.3)));
  const regularityScore = Math.min(100, Math.round(activeDaysPercentage * (1 + Math.random() * 0.5)));
  const performanceScore = Math.min(100, Math.round(masteredPercentage * (1 + Math.random() * 0.2)));
  const consistencyScore = Math.min(100, Math.round((regularityScore + performanceScore) / 2));
  const progressionScore = Math.min(100, Math.round(masteredPercentage * (1 + Math.random() * 0.4)));
  
  // Calculate overall score
  const score = Math.round(
    (memorizationScore + regularityScore + performanceScore + consistencyScore + progressionScore) / 5
  );
  
  return {
    reviewHistory: filteredHistory,
    stats: {
      score,
      totalCards,
      masteredPercentage,
      correctAnswersAvg,
      activeDaysPercentage,
      memorizationScore,
      regularityScore,
      performanceScore,
      consistencyScore,
      progressionScore
    },
    levelData,
    statusData,
    reviewLineData,
    troubleCards
  };
};
