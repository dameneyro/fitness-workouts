import React, { useState, useEffect } from 'react';
import BeginWorkoutButton from './BeginWorkoutButton';

const WorkoutForm = ({ onBegin }) => {
  const [userId, setUserId] = useState('');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('https://bwg36wqc6b.execute-api.us-east-1.amazonaws.com/dev/workouts/templates', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        const parsedData = JSON.parse(data.body);

        if (Array.isArray(parsedData)) {
          setTemplates(parsedData);
        } else {
          console.error('Parsed data is not an array:', parsedData);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
      }
    };

    fetchTemplates();
  }, []);

  const handleBegin = async () => {
    if (userId && selectedTemplate) {
      try {
        const response = await fetch(`https://bwg36wqc6b.execute-api.us-east-1.amazonaws.com/dev/workouts/begin?userId=${userId}&templateId=${selectedTemplate}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        const parsedBody = JSON.parse(data.body);
        const { workoutId, exercises } = parsedBody;

        onBegin(userId, workoutId, exercises);
      } catch (error) {
        console.error('Error fetching exercises:', error);
      }
    } else {
      alert('Please enter a User ID and select a workout template.');
    }
  };

  return (
    <div>
      <div>
        <label>User ID:</label>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Workout Template:</label>
        <select
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
          required
        >
          <option value="">Select a template</option>
          {templates.map((template) => (
            <option key={template.workout_template_id} value={template.workout_template_id}>
              {template.name}
            </option>
          ))}
        </select>
      </div>
      <BeginWorkoutButton onClick={handleBegin} />
    </div>
  );
};

export default WorkoutForm;

