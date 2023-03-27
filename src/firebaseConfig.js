import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'
import {getStorage} from 'firebase/storage'

//paras
const firebaseConfig = {
   apiKey: "AIzaSyC76Om2gSTAL4vInLxKAbss7_QrnNcZ1uU",
   authDomain: "userprofile-e8f12.firebaseapp.com",
   projectId: "userprofile-e8f12",
   storageBucket: "userprofile-e8f12.appspot.com",
   messagingSenderId: "910683641114",
   appId: "1:910683641114:web:e2788e290e26a6441208a3"
};

//naincy
// const firebaseConfig = {
//    apiKey: "AIzaSyB4EoIDQyA8CbsB2096Q7NsXuiszOGP6ng",
//    authDomain: "userprofile-1349a.firebaseapp.com",
//    projectId: "userprofile-1349a",
//    storageBucket: "userprofile-1349a.appspot.com",
//    messagingSenderId: "546446170113",
//    appId: "1:546446170113:web:bcb8ba99ccc950631cc800"
// };



export const app = initializeApp(firebaseConfig);
export const database = getFirestore(app)
export const storage = getStorage(app)