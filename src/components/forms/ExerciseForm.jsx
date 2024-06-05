import React, { useState, useEffect } from 'react';
import SetSubform from './SetSubform';
import './ExerciseForm.css';  // Make sure to import your CSS file

const ExerciseForm = ({ workoutId, exercise, onSubmit, onBack }) => {
  const [sets, setSets] = useState([]);
  const [completedExerciseId, setCompletedExerciseId] = useState(null);

  useEffect(() => {
    console.log("Reloading with exercise ", exercise);
    if (exercise) {
      console.log("Initializing");
      initializeExercise();
    }
  }, [exercise]);

  const initializeExercise = async () => {
    try {
      console.log("In initialization method");

      // Check if exercise is already initialized
      // if (completedExerciseId) {
      //   // Fetch existing sets from backend
      //   const setsResponse = await fetch(`https://bwg36wqc6b.execute-api.us-east-1.amazonaws.com/dev/workouts/${workoutId}/exercises/${completedExerciseId}/sets`, {
      //     method: 'GET',
      //     headers: { 'Content-Type': 'application/json' }
      //   });
      //   const setsData = await setsResponse.json();
      //   setSets(setsData.sets || []);
      // } else {
        // Initialize new exercise
        const startTime = new Date().toISOString();
        const response = await fetch(`https://bwg36wqc6b.execute-api.us-east-1.amazonaws.com/dev/workouts/${workoutId}/exercises`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ exercise_id: exercise.exercise_id, start_time: startTime }),
        });

        const data = await response.json();
        setCompletedExerciseId(data.completedExerciseId);

        // Initialize sets based on exercise type
        const setsToCreate = exercise.set_type_id === 4 ? 1 : 3;
        const initialSets = Array.from({ length: setsToCreate }, () => ({
          reps: '',
          weight: '',
          rir: null,
          rpe: null,
          set_type_id: exercise.set_type_id,
        }));

        setSets(initialSets);
      // }
    } catch (error) {
      console.error('Error initializing exercise:', error);
    }
  };

  const handleSetChange = (index, field, value) => {
    setSets((prevSets) => {
      const newSets = [...prevSets];
      newSets[index] = { ...newSets[index], [field]: value };
      return newSets;
    });
  };

  const saveSets = async () => {
    try {
      const response = await fetch(`https://bwg36wqc6b.execute-api.us-east-1.amazonaws.com/dev/workouts/${workoutId}/exercises/${completedExerciseId}/sets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sets }),
      });
      const responseData = await response.json();
      setSets(responseData.sets);
    } catch (error) {
      console.error('Error saving sets:', error);
    }
  };

  const handleNextExercise = async () => {
    await saveSets();
    onSubmit();
  };

  const handlePreviousExercise = async () => {
    await saveSets();
    onBack();
  };

  if (!exercise) {
    return <div>Loading exercise...</div>;
  }

  return (
    <div className="form-container">
      <h2>{exercise.name}</h2>
      <p>{exercise.description}</p>
      {sets.map((set, index) => (
        <SetSubform key={index} set={set} index={index} onChange={handleSetChange} />
      ))}
      <div className="button-group">
        <button onClick={handlePreviousExercise}>Previous Exercise</button>
        <button onClick={handleNextExercise}>Next Exercise</button>
      </div>
    </div>
  );
};

export default ExerciseForm;
