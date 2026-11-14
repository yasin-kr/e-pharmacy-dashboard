import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { getErrorMessage, isDemo } from "../data/firebase";
import {
  addRecord,
  collectionNames,
  demoDataKey,
  loadStore,
  removeRecord,
  sortRecords,
  updateRecord,
} from "../data/store";

const DataContext = createContext(null);
const emptyData = Object.fromEntries(collectionNames.map((name) => [name, []]));

export function DataProvider({ children }) {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const [state, setState] = useState({
    ...emptyData,
    uid: null,
    loading: false,
    error: "",
    refreshError: "",
  });
  const currentUid = useRef(uid);
  const requestVersion = useRef(0);
  const sessionVersion = useRef(0);
  const mounted = useRef(false);
  const mutationQueue = useRef(Promise.resolve());
  currentUid.current = uid;

  const reload = useCallback(
    async ({ background = false } = {}) => {
      if (!uid || !mounted.current || currentUid.current !== uid) return;
      const request = ++requestVersion.current;
      setState((previous) => ({
        ...previous,
        loading: background ? previous.loading : true,
        error: background ? previous.error : "",
        refreshError: "",
      }));

      try {
        const data = await loadStore(uid);
        if (
          mounted.current &&
          request === requestVersion.current &&
          currentUid.current === uid
        ) {
          setState({
            ...data,
            uid,
            loading: false,
            error: "",
            refreshError: "",
          });
        }
      } catch (cause) {
        if (
          mounted.current &&
          request === requestVersion.current &&
          currentUid.current === uid
        ) {
          setState((previous) => ({
            ...previous,
            uid,
            loading: false,
            error: background ? previous.error : getErrorMessage(cause),
            refreshError: background ? getErrorMessage(cause) : "",
          }));
        }
      }
    },
    [uid],
  );

  useEffect(() => {
    mounted.current = true;
    sessionVersion.current += 1;
    requestVersion.current += 1;
    mutationQueue.current = Promise.resolve();
    setState({
      ...emptyData,
      uid,
      loading: Boolean(uid),
      error: "",
      refreshError: "",
    });
    if (uid) void reload();

    return () => {
      mounted.current = false;
      sessionVersion.current += 1;
      requestVersion.current += 1;
    };
  }, [uid, reload]);

  useEffect(() => {
    if (!isDemo || !uid) return undefined;
    const onStorage = (event) => {
      if (event.key === demoDataKey || event.key === null)
        void reload({ background: true });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [uid, reload]);

  const mutate = useCallback(
    (collectionName, operation, id, values) => {
      const session = sessionVersion.current;
      const isCurrentSession = () =>
        mounted.current &&
        currentUid.current === uid &&
        sessionVersion.current === session;

      const pending = mutationQueue.current.then(async () => {
        if (!uid || !isCurrentSession())
          throw new Error("Your session has changed. Please sign in again.");
        requestVersion.current += 1;

        try {
          let savedRecord;
          if (operation === "add")
            savedRecord = await addRecord(uid, collectionName, values);
          if (operation === "update")
            savedRecord = await updateRecord(uid, collectionName, id, values);
          if (operation === "delete")
            await removeRecord(uid, collectionName, id);

          if (!isCurrentSession())
            throw new Error("Your session has changed. Please sign in again.");
          setState((previous) => {
            if (previous.uid !== uid) return previous;
            let records = previous[collectionName];
            if (operation === "add")
              records = [
                savedRecord,
                ...records.filter((record) => record.id !== savedRecord.id),
              ];
            if (operation === "update")
              records = records.map((record) =>
                record.id === id ? { ...record, ...savedRecord } : record,
              );
            if (operation === "delete")
              records = records.filter((record) => record.id !== id);
            return {
              ...previous,
              [collectionName]: sortRecords(records),
              loading: false,
              error: "",
              refreshError: "",
            };
          });
          void reload({ background: true });
          return savedRecord;
        } catch (cause) {
          if (isCurrentSession())
            setState((previous) => ({ ...previous, loading: false }));
          throw new Error(getErrorMessage(cause));
        }
      });

      mutationQueue.current = pending.catch(() => {});
      return pending;
    },
    [uid, reload],
  );

  const actions = useMemo(
    () => ({
      addProduct: (values) => mutate("products", "add", null, values),
      updateProduct: (id, values) => mutate("products", "update", id, values),
      deleteProduct: (id) => mutate("products", "delete", id),
      addSupplier: (values) => mutate("suppliers", "add", null, values),
      updateSupplier: (id, values) => mutate("suppliers", "update", id, values),
      updateCustomer: (id, values) => mutate("customers", "update", id, values),
    }),
    [mutate],
  );

  const visibleState =
    state.uid === uid
      ? state
      : { ...emptyData, loading: Boolean(uid), error: "", refreshError: "" };
  const value = { ...visibleState, ...actions, reload };
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider.");
  return context;
}
