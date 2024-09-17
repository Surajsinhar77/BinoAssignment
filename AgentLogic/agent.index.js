const mongoose = require('mongoose');

const callStatusEnum = ['connected', 'notConnected']


// Agent Model 
const agentSchema = new mongoose.Schema({
	name : {
		type : String,
		require : true,
		unique : true,
	},

	email : {
		type : String,
		require : true,
		unique : true,
	},

	password : {
		type : String,
		require : true,
	}

}, {timestamps : true});

// Define this before using it
const agent = mongoose.model('agent', agentSchema);

const CallHistory = new mongoose.Schema({
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'agent'
  },
  callType: {
    type: String,
    enum: callStatusEnum,  // Use the defined enum array
    default: 'notConnected'
  }
}, { timestamps: true });  

const callModel = mongoose.model('callModel', CallHistory);



module.exports = {
	callModel,
	agent,
};