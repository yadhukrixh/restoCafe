import React, { useState } from 'react';
import './style.css'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isNewPasswordSumitted, setIsNewPasswordSubmited] = useState(false);
  const [isPasswordUpdated, setIsPasswordUpdated] = useState(false);
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);
  const [isSecretCodeSubmitted, setIsSecretCodeSubmitted] = useState(false);
  const [isSecretCodeValid, setIsSecretCodeValid] = useState(false);
  const navigate = useNavigate()


  const handleVoiceInput = (prompt, callback) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech Recognition API not supported in this browser.');
      return;
    }
  
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
  
    recognition.onresult = (event) => {
      let transcript = event.results[0][0].transcript.trim(); // Remove leading and trailing spaces
      transcript = transcript.toLowerCase();
      
      // Replace 'at' with '@' only if it's a standalone word
      transcript = transcript.replace(/\bat\b/g, '@');
  
      // Remove all spaces
      transcript = transcript.replace(/\s+/g, '');
  
      callback(transcript);
    };
  
    recognition.onerror = (error) => {
      console.error('Speech Recognition Error:', error);
    };
  
    recognition.start();
  };
  
  

  const speak = (text) => {
    const synth = new SpeechSynthesisUtterance();
    synth.text = text;
    window.speechSynthesis.speak(synth);
  };


  const handleEmailSubmit = async () => {
    if (!email) {
      speak('Please provide your email address.');
      return;
    }
    setIsEmailSubmitted(true);
    speak('Email address submitted.');
    try {
      
      const emailSubmission = await axios.post('http://localhost:3000/emailValidation', { email });
      if (emailSubmission.data && emailSubmission.data.isEmailValid) {
        speak('Email is valid.');
        setIsEmailSubmitted(true); // Assuming this is a state update function
      } else {
        speak('Email validation failed.');
        setIsEmailSubmitted(false); // Assuming this is a state update function
      }
    } catch (error) {
      console.error('Error validating email:', error);
    }
  };


  const handleSecretCodeSubmit = async () => {
    if(!secretCode){
      speak("Please enter OTP.")
      return;
    }
    setIsSecretCodeSubmitted(true);
    speak("OTP submitted.")
    try{
      const codeValidation = await axios.post('http://localhost:3000/codeValidation', {email, secretCode });
      if (codeValidation.data && codeValidation.data.isSecretCodeValid){
          speak("OTP validated successfully.");
          setIsSecretCodeValid(true);
      }else{
          speak("OTP mismatched.");
          setIsSecretCodeValid(false);
          setIsSecretCodeSubmitted(false);
      }
    }
    catch (error){
      console.error('Error validating OTP:', error);
    }
  };

  const handleReset = async() => {
    if(!newPassword && !confirmPassword){
      speak("Enter your Password correctly");
      return;
    }
    setIsNewPasswordSubmited(true);
    if(newPassword===confirmPassword){
      try{
        const passwordReset = await axios.post('http://localhost:3000/passwordReset', {email, newPassword });
        if(passwordReset.data.isPasswordUpdated){
          speak("Password Updated successfully");
          setTimeout(() => {
            navigate("/");
          }, 3000);
        }
        
      }catch (error){
        console.error('Error reseting password:', error);
      }
    }
    else{
      speak("Password mismatched. Please try again.")
    }
  };

  return (
    <div>
      {!isEmailSubmitted && (
        <div className='container form'>
          <h2>Reset Password</h2>
          <label>Email Address: </label>
          <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button style={{backgroundColor:'red'}} onClick={() => handleVoiceInput('Speak your email address:', (text) => setEmail(text))}>Speak Email</button>
          <button style={{backgroundColor:'green'}} onClick={handleEmailSubmit}>Send Secret Code</button>
        </div>
      )}
      {isEmailSubmitted && !isSecretCodeSubmitted &&(
        <div className='container form'>
          <h2>Secret Code Verification</h2>
          <label>Secret Code: </label>
          <input type="number" value={secretCode} onChange={(e) => setSecretCode(e.target.value)} />
          <button style={{backgroundColor:'red'}} onClick={() => handleVoiceInput('Speak the secret code:', (text) => setSecretCode(text))}>Speak Secret Code</button>
          <button style={{backgroundColor:'green'}} onClick={() => { setIsSecretCodeSubmitted(true); handleSecretCodeSubmit(); }}>Confirm</button>
        </div>
      )}
      {isSecretCodeValid && (
        <div className='container form'>
          <h2>Set New Password</h2>
          <label>New Password: </label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <button style={{backgroundColor:'red'}} onClick={() => handleVoiceInput('Speak your new password:', (text) => setNewPassword(text))}>Speak New Password</button>
          <label>Confirm Password: </label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          <button style={{background:'red'}} onClick={() => handleVoiceInput('Speak the confirmation password:', (text) => setConfirmPassword(text))}>Speak Confirm Password</button>
          <button style={{backgroundColor:'green'}} onClick={handleReset}>Reset</button>
        </div>
      )}
    </div>
  );
}

export default ResetPassword;
