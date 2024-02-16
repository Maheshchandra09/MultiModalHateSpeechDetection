import { initializeApp } from 'firebase/app';
import { uploadBytes , getDownloadURL , ref, getStorage, listAll} from 'firebase/storage';
import { getFirestore} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD9-q5UGq1Zqc3vXz20xGC3uQEcRFe7yL8",
  authDomain: "hatespeechdetection-22a24.firebaseapp.com",
  databaseURL: "https://hatespeechdetection-22a24-default-rtdb.firebaseio.com",
  projectId: "hatespeechdetection-22a24",
  storageBucket: "hatespeechdetection-22a24.appspot.com",
  messagingSenderId: "752755850531",
  appId: "1:752755850531:web:0493a900ea395d11372096",
  measurementId: "G-8BEGM7LBEV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

// Include the ref export

const getUserId = async () => {
  const auth = getAuth();
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(user.uid);
      } else {
        reject(new Error('User not signed in.'));
      }
    });
  });
};

export {ref,uploadBytes , getDownloadURL, getUserId};


export const getPreviousUploads = async (userId) => {
  try {
    const storageRef = ref(storage, `uploads/${userId}/`);
    const filesList = await listAll(storageRef);

    const uploads = await Promise.all(
      filesList.items.map(async (fileRef) => {
        const downloadURL = await getDownloadURL(fileRef);
        return {
          name: fileRef.name,
          downloadURL,
        };
      })
    );

    console.log('Previous uploads retrieved:', uploads);
    return uploads;
  } catch (error) {
    console.error('Error retrieving previous uploads:', error);
    return [];
  }
};