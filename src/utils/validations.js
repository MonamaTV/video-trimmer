export const validateTime = (time) => {
  const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;
  return timePattern.test(time);
};
