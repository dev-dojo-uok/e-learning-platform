import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to run prisma seed in production.');
  }

  console.log('Start seeding database...');
  // 1. Create a Teacher
  const teacherEmail = 'teacher@test.com';
  const hashedPassword = await bcrypt.hash('password123', 10);

  let teacher = await prisma.user.findUnique({
    where: { email: teacherEmail }
  });

  if (!teacher) {
    teacher = await prisma.user.create({
      data: {
        name: 'Teacher Test',
        email: teacherEmail,
        password: hashedPassword,
        role: 'TEACHER',
      }
    });
    console.log(`Created teacher: ${teacher.name} (${teacher.email})`);
  } else {
    console.log(`Teacher already exists: ${teacher.name} (${teacher.email})`);
  }

  const courses = await prisma.course.findMany({})
  let course;

  if (courses.length > 0) {
    console.log(`Courses already exist: ${courses.length} courses found.`);
    course = courses[0];
  }
  else {
    course = await prisma.course.create({
      data: {
        title: 'Introduction to Software Architecture',
        description: 'Learn the fundamental concepts of software architecture, design patterns, clean layouts, and architectural styles.',
        teacherId: teacher.id,
        sections: {
          create: [
            {
              title: 'Week 1: Fundamentals of Software Architecture',
              sortOrder: 1,
              materials: {
                create: [
                  {
                    title: 'Architectural Style Overview PDF',
                    description: 'A comprehensive slide deck summarizing monolithic, microservices, and event-driven architectures.',
                    type: 'PDF',
                    contentUrl: 'https://example.com/materials/week1-styles.pdf',
                    isGraded: false
                  },
                  {
                    title: 'Introduction to Software Architecture Video',
                    description: 'An overview video introduction to software architecture concepts.',
                    type: 'VIDEO_SRC',
                    contentUrl: 'https://example.com/videos/intro-arch.mp4',
                    isGraded: false
                  }
                ]
              }
            },
            {
              title: 'Week 2: Clean Architecture & Monoliths',
              sortOrder: 2,
              materials: {
                create: [
                  {
                    title: 'Clean Architecture Principles Document',
                    description: 'A supplementary word document detailing dependencies and entity layers.',
                    type: 'FILE',
                    contentUrl: 'https://example.com/materials/week2-clean-arch.docx',
                    isGraded: true,
                    gradingWeight: 10.0
                  },
                  {
                    title: 'Design Principles & Solid (Embedded)',
                    description: 'An embedded video lecture on SOLID principles and design patterns.',
                    type: 'VIDEO_EMBED',
                    embedCode: '<iframe src="https://www.youtube.com/embed/t86t3KDG5ds" width="560" height="315" frameborder="0"></iframe>',
                    isGraded: false
                  }
                ]
              }
            }
          ]
        }
      }
    });

    console.log(`Seeded Course: ${course.title} with 2 sections and 4 materials.`);
  }

  // 2. Create a Course


  // 3. Create a Student
  const studentEmail = 'student@test.com';
  let student = await prisma.user.findUnique({
    where: { email: studentEmail }
  });

  if (!student) {
    student = await prisma.user.create({
      data: {
        name: 'Student Test',
        email: studentEmail,
        password: hashedPassword,
        role: 'STUDENT',
      }
    });
    console.log(`Created student: ${student.name} (${student.email})`);
  } else {
    console.log(`Student already exists: ${student.name} (${student.email})`);
  }

  // Get one material from the course we just created to complete
  const firstMaterial = await prisma.material.findFirst({
    where: { section: { courseId: course.id } },
    orderBy: { createdAt: 'asc' }
  });

  const firstMaterialComplete = await prisma.materialCompletion.findFirst({
    where: {
      studentId: student.id,
      materialId: firstMaterial.id
    }
  })

  if (firstMaterialComplete) {
    console.log(`Material completion already exists: Student "${student.name}" completed material "${firstMaterial.title}"`);
  } else {
    if (!firstMaterialComplete) {
    // Create material completion record
    await prisma.materialCompletion.upsert({
      where: {
        studentId_materialId: {
          studentId: student.id,
          materialId: firstMaterial.id
        }
      },
      update: {},
      create: {
        studentId: student.id,
        materialId: firstMaterial.id
      }
    });
    console.log(`Created completion record: Student "${student.name}" completed material "${firstMaterial.title}"`);
  }
  }

  // 4. Create Enrollments
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' }
  });
  const allCourses = await prisma.course.findMany({});

  if (students.length > 0 && allCourses.length > 0) {
    const enrollmentData = [];
    for (const s of students) {
      for (const c of allCourses) {
        enrollmentData.push({
          studentId: s.id,
          courseId: c.id,
        });
      }
    }

    const createdEnrollments = await prisma.enrollment.createMany({
      data: enrollmentData,
      skipDuplicates: true,
    });
    console.log(`Created ${createdEnrollments.count} enrollment records.`);
  }

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
