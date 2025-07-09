import React, { useEffect, useRef } from 'react';
import { Card } from 'react-bootstrap';
import Chart from 'chart.js/auto';
import { FiActivity } from 'react-icons/fi';

const ProgressRadarChart = ({ stats }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      
      chartInstance.current = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: ['Mémorisation', 'Régularité', 'Performance', 'Constance', 'Progression'],
          datasets: [{
            label: 'Compétences',
            data: [
              stats.memorizationScore,
              stats.regularityScore,
              stats.performanceScore,
              stats.consistencyScore,
              stats.progressionScore
            ],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(54, 162, 235, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(54, 162, 235, 1)'
          }]
        },
        options: {
          scales: {
            r: {
              angleLines: {
                display: true
              },
              suggestedMin: 0,
              suggestedMax: 100,
              ticks: {
                stepSize: 20,
                backdropColor: 'transparent'
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.label}: ${context.raw}/100`;
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
  }, [stats]);

  return (
    <Card className="shadow-sm h-100">
      <Card.Body>
        <Card.Title className="d-flex align-items-center mb-4">
          <FiActivity className="me-2 text-primary" />
          <span>Graphique radar des compétences</span>
        </Card.Title>
        <div style={{ height: '300px', position: 'relative' }}>
          <canvas ref={chartRef} />
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProgressRadarChart;
