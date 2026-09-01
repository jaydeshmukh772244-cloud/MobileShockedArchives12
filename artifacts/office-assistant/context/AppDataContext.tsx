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

export interface DeathReportEntry {
  id: string;
  personName: string;
  age: string;
  gender: string;
  villageName: string;
  deathPlace: string;
  deathDate: string;
  cause: string;
  remark: string;
}

export interface CataractReportEntry {
  id: string;
  personName: string;
  age: string;
  gender: string;
  villageName: string;
  eye: 'right' | 'left' | '';
  searchDate: string;
  remark: string;
}

export interface CataractSurgeryReportEntry {
  id: string;
  personName: string;
  age: string;
  gender: string;
  villageName: string;
  eye: 'right' | 'left' | '';
  surgeryDate: string;
  remark: string;
}

export interface SputumSampleReportEntry {
  id: string;
  personName: string;
  age: string;
  gender: string;
  villageName: string;
  sampleCollectedDate: string;
  sampleTestDate: string;
  workerName: string;
  testType: 'sputum' | 'cbnaat' | '';
}

export interface ReportPeriod {
  month: number;
  year: number;
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
  deathReports: DeathReportEntry[];
  cataractReports: CataractReportEntry[];
  cataractSurgeryReports: CataractSurgeryReportEntry[];
  sputumSampleReports: SputumSampleReportEntry[];
  reportPeriod: ReportPeriod;
  hydrated: boolean;
  addEntry: (entry: Omit<DiaryEntry, 'id' | 'date'> & { date?: string }) => void;
  toggleEntry: (id: string) => void;
  removeEntry: (id: string) => void;
  addDeathReport: (report: Omit<DeathReportEntry, 'id'>) => void;
  updateDeathReport: (id: string, report: Omit<DeathReportEntry, 'id'>) => void;
  removeDeathReport: (id: string) => void;
  addCataractReport: (report: Omit<CataractReportEntry, 'id'>) => void;
  updateCataractReport: (id: string, report: Omit<CataractReportEntry, 'id'>) => void;
  removeCataractReport: (id: string) => void;
  addCataractSurgeryReport: (report: Omit<CataractSurgeryReportEntry, 'id'>) => void;
  updateCataractSurgeryReport: (id: string, report: Omit<CataractSurgeryReportEntry, 'id'>) => void;
  removeCataractSurgeryReport: (id: string) => void;
  addSputumSampleReport: (report: Omit<SputumSampleReportEntry, 'id'>) => void;
  updateSputumSampleReport: (id: string, report: Omit<SputumSampleReportEntry, 'id'>) => void;
  removeSputumSampleReport: (id: string) => void;
  updateReportPeriod: (period: ReportPeriod) => void;
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

const currentDate = new Date();
const defaultReportPeriod: ReportPeriod = {
  month: currentDate.getMonth() + 1,
  year: currentDate.getFullYear(),
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
  const [deathReports, setDeathReports] = useState<DeathReportEntry[]>([]);
  const [cataractReports, setCataractReports] = useState<CataractReportEntry[]>([]);
  const [cataractSurgeryReports, setCataractSurgeryReports] = useState<CataractSurgeryReportEntry[]>([]);
  const [sputumSampleReports, setSputumSampleReports] = useState<SputumSampleReportEntry[]>([]);
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>(defaultReportPeriod);
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
            deathReports?: DeathReportEntry[];
            cataractReports?: Array<CataractReportEntry & { surgeryDate?: string }>;
            cataractSurgeryReports?: CataractSurgeryReportEntry[];
            sputumSampleReports?: SputumSampleReportEntry[];
            reportPeriod?: ReportPeriod;
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
          if (Array.isArray(saved.deathReports)) setDeathReports(saved.deathReports);
          if (Array.isArray(saved.cataractReports)) {
            setCataractReports(saved.cataractReports.map((entry) => ({
              ...entry,
              searchDate: entry.searchDate ?? entry.surgeryDate ?? '',
            })));
          }
          if (Array.isArray(saved.cataractSurgeryReports)) setCataractSurgeryReports(saved.cataractSurgeryReports);
          if (Array.isArray(saved.sputumSampleReports)) setSputumSampleReports(saved.sputumSampleReports);
          if (saved.reportPeriod && Number.isInteger(saved.reportPeriod.month) && saved.reportPeriod.month >= 1 && saved.reportPeriod.month <= 12 && Number.isInteger(saved.reportPeriod.year)) {
            setReportPeriod(saved.reportPeriod);
          }
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
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ profile, entries, deathReports, cataractReports, cataractSurgeryReports, sputumSampleReports, reportPeriod }));
  }, [profile, entries, deathReports, cataractReports, cataractSurgeryReports, sputumSampleReports, reportPeriod, hydrated]);

  const value = useMemo<AppDataContextValue>(
    () => ({
      profile,
      entries,
      deathReports,
      cataractReports,
      cataractSurgeryReports,
      sputumSampleReports,
      reportPeriod,
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
      addDeathReport: (report) => setDeathReports((current) => [...current, { ...report, id: makeId('death') }]),
      updateDeathReport: (id, report) => setDeathReports((current) => current.map((entry) => (entry.id === id ? { ...report, id } : entry))),
      removeDeathReport: (id) => setDeathReports((current) => current.filter((report) => report.id !== id)),
      addCataractReport: (report) => setCataractReports((current) => [...current, { ...report, id: makeId('cataract') }]),
      updateCataractReport: (id, report) => setCataractReports((current) => current.map((entry) => (entry.id === id ? { ...report, id } : entry))),
      removeCataractReport: (id) => setCataractReports((current) => current.filter((report) => report.id !== id)),
      addCataractSurgeryReport: (report) => setCataractSurgeryReports((current) => [...current, { ...report, id: makeId('cataract-surgery') }]),
      updateCataractSurgeryReport: (id, report) => setCataractSurgeryReports((current) => current.map((entry) => (entry.id === id ? { ...report, id } : entry))),
      removeCataractSurgeryReport: (id) => setCataractSurgeryReports((current) => current.filter((report) => report.id !== id)),
      addSputumSampleReport: (report) => setSputumSampleReports((current) => [...current, { ...report, id: makeId('sputum') }]),
      updateSputumSampleReport: (id, report) => setSputumSampleReports((current) => current.map((entry) => (entry.id === id ? { ...report, id } : entry))),
      removeSputumSampleReport: (id) => setSputumSampleReports((current) => current.filter((report) => report.id !== id)),
      updateReportPeriod: (period) => setReportPeriod(period),
      updateProfile: (nextProfile) => setProfile(nextProfile),
    }),
    [cataractReports, cataractSurgeryReports, deathReports, entries, hydrated, profile, reportPeriod, sputumSampleReports],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const value = useContext(AppDataContext);
  if (!value) throw new Error('useAppData must be used within AppDataProvider');
  return value;
}