// src/components/ProgressChart.js
import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { useData } from '../contexts/DataContext';

const ProgressChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null); // To hold the chart instance
  const { cards } = useData();

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy(); // Destroy the old chart instance before creating a new one
    }

    if (chartRef.current && cards.length > 0) {
      const masteryLevels = {
        'New': 0, // level 1
        'Learning': 0, // level 2-4
        'Mastered': 0, // level 5+
      };

      cards.forEach(card => {
        if (card.level <= 1) {
          masteryLevels['New']++;
        } else if (card.level <= 4) {
          masteryLevels['Learning']++;
        } else {
          masteryLevels['Mastered']++;
        }
      });

      const ctx = chartRef.current.getContext('2d');
      chartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(masteryLevels),
          datasets: [{
            label: 'Card Mastery',
            data: Object.values(masteryLevels),
            backgroundColor: [
              'rgba(59, 77, 255, 0.7)', // Primary color for 'New'
              'rgba(255, 193, 7, 0.7)',  // A warning yellow for 'Learning'
              'rgba(6, 194, 112, 0.7)', // Secondary color for 'Mastered'
            ],
            borderColor: [
                'rgba(59, 77, 255, 1)',
                'rgba(255, 193, 7, 1)',
                'rgba(6, 194, 112, 1)',
            ],
            borderWidth: 1,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Overall Card Mastery'
            }
          }
        }
      });
    }
    
    // Cleanup function to destroy chart on component unmount
    return () => {
        if(chartInstance.current) {
            chartInstance.current.destroy();
        }
    }

  }, [cards]);

  if (cards.length === 0) {
      return <p className="text-center">No card data available. Add some cards to see your progress!</p>
  }

  return <canvas ref={chartRef} />;
};

export default ProgressChart;
