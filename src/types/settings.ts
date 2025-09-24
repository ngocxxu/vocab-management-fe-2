export type TVocabSubject = {
  id: string;
  name: string;
  order: number;
};

export type TReorderVocabSubject = {
  id: string;
  order: number;
};

export type TUserProfile = {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: string;
  isActive: boolean;
};

export type TTimezoneSettings = {
  city: string;
  timezone: string;
  dateTimeFormat: string;
};

export type TMotivationSettings = {
  desiredDailyTimeUtilization: number; // in hours
  desiredDailyCoreWorkRange: {
    start: number; // in hours
    end: number; // in hours
  };
};

export type TWorkSettings = {
  function: string;
  jobTitle: string;
  responsibilities?: string;
};

export type TSettings = {
  profile: TUserProfile;
  timezone: TTimezoneSettings;
  motivation: TMotivationSettings;
  work: TWorkSettings;
};

export type TSettingsTab = 'account' | 'notifications' | 'sharing' | 'update-schedule' | 'billing' | 'questions';
