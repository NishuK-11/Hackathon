const Token = require("../model/tokenModel");

module.exports = async function emitQueue(io, opdSessionId) {
  const tokens = await Token.find({ opdSession: opdSessionId })
    .populate("patient")
    .sort({ tokenNumber: 1 });

  io.to(`opd_${opdSessionId}`).emit("QUEUE_SYNC", {
    current: tokens.find(t => t.status === "CALLED"),
    waiting: tokens.filter(t => t.status === "WAITING"),
    completed: tokens.filter(t => t.status === "COMPLETED"),
    skipped: tokens
      .filter(t => t.status === "SKIPPED")
      .sort((a, b) => a.skippedAt - b.skippedAt)
  });
};
