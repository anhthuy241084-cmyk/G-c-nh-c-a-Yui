import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function main() {
  try {
    const snap = await getDocs(collection(db, 'characters'));
    console.log(`Found ${snap.size} characters in Firestore:`);
    snap.docs.forEach(d => {
      console.log(`- ID: ${d.id}, Name: ${d.data().name}`);
    });
  } catch (e) {
    console.error('Error fetching characters:', e);
  }
}

main();
