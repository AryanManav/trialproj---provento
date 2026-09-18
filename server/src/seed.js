import bcrypt from 'bcryptjs';
import { prisma } from './services/prisma.js';

async function seed() {
  console.log('🌱 Starting database seed...');

  // Clean existing demo user if present
  const existingUser = await prisma.user.findUnique({
    where: { email: 'demo@codemaster.dev' },
  });

  if (existingUser) {
    console.log('Clearing old demo user data...');
    await prisma.user.delete({
      where: { id: existingUser.id },
    });
  }

  const passwordHash = await bcrypt.hash('password123', 10);
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@codemaster.dev',
      name: 'Demo Developer',
      passwordHash,
    },
  });

  console.log(`Created demo user: ${demoUser.email} (Password: password123)`);

  const demoProject = await prisma.project.create({
    data: {
      name: 'JavaScript Algorithms & Sandbox',
      description: 'Sample workspace with algorithms, utility functions, and config data',
      userId: demoUser.id,
      files: {
        create: [
          {
            name: 'main.js',
            language: 'javascript',
            content: `// ==========================================
// Welcome to Code Master!
// Press "Run Code" or Ctrl+Enter to execute.
// ==========================================

console.log("🚀 Starting Data Processing...");

const users = [
  { id: 1, name: "Alice", score: 92, active: true },
  { id: 2, name: "Bob", score: 78, active: false },
  { id: 3, name: "Charlie", score: 95, active: true },
  { id: 4, name: "Diana", score: 88, active: true }
];

// Calculate statistics
const activeUsers = users.filter(u => u.active);
const totalScore = activeUsers.reduce((sum, u) => sum + u.score, 0);
const averageScore = totalScore / activeUsers.length;

console.log("Active users count:", activeUsers.length);
console.log("Average active user score:", averageScore.toFixed(2));

// Quick sorting demo
const topPerformers = [...users].sort((a, b) => b.score - a.score);
console.log("Top Performer:", topPerformers[0].name, "with score", topPerformers[0].score);

console.log("✨ All tasks completed successfully!");
`,
          },
          {
            name: 'math_utils.js',
            language: 'javascript',
            content: `// Math Utility Functions
function isPrime(num) {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;
  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }
  return true;
}

const primesUnder30 = [];
for (let i = 1; i <= 30; i++) {
  if (isPrime(i)) primesUnder30.push(i);
}

console.log("Primes under 30:", primesUnder30);
`,
          },
          {
            name: 'app_config.json',
            language: 'json',
            content: `{\n  "appName": "Code Master Workspace",\n  "version": "1.0.0",\n  "theme": "vs-dark",\n  "settings": {\n    "autoSave": false,\n    "tabSize": 2,\n    "showLineNumbers": true\n  }\n}\n`,
          },
        ],
      },
    },
    include: { files: true },
  });

  console.log(`Created sample project: "${demoProject.name}" with ${demoProject.files.length} files.`);
  console.log('✅ Seeding finished successfully!');
}

seed()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
