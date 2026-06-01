const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Lab = require('./models/Lab');
const Progress = require('./models/Progress');
require('dotenv').config();

async function deepReset() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/virtual-lab-lms';
        await mongoose.connect(mongoUri);
        console.log('--- DEEP RESET START ---');

        const collections = ['users', 'courses', 'labs', 'progress', 'institutions', 'teacherresources'];
        for (const col of collections) {
            try {
                const count = await mongoose.connection.db.collection(col).countDocuments();
                console.log(`Collection ${col}: ${count} records found.`);
                await mongoose.connection.db.collection(col).drop();
                console.log(`Collection ${col}: Dropped completely (indexes wiped).`);
            } catch (e) {
                console.log(`Collection ${col}: Could not drop (maybe it does not exist).`);
            }
        }

        console.log('--- DEEP RESET COMPLETE ---');
        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('ERROR:', err);
        process.exit(1);
    }
}

deepReset();
