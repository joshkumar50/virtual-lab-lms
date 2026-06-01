require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Course = require('./models/Course');
const Lab = require('./models/Lab');

const MONGO = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/virtual-lab-lms';

async function main() {
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });

  console.log('Connected to DB', MONGO);

  // wipe sample data (only in non-production)
  if ((process.env.NODE_ENV || 'development') === 'production') {
    console.error('Refusing to seed in production');
    process.exit(1);
  }

  // Courses and Labs are wiped to ensure fresh demo content
  await Course.deleteMany({});
  await Lab.deleteMany({});

  // Upsert users to preserve them across seeds/restarts
  console.log('Upserting demo users (preserving existing passwords)...');

  const demoPassword = await bcrypt.hash('demo123', 12);
  const joshPassword = await bcrypt.hash('123456', 12);

  // Use $set for non-sensitive fields and $setOnInsert for password
  // This ensures the password is ONLY set when a new user is created, never overwritten.
  const teacher = await User.findOneAndUpdate(
    { email: 'teacher@demo.com' },
    {
      $set: { name: 'Prof. Smith', role: 'teacher', email: 'teacher@demo.com' },
      $setOnInsert: { password: demoPassword }
    },
    { upsert: true, new: true }
  );

  const student = await User.findOneAndUpdate(
    { email: 'student@demo.com' },
    {
      $set: { name: 'Alice Johnson', role: 'student', email: 'student@demo.com' },
      $setOnInsert: { password: demoPassword }
    },
    { upsert: true, new: true }
  );

  const josh = await User.findOneAndUpdate(
    { email: 'josh@gmail.com' },
    {
      $set: { name: 'Josh', role: 'student', email: 'josh@gmail.com' },
      $setOnInsert: { password: joshPassword }
    },
    { upsert: true, new: true }
  );

  // Upsert Dr raman (primary teacher account)
  const ramanPassword = await bcrypt.hash('raman123', 12);
  const drRaman = await User.findOneAndUpdate(
    { email: 'raman@gmail.com' },
    {
      $set: { name: 'Dr raman', role: 'teacher', email: 'raman@gmail.com' },
      $setOnInsert: { password: ramanPassword }
    },
    { upsert: true, new: true }
  );

  console.log('Users upserted successfully (passwords preserved for existing accounts)');

  const c1 = await Course.create({
    title: 'Advanced Physics Laboratory',
    description: 'Comprehensive physics labs for engineering students with interactive simulations.',
    instructor: drRaman._id,
    createdBy: drRaman._id,
    category: 'Physics',
    level: 'Intermediate',
    duration: 8,
    status: 'published',
    isPublished: true,
    courseImage: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&h=400&fit=crop&auto=format&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    zoomLink: 'https://meet.google.com/abc-defg-hij',
    announcement: 'Online doubt sessions every Monday at 3 PM',
    students: [student._id, josh._id],
    enrolledStudents: [student._id, josh._id],
    assignments: [
      {
        title: 'Ohms Law Investigation',
        description: 'Complete the virtual Ohms Law lab and submit your findings',
        labTitle: 'Ohms Law Circuit Lab',
        labType: 'electronics',
        maxScore: 100,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'active',
        autoGrade: true,
        gradingCriteria: {
          rules: {
            totalPoints: 50,
            expectedValues: {
              voltage: { value: 12, tolerance: 0.5, points: 15 },
              current: { value: 3, tolerance: 0.1, points: 15 },
              resistance: { value: 4, tolerance: 0.2, points: 20 }
            }
          },
          rubric: {
            totalPoints: 50,
            sections: {
              'Results': { indicators: ['result', 'voltage', 'current'], points: 10, minLength: 30 },
              'Observations': { indicators: ['observe', 'noticed', 'found'], points: 15, minLength: 50 },
              'Analysis': { indicators: ['analysis', 'because', 'therefore', 'conclude'], points: 10, minLength: 50 }
            },
            keywords: {
              list: ['proportional', 'linear', 'ohm', 'resistance', 'circuit'],
              pointsPerKeyword: 2,
              maxPoints: 10
            },
            minLength: 200,
            minLengthPoints: 5
          }
        }
      }
    ]
  });

  const c2 = await Course.create({
    title: 'Chemistry Fundamentals',
    description: 'Basic chemistry concepts through virtual experiments and simulations.',
    instructor: drRaman._id,
    createdBy: drRaman._id,
    category: 'Chemistry',
    level: 'Beginner',
    duration: 6,
    status: 'published',
    isPublished: true,
    courseImage: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&h=400&fit=crop&auto=format&q=80',
    students: [],
    enrolledStudents: [],
    assignments: []
  });

  // Add some sample submissions for the first course
  c1.submissions = [
    {
      student: student._id,
      assignment: 'Pendulum Period Analysis',
      content: 'I calculated the period for different pendulum lengths and found that T = 2π√(L/g)',
      submittedAt: new Date()
    }
  ];
  await c1.save();

  // Create sample labs for practice
  const lab1 = await Lab.create({
    title: 'Ohm\'s Law Experiment',
    description: 'Explore the relationship between voltage, current, and resistance in electrical circuits.',
    course: c1._id,
    labType: 'CircuitAnalysis',
    instructions: '1. Set up the circuit with a resistor and power supply\n2. Measure voltage and current\n3. Calculate resistance using Ohm\'s law\n4. Repeat with different resistor values',
    objectives: ['Understand Ohm\'s law', 'Learn to measure electrical quantities', 'Practice circuit analysis'],
    estimatedDuration: 30,
    difficulty: 'Easy',
    maxScore: 100,
    parameters: {
      resistorValues: [100, 220, 470, 1000],
      voltageRange: [1, 12],
      currentRange: [0.001, 0.1]
    },
    isPublished: true,
    isActive: true,
    order: 1
  });

  const lab2 = await Lab.create({
    title: 'Logic Gate Simulator',
    description: 'Practice with basic digital logic gates including AND, OR, NOT, and XOR gates.',
    course: c2._id,
    labType: 'LogicGateSimulator',
    instructions: '1. Select input values for the gates\n2. Observe the output behavior\n3. Build simple combinational circuits\n4. Test your understanding with provided exercises',
    objectives: ['Understand basic logic gates', 'Learn truth tables', 'Build combinational circuits'],
    estimatedDuration: 45,
    difficulty: 'Medium',
    maxScore: 100,
    parameters: {
      availableGates: ['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR'],
      maxInputs: 4,
      exercises: ['Build a half-adder', 'Create a 2-to-1 multiplexer']
    },
    isPublished: true,
    isActive: true,
    order: 1
  });

  const lab3 = await Lab.create({
    title: 'Pendulum Physics Lab',
    description: 'Investigate the relationship between pendulum length and period of oscillation.',
    course: c1._id,
    labType: 'PendulumLab',
    instructions: '1. Adjust the pendulum length\n2. Measure the period of oscillation\n3. Record data for different lengths\n4. Analyze the relationship between length and period',
    objectives: ['Understand simple harmonic motion', 'Learn about pendulum physics', 'Practice data analysis'],
    estimatedDuration: 25,
    difficulty: 'Easy',
    maxScore: 100,
    parameters: {
      lengthRange: [0.1, 2.0],
      gravity: 9.81,
      massRange: [0.1, 1.0]
    },
    isPublished: true,
    isActive: true,
    order: 2
  });

  const lab4 = await Lab.create({
    title: 'Double Slit Experiment',
    description: 'Observe wave interference patterns in the famous double-slit experiment.',
    course: c1._id,
    labType: 'DoubleSlitLab',
    instructions: '1. Adjust the slit separation\n2. Change the wavelength of light\n3. Observe the interference pattern\n4. Measure fringe spacing and calculate wavelength',
    objectives: ['Understand wave interference', 'Learn about light as a wave', 'Practice optical measurements'],
    estimatedDuration: 40,
    difficulty: 'Hard',
    maxScore: 100,
    parameters: {
      slitSeparation: [0.1, 2.0],
      wavelength: [400, 700],
      screenDistance: [1, 5]
    },
    isPublished: true,
    isActive: true,
    order: 3
  });

  const lab5 = await Lab.create({
    title: 'Chemistry Reaction Simulator',
    description: 'Explore chemical reactions and balance equations in a virtual chemistry lab.',
    course: c2._id,
    labType: 'ChemistryLab',
    instructions: '1. Select reactants from the periodic table\n2. Mix chemicals in the virtual beaker\n3. Observe the reaction\n4. Balance the chemical equation',
    objectives: ['Learn chemical reactions', 'Practice equation balancing', 'Understand stoichiometry'],
    estimatedDuration: 35,
    difficulty: 'Medium',
    maxScore: 100,
    parameters: {
      availableElements: ['H', 'O', 'C', 'N', 'Cl', 'Na', 'Mg', 'Al'],
      reactionTypes: ['synthesis', 'decomposition', 'single replacement', 'double replacement'],
      temperature: [20, 100]
    },
    isPublished: true,
    isActive: true,
    order: 2
  });

  const lab6 = await Lab.create({
    title: 'Arduino Uno Robotics Lab',
    description: 'Learn embedded systems and robotics by programming an Arduino Uno in a virtual environment.',
    course: c2._id,
    labType: 'ArduinoLab',
    instructions: '1. Use the Wokwi simulator to write C++ code\n2. Configure digital and analog pins\n3. Observe the behavior of LEDs, sensors, or motors\n4. Submit your code and observations in the report',
    objectives: ['Learn Arduino C++ programming', 'Understand GPIO and PWM', 'Practice circuit integration'],
    estimatedDuration: 60,
    difficulty: 'Medium',
    maxScore: 100,
    parameters: {
      board: 'arduino-uno',
      components: ['LED', 'Resistor', 'Potentiometer', 'LCD', 'Servo'],
      simUrl: 'https://wokwi.com/projects/new/arduino-uno?embed=1'
    },
    isPublished: true,
    isActive: true,
    order: 3
  });

  // Add labs to courses
  c1.labs.push(lab1._id, lab3._id, lab4._id);
  c2.labs.push(lab2._id, lab5._id, lab6._id);
  await c1.save();
  await c2.save();

  console.log('Seeded demo user, courses & labs', {
    teacherId: teacher._id.toString(),
    studentId: student._id.toString(),
    c1: c1._id.toString(),
    c2: c2._id.toString(),
    labs: [lab1._id.toString(), lab2._id.toString(), lab3._id.toString(), lab4._id.toString(), lab5._id.toString()]
  });

  // =============================================
  // Government & Civic Tech Seed Data
  // =============================================
  const Institution = require('./models/Institution');
  await Institution.deleteMany({});

  // Create Education Officer user
  const officerPassword = await bcrypt.hash('officer123', 12);
  const officer = await User.findOneAndUpdate(
    { email: 'officer@education.gov.in' },
    {
      $set: { name: 'Dr. Anita Sharma', role: 'education_officer', email: 'officer@education.gov.in', state: 'Maharashtra', district: 'Pune' },
      $setOnInsert: { password: officerPassword }
    },
    { upsert: true, new: true }
  );

  // Seed Institutions
  const schools = await Institution.insertMany([
    {
      name: 'Government Engineering College, Pune',
      institutionalCode: 'C-12345',
      state: 'Maharashtra',
      district: 'Pune',
      block: 'Haveli',
      type: 'Govt Degree College',
      category: 'Technical/Engineering',
      board: 'University Affiliated',
      principalName: 'Dr. Rajesh Patil',
      contactEmail: 'coep@education.mh.gov.in',
      isRural: false,
      status: 'Active',
      totalStudents: 1450,
      totalTeachers: 122,
      registeredBy: officer._id
    },
    {
      name: 'Zilla Parishad School, Satara',
      institutionalCode: '27210200201',
      state: 'Maharashtra',
      district: 'Satara',
      block: 'Wai',
      type: 'Local Body',
      category: 'Secondary',
      board: 'State Board',
      principalName: 'Mrs. Sunita Jadhav',
      isRural: true,
      status: 'Active',
      totalStudents: 180,
      totalTeachers: 8,
      registeredBy: officer._id
    },
    {
      name: 'Kendriya Vidyalaya, Bangalore',
      institutionalCode: '29280300301',
      state: 'Karnataka',
      district: 'Bangalore Urban',
      type: 'Kendriya Vidyalaya',
      category: 'Higher Secondary',
      board: 'CBSE',
      principalName: 'Dr. Ramesh Kumar',
      isRural: false,
      status: 'Active',
      totalStudents: 620,
      totalTeachers: 35,
      registeredBy: officer._id
    },
    {
      name: 'Government Model School, Jaipur',
      institutionalCode: '08130400401',
      state: 'Rajasthan',
      district: 'Jaipur',
      block: 'Sanganer',
      type: 'Government',
      category: 'Secondary',
      board: 'State Board',
      principalName: 'Mr. Vikram Singh',
      isRural: true,
      status: 'Active',
      totalStudents: 290,
      totalTeachers: 14,
      registeredBy: officer._id
    },
    {
      name: 'National Institute of Technology, Nagpur',
      institutionalCode: 'U-0334',
      state: 'Maharashtra',
      district: 'Nagpur',
      type: 'NIT/IIT/IIIT',
      category: 'Technical/Engineering',
      board: 'Autonomous',
      principalName: 'Dr. Priya Deshmukh',
      isRural: false,
      status: 'Active',
      totalStudents: 2510,
      totalTeachers: 228,
      registeredBy: officer._id
    }
  ]);

  console.log(`✅ Seeded ${schools.length} government schools`);

  // Update labs with curriculum alignment
  await Lab.updateMany(
    { labType: { $in: ['PendulumLab', 'DoubleSlitLab', 'CircuitAnalysis'] } },
    { $set: { boardAlignment: 'CBSE', gradeLevel: 11, subject: 'Physics', liteModeAvailable: true, liteModeInstructions: 'Follow the step-by-step text instructions. Record your observations in the text box below.' } }
  );
  await Lab.updateMany(
    { labType: 'ChemistryLab' },
    { $set: { boardAlignment: 'All', gradeLevel: 10, subject: 'Chemistry', liteModeAvailable: true, liteModeInstructions: 'Read the reaction procedure. Note the reactants and products. Submit your balanced equation.' } }
  );
  await Lab.updateMany(
    { labType: 'LogicGateSimulator' },
    { $set: { boardAlignment: 'CBSE', gradeLevel: 11, subject: 'Computer Science', liteModeAvailable: true } }
  );

  console.log('\nDemo credentials:');
  console.log('Teacher: teacher@demo.com / demo123');
  console.log('Student: student@demo.com / demo123');
  console.log('Josh: josh@gmail.com / 123456');
  console.log('Education Officer: officer@education.gov.in / officer123');

  process.exit(0);
}

main().catch(err => {
  console.error('Seed error:', err.errors ? JSON.stringify(err.errors, null, 2) : err);
  process.exit(1);
});