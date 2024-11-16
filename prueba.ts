import prisma from './src/services/prisma';

const testUpload = async () => {
  try {
    const user = await prisma.user.create({
      data: {
        email: 'matiDwon@example.com',
        name: 'matiDwon',
      },
    });
    console.log('User created:', user);
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
};

testUpload();