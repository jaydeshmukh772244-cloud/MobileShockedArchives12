import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export interface Profile {
  name: string;
  avatarUri: string;
  district: string;
  taluka: string;
  primaryHealthCenter: string;
  subCenter: string;
  villages: Village[];
  bsCode: string;
  phone: string;
  gmail: string;
}

export interface Village {
  id: string;
  name: string;
  population: string;
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
  profile: Profile;
  entries: DiaryEntry[];
  hydrated: boolean;
  addEntry: (entry: Omit<DiaryEntry, 'id' | 'date'> & { date?: string }) => void;
  toggleEntry: (id: string) => void;
  removeEntry: (id: string) => void;
  updateProfile: (profile: Profile) => void;
}

const STORAGE_KEY = '@office-assistant/data';

const emptyProfile: Profile = {
  name: '',
  avatarUri: '',
  district: '',
  taluka: '',
  primaryHealthCenter: '',
  subCenter: '',
  villages: [],
  bsCode: '',
  phone: '',
  gmail: '',
};

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
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [entries, setEntries] = useState<DiaryEntry[]>(starterEntries);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as {
            profile?: Partial<Profile> & { email?: string };
            people?: Array<{ name: string; role: string; phone: string; email?: string; kind?: string }>;
            entries?: DiaryEntry[];
          };
          if (saved.profile) {
            setProfile({
              ...emptyProfile,
              ...saved.profile,
              villages: Array.isArray(saved.profile.villages) ? saved.profile.villages : [],
              gmail: saved.profile.gmail ?? saved.profile.email ?? '',
            });
          } else if (Array.isArray(saved.people)) {
            const previousUser = saved.people.find((person) => person.kind === 'team') ?? saved.people[0];
            if (previousUser) {
              setProfile({
                name: previousUser.name ?? '',
                avatarUri: '',
                district: '',
                taluka: '',
                primaryHealthCenter: '',
                subCenter: '',
                villages: [],
                bsCode: '',
                phone: previousUser.phone ?? '',
                gmail: previousUser.email ?? '',
              });
            }
          }
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
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ profile, entries }));
  }, [profile, entries, hydrated]);

  const value = useMemo<AppDataContextValue>(
    () => ({
      profile,
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
      updateProfile: (nextProfile) => setProfile(nextProfile),
    }),
    [entries, hydrated, profile],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const value = useContext(AppDataContext);
  if (!value) throw new Error('useAppData must be used within AppDataProvider');
  return value;
}