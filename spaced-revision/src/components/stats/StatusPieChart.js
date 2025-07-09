import React, { useEffect, useRef } from 'react';
import { Card } from 'react-bootstrap';
import Chart from 'chart.js/auto';
import { FiPieChart } from 'react-icons/fi';

const StatusPieChart = ({ statusData }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (chartRef.current && statusData) {
      const ctx = chartRef.current.getContext('2d');
      
      chartInstance.current = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['À réviser', 'Maîtrisées', 'En attente'],
          datasets: [{
            data: [statusData.toReview, statusData.mastered, statusData.waiting],
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(255, 205, 86, 0.7)'
            ],
            borderColor: [
              'rgb(255, 99, 132)',
              'rgb(75, 192, 192)',
              'rgb(255, 205, 86)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${value} cartes (${percentage}%)`;
                }
              }
            },
            legend: {
              position: 'right'
            }
          },
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [statusData]);

  return (
    <Card className="shadow-sm h-100">
      <Card.Body>
        <Card.Title className="d-flex align-items-center mb-4">
          <FiPieChart className="me-2 text-danger" />
          <span>Répartition des cartes par statut</span>
        </Card.Title>
        <div style={{ height: '300px', position: 'relative' }}>
          <canvas ref={chartRef} />
        </div>
      </Card.Body>
    </Card>
  );
};

export default StatusPieChart;
