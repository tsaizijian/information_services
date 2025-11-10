import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export const useAuth = () => {
  const user = useState<User | null>("user", () => null);
  const userProfile = useState<any>("userProfile", () => null);
  const loading = useState("authLoading", () => true);

  // 延遲獲取 Firebase 實例
  const getFirebaseInstances = () => {
    try {
      const nuxtApp = useNuxtApp();
      return {
        auth: nuxtApp.$auth,
        firestore: nuxtApp.$firestore,
      };
    } catch (error) {
      console.warn("Firebase not yet initialized");
      return { auth: null, firestore: null };
    }
  };

  // 註冊
  const register = async (userData: {
    email: string;
    password: string;
    displayName: string;
    phone?: string;
  }) => {
    try {
      const { auth, firestore } = getFirebaseInstances();
      if (!auth || !firestore) {
        return { success: false, error: "Firebase not initialized" };
      }

      // 建立 Firebase Auth 使用者
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      // 更新 Firebase Auth 的 displayName
      await updateProfile(userCredential.user, {
        displayName: userData.displayName,
      });

      // 建立 Firestore 使用者資料（預設角色為 family）
      const userDoc = {
        email: userData.email,
        displayName: userData.displayName,
        phone: userData.phone || "",
        role: "family", // 註冊時統一設定為家屬，之後由管理員調整
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
      };

      console.log("Creating Firestore user document:", {
        uid: userCredential.user.uid,
        userDoc,
      });

      try {
        await setDoc(doc(firestore, "users", userCredential.user.uid), userDoc);
        console.log("✅ Firestore user document created successfully");
      } catch (firestoreError: any) {
        console.error("❌ Firestore setDoc failed:", firestoreError);
        console.error("Error code:", firestoreError.code);
        console.error("Error message:", firestoreError.message);
        throw new Error(
          `Firestore 寫入失敗: ${firestoreError.message || "權限不足"}`
        );
      }

      user.value = userCredential.user;
      userProfile.value = { id: userCredential.user.uid, ...userDoc };

      return { success: true, user: userCredential.user };
    } catch (error: any) {
      console.error("Register error:", error);

      let errorMessage = "註冊失敗，請稍後再試";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "此電子郵件已被使用";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "電子郵件格式不正確";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "密碼強度不足，至少需要 6 個字元";
      }

      return { success: false, error: errorMessage };
    }
  };

  // 登入
  const login = async (email: string, password: string) => {
    try {
      const { auth, firestore } = getFirebaseInstances();
      if (!auth || !firestore) {
        return { success: false, error: "Firebase not initialized" };
      }

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      user.value = userCredential.user;

      // 取得使用者資料
      const userDoc = await getDoc(
        doc(firestore, "users", userCredential.user.uid)
      );
      if (userDoc.exists()) {
        userProfile.value = { id: userDoc.id, ...userDoc.data() };
      }

      return { success: true, user: userCredential.user };
    } catch (error: any) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    }
  };

  // 登出
  const logout = async () => {
    try {
      const { auth } = getFirebaseInstances();
      if (!auth) {
        return { success: false, error: "Firebase not initialized" };
      }

      await signOut(auth);
      user.value = null;
      userProfile.value = null;
      navigateTo("/login");
      return { success: true };
    } catch (error: any) {
      console.error("Logout error:", error);
      return { success: false, error: error.message };
    }
  };

  // 檢查認證狀態
  const initAuth = () => {
    return new Promise((resolve) => {
      const { auth, firestore } = getFirebaseInstances();
      if (!auth || !firestore) {
        loading.value = false;
        resolve(null);
        return;
      }

      onAuthStateChanged(auth, async (firebaseUser) => {
        user.value = firebaseUser;

        if (firebaseUser) {
          // 取得使用者資料
          const userDoc = await getDoc(
            doc(firestore, "users", firebaseUser.uid)
          );
          if (userDoc.exists()) {
            userProfile.value = { id: userDoc.id, ...userDoc.data() };
          }
        } else {
          userProfile.value = null;
        }

        loading.value = false;
        resolve(firebaseUser);
      });
    });
  };

  // 檢查角色權限
  const hasRole = (role: string | string[]) => {
    if (!userProfile.value) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(userProfile.value.role);
  };

  const isAdmin = computed(() => hasRole("admin"));
  const isCaregiver = computed(() => hasRole(["caregiver", "admin"]));

  return {
    user,
    userProfile,
    loading,
    register,
    login,
    logout,
    initAuth,
    hasRole,
    isAdmin,
    isCaregiver,
  };
};
