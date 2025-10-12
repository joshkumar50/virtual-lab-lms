const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Lab = require('./models/Lab');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/virtual-lab-lms');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Lab.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create sample users
    const teacher = await User.create({
      name: 'Dr. Sarah Johnson',
      email: 'teacher@example.com',
      password: 'password123',
      role: 'teacher'
    });

    const student1 = await User.create({
      name: 'Alice Johnson',
      email: 'student1@example.com',
      password: 'password123',
      role: 'student'
    });

    const student2 = await User.create({
      name: 'Bob Smith',
      email: 'student2@example.com',
      password: 'password123',
      role: 'student'
    });

    const student3 = await User.create({
      name: 'Carol Davis',
      email: 'student3@example.com',
      password: 'password123',
      role: 'student'
    });

    console.log('👥 Created sample users');

    // Create sample courses
    const digitalElectronicsCourse = await Course.create({
      title: 'Digital Electronics Fundamentals',
      description: 'Learn the basics of digital electronics with interactive logic gate simulations.',
      instructor: teacher._id,
      category: 'Engineering',
      level: 'Beginner',
      duration: 8,
      tags: ['digital', 'electronics', 'logic gates', 'circuits'],
      prerequisites: ['Basic mathematics', 'Basic physics'],
      learningObjectives: [
        'Understand basic logic gates (AND, OR, NOT)',
        'Analyze digital circuits',
        'Design simple logic circuits',
        'Use truth tables effectively'
      ],
      isPublished: true,
      enrolledStudents: [student1._id, student2._id]
    });

    const physicsCourse = await Course.create({
      title: 'Physics Laboratory Simulations',
      description: 'Explore physics concepts through interactive virtual experiments including pendulum motion and wave interference.',
      instructor: teacher._id,
      category: 'Physics',
      level: 'Intermediate',
      duration: 12,
      tags: ['physics', 'mechanics', 'oscillations', 'energy', 'waves', 'interference'],
      prerequisites: ['Basic physics', 'Calculus'],
      learningObjectives: [
        'Understand harmonic motion and pendulum behavior',
        'Study energy conservation principles',
        'Explore wave interference and diffraction',
        'Analyze double slit experiment patterns',
        'Apply physics principles to real problems'
      ],
      isPublished: true,
      enrolledStudents: [student1._id, student3._id]
    });

    const chemistryCourse = await Course.create({
      title: 'Chemistry Virtual Lab',
      description: 'Explore chemistry concepts through interactive pH experiments and color changes.',
      instructor: teacher._id,
      category: 'Chemistry',
      level: 'Beginner',
      duration: 6,
      tags: ['chemistry', 'ph', 'acids', 'bases', 'titration'],
      prerequisites: ['Basic chemistry', 'Understanding of pH'],
      learningObjectives: [
        'Understand pH scale and acid-base concepts',
        'Perform virtual titrations',
        'Observe color changes with indicators',
        'Analyze chemical reactions'
      ],
      isPublished: true,
      enrolledStudents: [student2._id, student3._id]
    });

    const circuitAnalysisCourse = await Course.create({
      title: 'Circuit Analysis Fundamentals',
      description: 'Learn electrical circuit analysis with interactive simulations and real-time calculations.',
      instructor: teacher._id,
      category: 'Engineering',
      level: 'Intermediate',
      duration: 10,
      tags: ['circuits', 'electronics', 'analysis', 'ohm-law', 'resistance'],
      prerequisites: ['Basic physics', 'Understanding of electricity'],
      learningObjectives: [
        'Understand basic circuit components (resistors, capacitors, voltage sources)',
        'Analyze series and parallel circuits',
        'Calculate voltage, current, and power using Ohm\'s law',
        'Apply circuit analysis techniques to solve problems'
      ],
      isPublished: true,
      enrolledStudents: [student1._id, student2._id, student3._id]
    });


    // Create sample labs
    const logicGateLab = await Lab.create({
      title: 'Logic Gate Simulator',
      description: 'Interactive simulation of AND, OR, and NOT logic gates with real-time circuit visualization.',
      course: digitalElectronicsCourse._id,
      labType: 'LogicGateSimulator',
      instructions: '1. Select a logic gate from the options below\n2. Toggle the input switches (A, B) to see how the output changes\n3. Observe the truth table for each gate\n4. Complete all gates to finish the lab',
      objectives: [
        'Understand AND gate operation',
        'Understand OR gate operation',
        'Understand NOT gate operation',
        'Analyze truth tables'
      ],
      estimatedDuration: 30,
      difficulty: 'Easy',
      maxScore: 100,
      parameters: {
        gates: ['AND', 'OR', 'NOT'],
        inputs: ['A', 'B'],
        outputs: ['AND', 'OR', 'NOT']
      },
      isPublished: true,
      order: 1
    });

    const pendulumLab = await Lab.create({
      title: 'Physics Laboratory - Pendulum & Double Slit',
      description: 'Explore harmonic motion with pendulum experiments and wave interference with double slit experiments.',
      course: physicsCourse._id,
      labType: 'PendulumLab',
      instructions: '1. Select between Pendulum Lab or Double Slit Experiment\n2. For Pendulum: Adjust length, angle, and gravity parameters\n3. For Double Slit: Adjust wavelength, slit separation, and screen distance\n4. Click play to start the animation\n5. Observe the physics phenomena and complete the lab',
      objectives: [
        'Understand harmonic motion and pendulum behavior',
        'Analyze period-length relationship',
        'Study energy conservation principles',
        'Explore wave interference and diffraction',
        'Analyze double slit experiment patterns',
        'Apply physics equations to real problems'
      ],
      estimatedDuration: 60,
      difficulty: 'Medium',
      maxScore: 100,
      parameters: {
        experiments: ['pendulum', 'double-slit'],
        pendulum: {
          length: { min: 50, max: 200, default: 100, unit: 'cm' },
          angle: { min: 10, max: 60, default: 30, unit: 'degrees' },
          gravity: { min: 5, max: 15, default: 9.81, unit: 'm/s²' },
          damping: { min: 0.99, max: 0.999, default: 0.995 }
        },
        doubleSlit: {
          wavelength: { min: 400, max: 700, default: 500, unit: 'nm' },
          slitSeparation: { min: 0.05, max: 0.5, default: 0.1, unit: 'mm' },
          screenDistance: { min: 0.5, max: 3, default: 1, unit: 'm' },
          slitWidth: { min: 0.01, max: 0.1, default: 0.02, unit: 'mm' }
        }
      },
      isPublished: true,
      order: 1
    });

    const chemistryLab = await Lab.create({
      title: 'pH Color Change Lab',
      description: 'Interactive pH titration with real-time color changes and acid-base reactions.',
      course: chemistryCourse._id,
      labType: 'ChemistryLab',
      instructions: '1. Select an experiment from the options below\n2. Add acid or base drops to change the pH\n3. Observe the color changes in the solution\n4. Record your observations and complete all experiments',
      objectives: [
        'Understand pH scale and acid-base concepts',
        'Perform virtual titrations',
        'Observe color changes with indicators',
        'Analyze chemical reactions'
      ],
      estimatedDuration: 30,
      difficulty: 'Easy',
      maxScore: 100,
      parameters: {
        phRange: { min: 0, max: 14, default: 7 },
        indicators: ['universal', 'phenolphthalein', 'bromothymol'],
        dropSize: 0.5,
        colorMapping: true
      },
      isPublished: true,
      order: 1
    });

    const circuitAnalysisLab = await Lab.create({
      title: 'Circuit Analysis Lab',
      description: 'Interactive electrical circuit builder with real-time analysis and component simulation.',
      course: circuitAnalysisCourse._id,
      labType: 'CircuitAnalysis',
      instructions: '1. Select a circuit template from the options\n2. Add or modify circuit components (resistors, capacitors, voltage sources)\n3. Adjust component values using the controls\n4. Run circuit analysis to calculate voltages, currents, and power\n5. Complete all circuit experiments to finish the lab',
      objectives: [
        'Understand basic circuit components (resistors, capacitors, voltage sources)',
        'Analyze series and parallel circuits',
        'Calculate voltage, current, and power using Ohm\'s law',
        'Apply circuit analysis techniques to solve problems'
      ],
      estimatedDuration: 60,
      difficulty: 'Medium',
      maxScore: 100,
      parameters: {
        components: ['resistor', 'capacitor', 'voltageSource', 'currentSource', 'led'],
        circuitTypes: ['basic', 'parallel', 'rc'],
        analysisTypes: ['dc', 'ac', 'transient'],
        maxComponents: 10
      },
      isPublished: true,
      order: 1
    });


    console.log('🧪 Created sample labs');

    // Add labs to courses
    digitalElectronicsCourse.labs.push(logicGateLab._id);
    await digitalElectronicsCourse.save();

    physicsCourse.labs.push(pendulumLab._id);
    await physicsCourse.save();

    chemistryCourse.labs.push(chemistryLab._id);
    await chemistryCourse.save();

    circuitAnalysisCourse.labs.push(circuitAnalysisLab._id);
    await circuitAnalysisCourse.save();


    console.log('🔗 Linked labs to courses');

    // Create sample progress records
    const Progress = require('./models/Progress');
    
    await Progress.create({
      student: student1._id,
      lab: logicGateLab._id,
      course: digitalElectronicsCourse._id,
      status: 'graded',
      score: 95,
      timeSpent: 25,
      attempts: 1,
      labData: {
        gatesCompleted: ['AND', 'OR', 'NOT'],
        experimentsPerformed: 4
      },
      submissionData: {
        finalScore: 95,
        completionTime: '25 minutes',
        gatesTested: ['AND', 'OR', 'NOT']
      },
      feedback: 'Excellent work! You demonstrated a clear understanding of all logic gates.',
      gradedBy: teacher._id,
      gradedAt: new Date(),
      submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    });

    await Progress.create({
      student: student1._id,
      lab: pendulumLab._id,
      course: physicsCourse._id,
      status: 'submitted',
      timeSpent: 35,
      attempts: 1,
      labData: {
        experimentsCompleted: ['Period Analysis', 'Length Relationship', 'Energy Conservation'],
        dataPoints: 12
      },
      submissionData: {
        finalScore: 88,
        completionTime: '35 minutes',
        experimentsCompleted: ['Period Analysis', 'Length Relationship', 'Energy Conservation']
      },
      submittedAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
    });

    console.log('📊 Created sample progress records');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Sample Data Created:');
    console.log(`👨‍🏫 Teacher: ${teacher.email} (password: password123)`);
    console.log(`👨‍🎓 Student 1: ${student1.email} (password: password123)`);
    console.log(`👨‍🎓 Student 2: ${student2.email} (password: password123)`);
    console.log(`👨‍🎓 Student 3: ${student3.email} (password: password123)`);
    console.log(`📚 Courses: ${digitalElectronicsCourse.title}, ${physicsCourse.title}, ${chemistryCourse.title}, ${circuitAnalysisCourse.title}`);
    console.log(`🧪 Labs: ${logicGateLab.title}, ${pendulumLab.title}, ${chemistryLab.title}, ${circuitAnalysisLab.title}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the seed function
seedDatabase();
