import "./App.css";
import { useState, useEffect } from "react";
import { getLocations, isNameValid } from "./mock-api/apis";

function App() {
  const [name, setName] = useState('');
  const [valid, setValid] = useState(true);
  const [location, setLocation] = useState(null);
  const [locations, setLocations] = useState([]);
  const [duplicate, setDuplicate] = useState(false);
  const [data, setData] = useState([]);

  // useEffect used here similar to componentDidMount, being called only on initial render
  useEffect(() => {
    const fetchCountries = async () => {
      const locs = await getLocations();
      setLocations(locs);
      setLocation(locs[0]);
    };

    fetchCountries();
  }, []);

  // due to the random finish time of name validation a more recent request could finish after a previous request
  // we use a boolean flag to handle such race conditions. only most recent request will update state
  // this logic is handled via the clean up returned by useEffect
  useEffect(() => {
    let active = true;
    setDuplicate(false);
    const validateName = async () => {
      const isValid = await isNameValid(name);
      if (active) {
        setValid(isValid);
      }
    };
    validateName();
    return () => {
      active = false;
    };
  }, [name]);

  const handleLocationChange = (e) => {
    setLocation(e.target.value);
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
  };

  // clear all state to initial values
  const clear = () => {
    setName("");
    setValid(true);
    setData([]);
    setLocation(locations[0]);
  };

  // creates a newItem based on current state, checks if entry is a duplicate then appends to table data
  const add = () => {
    const newItem = { name, location };
    const inTable = data.some(
      (item) => item.name === newItem.name && item.location === newItem.location
    );

    if (inTable) {
      setDuplicate(true);
    } else {
      setDuplicate(false);
      setData([...data, newItem]);
    }
  };

  // fairly trivial jsx here. we have name validation text that appears conditionally
  // table with data variable mapped to table rows
  return (
    <div className="container">
      <div className="row">
        <div className="col-1">Name</div>
        <div className="col-1 name-input-field">
          <input
            value={name}
            onChange={handleNameChange}
          />
        </div>
        {!valid && <div className="text-validation">This name has already been taken</div>}
        {duplicate && <div className="text-validation">Duplicate entry...</div>}
      </div>
      <div className="row">
        <div className="col-1">Country</div>
        <div className="col-1 location-input-field">
          <select
            value={location}
            onChange={handleLocationChange}
          >
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="buttons">
        <span>
          <button
            className="btn btn-secondary"
            onClick={clear}
          >
            Clear
          </button>
        </span>
        <span>
          <button
            className="btn btn-secondary"
            onClick={add}
            disabled={!valid}
          >
            Add
          </button>
        </span>
      </div>
      <div>
        <div>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Country</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, i) => (
                <tr key={i} className="table-light">
                  <td>{item.name}</td>
                  <td>{item.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
