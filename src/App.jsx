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

  const handleExerciseSubmit = (completedExerciseId) => {
    setExercises(prevExercises => 
      prevExercises.map((exercise, index) =>
        index === currentExerciseIndex ? { ...exercise, completedExerciseId } : exercise
      )
    );

    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex((prevIndex) => prevIndex + 1);
    } else {
      alert('Workout complete!');
      setUserId('');
      setWorkoutId(null);
      setExercises([]);
      setCurrentExerciseIndex(0);
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
          />
        ) : (
          <p>Loading exercise...</p>
        )
      )}
    </div>
  );
};

export default App;
