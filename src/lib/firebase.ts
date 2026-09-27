import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  signInAnonymously,
  updateProfile
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  serverTimestamp,
  increment,
  getDocFromServer,
  deleteDoc,
  limit
} from 'firebase/firestore';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import firebaseConfig from '../../firebase-applet-config.json';

// Dynamically resolve authDomain:
// If running on the custom domain (pointc.aldiaai.cloud), use it.
// Otherwise, use the reliable default Firebase authDomain (pointc-e9618.firebaseapp.com)
// to prevent DNS / SSL unresolved domain errors in dev / preview environments.
const effectiveAuthDomain =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'pointc.aldiaai.cloud' || window.location.hostname.endsWith('aldiaai.cloud'))
    ? 'pointc.aldiaai.cloud'
    : (firebaseConfig.authDomain || 'pointc-e9618.firebaseapp.com');

const appConfig = {
  ...firebaseConfig,
  authDomain: effectiveAuthDomain,
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(appConfig) : getApp();

export const auth = getAuth(app);
export const db = (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)')
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Analytics in browser runtime if supported
export let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
        console.log('[Firebase] Analytics initialized with measurementId:', firebaseConfig.measurementId);
      }
    })
    .catch(() => {});
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  credits: number;
  totalTokensSpent?: number;
  language?: 'es' | 'en';
  plan: 'Gratuito' | 'Pro' | 'Enterprise';
  createdAt: any;
  updatedAt: any;
}

export interface StoredProject {
  id: string;
  userId: string;
  name: string;
  content: string;
  cCode?: string;
  cppCode?: string;
  status?: 'active' | 'deleted';
  isDeleted?: boolean;
  updatedAt: any;
  createdAt?: any;
  deletedAt?: any;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase Firestore is offline or uninitialized.');
    }
  }
}

export interface StoredTransaction {
  id?: string;
  userId: string;
  userEmail: string;
  planName: string;
  creditsAdded: number;
  amountUsd: number;
  paymentMethod: string;
  transactionRef: string;
  status: string;
  createdAt: any;
}

// Ensure active Firebase Auth session
export async function ensureAuthenticatedUser(): Promise<FirebaseUser> {
  if (auth.currentUser) {
    return auth.currentUser;
  }
  const result = await signInAnonymously(auth);
  return result.user;
}

// User Profile Helpers
export async function syncUserProfile(user: FirebaseUser): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const data = userSnap.data() as UserProfile;
    return {
      ...data,
      displayName: user.displayName || data.displayName || 'Desarrollador pointC',
      email: user.email || data.email || 'invitado@pointc.dev',
      totalTokensSpent: data.totalTokensSpent ?? 0,
      language: data.language || 'es',
    };
  } else {
    const initialProfile: UserProfile = {
      uid: user.uid,
      email: user.email || 'invitado@pointc.dev',
      displayName: user.displayName || 'Desarrollador pointC',
      credits: 150, // Welcome gift of 150 IA credits
      totalTokensSpent: 0,
      language: 'es',
      plan: 'Gratuito',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(userRef, initialProfile, { merge: true });
    return initialProfile;
  }
}

// Update User Language Preference in Firestore
export async function updateUserLanguageInFirestore(userId: string, language: 'es' | 'en'): Promise<void> {
  const currentUser = auth.currentUser;
  const actualUid = currentUser?.uid || userId;
  const userRef = doc(db, 'users', actualUid);
  await setDoc(userRef, { language, updatedAt: serverTimestamp() }, { merge: true });
}

// Add Credits & Record Transaction in Firestore
export async function addCreditsToUser(
  userId: string,
  userEmail: string,
  creditsToAdd: number,
  planName: string,
  amountUsd: number,
  paymentMethod: string
): Promise<number> {
  const currentUser = await ensureAuthenticatedUser();
  const actualUid = currentUser.uid || userId;
  const userRef = doc(db, 'users', actualUid);
  const newPlan = creditsToAdd >= 2500 ? 'Pro' : 'Gratuito';

  // Merge into user record (creates if not exists, or increments)
  await setDoc(
    userRef,
    {
      uid: actualUid,
      email: currentUser.email || userEmail || 'usuario@pointc.dev',
      credits: increment(creditsToAdd),
      plan: newPlan,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  // Record transaction log in Firestore
  const txRef = collection(db, 'transactions');
  await addDoc(txRef, {
    userId: actualUid,
    userEmail: currentUser.email || userEmail || 'usuario@pointc.dev',
    planName,
    creditsAdded: creditsToAdd,
    amountUsd,
    paymentMethod,
    transactionRef: 'TX-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
    status: 'Completado',
    createdAt: serverTimestamp(),
  });

  const updatedSnap = await getDoc(userRef);
  return updatedSnap.data()?.credits ?? creditsToAdd;
}

// Record and Validate Gumroad Purchase in Firestore
export async function recordGumroadPurchase(
  userId: string,
  userEmail: string,
  creditsToAdd: number,
  planName: string,
  amountUsd: number,
  orderNumber: string
): Promise<{ success: boolean; newCredits: number; message?: string }> {
  const currentUser = await ensureAuthenticatedUser();
  const actualUid = currentUser.uid || userId;
  const userRef = doc(db, 'users', actualUid);

  // Check if this Gumroad order was already registered in Firestore
  try {
    const q = query(
      collection(db, 'transactions'),
      where('transactionRef', '==', orderNumber),
      limit(1)
    );
    const existing = await getDocs(q);
    if (!existing.empty) {
      return {
        success: false,
        newCredits: 0,
        message: 'Este número de orden de Gumroad ya fue registrado anteriormente.',
      };
    }
  } catch (err) {
    console.warn('Checking existing Gumroad transaction in Firestore:', err);
  }

  const newPlan = creditsToAdd >= 2500 ? 'Pro' : 'Gratuito';

  await setDoc(
    userRef,
    {
      uid: actualUid,
      email: currentUser.email || userEmail || 'usuario@pointc.dev',
      credits: increment(creditsToAdd),
      plan: newPlan,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  // Store transaction log
  await addDoc(collection(db, 'transactions'), {
    userId: actualUid,
    userEmail: currentUser.email || userEmail || 'usuario@pointc.dev',
    planName,
    creditsAdded: creditsToAdd,
    amountUsd,
    paymentMethod: 'Gumroad (aldiaaipay)',
    transactionRef: orderNumber,
    status: 'Aprobado',
    createdAt: serverTimestamp(),
  });

  const updatedSnap = await getDoc(userRef);
  return {
    success: true,
    newCredits: updatedSnap.data()?.credits ?? creditsToAdd,
  };
}

// Deduct IA Credits & Record Tokens Spent in Firestore (1 credit = 2000 tokens)
export async function deductUserCredit(
  userId: string,
  amount: number = 1,
  tokensSpent: number = 2000
): Promise<{ remainingCredits: number; totalTokensSpent: number } | null> {
  const currentUser = auth.currentUser;
  const actualUid = currentUser?.uid || userId;
  const userRef = doc(db, 'users', actualUid);

  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    // Initialize if first time
    const initialCredits = Math.max(0, 150 - amount);
    await setDoc(userRef, {
      uid: actualUid,
      credits: initialCredits,
      totalTokensSpent: tokensSpent,
      plan: 'Gratuito',
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return { remainingCredits: initialCredits, totalTokensSpent: tokensSpent };
  }

  const data = snap.data();
  const currentCredits = data.credits ?? 0;
  const prevTokens = data.totalTokensSpent ?? 0;
  if (currentCredits < amount) return null;

  await setDoc(
    userRef,
    {
      credits: increment(-amount),
      totalTokensSpent: increment(tokensSpent),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return { remainingCredits: currentCredits - amount, totalTokensSpent: prevTokens + tokensSpent };
}

// Update User Display Name in Firestore and Auth
export async function updateUserNameInFirestore(userId: string, newDisplayName: string): Promise<void> {
  const currentUser = auth.currentUser;
  const actualUid = currentUser?.uid || userId;

  if (currentUser && currentUser.uid === actualUid) {
    try {
      await updateProfile(currentUser, { displayName: newDisplayName });
    } catch (e) {
      console.warn('Could not update Firebase Auth profile name:', e);
    }
  }

  const userRef = doc(db, 'users', actualUid);
  await setDoc(
    userRef,
    {
      uid: actualUid,
      displayName: newDisplayName,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

// Save or Update Project File in Firestore (with active status)
export async function saveProjectToFirestore(
  userId: string,
  projectId: string,
  name: string,
  content: string,
  cCode?: string,
  cppCode?: string
) {
  const currentUser = auth.currentUser;
  const actualUid = currentUser?.uid || userId;
  const projectRef = doc(db, 'users', actualUid, 'projects', projectId);

  await setDoc(
    projectRef,
    {
      id: projectId,
      userId: actualUid,
      name,
      content,
      cCode: cCode || '',
      cppCode: cppCode || '',
      status: 'active',
      isDeleted: false,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

// Delete Project in Firestore (updates state to deleted so backend records it)
export async function deleteProjectInFirestore(userId: string, projectId: string): Promise<void> {
  const currentUser = auth.currentUser;
  const actualUid = currentUser?.uid || userId;
  const projectRef = doc(db, 'users', actualUid, 'projects', projectId);

  try {
    // Specifically update the status to 'deleted' in Firestore
    await setDoc(
      projectRef,
      {
        status: 'deleted',
        isDeleted: true,
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error updating project deletion status in Firestore:', error);
    handleFirestoreError(error, OperationType.UPDATE, `users/${actualUid}/projects/${projectId}`);
  }
}

// Load User's Projects from Firestore (excluding deleted status)
export async function loadUserProjectsFromFirestore(userId: string): Promise<StoredProject[]> {
  try {
    const currentUser = auth.currentUser;
    const actualUid = currentUser?.uid || userId;
    const projectsRef = collection(db, 'users', actualUid, 'projects');
    const snap = await getDocs(projectsRef);
    const projects: StoredProject[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data() as StoredProject;
      // Filter out deleted projects
      if (data.status !== 'deleted' && !data.isDeleted) {
        projects.push(data);
      }
    });
    return projects;
  } catch (error) {
    console.warn('Could not load projects from Firestore, falling back to local storage:', error);
    return [];
  }
}
