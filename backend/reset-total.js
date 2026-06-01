const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Lab = require('./models/Lab');
const Progress = require('./models/Progress');
require('dotenv').config();

async function totalReset() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/virtual-lab-lms';
        console.log('Connecting to:', mongoUri);
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        console.log('Deleting All Records...');

        const userRes = await User.deleteMany({});
        const courseRes = await Course.deleteMany({});
        const labRes = await Lab.deleteMany({});
        const progressRes = await Progress.deleteMany({});

        console.log('--- Wiped Successfully ---');
        console.log(`Users deleted: ${userRes.deletedCount}`);
        console.log(`Courses deleted: ${courseRes.deletedCount}`);
        console.log(`Labs deleted: ${labRes.deletedCount}`);
        console.log(`Submissions deleted: ${progressRes.deletedCount}`);
        console.log('---------------------------');
        console.log('Your database is now 100% EMPTY.');
        console.log('You can now Register a new Teacher or Student account.');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Reset Error:', error);
        process.exit(1);
    }
}

totalReset();
