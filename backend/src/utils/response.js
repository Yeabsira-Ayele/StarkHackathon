// The team's standard success response:
// { "success": true, "message": "...", "data": {} }
const sendSuccess = (res, message, data = {}, status = 200) =>
  res.status(status).json({ success: true, message, data });

module.exports = { sendSuccess };
