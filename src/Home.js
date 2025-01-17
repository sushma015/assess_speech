import React from 'react';
import './App.css';
import mic from './mic.png';
import { useNavigate } from 'react-router-dom';
function Home(){
    const navigate=useNavigate()
  return (
    <>
    <div id="home">
    <div id="left-home">
      <p id="title">Pronunciation Assessment </p>
      <p id="desc">welcome to Pronunciation Assessment!<br/>
      get started to assess and improve your Pronunciation ability.</p>
      <button id="get-start" onClick={()=>navigate("/assess")} >Get Started</button>
    </div>
    <div id="right-home">
        <img src={mic} alt="mic" id="mic"></img>
    </div>
    </div>
   </>
  );
};

export default Home;
