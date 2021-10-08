import React, { useRef, useState } from 'react';
import './App.css';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyAijvwOLmY9kem1Z-ilIjsPyjEFwGKqOYY",
  authDomain: "react-chat-2ceee.firebaseapp.com",
  projectId: "react-chat-2ceee",
  storageBucket: "react-chat-2ceee.appspot.com",
  messagingSenderId: "511562161949",
  appId: "1:511562161949:web:b671fe5477ba560a578bf4",
  measurementId: "G-35JKQRHQT4"
})

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();


function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1><img src='images/firebase.png' alt='firebase' /> chat</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <img src='images/chat-logo.svg' alt='front page logo' className='front-page-logo' />
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
      <div className='front-page-text'>
        All user information is 100% anonymous.
        <br></br>
        Do not violate the community guidelines or you will be banned for life!
      </div>
    </>
  )

}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}


function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL, } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>
      <form className='form' onSubmit={sendMessage}>

      <input className='chat-input' value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />
      
      <a className='submit-button' type="submit" disabled={!formValue}><span className='add-symbol' aria-label='emoji'>+</span></a>

    </form>
    </main>

    
  </>)
}


function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img alt='profile' src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
    </div>
  </>)
}


export default App;
