import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import './VoiceAssistant.css';
import React,{ useEffect,useState  } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';

const VoiceAssistant = ({onAddEvent,onDeleteEvent,onAddFolder,onDeleteFolder,onAddNote,onDeleteNote}) => {
  const { transcript, listening, browserSupportsSpeechRecognition ,resetTranscript} = useSpeechRecognition();
  const navigate = useNavigate();
 const [feedback, setFeedback] = useState({ message: '', type: '' });

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
   if (!transcript ||isProcessing) return;

   sendToAI();

}, [isProcessing]);

 useEffect(() => {
  setTimeout(() => {

    if (feedback.message) {
      setFeedback({ message: '', type: '' });
    }
  }, 5000);

}, [feedback]);

const sendToAI = async () => {
    try {
      const res = await axios.post('http://localhost:4000/api/parse-command', { transcript });
        const command = res.data;

      switch (command.intent) {
        case 'go_to_home':
        navigate('/');
        setFeedback({ message: 'Navigated to home.', type: 'success' });
        break;
      case 'go_to_notes':
        navigate('/notes');
        setFeedback({ message: 'Navigated to notes.', type: 'success' });
        break;
      case 'add_event':
        handleAddEvent(command);
        break;
      case 'delete_event':
        handleDeleteEvent(command);
        break;
      case 'add_note':
        handleAddNote(command);
        break;
      case 'delete_note':
        handleDeleteNote(command);
        break;
      case 'add_folder':
        handleAddFolder(command);
        break;
      case 'delete_folder':
        handleDeleteFolder(command);
        break;
      default:
        setFeedback({ message: 'Unknown command.', type: 'error' });
        console.log('Unknown command');
      }

    } catch (err) {
      console.error("AI processing failed:", err);
    } finally {
      resetTranscript();
      setIsProcessing(false);
    }
  };
  const handleAddEvent = (command) => {
   onAddEvent(command);
   setFeedback({ message: 'Event added!', type: 'success' });
  };

  const handleDeleteEvent = (command) => {
   onDeleteEvent(command);    
   setFeedback({ message: 'Event deleted!', type: 'success' });

  };

  const handleAddNote = (command) => {
    onAddNote(command.description);
    setFeedback({ message: 'Note added!', type: 'success' });

  };

  const handleDeleteNote = (command) => {
    onDeleteNote(command.description);
    setFeedback({ message: 'Note deleted!', type: 'success' });
  };
   const handleAddFolder = (command) => {
    onAddFolder(command.name);
    setFeedback({ message: 'Folder added!', type: 'success' });
  };

  const handleDeleteFolder = (command) => {
    onDeleteFolder(command.name); 
    setFeedback({ message: 'Folder deleted!', type: 'success' });
   };

  if (!browserSupportsSpeechRecognition) {
    return <p>Browser does not support voice recognition.</p>;
  }

  
  const handleVoiceCommand = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      setIsProcessing(false);
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
      setIsProcessing(true);
    }
  };

return (
 <div className="voice-container">
      {transcript && (
        <div className={`transcript-bubble ${ isProcessing? 'isProcessing' : 'listening'}`}>
          {transcript}
        </div>
      )}
     {feedback.message && (
      <div className='feedback-message'
        style={{
          marginRight: 10,
          color: feedback.type === 'success' ? '#4caf50' : '#f44336',
          fontWeight: 'bold',
          backgroundColor: '#090909af',
          borderRadius: 6,
          padding: '4px 10px',
          fontSize: 13,
        }}
      >
        {feedback.message} 
      </div>
      )}
      <button
        className={`voise-assistant-button ${listening ? 'listening' : ''}`}
        onClick={handleVoiceCommand}
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
      >
        <svg width="40" height="40" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="40" height="40" fill="#00000" />
          <circle cx="25" cy="25" r="25" fill="black" />
          <polygon id="center-star" points="25,15 27,23 35,25 27,27 25,35 23,27 15,25 23,23"
            fill="#f8f8f4" stroke="#FFF" strokeWidth="0.7" />
          <polygon id="additional-stars" points="37,8 38,12 42,13 38,14 37,18 36,14 32,13 36,12"
            fill="#dadada" stroke="#FFF" strokeWidth="0.5" />
          <polygon id="additional-stars" points="13,32 14,36 18,37 14,38 13,42 12,38 8,37 12,36"
            fill="#dadada" stroke="#FFF" strokeWidth="0.5" />
        </svg>
      </button>
    </div>
);
};

export default React.memo(VoiceAssistant);
