import React, { useState } from 'react';
import WorkoutForm from './components/WorkoutForm';
import ExerciseForm from './components/ExerciseForm';
import './App.css';

const App = () => {
  const [userId, setUserId] = useState('');
  const [workoutId, setWorkoutId] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseSetsMap, setExerciseSetsMap] = useState({});

  const handleBeginWorkout = (userId, workoutId, exercises) => {
    setUserId(userId);
    setWorkoutId(workoutId);
    setExercises(exercises);
    setCurrentExerciseIndex(0);
    setExerciseSetsMap({});
  };

  const handleExerciseSubmit = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex((prevIndex) => prevIndex + 1);
    } else {
      alert('Workout complete!');
      setUserId('');
      setWorkoutId(null);
      setExercises([]);
      setCurrentExerciseIndex(0);
      setExerciseSetsMap({});
    }
  };

  const handleBack = () => {
    setCurrentExerciseIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const updateExerciseSetsMap = (exerciseId, sets) => {
    setExerciseSetsMap((prevMap) => ({
      ...prevMap,
      [exerciseId]: sets,
    }));
  };

  return (
    <div>
      {workoutId === null ? (
        <WorkoutForm onBegin={handleBeginWorkout} />
      ) : (
        <ExerciseForm
          workoutId={workoutId}
          exercise={exercises[currentExerciseIndex]}
          onSubmit={handleExerciseSubmit}
          onBack={handleBack}
          exerciseSets={exerciseSetsMap[exercises[currentExerciseIndex].exercise_id] || []}
          updateExerciseSets={updateExerciseSetsMap}
        />
      )}
    </div>
  );
};

export default App;