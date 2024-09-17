// Agent Router
const router = require('express').Router();
const { makeCall, all_call_made_by_agent, agent_register,call_by_agent} = require('./agent.controller');


router.route('/agent-create').post(agent_register);
router.route('/call-customer/:id').get(makeCall);
router.route('/all-calls-madeBy-agent').get(all_call_made_by_agent);
router.route('/callBy-agent/:id').get(call_by_agent);


module.exports = router;