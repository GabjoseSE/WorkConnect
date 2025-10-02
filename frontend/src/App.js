import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("/")
      .then(res => setMessage(res.data))
      .catch(err => setMessage("Backend not connected"));
  }, []);

  return (
    <div className="App">
      <h1>WorkConnect</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;
