import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type PersonKind = 'team' | 'customer';

export interface Person {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  kind: PersonKind;
}

export interface DiaryEntry {
  id: string;
  title: string;
  note: string;
  date: string;
  category: string;
  done: boolean;
}

interface AppDataContextValue {
  people: Person[];
  entries: DiaryEntry[];
  hydrated: boolean;
  addEntry: (entry: Omit<DiaryEntry, 'id' | 'date'> & { date?: string }) => void;
  toggleEntry: (id: string) => void;
  removeEntry: (id: string) => void;
  addPerson: (person: Omit<Person, 'id'>) => void;
  removePerson: (id: string) => void;
}

const STORAGE_KEY = '@office-assistant/data';

const starterPeople: Person[] = [
  {
    id: 'person-1',
    name: 'अमोल देशमुख',
    role: 'ऑफिस व्यवस्थापक',
    phone: '98765 43210',
    email: 'amol@office.local',
    kind: 'team',
  },
  {
    id: 'person-2',
    name: 'स्नेहा पाटील',
    role: 'ग्राहक',
    phone: '97654 32109',
    email: 'sneha@example.com',
    kind: 'customer',
  },
];

const today = new Date();
const dateKey = (offset = 0) => {
  const value = new Date(today);
  value.setDate(today.getDate() + offset);
  return value.toISOString().slice(0, 10);
};

const starterEntries: DiaryEntry[] = [
  {
    id: 'entry-1',
    title: 'साप्ताहिक टीम मीटिंग',
    note: 'पुढील आठवड्याची कामांची यादी आणि जबाबदाऱ्या ठरवायच्या.',
    date: dateKey(),
    category: 'मीटिंग',
    done: false,
  },
  {
    id: 'entry-2',
    title: 'ग्राहकाला प्रस्ताव पाठवला',
    note: 'नवीन प्रोजेक्टचा खर्चाचा अंदाज ईमेल केला.',
    date: dateKey(-1),
    category: 'फॉलो-अप',
    done: true,
  },
  {
    id: 'entry-3',
    title: 'महिन्याचा खर्च तपासला',
    note: 'ऑफिसचे नियमित खर्च आणि येणे बाकी असलेली रक्कम पाहिली.',
    date: dateKey(-2),
    category: 'अकाउंट्स',
    done: true,
  },
];

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

const makeId = (prefix: string) =>
  `${prefix}-${Date.now().toString()}-${Math.random().toString(36).slice(2, 8)}`;

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [people, setPeople] = useState<Person[]>(starterPeople);
  const [entries, setEntries] = useState<DiaryEntry[]>(starterEntries);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as { people?: Person[]; entries?: DiaryEntry[] };
          if (Array.isArray(saved.people)) setPeople(saved.people);
          if (Array.isArray(saved.entries)) setEntries(saved.entries);
        }
      } catch {
        // The in-memory starter data remains usable if storage is unavailable.
      } finally {
        setHydrated(true);
      }
    };
    void load();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ people, entries }));
  }, [people, entries, hydrated]);

  const value = useMemo<AppDataContextValue>(
    () => ({
      people,
      entries,
      hydrated,
      addEntry: (entry) =>
        setEntries((current) => [
          {
            ...entry,
            id: makeId('entry'),
            date: entry.date ?? new Date().toISOString().slice(0, 10),
          },
          ...current,
        ]),
      toggleEntry: (id) =>
        setEntries((current) =>
          current.map((entry) => (entry.id === id ? { ...entry, done: !entry.done } : entry)),
        ),
      removeEntry: (id) => setEntries((current) => current.filter((entry) => entry.id !== id)),
      addPerson: (person) => setPeople((current) => [{ ...person, id: makeId('person') }, ...current]),
      removePerson: (id) => setPeople((current) => current.filter((person) => person.id !== id)),
    }),
    [entries, hydrated, people],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const value = useContext(AppDataContext);
  if (!value) throw new Error('useAppData must be used within AppDataProvider');
  return value;
}