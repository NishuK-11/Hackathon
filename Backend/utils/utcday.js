const getUtcDayRange = (dateInput) => {
  const d = new Date(dateInput);

  const start = new Date(d);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(d);
  end.setUTCHours(23, 59, 59, 999);

  return { start, end };
};

module.exports = { getUtcDayRange };
