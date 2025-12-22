import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

// 使用者資料類型定義
interface UserProfile {
  id?: string;
  email: string;
  displayName: string;
  phone?: string;
  role: "admin" | "caregiver" | "family";
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export const useAuth = () => {
  const user = useState<User | null>("user", () => null);
  const userProfile = useState<UserProfile | null>("userProfile", () => null);
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

      // 發送驗證郵件
      await sendEmailVerification(userCredential.user);

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

      // 註冊後立即登出，要求用戶驗證郵箱後再登入
      await signOut(auth);
      user.value = null;
      userProfile.value = null;

      return { success: true, user: userCredential.user, emailSent: true };
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

      // 檢查郵箱是否已驗證
      if (!userCredential.user.emailVerified) {
        // 登出用戶
        await signOut(auth);
        return {
          success: false,
          error: "請先驗證您的電子郵件",
          code: "auth/email-not-verified",
          user: userCredential.user,
        };
      }

      user.value = userCredential.user;

      // 取得使用者資料
      const userDoc = await getDoc(
        doc(firestore, "users", userCredential.user.uid)
      );
      if (userDoc.exists()) {
        const data = userDoc.data();
        userProfile.value = {
          id: userDoc.id,
          email: data.email,
          displayName: data.displayName,
          phone: data.phone,
          role: data.role as "admin" | "caregiver" | "family",
          isActive: data.isActive,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      }

      return { success: true, user: userCredential.user };
    } catch (error: any) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    }
  };

  // 發送郵箱驗證信（可以傳入特定的 user 或使用當前登入的用戶）
  const sendVerificationEmail = async (targetUser?: User) => {
    try {
      const { auth } = getFirebaseInstances();
      if (!auth) {
        return { success: false, error: "Firebase not initialized" };
      }

      const userToVerify = targetUser || auth.currentUser;
      if (!userToVerify) {
        return { success: false, error: "未找到登入用戶" };
      }

      await sendEmailVerification(userToVerify);
      return { success: true, message: "驗證郵件已發送，請檢查您的信箱" };
    } catch (error: any) {
      console.error("Send verification email error:", error);
      let errorMessage = "發送驗證郵件失敗";
      if (error.code === "auth/too-many-requests") {
        errorMessage = "發送次數過多，請稍後再試";
      }
      return { success: false, error: errorMessage };
    }
  };

  // 發送密碼重置郵件
  const resetPassword = async (email: string) => {
    try {
      const { auth } = getFirebaseInstances();
      if (!auth) {
        return { success: false, error: "Firebase not initialized" };
      }

      await sendPasswordResetEmail(auth, email);
      return { success: true, message: "密碼重置郵件已發送，請檢查您的信箱" };
    } catch (error: any) {
      console.error("Reset password error:", error);
      let errorMessage = "發送密碼重置郵件失敗";
      if (error.code === "auth/user-not-found") {
        errorMessage = "找不到此電子郵件對應的帳號";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "電子郵件格式不正確";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "發送次數過多，請稍後再試";
      }
      return { success: false, error: errorMessage };
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
            const data = userDoc.data();
            userProfile.value = {
              id: userDoc.id,
              email: data.email,
              displayName: data.displayName,
              phone: data.phone,
              role: data.role as "admin" | "caregiver" | "family",
              isActive: data.isActive,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            };
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
    sendVerificationEmail,
    resetPassword,
    initAuth,
    hasRole,
    isAdmin,
    isCaregiver,
  };
};
