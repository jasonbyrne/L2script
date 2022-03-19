export const forEachPromise = (arr: string[], callback: Function) => {
  let i = 0;
  const next = () => {
    if (arr.length && i < arr.length) {
      const value = callback(arr[i]);
      i++;
      if (value && value.then) {
        value.then(next);
      } else {
        next();
      }
    }
  };
  next();
};

export const generateName = () => {
  return `shape${Date.now()}_${Math.round(Math.random() * 10000)}`;
};

export function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutes + " " + ampm;
  return strTime;
}
