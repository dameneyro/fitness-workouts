import React, { useState } from 'react';
import WorkoutForm from './components/forms/WorkoutForm';
import ExerciseForm from './components/forms/ExerciseForm';
import './App.css';

const App = () => {
  const [userId, setUserId] = useState('');
  const [workoutId, setWorkoutId] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  const handleBeginWorkout = (userId, workoutId, exercises) => {
    setUserId(userId);
    setWorkoutId(workoutId);
    setExercises(exercises.map(exercise => ({ ...exercise, completedExerciseId: null })));
    setCurrentExerciseIndex(0);
  };

  const handleExerciseSubmit = async (completedExerciseId, isLastExercise) => {
    setExercises(prevExercises => 
      prevExercises.map((exercise, index) =>
        index === currentExerciseIndex ? { ...exercise, completedExerciseId } : exercise
      )
    );

    if (isLastExercise) {
      await handleCompleteWorkout();
    } else {
      setCurrentExerciseIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handleCompleteWorkout = async () => {
    try {
      const response = await fetch(`https://bwg36wqc6b.execute-api.us-east-1.amazonaws.com/dev/workouts/${workoutId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Error completing workout: ${response.statusText}`);
      }

      alert('Workout complete!');
      setUserId('');
      setWorkoutId(null);
      setExercises([]);
      setCurrentExerciseIndex(0);
    } catch (error) {
      console.error('Error completing workout:', error);
      alert('Failed to complete workout. Please try again.');
    }
  };

  const handleBack = (completedExerciseId) => {
    setExercises(prevExercises => 
      prevExercises.map((exercise, index) =>
        index === currentExerciseIndex ? { ...exercise, completedExerciseId } : exercise
      )
    );

    setCurrentExerciseIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  return (
    <div>
      {workoutId === null ? (
        <WorkoutForm onBegin={handleBeginWorkout} />
      ) : (
        exercises.length > 0 && exercises[currentExerciseIndex] ? (
          <ExerciseForm
            workoutId={workoutId}
            exercise={exercises[currentExerciseIndex]}
            onSubmit={handleExerciseSubmit}
            onBack={handleBack}
            isLastExercise={currentExerciseIndex === exercises.length - 1}
          />
        ) : (
          <p>Loading exercise...</p>
        )
      )}
    </div>
  );
};

export default App;
