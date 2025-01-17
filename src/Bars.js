import React from 'react';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css'; // Ensure you have this import for default styles

function Bars({ accuracy, confidence, score }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
      <div style={{ width: '180px', margin: '10px', position: 'relative' }}>
        <CircularProgressbarWithChildren
          value={confidence}
          styles={buildStyles({
            pathColor: 'turquoise',
            trailColor: 'gray',
          })}
        >
          <div style={{ fontSize: 20, marginTop: -5 ,color: 'orange',textShadow:'1px 1px 1px black' }}>
            <strong>{`${confidence}%`}</strong>
          </div>
        </CircularProgressbarWithChildren>
        <center><div style={{marginTop:'20px',color:'orange',fontSize:28,textShadow:'1px 1px 1px gray',fontWeight:500}}>Confidence</div></center>
      </div>
      <div style={{ width: '180px', margin: '10px', position: 'relative' }}>
        <CircularProgressbarWithChildren
          value={accuracy}
          styles={buildStyles({
            pathColor: 'turquoise',
            trailColor: 'gray',
          })}
        >
          <div style={{ fontSize: 20, marginTop: -5 ,color: 'orange',textShadow:'1px 1px 1px black' }}>
            <strong>{`${accuracy}%`}</strong>
          </div>
        </CircularProgressbarWithChildren>
        <center><div style={{marginTop:'20px',color:'orange',fontSize:28,textShadow:'1px 1px 1px gray',fontWeight:500}}>Accuracy</div></center>
      </div>
      <div style={{ width: '180px', margin: '10px', position: 'relative' }}>
        <CircularProgressbarWithChildren
          value={score}
          styles={buildStyles({
            pathColor: 'turquoise',
            trailColor: 'gray',
          })}
        >
          <div style={{ fontSize: 20, marginTop: -5 ,color: 'orange',textShadow:'1px 1px 1px black'}}>
            <strong>{`${score}%`}</strong>
          </div>
        </CircularProgressbarWithChildren>
        <center><div style={{marginTop:'20px',color:'orange',fontSize:28,textShadow:'1px 1px 1px gray',fontWeight:500}}>Total Score</div></center>
      </div>
    </div>
  );
}

export default Bars;
