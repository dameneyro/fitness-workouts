import React, { useState, useEffect } from 'react';
import '../../App.css'; // Import CSS for the subform if needed

const SetSubform = ({ set, index, onChange, setType }) => {
  const [reps, setReps] = useState(set.reps || '');
  const [weight, setWeight] = useState(set.weight || '');
  const [rir, setRir] = useState(set.rir !== undefined ? set.rir : null);
  const [rpe, setRpe] = useState(set.rpe !== undefined ? set.rpe : null);

  useEffect(() => {
    setReps(set.reps || '');
    setWeight(set.weight || '');
    setRir(set.rir !== undefined ? set.rir : null);
    setRpe(set.rpe !== undefined ? set.rpe : null);
  }, [set]);

  const handleRirChange = (event) => {
    const value = event.target.value;
    setRir(value === '' ? null : parseInt(value));
    onChange(index, 'rir', value === '' ? null : parseInt(value));
  };

  const handleRpeChange = (event) => {
    const value = event.target.value;
    setRpe(value === '' ? null : parseInt(value));
    onChange(index, 'rpe', value === '' ? null : parseInt(value));
  };

  return (
    <div className="form-group">
      <h3>Set {index + 1}</h3>
      <div>
        <label>{setType === 5 ? 'Seconds:' : 'Reps:'}</label>
        <input type="number" value={reps} onChange={(e) => { setReps(e.target.value); onChange(index, 'reps', e.target.value); }} />
      </div>
      <div>
        <label>Weight:</label>
        <input type="number" value={weight} onChange={(e) => { setWeight(e.target.value); onChange(index, 'weight', e.target.value); }} />
      </div>
      <div>
        <label>RIR:</label>
        <select value={rir !== null ? rir : ''} onChange={handleRirChange}>
          <option value="">Select RIR</option>
          {[...Array(11).keys()].map(value => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>
      </div>
      <div>
        <label>RPE:</label>
        <select value={rpe !== null ? rpe : ''} onChange={handleRpeChange}>
          <option value="">Select RPE</option>
          {[...Array(11).keys()].map(value => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SetSubform;
