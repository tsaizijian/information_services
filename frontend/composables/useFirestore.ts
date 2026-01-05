import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  type Query,
  type QueryConstraint,
  Timestamp,
} from "firebase/firestore";

export const useFirestore = () => {
  // 通用 CRUD 操作

  // 取得單一文件
  const getDocument = async (collectionName: string, docId: string) => {
    try {
      const { $firestore } = useNuxtApp();
      if (!$firestore) {
        throw new Error("Firestore not initialized");
      }
      const docRef = doc($firestore, collectionName, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error(`Error getting document from ${collectionName}:`, error);
      throw error;
    }
  };

  // 取得集合中的所有文件
  const getCollection = async (
    collectionName: string,
    constraints: QueryConstraint[] = []
  ) => {
    try {
      const { $firestore } = useNuxtApp();
      if (!$firestore) {
        throw new Error("Firestore not initialized");
      }
      const collectionRef = collection($firestore, collectionName);
      const q =
        constraints.length > 0
          ? query(collectionRef, ...constraints)
          : collectionRef;
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error(`Error getting collection ${collectionName}:`, error);
      throw error;
    }
  };

  // 新增文件
  const addDocument = async (collectionName: string, data: any) => {
    try {
      const { $firestore } = useNuxtApp();
      if (!$firestore) {
        throw new Error("Firestore not initialized");
      }
      const docRef = await addDoc(collection($firestore, collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error(`Error adding document to ${collectionName}:`, error);
      throw error;
    }
  };

  // 設定文件（建立或覆寫指定 ID 的文件）
  const setDocument = async (
    collectionName: string,
    docId: string,
    data: any,
    merge: boolean = true
  ) => {
    try {
      const { $firestore } = useNuxtApp();
      if (!$firestore) {
        throw new Error("Firestore not initialized");
      }
      const docRef = doc($firestore, collectionName, docId);
      await setDoc(
        docRef,
        {
          ...data,
          updatedAt: Timestamp.now(),
        },
        { merge }
      );
      return { id: docId, ...data };
    } catch (error) {
      console.error(`Error setting document in ${collectionName}:`, error);
      throw error;
    }
  };

  // 更新文件
  const updateDocument = async (
    collectionName: string,
    docId: string,
    data: any
  ) => {
    try {
      const { $firestore } = useNuxtApp();
      if (!$firestore) {
        throw new Error("Firestore not initialized");
      }
      const docRef = doc($firestore, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
      return { id: docId, ...data };
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      throw error;
    }
  };

  // 刪除文件
  const deleteDocument = async (collectionName: string, docId: string) => {
    try {
      const { $firestore } = useNuxtApp();
      if (!$firestore) {
        throw new Error("Firestore not initialized");
      }
      const docRef = doc($firestore, collectionName, docId);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  };

  // 查詢文件
  const queryDocuments = async (
    collectionName: string,
    ...constraints: QueryConstraint[]
  ) => {
    try {
      const { $firestore } = useNuxtApp();
      if (!$firestore) {
        throw new Error("Firestore not initialized");
      }
      const q = query(collection($firestore, collectionName), ...constraints);
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error(`Error querying ${collectionName}:`, error);
      throw error;
    }
  };

  return {
    getDocument,
    getCollection,
    addDocument,
    setDocument,
    updateDocument,
    deleteDocument,
    queryDocuments,
    // 匯出查詢輔助函數
    where,
    orderBy,
    limit,
  };
};
