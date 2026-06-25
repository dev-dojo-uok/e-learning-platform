import prisma from '../src/config/db.js';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('--- Reseeding Sample LMS Data ---');

  const teacherEmail = 'teacher@uok.lk';
  const studentEmail = 'student@uok.lk';

  // 1. Clean up existing sample data safely
  console.log('Cleaning up previous sample records...');
  
  // Find previous courses owned by the teacher to clean them up and avoid Restrict error
  const existingTeacher = await prisma.user.findUnique({
    where: { email: teacherEmail }
  });

  if (existingTeacher) {
    await prisma.course.deleteMany({
      where: { teacherId: existingTeacher.id }
    });
  }

  // Delete previous users if they exist
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [teacherEmail, studentEmail]
      }
    }
  });

  console.log('Previous sample records cleaned up.');

  // 2. Hash Password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 3. Create Teacher & Student Users
  console.log('Creating sample users...');
  const teacher = await prisma.user.create({
    data: {
      name: 'Prof. Damith',
      email: teacherEmail,
      password: hashedPassword,
      role: 'TEACHER'
    }
  });
  console.log(`Created Teacher: ${teacher.name} (${teacher.email})`);

  const student = await prisma.user.create({
    data: {
      name: 'Geeth Akash',
      email: studentEmail,
      password: hashedPassword,
      role: 'STUDENT'
    }
  });
  console.log(`Created Student: ${student.name} (${student.email})`);

  // 4. Create Course
  console.log('Creating sample course...');
  const course = await prisma.course.create({
    data: {
      title: 'Software Architecture & Design Patterns',
      description: 'An advanced university course covering software architecture paradigms (MVC, Clean Architecture, Microservices), SOLID principles, and Gang of Four design patterns.',
      teacherId: teacher.id
    }
  });
  console.log(`Created Course: "${course.title}"`);

  // 5. Create Sections/Modules
  console.log('Creating course modules...');
  const module1 = await prisma.courseSection.create({
    data: {
      courseId: course.id,
      title: 'Module 1: SOLID Principles & MVC',
      sortOrder: 1
    }
  });

  const module2 = await prisma.courseSection.create({
    data: {
      courseId: course.id,
      title: 'Module 2: Clean Architecture & Domain-Driven Design',
      sortOrder: 2
    }
  });
  console.log('Created course modules successfully.');

  // 6. Create Materials (PDF & Video Src)
  console.log('Adding lecture materials...');
  const matPdf = await prisma.material.create({
    data: {
      sectionId: module1.id,
      title: 'Lecture Slides: SOLID Design Principles',
      description: 'Slide notes describing Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion.',
      type: 'PDF',
      contentUrl: '/uploads/solid-principles.pdf'
    }
  });

  const matVideo = await prisma.material.create({
    data: {
      sectionId: module1.id,
      title: 'Video Guide: Separation of Concerns in MVC',
      description: 'Walkthrough video demonstrating model, view, controller interactions.',
      type: 'VIDEO_SRC',
      contentUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
    }
  });
  console.log('Added materials.');

  // 7. Create Quiz object
  console.log('Configuring interactive assessment quiz...');
  const questionsList = [
    {
      id: 'q1',
      type: 'multiple_choice',
      questionText: 'Which SOLID principle states that "software entities should be open for extension, but closed for modification"?',
      options: ['Single Responsibility Principle', 'Open-Closed Principle', 'Liskov Substitution Principle', 'Dependency Inversion Principle'],
      correctAnswer: 'Open-Closed Principle',
      points: 10
    },
    {
      id: 'q2',
      type: 'true_false',
      questionText: 'In the MVC architectural pattern, the view should directly handle database schema updates and query executions.',
      options: ['True', 'False'],
      correctAnswer: 'False',
      points: 10
    },
    {
      id: 'q3',
      type: 'multiple_choice',
      questionText: 'In Clean Architecture, which layer contains the application-specific business rules and use cases?',
      options: ['Entities Layer', 'Use Cases Layer', 'Interface Adapters Layer', 'Frameworks & Drivers Layer'],
      correctAnswer: 'Use Cases Layer',
      points: 10
    }
  ];

  const quiz = await prisma.quiz.create({
    data: {
      courseId: course.id,
      title: 'Module 1 Assessment: MVC & Clean Architecture',
      hasTimeLimit: true,
      timeLimitMinutes: 15,
      minPassMark: 60.0,
      attemptLimit: 2,
      questionsJson: questionsList
    }
  });

  // Link quiz to section materials
  const matQuiz = await prisma.material.create({
    data: {
      sectionId: module1.id,
      title: quiz.title,
      description: 'Graded quiz assessment to verify understanding of Module 1 concepts.',
      type: 'QUIZ',
      itemId: quiz.id,
      isGraded: true,
      gradingWeight: 15.0
    }
  });
  console.log(`Created Quiz and successfully linked to section materials (Material ID: ${matQuiz.id}).`);

  // 8. Simulate Student viewing materials
  console.log('Simulating student completions for materials...');
  await prisma.materialCompletion.createMany({
    data: [
      {
        studentId: student.id,
        materialId: matPdf.id
      },
      {
        studentId: student.id,
        materialId: matVideo.id
      }
    ]
  });
  console.log('Material completions registered.');

  // 9. Simulate Quiz Attempts
  console.log('Simulating student quiz attempts...');
  
  // Attempt 1: Failed attempt (started 1hr ago, submitted 50m ago)
  const attempt1 = await prisma.quizAttempt.create({
    data: {
      quizId: quiz.id,
      studentId: student.id,
      startedAt: new Date(Date.now() - 3600 * 1000),
      submittedAt: new Date(Date.now() - 3000 * 1000),
      submittedAnswersJson: {
        q1: 'Single Responsibility Principle', // Incorrect
        q2: 'True', // Incorrect
        q3: 'Entities Layer' // Incorrect
      },
      score: 0.0,
      teacherFeedback: 'You did not pass this attempt. Please review SOLID principles and MVC details before retaking the assessment.'
    }
  });
  console.log(`Seeded Attempt 1 (Score: ${attempt1.score}%, Status: Failed)`);

  // Attempt 2: Perfect score passing attempt (started 15m ago, submitted 5m ago)
  const attempt2 = await prisma.quizAttempt.create({
    data: {
      quizId: quiz.id,
      studentId: student.id,
      startedAt: new Date(Date.now() - 900 * 1000),
      submittedAt: new Date(Date.now() - 300 * 1000),
      submittedAnswersJson: {
        q1: 'Open-Closed Principle', // Correct
        q2: 'False', // Correct
        q3: 'Use Cases Layer' // Correct
      },
      score: 100.0,
      teacherFeedback: 'Outstanding job! You improved from a 0% to a 100% score. Keep up the great work.'
    }
  });
  console.log(`Seeded Attempt 2 (Score: ${attempt2.score}%, Status: Passed)`);

  console.log('--- Sample Seeding Complete! ---');
  console.log(`Teacher login: ${teacherEmail} / password123`);
  console.log(`Student login: ${studentEmail} / password123`);
}

main()
  .catch((e) => {
    console.error('Error seeding sample data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
