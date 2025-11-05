import { orderBy } from "firebase/firestore";

export const useClasses = () => {
  const {
    queryDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocument,
  } = useFirestore();

  // 取得所有班級
  const getClasses = async () => {
    return await queryDocuments("classes", orderBy("className"));
  };

  // 取得單一班級
  const getClass = async (classId: string) => {
    return await getDocument("classes", classId);
  };

  // 新增班級
  const createClass = async (classData: any) => {
    return await addDocument("classes", classData);
  };

  // 更新班級
  const updateClass = async (classId: string, classData: any) => {
    return await updateDocument("classes", classId, classData);
  };

  // 刪除班級
  const deleteClass = async (classId: string) => {
    return await deleteDocument("classes", classId);
  };

  // 更新班級個案人數
  const updateClassClientCount = async (classId: string, count: number) => {
    return await updateDocument("classes", classId, { clientCount: count });
  };

  return {
    getClasses,
    getClass,
    createClass,
    updateClass,
    deleteClass,
    updateClassClientCount,
  };
};
