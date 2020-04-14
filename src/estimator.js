//To convert to days
const periodTypeFormatter = (type, digit) => {
  if (type === "weeks") {
    const newDigit = digit * 7;
    return newDigit;
  } else if (type === "months") {
    const newDigit = digit * 30.417;
    return newDigit;
  }
  return digit;
};
//To get number of available hospital bed spaces
function noOfHospitalBedsCalculator(totalHospitalBeds, severeCasesByRequestedTime) {
  const bedSpacesForSevereCases = totalHospitalBeds * 0.35;
  const availableBedSpaces = bedSpacesForSevereCases - severeCasesByRequestedTime;

  return parseInt(availableBedSpaces, 10);
}

//THE ESTIMATOR
const covid19ImpactEstimator = (data) => {
  const impact = {};
  const severeImpact = {};

  const {
    reportedCases,
    timeToElapse,
    periodType,
    totalHospitalBeds
  } = data;

  const {
    avgDailyIncomeInUSD,
    avgDailyIncomePopulation
  } = data.region;

  const timeCalculator = (timeInDays) => {
    const inThreeDays = parseInt(timeInDays / 3, 10);
    return 2 ** inThreeDays;
  };

  impact.currentlyInfected = reportedCases * 10;

  severeImpact.currentlyInfected = reportedCases * 50;

  const periodInDays = periodTypeFormatter(periodType, timeToElapse);

  const timeFormatter = timeCalculator(periodInDays);


  impact.infectionsByRequestedTime = impact.currentlyInfected * timeFormatter;
  severeImpact.infectionsByRequestedTime = severeImpact.currentlyInfected * timeFormatter;

  impact.severeCasesByRequestedTime = impact.infectionsByRequestedTime * 0.15;
  severeImpact.severeCasesByRequestedTime = severeImpact.infectionsByRequestedTime * 0.15;

  const hospitalBedsByRequestedTimeForImpact = noOfHospitalBedsCalculator(totalHospitalBeds, impact.severeCasesByRequestedTime);
  const hospitalBedsByRequestedTimeForSevereImpact = noOfHospitalBedsCalculator(totalHospitalBeds, severeImpact.severeCasesByRequestedTime);

  impact.hospitalBedsByRequestedTime = hospitalBedsByRequestedTimeForImpact;
  severeImpact.hospitalBedsByRequestedTime = hospitalBedsByRequestedTimeForSevereImpact;

  impact.casesForICUByRequestedTime = Math.floor(impact.infectionsByRequestedTime * 0.05);
  severeImpact.casesForICUByRequestedTime = Math.floor(severeImpact.infectionsByRequestedTime * 0.05);

  impact.casesForVentilatorsByRequestedTime = Math.floor(impact.infectionsByRequestedTime * 0.02);
  severeImpact.casesForVentilatorsByRequestedTime = Math.floor(severeImpact.infectionsByRequestedTime * 0.02);

  impact.dollarsInFlight = Math.floor(((impact.infectionsByRequestedTime * avgDailyIncomePopulation) * avgDailyIncomeInUSD * periodInDays));

  severeImpact.dollarsInFlight = Math.floor(((severeImpact.infectionsByRequestedTime * avgDailyIncomePopulation) * avgDailyIncomeInUSD * periodInDays));

  return {
    data,
    impact,
    severeImpact
  };
};

export default covid19ImpactEstimator;