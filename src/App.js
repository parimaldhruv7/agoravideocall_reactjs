import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ConnectForm from './ConnectForm';
import Call from './Call';
import './App.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ConnectForm />} />
        <Route path="/call/:channelName" element={<Call />} />
      </Routes>
    </Router>
  );
};

export default App;
