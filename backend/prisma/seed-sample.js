import prisma from '../src/config/db.js';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('--- Reseeding Comprehensive ICT Sample Data ---');

  // 1. Clean up existing data in correct topological order
  console.log('Cleaning up previous database records...');
  await prisma.report.deleteMany();
  await prisma.forumPost.deleteMany();
  await prisma.forumThread.deleteMany();
  await prisma.forum.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.materialCompletion.deleteMany();
  await prisma.material.deleteMany();
  await prisma.courseSection.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();
  console.log('All previous database records cleaned up.');

  // 2. Hash Password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 3. Create Teachers
  console.log('Creating teachers...');
  const teacher1 = await prisma.user.create({
    data: {
      name: 'Prof. Damith Karunaratne',
      email: 'damith@uok.lk',
      password: hashedPassword,
      role: 'TEACHER'
    }
  });

  const teacher2 = await prisma.user.create({
    data: {
      name: 'Dr. Chaminda Jayawardena',
      email: 'chaminda@uok.lk',
      password: hashedPassword,
      role: 'TEACHER'
    }
  });

  const teacher3 = await prisma.user.create({
    data: {
      name: 'Ms. Priyantha Hewage',
      email: 'priyantha@uok.lk',
      password: hashedPassword,
      role: 'TEACHER'
    }
  });

  // 4. Create Students (5 unique student accounts)
  console.log('Creating students...');
  const students = [];
  const studentNames = [
    { name: 'Akash Geethanjana', email: 'akash@uok.lk' },
    { name: 'Divya Senarathne', email: 'divya@uok.lk' },
    { name: 'Thanuka Wickramasinghe', email: 'thanuka@uok.lk' },
    { name: 'Kaveesha Silva', email: 'kaveesha@uok.lk' },
    { name: 'Abishekan Rajadurai', email: 'abishekan@uok.lk' }
  ];

  for (const item of studentNames) {
    const s = await prisma.user.create({
      data: {
        name: item.name,
        email: item.email,
        password: hashedPassword,
        role: 'STUDENT'
      }
    });
    students.push(s);
  }

  // 5. Define ICT Courses data
  console.log('Creating courses, sections, and materials...');
  const coursesData = [
    {
      title: 'Introduction to Machine Learning',
      description: 'Foundational course in Machine Learning. Covers regression, classification, clustering, neural networks, and model evaluations with Python and Scikit-Learn.',
      teacherId: teacher1.id,
      sections: [
        { title: 'Section 1: ML Overview & Terminology', sortOrder: 1 },
        { title: 'Section 2: Supervised Learning & Linear Regression', sortOrder: 2 },
        { title: 'Section 3: Classification & Logistic Regression', sortOrder: 3 },
        { title: 'Section 4: Unsupervised Learning & Clustering', sortOrder: 4 },
        { title: 'Section 5: Model Evaluation & Performance Metrics', sortOrder: 5 }
      ]
    },
    {
      title: 'Modern Web Development',
      description: 'Full-stack modern web engineering using React, Node.js, Express, Postgres/Prisma, and modern styling libraries like TailwindCSS.',
      teacherId: teacher2.id,
      sections: [
        { title: 'Section 1: Modern JavaScript (ES6+) & DOM Basics', sortOrder: 1 },
        { title: 'Section 2: Introduction to React & Component Architecture', sortOrder: 2 },
        { title: 'Section 3: State Management & Client-Side Routing', sortOrder: 3 },
        { title: 'Section 4: RESTful API Integration & Fetching Data', sortOrder: 4 },
        { title: 'Section 5: CSS Frameworks & Responsive Design', sortOrder: 5 }
      ]
    },
    {
      title: 'Python Programming Essentials',
      description: 'Core concepts of Python programming language. Designed for absolute beginners, including script design, object-oriented concepts, and basic scripting libraries.',
      teacherId: teacher3.id,
      sections: [
        { title: 'Section 1: Syntax, Variables, & Operators', sortOrder: 1 },
        { title: 'Section 2: Flow Control (Conditionals & Loops)', sortOrder: 2 },
        { title: 'Section 3: Functions, Scope, & Modules', sortOrder: 3 },
        { title: 'Section 4: Advanced Collections (Lists, Dicts, Sets)', sortOrder: 4 },
        { title: 'Section 5: File I/O & Exception Handling', sortOrder: 5 }
      ]
    },
    {
      title: 'Software Architecture and Concepts',
      description: 'Comprehensive analysis of enterprise architectural patterns, SOLID principles, Clean Architecture, Domain-Driven Design, and microservices.',
      teacherId: teacher1.id,
      sections: [
        { title: 'Section 1: Introduction to Architectural Patterns', sortOrder: 1 },
        { title: 'Section 2: Object-Oriented Design & SOLID Principles', sortOrder: 2 },
        { title: 'Section 3: Domain-Driven Design Fundamentals', sortOrder: 3 },
        { title: 'Section 4: Layered & Clean Architectural Models', sortOrder: 4 },
        { title: 'Section 5: API Gateway & Microservices Architecture', sortOrder: 5 }
      ]
    },
    {
      title: 'Data Structures & Algorithms',
      description: 'Crucial algorithms and data structures. In-depth explanations of stacks, queues, trees, graphs, sorting, searching, and complexity analysis using Big O.',
      teacherId: teacher2.id,
      sections: [
        { title: 'Section 1: Complexity Analysis & Big O Notation', sortOrder: 1 },
        { title: 'Section 2: Stacks, Queues, & Linked Lists', sortOrder: 2 },
        { title: 'Section 3: Binary Trees, BSTs, & Heaps', sortOrder: 3 },
        { title: 'Section 4: Graph Representations & BFS/DFS', sortOrder: 4 },
        { title: 'Section 5: Sorting & Searching Algorithms', sortOrder: 5 }
      ]
    },
    {
      title: 'Cloud Computing Foundations',
      description: 'Introduction to public cloud vendors, infrastructure services, IAM policies, cloud security, serverless computing, and AWS foundations.',
      teacherId: teacher3.id,
      sections: [
        { title: 'Section 1: Introduction to Cloud Paradigms (IaaS/PaaS/SaaS)', sortOrder: 1 },
        { title: 'Section 2: Virtualization & Containerisation (Docker)', sortOrder: 2 },
        { title: 'Section 3: AWS Compute (EC2) & Storage (S3)', sortOrder: 3 },
        { title: 'Section 4: Cloud Networking (VPCs & Subnets)', sortOrder: 4 },
        { title: 'Section 5: Serverless Systems & AWS Lambda', sortOrder: 5 }
      ]
    }
  ];

  const courses = [];
  const materialsMap = {}; // courseId -> list of material ids

  for (const cData of coursesData) {
    const course = await prisma.course.create({
      data: {
        title: cData.title,
        description: cData.description,
        teacherId: cData.teacherId
      }
    });
    courses.push(course);
    materialsMap[course.id] = [];

    // Create Sections & Materials
    for (const secData of cData.sections) {
      const section = await prisma.courseSection.create({
        data: {
          courseId: course.id,
          title: secData.title,
          sortOrder: secData.sortOrder
        }
      });

      // Add 2 materials per section (1 PDF, 1 Video)
      const matPdf = await prisma.material.create({
        data: {
          sectionId: section.id,
          title: `Lecture Material for ${secData.title}`,
          description: `Detailed slide notes and references explaining topics covered in ${secData.title}.`,
          type: 'PDF',
          contentUrl: `/uploads/sample-lecture-${secData.sortOrder}.pdf`
        }
      });

      const matVideo = await prisma.material.create({
        data: {
          sectionId: section.id,
          title: `Core Concepts of ${secData.title}`,
          description: `Visual walkthrough and step-by-step guidance on ${secData.title}.`,
          type: 'VIDEO_SRC',
          contentUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
        }
      });

      materialsMap[course.id].push(matPdf.id, matVideo.id);
    }
  }

  // 6. Create Quizzes (2-4 quizzes per course)
  console.log('Generating quizzes and assignments...');
  const quizzesMap = {}; // courseId -> list of quiz objects

  const sampleQuestions = [
    {
      id: 'q1',
      type: 'multiple_choice',
      questionText: 'What is the main purpose of supervised learning?',
      options: ['To cluster unlabeled data', 'To predict output labels using input features', 'To generate synthetic images', 'None of the above'],
      correctAnswer: 'To predict output labels using input features',
      points: 10
    },
    {
      id: 'q2',
      type: 'true_false',
      questionText: 'SOLID design principles apply exclusively to relational databases.',
      options: ['True', 'False'],
      correctAnswer: 'False',
      points: 10
    },
    {
      id: 'q3',
      type: 'multiple_choice',
      questionText: 'In React, which hook is used to perform side effects in components?',
      options: ['useState', 'useContext', 'useEffect', 'useMemo'],
      correctAnswer: 'useEffect',
      points: 10
    }
  ];

  for (const course of courses) {
    quizzesMap[course.id] = [];
    const numQuizzes = Math.floor(Math.random() * 3) + 2; // 2 to 4 quizzes

    const sections = await prisma.courseSection.findMany({
      where: { courseId: course.id },
      orderBy: { sortOrder: 'asc' }
    });

    for (let i = 1; i <= numQuizzes; i++) {
      const quiz = await prisma.quiz.create({
        data: {
          courseId: course.id,
          title: `Quiz ${i}: Module Assessment`,
          hasTimeLimit: true,
          timeLimitMinutes: 10,
          minPassMark: 50.0,
          attemptLimit: 3,
          questionsJson: sampleQuestions
        }
      });
      quizzesMap[course.id].push(quiz);

      // Create matching Material of type QUIZ
      await prisma.material.create({
        data: {
          sectionId: sections[(i - 1) % sections.length].id,
          title: quiz.title,
          type: 'QUIZ',
          itemId: quiz.id,
          isGraded: true,
          gradingWeight: 10.0
        }
      });
    }
  }

  // 7. Create Assignments (1-2 assignments per course)
  const assignmentsMap = {}; // courseId -> list of assignment objects

  for (const course of courses) {
    assignmentsMap[course.id] = [];
    const numAssignments = Math.floor(Math.random() * 2) + 1; // 1 to 2 assignments

    const sections = await prisma.courseSection.findMany({
      where: { courseId: course.id },
      orderBy: { sortOrder: 'asc' }
    });

    for (let i = 1; i <= numAssignments; i++) {
      const assignment = await prisma.assignment.create({
        data: {
          courseId: course.id,
          teacherId: course.teacherId,
          title: `Assignment ${i}: Project Submission`,
          description: `Submit your practical implementation file here. Document all design choices, code blocks, and output results.`,
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days from now
          totalMarks: 100
        }
      });
      assignmentsMap[course.id].push(assignment);

      // Create matching Material of type ASSIGNMENT
      await prisma.material.create({
        data: {
          sectionId: sections[(sections.length - i) % sections.length].id,
          title: assignment.title,
          type: 'ASSIGNMENT',
          itemId: assignment.id,
          isGraded: true,
          gradingWeight: 20.0
        }
      });
    }
  }

  // 8. Completed sections & courses setup (Starts completely clean as requested)
  console.log('Clean student state initialized (no pre-enrollments or attempts).');

  // 9. Forums, Announcement Threads, and Discussion Threads
  console.log('Seeding discussion forums and threads...');

  for (const course of courses) {
    // Create Forum linked to course
    const forum = await prisma.forum.create({
      data: {
        courseId: course.id,
        name: `Course Forums: ${course.title}`,
        description: `Central hub for all discussions related to ${course.title}.`,
        createdBy: course.teacherId
      }
    });

    // Create Announcement Thread (Pinned)
    const announcementThread = await prisma.forumThread.create({
      data: {
        forumId: forum.id,
        title: '📢 IMPORTANT: Welcome & Course Announcements',
        createdBy: course.teacherId,
        isPinned: true,
        views: 25
      }
    });

    // Add OP to announcement thread
    await prisma.forumPost.create({
      data: {
        threadId: announcementThread.id,
        content: `Welcome to ${course.title}! Please ensure you check here weekly for any updates regarding lecture videos, assignments, and test schedules.\n\nBest regards,\nCourse Instructor.`,
        createdBy: course.teacherId
      }
    });

    // Create a general topic thread
    const discussionThread = await prisma.forumThread.create({
      data: {
        forumId: forum.id,
        title: '❓ General Q&A / Ask Questions Here',
        createdBy: students[0].id,
        views: 12
      }
    });

    // Add initial post to Q&A
    const questionPost = await prisma.forumPost.create({
      data: {
        threadId: discussionThread.id,
        content: 'Hi everyone! What are the best external resources (e.g. YouTube channels or documentations) to read for this module?',
        createdBy: students[0].id
      }
    });

    // Add reply to Q&A from teacher
    await prisma.forumPost.create({
      data: {
        threadId: discussionThread.id,
        parentPostId: questionPost.id,
        content: 'I highly recommend reviewing the official documentation links I uploaded in Section 1. They are accurate and thoroughly detailed!',
        createdBy: course.teacherId
      }
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
