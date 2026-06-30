import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding forums...');

  // Retrieve an existing user to act as the creator
  const user = await prisma.user.findFirst();
  if (!user) {
    throw new Error('No users found in the database. Please run the main seed script first.');
  }

  // Retrieve an existing course to associate the forum with
  const course = await prisma.course.findFirst();
  if (!course) {
    throw new Error('No courses found in the database. Please run the main seed script first.');
  }

  // Retrieve an optional course section (module)
  const section = await prisma.courseSection.findFirst({
    where: { courseId: course.id }
  });

  // 1. Create 1 Forum
  const forum = await prisma.forum.create({
    data: {
      name: 'General Web Development Discussion',
      description: 'Discuss HTML, CSS, JavaScript and frameworks',
      courseId: course.id,
      moduleId: section ? section.id : null,
      createdBy: user.id,
    }
  });
  console.log(`Created Forum: "${forum.name}" (ID: ${forum.id})`);

  // 2. Create 3 ForumThreads inside the forum
  const thread1 = await prisma.forumThread.create({
    data: {
      forumId: forum.id,
      title: 'What is Flexbox and how does it work?',
      createdBy: user.id,
      isPinned: true,
      views: 42,
    }
  });

  const thread2 = await prisma.forumThread.create({
    data: {
      forumId: forum.id,
      title: 'Difference between Grid and Flexbox',
      createdBy: user.id,
      views: 18,
    }
  });

  const thread3 = await prisma.forumThread.create({
    data: {
      forumId: forum.id,
      title: 'Best way to learn React',
      createdBy: user.id,
      views: 29,
    }
  });
  console.log('Created 3 threads.');

  // 3. Create ForumPosts (Replies)
  
  // Thread 1 Replies: What is Flexbox?
  const post1_1 = await prisma.forumPost.create({
    data: {
      threadId: thread1.id,
      content: 'CSS Flexible Box Layout, commonly known as Flexbox, is a 1-dimensional layout model. It makes it easy to align items and distribute space within a container, even when their size is unknown or dynamic.',
      createdBy: user.id,
    }
  });

  const post1_2 = await prisma.forumPost.create({
    data: {
      threadId: thread1.id,
      parentPostId: post1_1.id, // Nested reply
      content: 'Thanks for the explanation! Should I always use flex-direction: row, or is column common too?',
      createdBy: user.id,
    }
  });

  await prisma.forumPost.create({
    data: {
      threadId: thread1.id,
      parentPostId: post1_2.id, // Deep nested reply
      content: 'Both are extremely common! Use row for horizontal layouts (like navbars) and column for vertical layouts (like form fields or sidebar widgets).',
      createdBy: user.id,
    }
  });

  // Thread 2 Replies: Grid vs Flexbox
  await prisma.forumPost.create({
    data: {
      threadId: thread2.id,
      content: 'The main difference is that Flexbox is one-dimensional (deals with either columns or rows at a time), while CSS Grid is two-dimensional (deals with both columns and rows simultaneously).',
      createdBy: user.id,
    }
  });

  await prisma.forumPost.create({
    data: {
      threadId: thread2.id,
      content: 'Exactly. A good rule of thumb is: use Grid for the overall page layout, and Flexbox for aligning elements inside grid items or small components.',
      createdBy: user.id,
    }
  });

  // Thread 3 Replies: Best way to learn React
  await prisma.forumPost.create({
    data: {
      threadId: thread3.id,
      content: 'I highly recommend starting with the official React documentation (react.dev). It has been completely rewritten and features excellent interactive tutorials.',
      createdBy: user.id,
    }
  });

  await prisma.forumPost.create({
    data: {
      threadId: thread3.id,
      content: 'Also, make sure you have a solid grasp of JavaScript ES6+ features like destructuring, arrow functions, and array methods (map, filter, reduce) before diving in.',
      createdBy: user.id,
    }
  });

  console.log('Created replies for all threads.');
  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
