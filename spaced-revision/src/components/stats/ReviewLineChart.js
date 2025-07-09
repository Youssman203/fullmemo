import React, { useEffect, useRef } from 'react';
import { Card } from 'react-bootstrap';
import Chart from 'chart.js/auto';
import { FiTrendingUp } from 'react-icons/fi';

const ReviewLineChart = ({ reviewData }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (chartRef.current && reviewData && reviewData.labels.length > 0) {
      const ctx = chartRef.current.getContext('2d');
      
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: reviewData.labels,
          datasets: [{
            label: 'Sessions de révision',
            data: reviewData.counts,
            fill: true,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            tension: 0.4,
            pointBackgroundColor: 'rgba(75, 192, 192, 1)',
            pointBorderColor: '#fff',
            pointRadius: 4,
            pointHoverRadius: 6
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              },
              title: {
                display: true,
                text: 'Nombre de révisions'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Date'
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                title: function(tooltipItems) {
                  return tooltipItems[0].label;
                },
                label: function(context) {
                  const label = context.dataset.label || '';
                  const value = context.parsed.y;
                  return `${label}: ${value} ${value === 1 ? 'révision' : 'révisions'}`;
                }
              }
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
  }, [reviewData]);

  return (
    <Card className="shadow-sm h-100">
      <Card.Body>
        <Card.Title className="d-flex align-items-center mb-4">
          <FiTrendingUp className="me-2 text-success" />
          <span>Sessions de révision</span>
        </Card.Title>
        <div style={{ height: '300px', position: 'relative' }}>
          {reviewData && reviewData.labels.length > 0 ? (
            <canvas ref={chartRef} />
          ) : (
            <div className="d-flex justify-content-center align-items-center h-100 text-muted">
              Pas assez de données pour afficher le graphique
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default ReviewLineChart;
