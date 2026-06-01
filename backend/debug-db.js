const mongoose = require('mongoose');
const Course = require('./models/Course');
const User = require('./models/User');
require('dotenv').config();

async function debugDB() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/virtual-lab-lms';
        console.log('Connecting to:', mongoUri);
        await mongoose.connect(mongoUri);

        const courses = await Course.find();
        console.log('--- Current Courses in DB ---');
        console.log(`Count: ${courses.length}`);
        courses.forEach(c => {
            console.log(`- ${c.title} (ID: ${c._id})`);
        });

        const users = await User.find();
        console.log('--- Current Users in DB ---');
        console.log(`Count: ${users.length}`);
        users.forEach(u => {
            console.log(`- ${u.email} (Role: ${u.role})`);
        });

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

debugDB();
