import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from './db.js';
import Book from './models/Book.js';
import User from './models/User.js';
import UserBook from './models/UserBook.js';

const ADMIN_EMAIL = 'admin@library.com';
const ADMIN_PASSWORD = 'admin123';

const books = [
  // Fiction & general
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', description: 'A story of decadence and the American Dream.', category: 'Fiction', book_type: 'Novel', published_year: 1925, cover_url: 'https://covers.openlibrary.org/b/id/10613930-M.jpg' },
  { title: 'To Kill a Mockingbird', author: 'Harper Lee', description: 'Racial injustice in the American South.', category: 'Fiction', book_type: 'Novel', published_year: 1960, cover_url: 'https://covers.openlibrary.org/b/id/8305832-M.jpg' },
  { title: '1984', author: 'George Orwell', description: 'Dystopian totalitarian regime.', category: 'Fiction', book_type: 'Novel', published_year: 1949, cover_url: 'https://covers.openlibrary.org/b/id/7222246-M.jpg' },
  { title: 'Pride and Prejudice', author: 'Jane Austen', description: 'Romance and social commentary in Regency England.', category: 'Romance', book_type: 'Novel', published_year: 1813, cover_url: 'https://covers.openlibrary.org/b/id/13270442-M.jpg' },
  { title: 'The Hobbit', author: 'J.R.R. Tolkien', description: 'Bilbo Baggins and the quest for treasure.', category: 'Fantasy', book_type: 'Novel', published_year: 1937, cover_url: 'https://covers.openlibrary.org/b/id/6979862-M.jpg' },
  { title: 'Harry Potter and the Philosopher\'s Stone', author: 'J.K. Rowling', description: 'A young wizard discovers his destiny.', category: 'Fantasy', book_type: 'Novel', published_year: 1997, cover_url: 'https://covers.openlibrary.org/b/id/8267152-M.jpg' },
  { title: 'The Da Vinci Code', author: 'Dan Brown', description: 'Mystery thriller involving art and secret societies.', category: 'Thriller', book_type: 'Novel', published_year: 2003, cover_url: 'https://covers.openlibrary.org/b/id/104833-M.jpg' },
  { title: 'Sapiens', author: 'Yuval Noah Harari', description: 'A brief history of humankind.', category: 'History', book_type: 'Non-Fiction', published_year: 2011, cover_url: 'https://covers.openlibrary.org/b/id/10275134-M.jpg' },
  { title: 'Atomic Habits', author: 'James Clear', description: 'Tiny changes for remarkable results.', category: 'Self-Help', book_type: 'Non-Fiction', published_year: 2018, cover_url: 'https://covers.openlibrary.org/b/id/15229304-M.jpg' },
  { title: 'Deep Work', author: 'Cal Newport', description: 'Rules for focused success in a distracted world.', category: 'Self-Help', book_type: 'Non-Fiction', published_year: 2016, cover_url: 'https://covers.openlibrary.org/b/id/12882255-M.jpg' },
  { title: 'The Lean Startup', author: 'Eric Ries', description: 'How to build a sustainable business.', category: 'Business', book_type: 'Non-Fiction', published_year: 2011, cover_url: 'https://covers.openlibrary.org/b/id/12422954-M.jpg' },
  { title: 'Dune', author: 'Frank Herbert', description: 'Epic science fiction on the desert planet Arrakis.', category: 'Science Fiction', book_type: 'Novel', published_year: 1965, cover_url: 'https://covers.openlibrary.org/b/id/11525154-M.jpg' },
  { title: 'Project Hail Mary', author: 'Andy Weir', description: 'A lone astronaut must save Earth.', category: 'Science Fiction', book_type: 'Novel', published_year: 2021, cover_url: 'https://covers.openlibrary.org/b/id/12883462-M.jpg' },
  { title: 'Murder on the Orient Express', author: 'Agatha Christie', description: 'Classic detective mystery on a train.', category: 'Mystery', book_type: 'Novel', published_year: 1934, cover_url: 'https://covers.openlibrary.org/b/id/12883462-M.jpg' },
  { title: 'The Silent Patient', author: 'Alex Michaelides', description: 'A woman shoots her husband and never speaks again.', category: 'Thriller', book_type: 'Novel', published_year: 2019, cover_url: 'https://covers.openlibrary.org/b/id/12883462-M.jpg' },
  { title: 'Educated', author: 'Tara Westover', description: 'A memoir of survival and education.', category: 'Biography', book_type: 'Non-Fiction', published_year: 2018, cover_url: 'https://covers.openlibrary.org/b/id/12883462-M.jpg' },
  { title: 'The Midnight Library', author: 'Matt Haig', description: 'A library between life and death with infinite books.', category: 'Fiction', book_type: 'Novel', published_year: 2020, cover_url: 'https://covers.openlibrary.org/b/id/12883462-M.jpg' },
  { title: 'Where the Crawdads Sing', author: 'Delia Owens', description: 'Mystery and coming-of-age in the marshes.', category: 'Fiction', book_type: 'Novel', published_year: 2018, cover_url: 'https://covers.openlibrary.org/b/id/12883462-M.jpg' },
  // DevOps & SRE – category = topic, book_type = Technical/Programming/Development
  { title: 'The Phoenix Project', author: 'Gene Kim, Kevin Behr, George Spafford', description: 'A novel about IT, DevOps, and helping your business win.', category: 'DevOps', book_type: 'Technical', published_year: 2013, cover_url: 'https://covers.openlibrary.org/b/id/10992158-M.jpg' },
  { title: 'The DevOps Handbook', author: 'Gene Kim, Jez Humble, Patrick Debois, John Willis', description: 'World-class agility, reliability, and security in technology organizations.', category: 'DevOps', book_type: 'Technical', published_year: 2016, cover_url: 'https://covers.openlibrary.org/b/id/12883462-M.jpg' },
  { title: 'Accelerate', author: 'Nicole Forsgren, Jez Humble, Gene Kim', description: 'Building and scaling high performing technology organizations.', category: 'DevOps', book_type: 'Technical', published_year: 2018, cover_url: 'https://covers.openlibrary.org/b/id/12883462-M.jpg' },
  { title: 'Site Reliability Engineering', author: 'Betsy Beyer, Chris Jones, Jennifer Petoff, Niall Richard Murphy', description: 'How Google runs production systems. The definitive SRE guide.', category: 'SRE', book_type: 'Technical', published_year: 2016, cover_url: 'https://covers.openlibrary.org/b/id/12883462-M.jpg' },
  { title: 'The Site Reliability Workbook', author: 'Betsy Beyer, Niall Richard Murphy, David K. Rensin, Kent Kawahara, Stephen Thorne', description: 'Practical ways to implement SRE principles.', category: 'SRE', book_type: 'Technical', published_year: 2018, cover_url: 'https://covers.openlibrary.org/b/id/12883462-M.jpg' },
  { title: 'Continuous Delivery', author: 'Jez Humble, David Farley', description: 'Reliable software releases through build, test, and deployment automation.', category: 'CI/CD', book_type: 'Development', published_year: 2010, cover_url: 'https://covers.openlibrary.org/b/id/12883462-M.jpg' },
  { title: 'Docker Deep Dive', author: 'Nigel Poulton', description: 'Practical guide to containerization with Docker.', category: 'Docker', book_type: 'Technical', published_year: 2022, cover_url: 'https://covers.openlibrary.org/b/id/12883462-M.jpg' },
  { title: 'Kubernetes in Action', author: 'Marko Luksa', description: 'Complete guide to Kubernetes: deploying and managing containerized applications.', category: 'Kubernetes', book_type: 'Technical', published_year: 2017, cover_url: 'https://covers.openlibrary.org/b/id/12883462-M.jpg' },
  { title: 'Terraform: Up and Running', author: 'Yevgeniy Brikman', description: 'Infrastructure as code with HashiCorp Terraform. AWS, GCP, Azure.', category: 'Terraform', book_type: 'Technical', published_year: 2019, cover_url: 'https://covers.openlibrary.org/b/id/12883462-M.jpg' },
  { title: 'Ansible for DevOps', author: 'Jeff Geerling', description: 'Server and configuration management. Automate with Ansible playbooks.', category: 'DevOps', book_type: 'Technical', published_year: 2020, cover_url: 'https://covers.openlibrary.org/b/id/12883462-M.jpg' },
  { title: 'Release It!', author: 'Michael T. Nygard', description: 'Design and deploy production-ready software.', category: 'DevOps', book_type: 'Development', published_year: 2018, cover_url: 'https://covers.openlibrary.org/b/id/12883462-M.jpg' },
  { title: 'Building Microservices', author: 'Sam Newman', description: 'Designing fine-grained systems. Microservice architecture and deployment.', category: 'DevOps', book_type: 'Development', published_year: 2021, cover_url: 'https://covers.openlibrary.org/b/id/12883462-M.jpg' },
  { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', description: 'Reliable, scalable, and maintainable systems. Essential for platform engineers.', category: 'DevOps', book_type: 'Technical', published_year: 2017, cover_url: 'https://covers.openlibrary.org/b/id/12883462-M.jpg' },
  { title: 'The Unicorn Project', author: 'Gene Kim', description: 'A sequel to The Phoenix Project. Digital transformation and DevOps.', category: 'DevOps', book_type: 'Technical', published_year: 2019, cover_url: 'https://covers.openlibrary.org/b/id/12883462-M.jpg' },
  // Cloud: AWS, GCP, Azure
  { title: 'AWS Certified Solutions Architect Study Guide', author: 'Ben Piper', description: 'Prepare for the AWS Solutions Architect exam. Cloud architecture.', category: 'AWS', book_type: 'Technical', published_year: 2021, cover_url: 'https://covers.openlibrary.org/b/id/12883462-M.jpg' },
  { title: 'Google Cloud Certified Professional Cloud Architect', author: 'Dan Sullivan', description: 'Design and manage scalable, highly available solutions on GCP.', category: 'GCP', book_type: 'Technical', published_year: 2020, cover_url: 'https://covers.openlibrary.org/b/id/12883462-M.jpg' },
  { title: 'Microsoft Azure Fundamentals', author: 'Microsoft', description: 'Azure cloud services, security, and governance for beginners.', category: 'Azure', book_type: 'Technical', published_year: 2022, cover_url: 'https://covers.openlibrary.org/b/id/12883462-M.jpg' },
  // CI/CD, GitHub, Programming, Scripting
  { title: 'Jenkins: The Definitive Guide', author: 'John Ferguson Smart', description: 'Continuous integration and delivery with Jenkins.', category: 'CI/CD', book_type: 'Development', published_year: 2011, cover_url: 'https://covers.openlibrary.org/b/id/12883462-M.jpg' },
  { title: 'GitHub Actions in Action', author: 'Christopher Allen', description: 'Automate workflows with GitHub Actions. CI/CD and deployments.', category: 'GitHub', book_type: 'Development', published_year: 2022, cover_url: 'https://covers.openlibrary.org/b/id/12883462-M.jpg' },
  { title: 'Fluent Python', author: 'Luciano Ramalho', description: 'Clear, concise, and effective Python. Essential for scripting and automation.', category: 'Python', book_type: 'Programming', published_year: 2021, cover_url: 'https://covers.openlibrary.org/b/id/12883462-M.jpg' },
  { title: 'The Linux Command Line', author: 'William Shotts', description: 'A complete introduction to bash and the command line. Scripting.', category: 'Bash', book_type: 'Programming', published_year: 2019, cover_url: 'https://covers.openlibrary.org/b/id/12883462-M.jpg' },
  // AI & LLM (sample)
  { title: 'Deep Learning', author: 'Ian Goodfellow, Yoshua Bengio, Aaron Courville', description: 'Foundational textbook on deep learning and neural networks.', category: 'AI', book_type: 'Technical', published_year: 2016, cover_url: 'https://covers.openlibrary.org/b/id/12883462-M.jpg' },
  { title: 'Building LLM Apps', author: 'Various', description: 'Building applications with large language models and prompt engineering.', category: 'LLM', book_type: 'AI', published_year: 2024, cover_url: 'https://covers.openlibrary.org/b/id/12883462-M.jpg' },
];

async function seed() {
  await connectDB();
  await UserBook.deleteMany({});
  await Book.deleteMany({});
  await Book.insertMany(books);
  const adminHash = bcrypt.hashSync(ADMIN_PASSWORD, 10);
  const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
  if (!existingAdmin) {
    await User.create({
      email: ADMIN_EMAIL,
      password: adminHash,
      name: 'Admin',
      role: 'admin',
    });
    console.log(`Admin user created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  } else {
    existingAdmin.password = adminHash;
    existingAdmin.role = 'admin';
    existingAdmin.name = 'Admin';
    await existingAdmin.save();
    console.log(`Admin password reset: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  }
  console.log(`Seeded ${books.length} books (DevOps, Programming, AI/LLM, Fiction).`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
