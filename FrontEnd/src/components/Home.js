import React, { useState } from 'react';
import WebcamCapture from './WebcamCapture';
import styles from './Home.module.css';
import { storage, ref, getDownloadURL,uploadBytes } from '../firebase';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import axios from 'axios';
import {  useNavigate } from 'react-router-dom';
import Offensive from './Offensive';
import Login from './Login';

const Home = (props) => {
  const [file, setFile] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [recordedBlob, setRecordedBlob] = useState(null);
  const auth = getAuth();
  const navigate=useNavigate();

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  const handleTextInputChange = (event) => {
    setTextInput(event.target.value);
  };

  const handleRecordedBlob = (blob) => {
    console.log(blob)
    setRecordedBlob(blob);
  };
  
  const getCurrentUserId = () => {
    return new Promise((resolve, reject) => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          resolve(user.uid);
        } else {
          reject(new Error('No user is currently authenticated.'));
        }
      });
    });
  };
  
  const detectInput = async (input,type) => {
    setLoading(true);
    var res={};
    if(type==="txt"){
    res = await axios.post('http://127.0.0.1:5000/predictOnText',{
      text:[input]
    })
    }
    else{
      const formData = new FormData();
      if(type==="rec")
        formData.append("file", recordedBlob);
      else
        formData.append("file", file);
      console.log(formData)
      res=await axios.post('http://127.0.0.1:5000/predictOnMedia', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
      })
    }
    console.log(res);
    if(res.data.output=="Neither"){
      return true;
    }
    return false;
  }

  const[loading,setLoading]=useState(false);
  const handleUpload = async () => {
    if (file || textInput || recordedBlob) {
      let downloadURL;
      const userId = await getCurrentUserId();

      if (file) {
        const safe=await detectInput(file,"not text")
        if(!safe){
          navigate("/notAllowed");
          return;
        }
        const fileStorageRef = ref(storage, `uploads/${userId}/${file.name}`);
        await uploadBytes(fileStorageRef, file);
        downloadURL = await getDownloadURL(fileStorageRef);
        alert("Upload Success")
        navigate("/previousupload");
      }
  
      else if (textInput!=='') {
        const textStorageRef = ref(storage, `uploads/${userId}/text_${Date.now()}.txt`);
        const safe=await detectInput(textInput,"txt")
        if(!safe){
          navigate("/notAllowed"); 
          return; 
        }
        await uploadBytes(textStorageRef, new Blob([textInput], { type: 'text/plain' }));
        downloadURL = await getDownloadURL(textStorageRef);
        alert("Upload Success")
        navigate("/previousupload");
      }
  
      else if (recordedBlob) {
        const safe=await detectInput(recordedBlob,"rec")
        if(!safe){
          navigate("/notAllowed"); 
          return; 
        }
        const blobStorageRef = ref(storage, `uploads/${userId}/recorded_${Date.now()}.webm`);
        await uploadBytes(blobStorageRef, recordedBlob);
        downloadURL = await getDownloadURL(blobStorageRef);
      }
      setLoading(false);
      console.log('File uploaded. Download URL:', downloadURL);
      setFile(null);
      setTextInput('');
      setRecordedBlob(null);
    } else {
      console.log('No option selected for upload.');
    }
  };
  return (
    <>
    {props.presentUser?(<>
    {(loading===false) ?(
    <div className="main">  
      <div className={styles.container}>
        <div className={styles.innerBox}>
          <h3 align="center">Upload a new post</h3>
          <div className={styles.options}>
            <div>
              <label htmlFor="fileInput" className={styles.optionLabel}>
                Upload Some Media
              </label>
              <input
                type="file"
                id="fileInput"
                accept="audio/*, video/*, .txt"
                onChange={handleFileChange}
              />
            </div>
            <div>
              <label htmlFor="textInput" className={styles.optionLabel}>
                Write a text post
              </label>
              <textarea
              style={{width:"700px"}}
                id="textInput"
                rows="4"
                placeholder="Write Something..."
                value={textInput}
                onChange={handleTextInputChange}
              ></textarea>
              <br></br>
              <button style={{backgroundColor:"skyblue"}}onClick={()=>setTextInput('')}>Clear</button>
            </div>
            {/* <div>          
              <h4>
                Live Capture
                </h4>
              <WebcamCapture onBlob={handleRecordedBlob} />
            </div> */}
          </div>
          <div className={styles.uploadButton} style={{textAlign:"center",padding:"20px"}}>
            <br></br>
            <button style={{width:"700px"}} onClick={handleUpload}>Upload</button>
          </div>
        </div>
      </div>
    </div>
  ):(
    <div  style={{textAlign:'center',padding:"200px", color:"green"}}>
    <h3>Loading...<br></br>Please Wait while we check and upload on your post</h3>
    </div>
  )}
  </>
  ):(
    <Login setCurrentUser={props.login}></Login>
  )
}
</>
  );
};

export default Home;
