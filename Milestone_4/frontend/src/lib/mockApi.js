const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

export async function predictVisa(payload) {
  await wait(900);

  const month = Number(payload.application_month);
  const employees = Number(payload.no_of_employees);
  const establishedYear = Number(payload.yr_of_estab);
  const wage = Number(payload.prevailing_wage);

  const continentOffset = {
    Africa: 8,
    Asia: 5,
    Europe: 2,
    'North America': 1,
    Oceania: 2,
    'South America': 6,
  };

  const educationOffset = {
    'High School': 4,
    "Bachelor's": 2,
    "Master's": 1,
    Doctorate: 0,
  };

  const regionOffset = {
    Northeast: 1,
    Midwest: 2,
    South: 3,
    West: 1,
    Island: 4,
  };

  const unitOffset = {
    Hour: 3,
    Week: 2,
    Month: 1,
    Year: 0,
  };

  let predictedDays = 26;
  predictedDays += continentOffset[payload.continent] ?? 3;
  predictedDays += educationOffset[payload.education_of_employee] ?? 2;
  predictedDays += regionOffset[payload.region_of_employment] ?? 2;
  predictedDays += unitOffset[payload.unit_of_wage] ?? 1;

  if (payload.has_job_experience === 'N') {
    predictedDays += 3;
  }
  if (payload.requires_job_training === 'Y') {
    predictedDays += 4;
  }
  if (payload.full_time_position === 'N') {
    predictedDays += 2;
  }

  if (month === 12 || month <= 2) {
    predictedDays += 2;
  } else if (month >= 6 && month <= 8) {
    predictedDays += 3;
  }

  if (employees > 10000) {
    predictedDays -= 2;
  } else if (employees < 200) {
    predictedDays += 2;
  }

  if (establishedYear >= 2018) {
    predictedDays += 1;
  } else if (establishedYear <= 1995) {
    predictedDays -= 1;
  }

  if (wage < 1000) {
    predictedDays += 2;
  } else if (wage > 60000) {
    predictedDays -= 1;
  }

  predictedDays = Math.max(7, Math.round(predictedDays));

  const spread = 6 + (payload.requires_job_training === 'Y' ? 2 : 0) + (payload.has_job_experience === 'N' ? 1 : 0);
  const confidenceRaw = 0.9 - spread * 0.015;
  const confidence = Number(Math.min(0.96, Math.max(0.72, confidenceRaw)).toFixed(2));

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const seasonalLift = [2, 2, 1, 0, -1, 1, 2, 2, 1, 0, 1, 2];
  const trend = monthLabels.map((label, index) => {
    const distance = Math.abs(index + 1 - month);
    const localFactor = Math.max(0, 3 - distance);
    const days = Math.max(7, Math.round(predictedDays + seasonalLift[index] + localFactor));
    return { month: label, days };
  });

  const comparisonBase = {
    Africa: predictedDays + 4,
    Asia: predictedDays + 2,
    Europe: predictedDays - 2,
    'North America': predictedDays - 3,
    Oceania: predictedDays - 1,
    'South America': predictedDays + 3,
  };

  const comparison = Object.entries(comparisonBase).map(([segment, days]) => ({
    segment,
    days: Math.max(7, Math.round(days)),
  }));

  return {
    id: crypto.randomUUID(),
    payload,
    range: `${Math.max(7, predictedDays - spread)}-${predictedDays + spread} days`,
    confidence,
    predictedDays,
    trend,
    comparison,
    createdAt: new Date().toISOString(),
  };
}
