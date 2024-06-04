import React, { useState, useEffect } from 'react';

const ExerciseForm = ({ workoutId, exercise, onSubmit, onBack, exerciseSets, updateExerciseSets }) => {
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [restTime, setRestTime] = useState('');
  const [completedSets, setCompletedSets] = useState([]);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [completedExerciseId, setCompletedExerciseId] = useState(null);

  useEffect(() => {
    setCompletedSets(exerciseSets);
    initializeExercise();
  }, [exercise]);

  const initializeExercise = async () => {
    console.log("exercise sets: ", exerciseSets)
    if (exerciseSets.length > 0) {
      setCompletedSets(exerciseSets);
      setCurrentSetIndex(exerciseSets.length - 1);
      setCompletedExerciseId(exerciseSets[0].completed_exercise_id); // Assuming all sets have the same exercise_id
      return;
    }

    try {
      const startTime = new Date().toISOString();
      const response = await fetch(`https://bwg36wqc6b.execute-api.us-east-1.amazonaws.com/dev/workouts/${workoutId}/exercises`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exercise_id: exercise.exercise_id, start_time: startTime }),
      });

      const data = await response.json();
      setCompletedExerciseId(data.completedExerciseId);
      
      console.log("HERE'S YOUR SET TYPE ID: ", exercise.set_type_id)
      const setResponse = await fetch(`https://bwg36wqc6b.execute-api.us-east-1.amazonaws.com/dev/workouts/${workoutId}/exercises/${data.completedExerciseId}/sets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reps: '', weight: '', rest_time: '', set_type_id: exercise.set_type_id }), // Initialize with empty values
      });

      const setData = await setResponse.json();
      const newSets = [{ ...setData.set, completed_exercise_id: data.completedExerciseId }];
      setCompletedSets(newSets); // Initialize with the first set
      updateExerciseSets(exercise.exercise_id, newSets);
    } catch (error) {
      console.error('Error initializing exercise:', error);
    }
  };

  const saveSet = async () => {
    try {
      if (completedExerciseId !== null && completedSets[currentSetIndex]) {
        const setId = completedSets[currentSetIndex]["completed_set_id"];
        const response = await fetch(`https://bwg36wqc6b.execute-api.us-east-1.amazonaws.com/dev/workouts/${workoutId}/exercises/${completedExerciseId}/sets/${setId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reps,
            weight,
            rest_time: restTime,
          }),
        });
        const data = await response.json();
        setCompletedSets((prevSets) => {
          const newSets = [...prevSets];
          newSets[currentSetIndex] = { ...data.set, completed_exercise_id: completedExerciseId };
          updateExerciseSets(exercise.exercise_id, newSets);
          return newSets;
        });
      }
    } catch (error) {
      console.error('Error saving set:', error);
    }
  };

  const createNewSet = async () => {
    try {
      const response = await fetch(`https://bwg36wqc6b.execute-api.us-east-1.amazonaws.com/dev/workouts/${workoutId}/exercises/${completedExerciseId}/sets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reps: '', weight: '', rest_time: '', set_type_id: exercise.set_type_id }), // Initialize with empty values
      });

      const setData = await response.json();
      const newSet = { ...setData.set, completed_exercise_id: completedExerciseId };
      setCompletedSets((prevSets) => {
        const newSets = [...prevSets, newSet];
        updateExerciseSets(exercise.exercise_id, newSets);
        return newSets;
      });
    } catch (error) {
      console.error('Error creating new set:', error);
    }
  };

  const handleSetChange = (setter) => (e) => {
    setter(e.target.value);
  };

  const handleNextSet = async () => {
    await saveSet();
    setReps('');
    setWeight('');
    setRestTime('');
    
    if (currentSetIndex < completedSets.length - 1) {
      setCurrentSetIndex((prevIndex) => prevIndex + 1);
    } else {
      await createNewSet();
      setCurrentSetIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePreviousSet = () => {
    saveSet();
    setCurrentSetIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  return (
    <div>
      <h2>{exercise.name}</h2>
      <p>{exercise.description}</p>
      {exercise.set_type_id === 1 ? (
        <>
          <p>Set {currentSetIndex + 1}</p> 
          <p>{exercise.min_reps} - {exercise.max_reps} reps</p>
          <p>Recommended weight: {exercise.goal_weight}</p>
        </>
      ) : (
        <p>Burn Set</p>
      )}
      <div>
        <label>Reps:</label>
        <input type="number" value={reps} onChange={handleSetChange(setReps)} />
      </div>
      <div>
        <label>Weight:</label>
        <input type="number" value={weight} onChange={handleSetChange(setWeight)} />
      </div>
      <div>
        <label>Rest Time:</label>
        <input type="number" value={restTime} onChange={handleSetChange(setRestTime)} />
      </div>
      <div>
        <button onClick={handlePreviousSet} disabled={currentSetIndex === 0}>Previous Set</button>
        <button onClick={handleNextSet} >Next Set</button>
      </div>
      <div>
        <button onClick={onBack}>Previous Exercise</button>
        <button onClick={onSubmit}>Next Exercise</button>
      </div>
      <div>
        <h3>Completed Sets</h3>
        {completedSets.map((set, index) => (
          <p key={index}>Set {index + 1}: {set.reps} reps, {set.weight} lbs</p>
        ))}
      </div>
    </div>
  );
};

export default ExerciseForm;