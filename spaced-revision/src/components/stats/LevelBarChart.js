import React, { useEffect, useRef } from 'react';
import { Card } from 'react-bootstrap';
import Chart from 'chart.js/auto';
import { FiLayers } from 'react-icons/fi';

const LevelBarChart = ({ levelData }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (chartRef.current && levelData) {
      const ctx = chartRef.current.getContext('2d');
      
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Niveau 1', 'Niveau 2', 'Niveau 3', 'Niveau 4', 'Niveau 5+'],
          datasets: [{
            label: 'Nombre de cartes',
            data: [
              levelData.level1,
              levelData.level2,
              levelData.level3,
              levelData.level4,
              levelData.level5Plus
            ],
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(255, 159, 64, 0.7)',
              'rgba(255, 205, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(54, 162, 235, 0.7)'
            ],
            borderColor: [
              'rgb(255, 99, 132)',
              'rgb(255, 159, 64)',
              'rgb(255, 205, 86)',
              'rgb(75, 192, 192)',
              'rgb(54, 162, 235)'
            ],
            borderWidth: 1
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
                text: 'Nombre de cartes'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Niveau SM-2'
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.dataset.label || '';
                  const value = context.parsed.y;
                  return `${label}: ${value} ${value === 1 ? 'carte' : 'cartes'}`;
                }
              }
            },
            legend: {
              display: false
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
  }, [levelData]);

  return (
    <Card className="shadow-sm h-100">
      <Card.Body>
        <Card.Title className="d-flex align-items-center mb-4">
          <FiLayers className="me-2 text-warning" />
          <span>Distribution des niveaux SM-2</span>
        </Card.Title>
        <div style={{ height: '300px', position: 'relative' }}>
          <canvas ref={chartRef} />
        </div>
      </Card.Body>
    </Card>
  );
};

export default LevelBarChart;
