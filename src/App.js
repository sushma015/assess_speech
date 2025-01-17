import React from 'react';
import {Route, Routes } from 'react-router-dom';
import Home from './Home';
import Assess from './Assess';
import Result from './Result';
import Translate from './Translate';
import './App.css';
const App = () => {
  return (
      <Routes>
          <Route path="/home" element={<Home/>} />
          <Route path="/assess" element={<Assess/>} />
          <Route path="/result" element={<Result/>} />
          <Route path="/translate" element={<Translate/>} />
          <Route path="/"  element={<Home/>} />
      </Routes>
  );
};

export default App;
