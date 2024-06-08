import React, { useState, useEffect } from 'react';
import SetSubform from './SetSubform';
import '../../App.css';  // Make sure to import your CSS file

const ExerciseForm = ({ workoutId, exercise, onSubmit, onBack }) => {
  const [sets, setSets] = useState([]);
  const [originalSets, setOriginalSets] = useState([]);

  useEffect(() => {
    console.log("RELOAD")
    if (exercise) {
      console.log("LAST EXERCISE ID: ", exercise, exercise.completedExerciseId)
      initializeExercise();
    }
  }, [exercise]);

  const initializeExercise = async () => {
    try {
      if (exercise.completedExerciseId) {
        // Fetch existing sets from backend
        console.log("GETTING PREVIOUS ONES FOR EXERCISE ID: ", exercise.completedExerciseId)
        const setsResponse = await fetch(`https://bwg36wqc6b.execute-api.us-east-1.amazonaws.com/dev/workouts/${workoutId}/exercises/${exercise.completedExerciseId}/sets`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!setsResponse.ok) {
          throw new Error(`Error fetching sets: ${setsResponse.statusText}`);
        }
        const setsData = await setsResponse.json();
        if (setsData.sets && setsData.sets.length > 0) {
          setSets(setsData.sets);
          setOriginalSets(setsData.sets);
        } else {
          initializeNewSets();
        }
      } else {
        // Initialize new exercise
        console.log("THIS IS LOOKING FOR A NEW EXERCISE")
        const startTime = new Date().toISOString();
        const response = await fetch(`https://bwg36wqc6b.execute-api.us-east-1.amazonaws.com/dev/workouts/${workoutId}/exercises`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ exercise_id: exercise.exercise_id, start_time: startTime }),
        });

        const data = await response.json();
        // Update the parent with the new completedExerciseId
        exercise.completedExerciseId = data.completedExerciseId;
        console.log("NEW COMPLETED EXERCISE ID: ", data.completedExerciseId);

        initializeNewSets();
      }
    } catch (error) {
      console.error('Error initializing exercise:', error);
    }
  };

  const initializeNewSets = () => {
    // Initialize sets based on exercise type
    let setsToCreate;

    switch (exercise.set_type_id) {
      case 1: // regular set
        setsToCreate = 3;
        break;
      case 2: // drop set
        setsToCreate = 5; 
        break;
      case 3: // super set, need to differentiate which set goes to which exercise (maybe odds and evens)
        setsToCreate = 6; 
        break;
      case 4: // burn set
        setsToCreate = 1;
        break;
      case 5: // timed set
        setsToCreate = 1
        break;
      default:
        setsToCreate = 3;
    }

    const initialSets = Array.from({ length: setsToCreate }, () => ({
      reps: '',
      weight: '',
      rir: null,
      rpe: null,
      set_type_id: exercise.set_type_id,
    }));

    setSets(initialSets);
    setOriginalSets(initialSets);
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
      console.log(" SETS TO SAVE: ", sets);
      
      const filteredSets = sets
        .filter(set => {
          const { reps, weight, rir, rpe } = set;
          return reps !== '' || weight !== '' || rir !== null || rpe !== null;
        })
        .map(set => ({
          completed_set_id: set.completed_set_id || null,
          reps: set.reps || null,
          weight: set.weight || null,
          rir: set.rir !== undefined ? set.rir : null,
          rpe: set.rpe !== undefined ? set.rpe : null,
          set_type_id: set.set_type_id
        }));

      // Check for changes compared to original sets
      const setsChanged = filteredSets.some((set, index) => {
        const originalSet = originalSets[index] || {};
        return set.reps !== originalSet.reps ||
          set.weight !== originalSet.weight ||
          set.rir !== originalSet.rir ||
          set.rpe !== originalSet.rpe;
      });

      if (!setsChanged) {
        console.log("No changes detected in sets.");
        return;
      }

      console.log("FILTERED SETS: ", filteredSets);

      const response = await fetch(`https://bwg36wqc6b.execute-api.us-east-1.amazonaws.com/dev/workouts/${workoutId}/exercises/${exercise.completedExerciseId}/sets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sets: filteredSets }),
      });

      const responseData = await response.json();
      setSets(responseData.sets);
      setOriginalSets(responseData.sets);  // Update original sets after saving
    } catch (error) {
      console.error('Error saving sets:', error);
    }
  };

  const handleNextExercise = async () => {
    console.log("HANDLENEXTEXERCISE")
    await saveSets();
    onSubmit(exercise.completedExerciseId);
  };

  const handlePreviousExercise = async () => {
    console.log("HANDLEPREVIOUSEXERCISE")
    await saveSets();
    onBack(exercise.completedExerciseId);
  };

  if (!exercise) {
    return <div>Loading exercise...</div>;
  }

  return (
    <div className="form-container">
      <h2>{exercise.name}</h2>
      <p>{exercise.description}</p>
      {sets.map((set, index) => (
        <SetSubform key={index} set={set} index={index} onChange={handleSetChange} setType={exercise.set_type_id} />
      ))}
      <div className="button-group">
        <button onClick={handlePreviousExercise}>Previous Exercise</button>
        <button onClick={handleNextExercise}>Next Exercise</button>
      </div>
    </div>
  );
};

export default ExerciseForm;
