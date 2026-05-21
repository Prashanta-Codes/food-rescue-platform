const Request = require("../models/Request");

exports.createRequest = async (req, res) => {
  const request = await Request.create(req.body);
  res.json(request);
};

exports.getRequests = async (req, res) => {
  const requests = await Request.find();
  res.json(requests);
};