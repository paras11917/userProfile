import React, { useState,useEffect } from 'react'
import { app, database } from './firebaseConfig'
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { collection, addDoc,getDocs } from 'firebase/firestore'
import { Link, useNavigate } from 'react-router-dom'

const Login = () => {
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
      email: "",
      password: ""
   })
   const collectionRef = collection(database, 'users')

   const handleChange = (event) => {
      event.preventDefault()
      setData({ ...data, [event.target.name]: event.target.value })
   }

   const handleSubmit = (event) => {
      event.preventDefault()
      signInWithEmailAndPassword(auth, data.email, data.password).then((response) => {
         console.log(response.user)
         navigate(`/user/${response.user.uid}`)
      }).catch((err) => {
         console.log(err.message)
      })
   }

   const goolgeLogin = () => {
      signInWithPopup(auth, googleProvider).then((gresponse) => {
         console.log(gresponse.user)
         getDocs(collectionRef).then((response) => {
            console.log(response.docs[0].id)
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
      <div className="flex flex-col items-center h-screen justify-center">
         <div className="border rounded p-8 bg-gray-100 shadow-lg">
         <h1 className="text-3xl font-bold mb-8">Log in to Your Account</h1>
            <button
               className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
               onClick={goolgeLogin}
            >
               Login with Google
            </button>
            <p className="my-4 text-center">OR</p>
            <form className="flex flex-col" onSubmit={handleSubmit}>
               <input className='border-b focus:outline-none bg-gray-100 border-gray-400 mb-4 p-2 w-80' type='text' placeholder='Email' onChange={handleChange} name='email' value={data.email} />
               <input className='border-b focus:outline-none bg-gray-100 border-gray-400 mb-4 p-2 w-80' type='password' placeholder='Password' onChange={handleChange} name='password' value={data.password} />

               <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  type="submit"
               >
                  Sign In
               </button>
               <Link className='mt-2 text-blue-600' to='/register'>Create Account</Link>
            </form>
         </div>
      </div>
   )
}

export default Login