const SelfLearningAgent = require('./selfLearning');

(async () => {
  try {
    const agent = new SelfLearningAgent();
    const quick = agent.generateFastResponse('How do I reset my password and recover access to my account? I tried the reset link but it did not work.', 'account');
    console.log('Fast response:', quick);
  } catch (err) {
    console.error('Fast test failed:', err);
  }
})();
