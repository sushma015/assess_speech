import React, { useState, useEffect } from 'react';
import { TranscribeClient, StartTranscriptionJobCommand, GetTranscriptionJobCommand } from '@aws-sdk/client-transcribe';
import AWS from 'aws-sdk';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client ,GetObjectCommand } from '@aws-sdk/client-s3';
import { useLocation, useNavigate} from 'react-router-dom';
import Bars from './Bars';
import { RotatingLines } from 'react-loader-spinner';
AWS.config.update({
  accessKeyId: 'AKIA6HM2F4C6PWG6E76R',
  secretAccessKey: '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',
  region: 'us-east-1'
});
const s3Client = new S3Client({
    region: 'us-east-1',
    credentials: {
      accessKeyId: 'AKIA6HM2F4C6PWG6E76R',
      secretAccessKey: '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'
    }
  });
  
const transcribeClient = new TranscribeClient({ region: 'us-east-1',credentials: {
    accessKeyId: 'AKIA6HM2F4C6PWG6E76R',
    secretAccessKey: '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'
  } });

function Result() {
    const location = useLocation();
    const [miss,setMiss]=useState('');
    const [wer, setWer] = useState(0);
    const inp = location.state.message || {};
    const url=location.state.url || {};
    const [confidence,setConf]=useState(0);
  const [transcription, setTranscription] = useState('');
  const [loading, setLoading] = useState(false);
  const [score,setScore]=useState(0);
  const nav=useNavigate();
  useEffect(() => {
    calculateFinalScore(wer, confidence);
  }, [wer, confidence]);
    useEffect(()=>{
       transcribeAudio();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[]);
    const calculateFinalScore = (accuracy, confidence) => {
      if (accuracy !== null && confidence !== null) {
        const finalScore = (parseFloat(accuracy) + parseFloat(confidence)) / 2;
        setScore(finalScore.toFixed(2));
      }
    };
  const transcribeAudio = async () => {
    setLoading(true);
    const jobName = `transcription-job-${Date.now()}`;
    const params = {
      TranscriptionJobName: jobName,
      LanguageCode: 'en-US',
      Media: {
        MediaFileUri:`s3://assess-demo/recorded_audio.wav`
      },
      OutputBucketName: 'assess-demo'
    };

    try {
      await transcribeClient.send(new StartTranscriptionJobCommand(params));
      checkTranscriptionStatus(jobName);
    } catch (error) {
      console.error('Error starting transcription job:', error);
      setLoading(false);
    }
  };

  const checkTranscriptionStatus = async (jobName) => {
    const params = {
      TranscriptionJobName: jobName
    };

    try {
      const data = await transcribeClient.send(new GetTranscriptionJobCommand(params));
      if (data.TranscriptionJob.TranscriptionJobStatus === 'COMPLETED') {
        fetchTranscriptionResult(data.TranscriptionJob.Transcript.TranscriptFileUri);
      } else if (data.TranscriptionJob.TranscriptionJobStatus === 'FAILED') {
        console.error('Transcription job failed:', data.TranscriptionJob.FailureReason);
        setLoading(false);
      } else {
        setTimeout(() => checkTranscriptionStatus(jobName), 5000);
      }
    } catch (error) {
      console.error('Error checking transcription status:', error);
      setLoading(false);
    }
  };
  const calculateWER = (reference, hypothesis) => {
    const cleanString = (str) => str.replace(/[.,]/g, '').trim().toLowerCase();
  const refWords = cleanString(reference).split(' ');
  const hypWords = cleanString(hypothesis).split(' ');

  const missingWords = refWords.filter(word => !hypWords.includes(word)).join(', ');
  const commonWords = refWords.filter(word => hypWords.includes(word)).length;
  const accuracy = (commonWords / refWords.length) * 100;
  setWer(accuracy.toFixed(2));
    setMiss(missingWords);
    return {
      missingWords
    };
  };
  const fetchTranscriptionResult = async (transcriptUri) => {
    try {
        const bucketName = 'assess-demo';
      const key = transcriptUri.split('/').pop(); // Extract the key from the URI

      const getObjectParams = {
        Bucket: bucketName,
        Key: key
      };
        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        const response = await fetch(url);
        const data = await response.json();
        const transcript = data.results.transcripts[0].transcript;
        const items = data.results.items;
        const confidenceValues = items.map(item => ({
          word: item.alternatives[0].content,
          confidence: item.alternatives[0].confidence
        }));
        setConf(0)
        setTranscription(transcript);
        const totalConfidence = confidenceValues.reduce((sum, item) => sum + parseFloat(item.confidence), 0);
        const averageConfidence = (totalConfidence / confidenceValues.length) * 100;
        if(averageConfidence!==null)
        setConf(averageConfidence.toFixed(2))
        const { missingWords } = calculateWER(inp, transcript);
       setMiss(missingWords)
    setLoading(false);
    } catch (error) {
      console.error('Error fetching transcription result:', error);
      setLoading(false);
    }
  };

  return (
    <div id='res-home'>
      {loading ? (
       <RotatingLines
       visible={true}
       height="60"
       width="60"
       color="gray"
       strokeWidth="5"
       animationDuration="0.75"
       ariaLabel="rotating-lines-loading"
       wrapperStyle={{}}
       wrapperClass=""
       />
      ) : (<>
        <div id="output">
          <div id="back" onClick={()=>nav("/assess")}><b>←</b></div>
          <h1>Pronunciation Assessment:</h1>
          <Bars accuracy={wer} confidence={confidence} score={score} ></Bars><br/>
          <audio controls src={url}></audio>
          {transcription!=='' &&<p style={{fontSize:25}}><b>You said: </b> {transcription}</p>}
          {miss!=='' && <p id="wrong" style={{fontSize:25}}><b>Wrongly Pronounced Words:</b> {miss}</p>}
        </div>
         </>
      )}
    </div>
  );
}

export default Result;

