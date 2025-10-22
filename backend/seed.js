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

  // Only clear courses and labs, keep existing users
  await Course.deleteMany({});
  await Lab.deleteMany({});

  // Create hackathon demo users
  await User.deleteMany({ email: { $in: ['teacher@demo.com', 'student@demo.com', 'admin@demo.com'] } });
  
  const teacherPass = await bcrypt.hash('demo123', 10);
  const teacher = await User.create({
    name: 'Prof. Smith',
    email: 'teacher@demo.com',
    password: teacherPass,
    role: 'teacher'
  });

  const studentPass = await bcrypt.hash('demo123', 10);
  const student = await User.create({
    name: 'Alice Johnson',
    email: 'student@demo.com',
    password: studentPass,
    role: 'student'
  });
  
  const student2 = await User.create({
    name: 'Bob Smith',
    email: 'bob@student.com',
    password: studentPass,
    role: 'student'
  });

  const c1 = await Course.create({
    title: 'Advanced Physics Laboratory',
    description: 'Comprehensive physics labs for engineering students with interactive simulations.',
    instructor: teacher._id,
    createdBy: teacher._id,
    category: 'Physics',
    level: 'Intermediate',
    duration: 8,
    status: 'published',
    isPublished: true,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    zoomLink: 'https://zoom.us/j/123456789',
    announcement: 'Live class every Monday at 3 PM',
    students: [student._id, student2._id],
    enrolledStudents: [student._id, student2._id],
    assignments: [
      {
        title: 'Ohms Law Investigation',
        description: 'Complete the virtual Ohms Law lab and submit your findings',
        labTitle: 'Ohms Law Circuit Lab',
        labType: 'electronics',
        maxScore: 100,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'active'
      }
    ]
  });

  const c2 = await Course.create({
    title: 'Chemistry Fundamentals',
    description: 'Basic chemistry concepts through virtual experiments and simulations.',
    instructor: teacher._id,
    createdBy: teacher._id,
    category: 'Chemistry',
    level: 'Beginner',
    duration: 6,
    status: 'published',
    isPublished: true,
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

  // Add labs to courses
  c1.labs.push(lab1._id, lab3._id, lab4._id);
  c2.labs.push(lab2._id, lab5._id);
  await c1.save();
  await c2.save();

  console.log('Seeded demo user, courses & labs', { 
    teacherId: teacher._id.toString(), 
    studentId: student._id.toString(), 
    c1: c1._id.toString(), 
    c2: c2._id.toString(),
    labs: [lab1._id.toString(), lab2._id.toString(), lab3._id.toString(), lab4._id.toString(), lab5._id.toString()]
  });
  
  console.log('\nDemo credentials:');
  console.log('Teacher: teacher@example.com / teacher123');
  console.log('Student: student@example.com / student123');
  
  process.exit(0);
}

main().catch(err => {
  console.error('Seed error', err);
  process.exit(1);
});