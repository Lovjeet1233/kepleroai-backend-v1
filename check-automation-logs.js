const mongoose = require('mongoose');
require('dotenv').config();

async function checkLogs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const AutomationExecution = mongoose.model('AutomationExecution', new mongoose.Schema({
      automationId: mongoose.Types.ObjectId,
      status: String,
      triggerData: mongoose.Schema.Types.Mixed,
      actionData: mongoose.Schema.Types.Mixed,
      errorMessage: String,
      executedAt: Date
    }));

    const executions = await AutomationExecution.find({ 
      automationId: '6918803bff737f71962c8791' 
    }).sort({ executedAt: -1 }).limit(10);

    console.log(`📊 Found ${executions.length} execution(s) for your automation:\n`);

    executions.forEach((exec, i) => {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`Execution #${i + 1}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`Status: ${exec.status}`);
      console.log(`Time: ${exec.executedAt}`);
      
      if (exec.triggerData) {
        console.log(`\n📥 Trigger Data:`);
        console.log(JSON.stringify(exec.triggerData, null, 2));
      }
      
      if (exec.actionData) {
        console.log(`\n⚡ Action Results:`);
        console.log(JSON.stringify(exec.actionData, null, 2));
      }
      
      if (exec.errorMessage) {
        console.log(`\n❌ Error: ${exec.errorMessage}`);
      }
    });

    if (executions.length === 0) {
      console.log('❌ No executions found. The automation may not be triggering.');
      console.log('\nTroubleshooting:');
      console.log('1. Make sure the automation is ENABLED (toggle switch)');
      console.log('2. Check that you\'re creating contacts (not just opening the form)');
      console.log('3. Look at the terminal where you ran "npm start" for live logs');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkLogs();

