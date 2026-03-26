const employmentRegions = ['Northeast', 'Midwest', 'South', 'West', 'Island'];

export const countries = [
  { name: 'India', continent: 'Asia' },
  { name: 'Japan', continent: 'Asia' },
  { name: 'Germany', continent: 'Europe' },
  { name: 'France', continent: 'Europe' },
  { name: 'Nigeria', continent: 'Africa' },
  { name: 'South Africa', continent: 'Africa' },
  { name: 'Canada', continent: 'North America' },
  { name: 'Mexico', continent: 'North America' },
  { name: 'Brazil', continent: 'South America' },
  { name: 'Argentina', continent: 'South America' },
  { name: 'Australia', continent: 'Oceania' },
  { name: 'New Zealand', continent: 'Oceania' },
];

export const visaTypes = ['Student', 'Skilled Worker', 'Research', 'Family', 'Seasonal Work'];

export const officesByCountry = {
  India: ['Delhi', 'Mumbai', 'Chennai'],
  Japan: ['Tokyo', 'Osaka'],
  Germany: ['Berlin', 'Frankfurt'],
  France: ['Paris', 'Lyon'],
  Nigeria: ['Lagos', 'Abuja'],
  'South Africa': ['Cape Town', 'Johannesburg'],
  Canada: ['Toronto', 'Vancouver'],
  Mexico: ['Mexico City', 'Monterrey'],
  Brazil: ['Sao Paulo', 'Brasilia'],
  Argentina: ['Buenos Aires', 'Cordoba'],
  Australia: ['Sydney', 'Melbourne'],
  'New Zealand': ['Auckland', 'Wellington'],
};

const visaProfiles = {
  Student: {
    education: ["Bachelor's", "Master's"],
    experienceBias: 'N',
    trainingBias: 'Y',
    fullTimeBias: 'N',
    employeeRange: [80, 1800],
    annualWageRange: [26000, 78000],
  },
  'Skilled Worker': {
    education: ["Bachelor's", "Master's", 'Doctorate'],
    experienceBias: 'Y',
    trainingBias: 'N',
    fullTimeBias: 'Y',
    employeeRange: [200, 12000],
    annualWageRange: [55000, 190000],
  },
  Research: {
    education: ["Master's", 'Doctorate'],
    experienceBias: 'Y',
    trainingBias: 'N',
    fullTimeBias: 'Y',
    employeeRange: [120, 6000],
    annualWageRange: [48000, 160000],
  },
  Family: {
    education: ['High School', "Bachelor's", "Master's"],
    experienceBias: coinFlip(0.45) ? 'Y' : 'N',
    trainingBias: coinFlip(0.4) ? 'Y' : 'N',
    fullTimeBias: coinFlip(0.55) ? 'Y' : 'N',
    employeeRange: [25, 2200],
    annualWageRange: [28000, 92000],
  },
  'Seasonal Work': {
    education: ['High School', "Bachelor's"],
    experienceBias: coinFlip(0.6) ? 'Y' : 'N',
    trainingBias: 'Y',
    fullTimeBias: 'N',
    employeeRange: [30, 1400],
    annualWageRange: [22000, 65000],
  },
};

const regionByContinent = {
  Asia: ['West', 'Northeast'],
  Europe: ['Northeast', 'Midwest'],
  Africa: ['South', 'Island'],
  'North America': ['Midwest', 'West'],
  'South America': ['South', 'West'],
  Oceania: ['Island', 'West'],
};

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function coinFlip(probability = 0.5) {
  return Math.random() <= probability;
}

function clamp(num, min, max) {
  return Math.max(min, Math.min(max, num));
}

function chooseUnitAndNormalizeWage(annualWage) {
  const unit = pick(['Hour', 'Week', 'Month', 'Year']);
  if (unit === 'Year') {
    return { unit, value: Math.round(annualWage) };
  }
  if (unit === 'Month') {
    return { unit, value: Math.round((annualWage / 12) * 10) / 10 };
  }
  if (unit === 'Week') {
    return { unit, value: Math.round((annualWage / 52) * 10) / 10 };
  }
  return { unit, value: Math.round((annualWage / 2080) * 10) / 10 };
}

function generateRealisticMonth() {
  const currentMonth = new Date().getMonth() + 1;
  const minMonth = Math.max(1, currentMonth - 10);
  return String(randInt(minMonth, currentMonth));
}

export function generateSmartRandomInput() {
  const country = pick(countries);
  const visaType = pick(visaTypes);
  const office = pick(officesByCountry[country.name]);
  const profile = visaProfiles[visaType];

  const regionOptions = regionByContinent[country.continent] || employmentRegions;
  const region = pick(regionOptions);

  const education = pick(profile.education);
  const noOfEmployees = randInt(profile.employeeRange[0], profile.employeeRange[1]);

  const currentYear = new Date().getFullYear();
  const minYear = noOfEmployees > 1500 ? 1970 : 1985;
  const yearEstablished = randInt(minYear, currentYear - 1);

  const annualWage = randInt(profile.annualWageRange[0], profile.annualWageRange[1]);
  const wagePack = chooseUnitAndNormalizeWage(annualWage);

  const experience = profile.experienceBias === 'Y' ? (coinFlip(0.84) ? 'Y' : 'N') : coinFlip(0.3) ? 'Y' : 'N';
  const trainingBase = profile.trainingBias === 'Y' ? 0.72 : 0.28;
  const training = coinFlip(experience === 'N' ? clamp(trainingBase + 0.12, 0.05, 0.95) : trainingBase) ? 'Y' : 'N';

  return {
    form: {
      continent: country.continent,
      education_of_employee: education,
      has_job_experience: experience,
      requires_job_training: training,
      no_of_employees: noOfEmployees,
      yr_of_estab: yearEstablished,
      region_of_employment: region,
      prevailing_wage: wagePack.value,
      unit_of_wage: wagePack.unit,
      full_time_position: profile.fullTimeBias === 'Y' ? (coinFlip(0.84) ? 'Y' : 'N') : coinFlip(0.4) ? 'Y' : 'N',
      application_month: generateRealisticMonth(),
    },
    meta: {
      country: country.name,
      visaType,
      processingOffice: office,
      generatedAt: new Date().toISOString(),
    },
  };
}