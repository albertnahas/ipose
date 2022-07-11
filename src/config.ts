// Import the functions you need from the SDKs you need
import firebase from "firebase"
import "firebase/storage"
import "firebase/messaging"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCEJ3TcAZ8Vo84AtG_YLcM0_333YNS-msg",
  authDomain: "ipose-c233a.firebaseapp.com",
  databaseURL: "https://ipose-c233a-default-rtdb.firebaseio.com",
  projectId: "ipose-c233a",
  storageBucket: "ipose-c233a.appspot.com",
  messagingSenderId: "135468959740",
  appId: "1:135468959740:web:976b59cbbd3bb9194c5479",
  measurementId: "G-414FKW9CXJ",
}

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
} else {
  firebase.app() // if already initialized, use that one
}
// if (window.location.hostname === "localhost") {
//   firebase.auth().useEmulator("http://localhost:9099")
//   firebase.firestore().useEmulator("localhost", 8081)
//   firebase.firestore().settings({
//     experimentalForceLongPolling: true,
//     merge: true,
//   })
//   firebase.functions().useEmulator("localhost", 5001)
//   firebase.database().useEmulator("localhost", 9000)
//   firebase.storage().useEmulator("localhost", 9199)
// }
let messaging: any

try {
  messaging = firebase.messaging()
} catch (error) {
  console.log(error)
}

export const getToken = () => {
  if (!messaging) return
  return messaging
    .getToken({
      vapidKey:
        "BA78juIma4M8aidoUh4dLV1OElH6m2IBvgTcU_AaMzsaAvuCCVI0_9ne9fyFj4aNMaLnBxI6EHEbJ0cVnJKpCdY",
    })
    .then((currentToken: any) => {
      if (currentToken) {
        return currentToken
        // Track the token -> client mapping, by sending to backend server
        // show on the UI that permission is secured
      } else {
        return undefined
        // shows on the UI that permission is required
      }
    })
    .catch((err: any) => {
      console.log("An error occurred while retrieving token. ", err)
      // catch error while creating client token
    })
}

export const onMessageListener = () =>
  new Promise((resolve) => {
    messaging &&
      messaging.onMessage((payload: any) => {
        resolve(payload)
      })
  })

export default firebase
