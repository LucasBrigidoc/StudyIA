export interface ContextFolder {
  id: string;
  name: string;
  bookReference?: string;
  notes?: string;
  createdAt: Date;
}

export interface ContextFile {
  id: string;
  folderId: string;
  name: string;
  type: string;
  size: number;
  data: string;
  extractedText?: string;
  createdAt: Date;
}

const DB_NAME = "solveai-db";
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

export async function initDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      if (!database.objectStoreNames.contains("folders")) {
        const folderStore = database.createObjectStore("folders", { keyPath: "id" });
        folderStore.createIndex("name", "name", { unique: false });
      }

      if (!database.objectStoreNames.contains("files")) {
        const fileStore = database.createObjectStore("files", { keyPath: "id" });
        fileStore.createIndex("folderId", "folderId", { unique: false });
      }
    };
  });
}

export async function getAllFolders(): Promise<ContextFolder[]> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction("folders", "readonly");
    const store = transaction.objectStore("folders");
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function getFolderById(id: string): Promise<ContextFolder | null> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction("folders", "readonly");
    const store = transaction.objectStore("folders");
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

export async function createFolder(name: string): Promise<ContextFolder> {
  const database = await initDB();
  const folder: ContextFolder = {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date(),
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction("folders", "readwrite");
    const store = transaction.objectStore("folders");
    const request = store.add(folder);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(folder);
  });
}

export async function deleteFolder(id: string): Promise<void> {
  const database = await initDB();
  
  const files = await getFilesByFolder(id);
  for (const file of files) {
    await deleteFile(file.id);
  }

  return new Promise((resolve, reject) => {
    const transaction = database.transaction("folders", "readwrite");
    const store = transaction.objectStore("folders");
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function updateFolder(id: string, updates: Partial<Pick<ContextFolder, "bookReference" | "notes">>): Promise<ContextFolder> {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction("folders", "readwrite");
    const store = transaction.objectStore("folders");
    const getRequest = store.get(id);

    getRequest.onerror = () => reject(getRequest.error);
    getRequest.onsuccess = () => {
      const folder = getRequest.result as ContextFolder;
      if (!folder) {
        reject(new Error("Folder not found"));
        return;
      }
      
      const updatedFolder = { ...folder, ...updates };
      const putRequest = store.put(updatedFolder);
      
      putRequest.onerror = () => reject(putRequest.error);
      putRequest.onsuccess = () => resolve(updatedFolder);
    };
  });
}

export async function getFilesByFolder(folderId: string): Promise<ContextFile[]> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction("files", "readonly");
    const store = transaction.objectStore("files");
    const index = store.index("folderId");
    const request = index.getAll(folderId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function addFile(file: Omit<ContextFile, "id" | "createdAt">): Promise<ContextFile> {
  const database = await initDB();
  const newFile: ContextFile = {
    ...file,
    id: crypto.randomUUID(),
    createdAt: new Date(),
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction("files", "readwrite");
    const store = transaction.objectStore("files");
    const request = store.add(newFile);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(newFile);
  });
}

export async function deleteFile(id: string): Promise<void> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction("files", "readwrite");
    const store = transaction.objectStore("files");
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getFolderFileCount(folderId: string): Promise<number> {
  const files = await getFilesByFolder(folderId);
  return files.length;
}
