const words = [
  "education",
  "veil",
  "boast",
  "vacation",
  "political",
  "rhetorical",
  "clumsy",
  "adhesive",
  "ladybug",
  "rock",
  "physical",
  "current",
  "thumb",
  "secretary",
  "ground",
  "gentle",
];

function randomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

function getRandomInt(max, min = 0) {
  return Math.floor(Math.random() * max - min);
}

export function generateFakeData(count) {
  const res = [];
  const currentDate = new Date();
  const startData = new Date();
  startData.setFullYear(startData.getFullYear() - 1);

  for (let i = 0; i < count; i++) {
    res.push({
      time: randomDate(startData, currentDate),
    });
  }
  const sortedValues = res.sort((a, b) => a.time - b.time);

  return sortedValues.reduce((acc, x) => {
    const lastValue = acc.length > 0 ? acc[acc.length - 1].value : 0;
    acc.push({
      ...x,
      value: Math.abs(lastValue + getRandomInt(15, 5)),
    });
    return acc;
  }, []);
}

export function generateBarData(count) {
  const res = [];

  for (let i = 0; i < count; i++) {
    const title = words[i];
    res.push({
      label: title,
      shortLabel: title.length > 5 ? title.slice(0, 5) + '...' : title,
      value: getRandomInt(1000),
    });
  }
  const sum = res.reduce((acc, v) => acc + v.value, 0);

  return res.map((x) => ({
    ...x,
    tooltipValue: x.value / (sum / 100),
  }));
}

export function generateHorizontalBarData(count) {
  const res = [];

  for (let i = 0; i < count; i++) {
    const title = words[i];
    res.push({
      label: title,
      value: getRandomInt(1000),
    });
  }

  return res;
}
