import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

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
    login,
    logout,
    initAuth,
    hasRole,
    isAdmin,
    isCaregiver,
  };
};
