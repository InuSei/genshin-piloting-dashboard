import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

// Keeps the in-progress order in this browser so a reload doesn't wipe it.
export function useStoredState<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? initial : (JSON.parse(raw) as T);
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage full or blocked: the order still works, it just won't survive a reload
    }
  }, [key, value]);
  return [value, setValue];
}
