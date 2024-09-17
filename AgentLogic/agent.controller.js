const { callModel, agent } = require("../AgentLogic/agent.index");
const mongoose = require("mongoose");
const moment = require("moment-timezone");

async function makeCall(req, res) {
  try {
    const getRandomBoolean = () => Math.random() >= 0.5;

    const callType = getRandomBoolean() ? "connected" : "notConnected";

    // Save the call detail to the database
    const callDetail = new callModel({
      agentId: req.params.id,
      callType: callType,
    });

    await callDetail.save();

    return res.status(200).json({
      message: `Call ${callType}`,
      data: callDetail,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function all_call_made_by_agent(req, res) {
  try {
    // const startOfDay = new Date(parseInt(req.query.startOfDay) * 1000);
    // const endOfDay = new Date(parseInt(req.query.endOfDay) * 1000);
	const startOfDay = moment().startOf('day').toDate();
	const endOfDay = moment().endOf('day').toDate();

    // Aggregate call data
    const result = await callModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: { agentId: "$agentId", callType: "$callType" },
          callCount: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.agentId",
          connectedCalls: {
            $sum: {
              $cond: [{ $eq: ["$_id.callType", "connected"] }, "$callCount", 0],
            },
          },
          notConnectedCalls: {
            $sum: {
              $cond: [
                { $eq: ["$_id.callType", "notConnected"] },
                "$callCount",
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "agents",  // Name of the collection for agents
          localField: "_id",
          foreignField: "_id",
          as: "agentInfo",
        },
      },
      {
        $project: {
          _id: 0,
          agentId: "$_id",
          connectedCalls: 1,
          notConnectedCalls: 1,
          agentInfo: { $arrayElemAt: ["$agentInfo", 0] },
          agentName: "$agentInfo.name",
          agentEmail: "$agentInfo.email",
        },
      },
    ]);

    // Send response with aggregated call data
    res
      .status(200)
      .json({ message: "Call details for all agents", data: result });
  } catch (err) {
    console.error("Error occurred:", err); // Log the error
    res.status(500).json({ message: err.message });
  }
}

async function agent_register(req, res) {
  try {
    const { name, email, password } = req.body;
    const newAgent = new agent({
      name,
      email,
      password,
    });

    await newAgent.save();
    return res.status(200).json({ message: "Agent created successfully" });
  } catch (err) {
    res.json({ message: err.message });
  }
}

async function call_by_agent(req, res) {
  try {
    const agentId = req.params.id;
    const startOfDay = moment().startOf('day').toDate();
	const endOfDay = moment().endOf('day').toDate();

    const result = await callModel.aggregate([
      {
        $match: {
          agentId: new mongoose.Types.ObjectId(agentId),
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: "$callType",
          callCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          callType: "$_id",
          callCount: 1,
        },
      },
    ]);

    res.status(200).json({ message: "Call details of the agent", result });
  } catch (err) {
    res.json({ message: err.message });
  }
}

module.exports = {
  makeCall,
  all_call_made_by_agent,
  agent_register,
  call_by_agent,
};
