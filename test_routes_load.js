try {
    const routes = require('./backend/routes/studentRoutes');
    console.log('✅ Student Routes module loaded successfully');
} catch (error) {
    console.error('❌ Failed to load Student Routes:', error);
    process.exit(1);
}
