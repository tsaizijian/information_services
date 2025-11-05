import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  // Firebase 配置
  const firebaseConfig = {
    apiKey: config.public.firebaseApiKey,
    authDomain: config.public.firebaseAuthDomain,
    projectId: config.public.firebaseProjectId,
    storageBucket: config.public.firebaseStorageBucket,
    messagingSenderId: config.public.firebaseMessagingSenderId,
    appId: config.public.firebaseAppId,
    measurementId: config.public.firebaseMeasurementId,
  };

  // 檢查配置
  console.log("Firebase Config:", {
    apiKey: firebaseConfig.apiKey ? "✓" : "✗",
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
  });

  // 初始化 Firebase
  const app = initializeApp(firebaseConfig);

  // 初始化服務
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const storage = getStorage(app);

  return {
    provide: {
      firebase: app,
      auth,
      firestore,
      storage,
    },
  };
});
