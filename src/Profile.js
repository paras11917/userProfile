import React, { useEffect, useState } from 'react'
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore'
import { database, storage } from './firebaseConfig'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { getAuth, signOut, onAuthStateChanged, deleteUser, reauthenticateWithCredential } from 'firebase/auth'
import { useNavigate, useParams } from 'react-router-dom'
import { Player } from 'video-react';
import "../node_modules/video-react/dist/video-react.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { faUpload, faPenToSquare, faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons'
import { faFloppyDisk, faXmark } from '@fortawesome/free-solid-svg-icons'


const Profile = () => {
  const [loadingImg, setLoadingImg] = useState(false)
  const [loadingCov, setLoadingCov] = useState(false)
  const [loadingVid, setLoadingVid] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [videoPreview, setVideoPreview] = useState(null)


  let auth = getAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const [userId, setUserId] = useState(null)
  const [userData, setUserData] = useState({})
  const [edit, setEdit] = useState(false)
  const [popup, setPopup] = useState(false)
  const [docId, setDocId] = useState('')

  const [updateData, setUpdateData] = useState({})

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid)
      } else {
        navigate('/login')
      }
    })
  }, [])

  useEffect(() => {
    getData()
  }, [])



  const handleChange = (event) => {
    event.preventDefault()
    if (event.target.name === 'image') {
      setUpdateData({ ...updateData, [event.target.name]: event.target.files[0] })
      setImagePreview(URL.createObjectURL(event.target.files[0]))

    }
    else if (event.target.name === 'cover') {
      setUpdateData({ ...updateData, [event.target.name]: event.target.files[0] })
      setCoverPreview(URL.createObjectURL(event.target.files[0]))
    }
    else if (event.target.name === 'video') {
      setUpdateData({ ...updateData, [event.target.name]: event.target.files[0] })
      setVideoPreview(URL.createObjectURL(event.target.files[0]))
    }
    else setUpdateData({ ...updateData, [event.target.name]: event.target.value })
  }

  const uploadImage = () => {
    if (updateData.image !== null) {
      const storageRef = ref(storage, `images/profile/${userData.username}`)
      const uploadTask = uploadBytesResumable(storageRef, updateData.image)
      uploadTask.on("state_changed", (snapshot) => {
        setLoadingImg(true)
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        console.log("Profile photo upload is " + progress + "% done")
      }, (error) => {
        console.log(error.message)
      }, () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log("File available at", downloadURL)
          setUpdateData({ ...updateData, imageURL: downloadURL })
        })
        setLoadingImg(false)
      })
    }
  }

  const uploadCover = () => {
    if (updateData.cover !== null) {
      const storageRef = ref(storage, `images/cover/${userData.username}`)
      const uploadTask = uploadBytesResumable(storageRef, updateData.cover)
      uploadTask.on("state_changed", (snapshot) => {
        setLoadingCov(true)
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        console.log("Cover photo upload is " + progress + "% done")
      }, (error) => {
        console.log(error.message)
      }, () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log("File available at", downloadURL)
          setUpdateData({ ...updateData, coverURL: downloadURL })
        })
        setLoadingCov(false)
      })
    }
  }

  const uploadVideo = () => {
    if (updateData.video !== null) {
      const storageRef = ref(storage, `video/${userData.username}`)
      const uploadTask = uploadBytesResumable(storageRef, updateData.video)
      uploadTask.on("state_changed", (snapshot) => {
        setLoadingVid(true)
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        console.log("Video upload is " + progress + "% done")
      }, (error) => {
        console.log(error.message)
      }, () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log("File available at", downloadURL)
          setUpdateData({ ...updateData, videoURL: downloadURL })
        })
        setLoadingVid(false)
      })
    }
  }


  const handlesignOut = () => {
    auth.signOut()
    navigate('/login')
  }

  const collectionRef = collection(database, 'users')
  const getData = () => {
    getDocs(collectionRef).then((response) => {
      const data = response.docs.filter((item) => {
        return item.data().uid === id
      })
      setDocId(data[0].id)
      setUserData(data[0].data())
      setUpdateData(data[0].data())
    }).catch((err) => {
      console.log(err)
    })
  }

  const SaveEdit = () => {
    const docToUpdate = doc(database, 'users', docId)
    updateDoc(docToUpdate, {
      name: updateData.name,
      dis: updateData.dis,
      imageURL: updateData.imageURL,
      coverURL: updateData.coverURL,
      videoURL: updateData.videoURL
    }).then(() => {
      setEdit(false)
      getData()
      setCoverPreview(null)
      setImagePreview(null)
      setVideoPreview(null)
    }).catch((err) => {
      console.log(err)
    })
  }




  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 ">
      <div className=" bg-gray-100 overflow-hidden shadow rounded-lg h-screen">
        <div
          className="relative bg-cover bg-center h-52 w-full"
        >
          {edit ? <div
            className="absolute p-4 w-full h-52 flex items-center text-center justify-center hover:cursor-pointer"
            onClick={() => { if (!coverPreview) document.getElementById('coverInput').click() }}
          >
            <input
              id="coverInput"
              type="file"
              accept="image/*"
              onChange={handleChange}
              style={{ display: 'none' }}
              name='cover'
            />

            {coverPreview ? (
              <div className='flex flex-col items-center justify-center relative h-52 w-full object-cover border-4 border-white'>
                <img className='opacity-30 w-full h-52' src={coverPreview} alt="Preview" />
                <button className='w-full h-52 absolute opacity-40 bg-gray-300 hover:bg-gray-800 hover:text-white text-black font-bold py-2 px-4  text-3xl' onClick={uploadCover} >
                  {loadingCov ? <FontAwesomeIcon icon={faSpinner} /> : <FontAwesomeIcon icon={faUpload} />}
                </button>
              </div>
            ) : (
              <img className='absolute bg-cover bg-center h-52 w-full' src={userData.coverURL} />
            )}

          </div> : <img className='absolute bg-cover bg-center h-52 w-full' src={userData.coverURL} />}
          
          <div className='absolute border-b border-2 top-96 w-full bg-black '></div>
          {edit ?
            <div className='absolute top-60 right-8 flex flex-col rounded text-xl'>
              <button onClick={SaveEdit} className='text-left p-2 py-1 hover:text-gray-500 text-3xl'><FontAwesomeIcon icon={faFloppyDisk} /></button>
              <button onClick={() => setEdit(!edit)} className='text-left p-2 py-1 hover:text-gray-500 text-3xl'><FontAwesomeIcon icon={faXmark} /></button>
            </div>
            :
            <div className='absolute top-60 right-8 flex flex-col rounded text-xl'>
              <button onClick={() => setEdit(!edit)} className='text-left p-2 py-1 text-3xl hover:text-gray-500'><FontAwesomeIcon icon={faPenToSquare} /></button>
              <button onClick={handlesignOut} className='text-left p-2 py-1 hover:text-gray-500 text-3xl'><FontAwesomeIcon icon={faArrowRightFromBracket} /></button>

            </div >}


          <div className='absolute top-36 '>
            <div className="ml-8 h-full w-full flex justify-start flex-col">
              {edit ? <div
                className=" relative bottom-4 rounded-full p-4 w-40 h-40 flex items-center text-center justify-center hover:cursor-pointer"
                onClick={() => { if (!imagePreview) document.getElementById('imageInput').click() }}
              >
                {imagePreview ? (
                  <div className='flex flex-col items-center justify-center relative h-32 w-32 rounded-full object-cover border-4 border-white'>
                    <img className='opacity-30 rounded-full' style={{ width: "128px", height: "128px" }} src={imagePreview} alt="Preview" />
                    <button className='w-32 h-32 rounded-full absolute opacity-40 bg-gray-300 hover:bg-gray-800 hover:text-white text-black font-bold py-2 px-4  text-3xl' onClick={uploadImage} >
                      {loadingImg ? <FontAwesomeIcon icon={faSpinner} /> : <FontAwesomeIcon icon={faUpload} />}
                    </button>
                  </div>
                ) : (
                  <img className=" h-32 w-32 rounded-full object-cover border-4 border-white" src={userData.imageURL} />
                )}
                <input
                  id="imageInput"
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  style={{ display: 'none' }}
                  name='image'
                />
              </div> : <img className=" h-32 w-32 rounded-full object-cover border-4 border-white" src={userData.imageURL} />}


              <div className="">
                {edit && <div className="relative bottom-4 pt-2 text-3xl font-medium leading-6 text-gray-800 mb-6">{userData.username}</div>}

                {edit ? <input className=' border-b focus:outline-none border-gray-400 bg-gray-100 mt-14 p-2 w-72 ' type='text' onChange={handleChange} placeholder="name" name='name' value={updateData.name} />
                  : <h2 className="text-3xl font-bold leading-6 text-gray-900 mt-2">{updateData.name}</h2>}
                {!edit && <h3 className="pt-2 text-2xl font-medium leading-6 text-gray-800 ">{userData.username}</h3>}
              </div>

            </div>


            <div className=" px-4 py-5 sm:p-6 mt-2 ">
              {edit ? <textarea className='rounded border border-gray-400 focus:outline-none bg-gray-100 h-24 p-2 w-80 ml-2 ' type='textarea' placeholder='description' onChange={handleChange} name='dis' value={updateData.dis} />
                : <div className="mt-14 ml-2 text-xl leading-6 text-gray-800">{updateData.dis}</div>}

              <div className=" mt-8 ml-2 shadow-lg hover:cursor-pointer">
                {edit ? <div
                  className="absolute bottom-6 left-96 border-2 border-dashed p-4 w-80 h-50 mt-1 flex items-center text-center justify-center"
                  onClick={() => { if (!videoPreview) document.getElementById('videoInput').click() }}
                >
                  {videoPreview ? (
                    <div className=' flex flex-col items-center justify-center relative'>
                      <Player
                        height={140}
                        width={288}
                        fluid={false}
                        src={videoPreview}
                      />
                      <button className='w-72 h-32 absolute opacity-40 bg-gray-300 hover:bg-gray-800 hover:text-white text-black font-bold py-2 px-4 rounded text-3xl' onClick={uploadVideo} >
                        {loadingVid ? <FontAwesomeIcon icon={faSpinner} /> : <FontAwesomeIcon icon={faUpload} />}
                      </button>
                    </div>
                  ) : (
                    <Player
                      height={140}
                      width={288}
                      fluid={false}
                      src={userData.videoURL}
                    />
                  )}
                  <input
                    id="videoInput"
                    type="file"
                    accept="video/*"
                    onChange={handleChange}
                    style={{ display: 'none' }}
                    name='video'
                  />
                </div> : <Player
                  height={180}
                  width={320}
                  fluid={false}
                  src={userData.videoURL}
                />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile