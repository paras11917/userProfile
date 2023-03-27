import React, { useEffect, useState } from 'react'
import { app, database, storage } from './firebaseConfig'
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { collection, addDoc, getDocs } from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { useNavigate,Link } from 'react-router-dom'
import { Player } from 'video-react';
import "../node_modules/video-react/dist/video-react.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUpload } from '@fortawesome/free-solid-svg-icons'
import { faSpinner, faImage, faVideo } from '@fortawesome/free-solid-svg-icons'
const Register = () => {
   const auth = getAuth()
   const navigate = useNavigate()
   
   useEffect(() => {
      auth.onAuthStateChanged((user) => {
         if (user) {
            navigate(`/user/${user.uid}`)
         }
      })
   }, [])
   let googleProvider = new GoogleAuthProvider()
   const [data, setData] = useState({
      name: "",
      username: "",
      email: "",
      password: "",
      dis: "",
      image: null,
      cover: null,
      video: null,
      imageURL: null,
      coverURL: null,
      videoURL: null
   })
   const [loadingImg, setLoadingImg] = useState(false)
   const [loadingCov, setLoadingCov] = useState(false)
   const [loadingVid, setLoadingVid] = useState(false)

   const collectionRef = collection(database, 'users')
   const [imagePreview, setImagePreview] = useState(null)
   const [coverPreview, setCoverPreview] = useState(null)
   const [videoPreview, setVideoPreview] = useState(null)


   const handleChange = (event) => {
      event.preventDefault()
      if (event.target.name === 'image') {
         setData({ ...data, [event.target.name]: event.target.files[0] })
         
         setImagePreview(URL.createObjectURL(event.target.files[0]))
         
      }
      else if (event.target.name === 'cover') {
         setData({ ...data, [event.target.name]: event.target.files[0] })
         
         setCoverPreview(URL.createObjectURL(event.target.files[0]))
      }
      else if (event.target.name === 'video') {
         setData({ ...data, [event.target.name]: event.target.files[0] })
        
         setVideoPreview(URL.createObjectURL(event.target.files[0]))
      }
      else setData({ ...data, [event.target.name]: event.target.value })
   }

   const uploadImage = () => {
      if (data.image !== null) {
         const storageRef = ref(storage, `images/profile/${data.username}`)
         const uploadTask = uploadBytesResumable(storageRef, data.image)
         uploadTask.on("state_changed", (snapshot) => {
            setLoadingImg(true)
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            console.log("Profile photo upload is " + progress + "% done")
         }, (error) => {
            console.log(error.message)
         }, () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
               console.log("File available at", downloadURL)
               setData({ ...data, imageURL: downloadURL })
            })
            setLoadingImg(false)
            setImagePreview(null)
         })
      }
   }

   const uploadCover = () => {
      if (data.cover !== null) {
         const storageRef = ref(storage, `images/cover/${data.username}`)
         const uploadTask = uploadBytesResumable(storageRef, data.cover)
         uploadTask.on("state_changed", (snapshot) => {
            setLoadingCov(true)
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            console.log("Cover photo upload is " + progress + "% done")
         }, (error) => {
            console.log(error.message)
         }, () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
               console.log("File available at", downloadURL)
               setData({ ...data, coverURL: downloadURL })
            })
            setLoadingCov(false)
            setCoverPreview(null)
         })
      }
   }

   const uploadVideo = () => {
      if (data.video !== null) {
         const storageRef = ref(storage, `video/${data.username}`)
         const uploadTask = uploadBytesResumable(storageRef, data.video)
         uploadTask.on("state_changed", (snapshot) => {
            setLoadingVid(true)
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            console.log("Video upload is " + progress + "% done")
         }, (error) => {
            console.log(error.message)
         }, () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
               console.log("File available at", downloadURL)
               setData({ ...data, videoURL: downloadURL })
            })
            setLoadingVid(false)
            setVideoPreview(null)
         })
      }
   }

   const handleSubmit = (event) => {
      event.preventDefault()

      if (data.imageURL && data.coverURL && data.videoURL) {
         createUserWithEmailAndPassword(auth, data.email, data.password).then((response) => {
            console.log(response.user)
            addDoc(collectionRef, {
               name: data.name,
               username: data.username,
               email: data.email,
               dis: data.dis,
               imageURL: data.imageURL,
               coverURL: data.coverURL,
               videoURL: data.videoURL,
               uid: response.user.uid

            })
            navigate(`/user/${response.user.uid}`)
         }).catch((err) => {
            console.log(err.message)
         })
      }
   }

   const goolgeLogin = () => {
      signInWithPopup(auth, googleProvider).then((gresponse) => {
         console.log(gresponse.user)
         getDocs(collectionRef).then((response) => {
            const data = response.docs.filter((item) => {
               return item.data().uid === gresponse.user.uid
            })
            if (data.length === 0) {
               addDoc(collectionRef, {
                  name: gresponse.user.displayName,
                  username: gresponse.user.email.substring(0, gresponse.user.email.length - 10),
                  email: gresponse.user.email,
                  dis: "User can change the description",
                  imageURL: gresponse.user.photoURL,
                  coverURL: gresponse.user.photoURL,
                  uid: gresponse.user.uid

               })
            }
         }).catch((err) => {
            console.log(err)
         })

         navigate(`/user/${gresponse.user.uid}`)
      }).catch((err) => {
         alert(err.message)
      })
   }

   return (
      <div className="flex flex-col items-center justify-center">
         <div className="border rounded p-8 flex flex-col justify-center bg-gray-100 shadow-lg mt-8">
         <h1 className="text-3xl font-bold mb-8 text-center">Create Account</h1>
            <button className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-72 self-center' onClick={goolgeLogin} >Login with Google</button>
            <p className='text-lg my-4 text-center'>OR</p>

            <form className='flex flex-col items-center' onSubmit={handleSubmit}>
               <div className='flex lg:flex-row md:flex-col sm:flex-col'>
                  <div className='flex flex-col mr-2 mt-4'>
                     <input className='border-b focus:outline-none border-gray-400 bg-gray-100 mb-4 p-2 w-80' type='text' placeholder='Name' onChange={handleChange} name='name' value={data.name} />
                     <input className='border-b focus:outline-none bg-gray-100 border-gray-400 mb-4 p-2 w-80' type='text' placeholder='Username' onChange={handleChange} name='username' value={data.username} />
                     <input className='border-b focus:outline-none bg-gray-100 border-gray-400 mb-4 p-2 w-80' type='text' placeholder='Email' onChange={handleChange} name='email' value={data.email} />
                     <input className='border-b focus:outline-none bg-gray-100 border-gray-400 mb-4 p-2 w-80' type='password' placeholder='Password' onChange={handleChange} name='password' value={data.password} />
                     <textarea className='border rounded focus:outline-none bg-gray-100 border-gray-400 h-24 p-2 w-80' type='textarea' placeholder='Description' onChange={handleChange} name='dis' value={data.dis} />
                  </div>
                  <div className='flex flex-col sm:mt-4'>
                     <div className='flex flex-row'>
                        <div
                           className="border-2 border-dashed hover:cursor-pointer border-white p-4 w-40 h-40 flex items-center text-center justify-center"
                           onClick={() => {if(!imagePreview) document.getElementById('imageInput').click()} }
                        >
                           {imagePreview ? (
                              <div className='flex flex-col items-center justify-center relative'>
                                 <img className='opacity-30' style={{ width: "128px", height: "128px" }} src={imagePreview} alt="Preview" />
                                 <button className='w-32 h-32 absolute opacity-40 bg-gray-300 hover:bg-gray-800 hover:text-white text-black font-bold py-2 px-4 rounded text-3xl' onClick={uploadImage} >
                                    {loadingImg ? <FontAwesomeIcon icon={faSpinner} /> : <FontAwesomeIcon icon={faUpload} />}
                                 </button>
                              </div>
                           ) : (
                                 <div className=''>
                                 <FontAwesomeIcon className='text-3xl' icon={faImage} />
                                 <p className='text-sm'>Upload Profile Photo</p>
                                 </div>
                           )}
                           <input
                              id="imageInput"
                              type="file"
                              accept="image/*"
                              onChange={handleChange}
                              style={{ display: 'none' }}
                              name='image'
                           />
                        </div>



                        <div
                           className="border-2 border-dashed hover:cursor-pointer border-white p-4 w-40 h-40 flex items-center text-center justify-center"
                           onClick={() => { if (!coverPreview) document.getElementById('coverInput').click() }}
                        >
                           {coverPreview ? (
                              <div className='flex flex-col items-center justify-center relative'>
                                 <img className='opacity-30' style={{ width: "128px", height: "128px" }} src={coverPreview} alt="Preview" />
                                 <button className='w-32 h-32 absolute opacity-40 bg-gray-300 hover:bg-gray-800 hover:text-white text-black font-bold py-2 px-4 rounded text-3xl' onClick={uploadCover} >
                                    {loadingCov ? <FontAwesomeIcon icon={faSpinner} /> : <FontAwesomeIcon icon={faUpload} />}
                                 </button>
                              </div>
                           ) : (
                                 <div className=''>
                                 <FontAwesomeIcon className='text-3xl' icon={faImage} />
                                 <p className='text-sm'>Upload Cover Photo</p>
                                 </div>
                           )}
                           <input
                              id="coverInput"
                              type="file"
                              accept="image/*"
                              onChange={handleChange}
                              style={{ display: 'none' }}
                              name='cover'
                           />
                        </div>

                     </div>
                     <div
                        className="border-2 border-dashed border-white hover:cursor-pointer p-4 w-80 h-40 mt-1 flex items-center text-center justify-center"
                        onClick={() => { if (!videoPreview) document.getElementById('videoInput').click() }}
                     >
                        {videoPreview ? (
                           <div className=' flex flex-col items-center justify-center relative'>
                              <Player
                                 height={128}
                                 width={288}
                                 fluid={false}
                                 src={videoPreview}
                              />
                              <button className='w-72 h-32 absolute opacity-40 bg-gray-300 hover:bg-gray-800 hover:text-white text-black font-bold py-2 px-4 rounded text-3xl' onClick={uploadVideo} >
                                 {loadingVid ? <FontAwesomeIcon icon={faSpinner} /> : <FontAwesomeIcon icon={faUpload} />}
                              </button>
                           </div>
                        ) : (
                              <div className=''>
                                 <FontAwesomeIcon className='text-3xl' icon={faVideo} />
                                 <p className='text-sm'>Upload Video</p>
                              </div>
                        )}
                        <input
                           id="videoInput"
                           type="file"
                           accept="video/*"
                           onChange={handleChange}
                           style={{ display: 'none' }}
                           name='video'
                        />
                     </div>
                  </div>


               </div>
               {/* <input className='rounded border border-gray-400 mb-2 p-2 w-80' type='file' accept='image/*' onChange={handleChange} name='cover' />
           <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' onClick={uploadCover} >Upload Cover Photo</button> */}
               {/* 
           <input className='rounded border border-gray-400 mb-2 p-2 w-80' type='file' accept='video/*' onChange={handleChange} name='video' />
           <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' onClick={uploadVideo} >Upload Video</button> */}

               <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4" type='submit' >SignUp</button>
            </form >
            <Link className='mt-2 text-blue-600 text-right' to='/login'>Already Have Account?</Link>
         </div >
      </div >
   )
}

export default Register