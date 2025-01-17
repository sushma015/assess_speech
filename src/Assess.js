import React, { useState, useEffect, useRef } from 'react';
import AWS from 'aws-sdk';
import './App.css';
import { useNavigate } from 'react-router-dom';
import trans from './pngegg.png';
AWS.config.update({
  accessKeyId: 'AKIA6HM2F4C6PWG6E76R',
  secretAccessKey: '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',
  region: 'us-east-1'
});

const s3 = new AWS.S3();
function Assess() {
  const navigate=useNavigate();
  const [audioURL, setAudioURL] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [voices, setVoices] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showGetResult, setShowGetResult] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    const synth = window.speechSynthesis;
    const loadVoices = () => {
      setVoices(synth.getVoices());
    };
    synth.onvoiceschanged = loadVoices;
    loadVoices();
  }, []);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };
  const handleRefresh=()=>{
    setInputValue('')
    setShowGetResult(false)
    setAudioURL('')
  }
  const handleSpeakerClick = () => {
    if (!inputValue.trim()) {
      alert("Input cannot be empty");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(inputValue);
    const femaleVoice = voices.find(voice => voice.name.includes('Female') || voice.gender === 'female');
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    window.speechSynthesis.speak(utterance);
  };

  const handleGetClick = () => {
    let s = [
      "Six sick slick slim sycamore saplings", "A box of biscuits a batch of mixed biscuits", 
      "Peter Piper picked a peck of pickled peppers", "Betty Botter had some butter", 
      "Unique New York", "Don't worry I was just giving you a hard time", 
      "Did you mean it? Or were you just saying it?", 
      "Raise your hand and lower your voice when you talk to me", 
      "I became nauseous from the toxic smoke", "Their wedding was the epitome of elegance", 
      "His new car is the epitome of luxury", "She was mischievous and I think rarely tired",
      "How much wood would a woodchuck chuck if a woodchuck could chuck wood?", 
      "She sells seashells by the seashore.", 
      "The great Greek grape growers grow great Greek grapes.", 
      "Black background, brown background.", 
      "Red leather, yellow leather.", 
      "I saw Susie sitting in a shoe shine shop.", 
      "Can you can a can as a canner can can a can?", 
      "Four fine fresh fish for you.", 
      "The thirty-three thieves thought that they thrilled the throne throughout Thursday.", 
      "I scream, you scream, we all scream for ice cream.", 
      "Freshly fried flying fish.", 
      "Lesser leather never weathered wetter weather better.",
      "The paradoxical nature of quantum mechanics fascinates and perplexes physicists.",
      "In an extraordinarily unprecedented move, the government unveiled an ambitious policy to combat climate change.",
      "Intricacies of the neurological pathways can be bewildering to those not versed in medical science.",
      "An antidisestablishmentarianism stance was unexpectedly supported by the populace.",
      "Her serendipitous discovery of the ancient manuscript transformed the entire field of historical linguistics.",
      "The proliferation of digital transformations has revolutionized the technological landscape.",
      "Bureaucratic procedures can often obfuscate straightforward solutions.",
      "The quintessential experience of visiting the Louvre left them spellbound.",
      "Phenomenological studies provide profound insights into human consciousness and perception.",
      "Esoteric philosophical discourses demand a high degree of cognitive engagement and comprehension."
    ];
    
    let random = Math.floor(Math.random() * s.length);
    setInputValue(s[random])
  };

  const handleRecordClick = () => {
    if (!inputValue.trim()) {
      alert("Input cannot be empty");
      return;
    }
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          mediaRecorderRef.current = new MediaRecorder(stream);
          mediaRecorderRef.current.ondataavailable = event => {
            audioChunksRef.current.push(event.data);
          };
          mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            setAudioURL(audioUrl);
            audioChunksRef.current = [];

            // Clear existing files in S3 and upload the new recording
            const bucketName = 'assess-demo';
            const params = {
              Bucket: bucketName,
            };

            // List and delete existing files
            s3.listObjectsV2(params, (err, data) => {
              if (err) {
                console.log('Error listing objects:', err);
                return;
              }
              const objectsToDelete = data.Contents.map(object => ({ Key: object.Key }));
              if (objectsToDelete.length > 0) {
                s3.deleteObjects({
                  Bucket: bucketName,
                  Delete: { Objects: objectsToDelete }
                }, (err, data) => {
                  if (err) {
                    console.log('Error deleting objects:', err);
                    return;
                  }
                  console.log('Existing files deleted:', data);
                });
              }

              // Upload the new recording
              const uploadParams = {
                Bucket: bucketName,
                Key: `recorded_audio.wav`,
                Body: audioBlob,
                ContentType: 'audio/wav'
              };
              s3.upload(uploadParams, (err, data) => {
                if (err) {
                  console.log('Error uploading file:', err);
                  return;
                }
                console.log('File uploaded successfully:', data);
                setShowGetResult(true); // Show the "Get Result" button
              });
            });
          };
          mediaRecorderRef.current.start();
          setIsRecording(true);
        });
    }
  };
 
  const handleGetResultClick = () => {
    navigate("/result", { state: { message:inputValue ,url:audioURL} });
  };
  const handleTranslate = () => {
    navigate("/translate");
  };
  return (
    <div id="App">
      <button id="translator" onClick={handleTranslate}><img src={trans} alt=""  height={50} ></img></button>
       <div id='assess'>
       <textarea value={inputValue} onChange={handleInputChange} placeholder="Get a text (or) Type something..." 
       id="custom_text" rows="4" cols="50" />
          <span><button onClick={handleSpeakerClick} id='speaker'>
            🔊
          </button>
          </span>
        </div>        
        {audioURL!=='' && <audio src={audioURL} controls></audio>}
        {!showGetResult && <div id="btns">
          <button onClick={handleGetClick} id="get">
            Get
          </button>
          <button onClick={handleRecordClick} id="rec">
            {isRecording ? 'Stop' : 'Record'} 
          </button>
        </div>}
        {showGetResult && (
        <div>
           <button onClick={handleRefresh} id="refresh">
            Refresh
          </button>
          <button onClick={handleGetResultClick} id="res">
            Get Result
          </button>
        </div>
      )}
    </div>
  );
}
export default Assess;
