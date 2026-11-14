import { getFirebaseDatabase, isDemo } from "./firebase";
import { createSeedData } from "./seed";

export const collectionNames = [
  "products",
  "suppliers",
  "customers",
  "orders",
  "transactions",
];
export const demoDataKey = "e-pharmacy-demo-data-v1";

const fields = {
  products: ["name", "category", "stock", "supplier", "price"],
  suppliers: ["name", "address", "company", "deliveryDate", "amount", "status"],
  customers: ["name", "email", "address", "phone", "registerDate"],
};

const dateFields = {
  suppliers: "deliveryDate",
  customers: "registerDate",
  orders: "date",
};

let demoQueue = Promise.resolve();

function withDemoLock(operation) {
  if (navigator.locks?.request) {
    return navigator.locks.request(demoDataKey, operation);
  }
  const pending = demoQueue.then(operation);
  demoQueue = pending.catch(() => {});
  return pending;
}

function saveDemoData(data) {
  try {
    localStorage.setItem(demoDataKey, JSON.stringify(data));
  } catch {
    throw new Error(
      "The changes could not be saved. Check that browser storage is enabled and has free space.",
    );
  }
}

function readDemoData() {
  let stored;
  try {
    stored = localStorage.getItem(demoDataKey);
  } catch {
    throw new Error(
      "Unable to read your data. Enable browser storage and try again.",
    );
  }

  if (!stored) {
    const data = createSeedData();
    saveDemoData(data);
    return data;
  }

  try {
    const data = JSON.parse(stored);
    if (!collectionNames.every((name) => Array.isArray(data[name])))
      throw new Error();
    return data;
  } catch {
    throw new Error(
      "The saved demo data could not be read. Clear the demo data in browser storage to start again.",
    );
  }
}

function requireUser(uid) {
  if (!uid) throw new Error("Please sign in to access your store.");
}

function getCreatedTime(record) {
  const value = record.createdAt;
  if (typeof value?.toMillis === "function") return value.toMillis();
  if (typeof value?.seconds === "number") return value.seconds * 1000;
  if (typeof value === "number") return value;
  return Date.parse(value) || 0;
}

function normalizeDate(value) {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value))
    return value.slice(0, 10);
  let dateValue = value;
  if (typeof value.toDate === "function") dateValue = value.toDate();
  else if (typeof value.seconds === "number") dateValue = value.seconds * 1000;
  const date = new Date(dateValue);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function normalizeRecord(collectionName, record) {
  const normalized = { ...record };
  if (record.createdAt !== undefined)
    normalized.createdAt = getCreatedTime(record);
  const dateField = dateFields[collectionName];
  if (dateField) normalized[dateField] = normalizeDate(record[dateField]);
  return normalized;
}

export function sortRecords(records) {
  return [...records].sort(
    (first, second) => getCreatedTime(second) - getCreatedTime(first),
  );
}

function selectFields(collectionName, values) {
  return Object.fromEntries(
    fields[collectionName].map((field) => {
      const value = values[field];
      if (value === undefined || value === null)
        throw new Error("Complete all required fields.");
      return [field, typeof value === "string" ? value.trim() : value];
    }),
  );
}

export async function loadStore(uid) {
  requireUser(uid);
  if (isDemo) {
    return withDemoLock(() => {
      const data = readDemoData();
      return Object.fromEntries(
        collectionNames.map((name) => [
          name,
          sortRecords(
            data[name].map((record) => normalizeRecord(name, record)),
          ),
        ]),
      );
    });
  }

  const { db, sdk } = await getFirebaseDatabase();
  const collections = await Promise.all(
    collectionNames.map(async (name) => {
      const snapshot = await sdk.getDocs(
        sdk.collection(db, "users", uid, name),
      );
      const records = snapshot.docs.map((document) =>
        normalizeRecord(name, {
          ...document.data(),
          id: document.id,
        }),
      );
      return [name, sortRecords(records)];
    }),
  );
  return Object.fromEntries(collections);
}

export async function addRecord(uid, collectionName, values) {
  requireUser(uid);
  const record = {
    ...selectFields(collectionName, values),
    createdAt: Date.now(),
  };

  if (isDemo) {
    return withDemoLock(() => {
      const data = readDemoData();
      const savedRecord = { ...record, id: crypto.randomUUID() };
      data[collectionName].unshift(savedRecord);
      saveDemoData(data);
      return savedRecord;
    });
  }

  const { db, sdk } = await getFirebaseDatabase();
  const reference = await sdk.addDoc(
    sdk.collection(db, "users", uid, collectionName),
    record,
  );
  return { ...record, id: reference.id };
}

export async function updateRecord(uid, collectionName, id, values) {
  requireUser(uid);
  const changes = selectFields(collectionName, values);

  if (isDemo) {
    return withDemoLock(() => {
      const data = readDemoData();
      const index = data[collectionName].findIndex(
        (record) => record.id === id,
      );
      if (index < 0)
        throw new Error(
          "This record no longer exists. Refresh the list and try again.",
        );
      const record = { ...data[collectionName][index], ...changes };
      data[collectionName][index] = record;
      saveDemoData(data);
      return record;
    });
  }

  const { db, sdk } = await getFirebaseDatabase();
  await sdk.updateDoc(sdk.doc(db, "users", uid, collectionName, id), changes);
  return { ...changes, id };
}

export async function removeRecord(uid, collectionName, id) {
  requireUser(uid);

  if (isDemo) {
    return withDemoLock(() => {
      const data = readDemoData();
      data[collectionName] = data[collectionName].filter(
        (record) => record.id !== id,
      );
      saveDemoData(data);
      return id;
    });
  }

  const { db, sdk } = await getFirebaseDatabase();
  await sdk.deleteDoc(sdk.doc(db, "users", uid, collectionName, id));
  return id;
}
