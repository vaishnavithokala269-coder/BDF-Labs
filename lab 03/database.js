
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

const dbPath = path.join(__dirname, "books.db");

const initializeDB = async () => {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS book (
      id INTEGER PRIMARY KEY,
      title TEXT,
      author TEXT,
      price INTEGER,
      pages INTEGER
    );
  `);

  return db;
  
await db.run(`
  INSERT INTO book (title, author, price, pages)
  SELECT 'Wings of Fire', 'A.P.J. Abdul Kalam', 250, 180
  WHERE NOT EXISTS (SELECT 1 FROM book);

  INSERT INTO book (title, author, price, pages)
  VALUES
  ('The Alchemist', 'Paulo Coelho', 300, 208),
  ('Atomic Habits', 'James Clear', 450, 320),
  ('Rich Dad Poor Dad', 'Robert Kiyosaki', 350, 336),
  ('Harry Potter', 'J.K. Rowling', 500, 400),
  ('The Hobbit', 'J.R.R. Tolkien', 400, 310),
  ('Ikigai', 'Hector Garcia', 280, 194),
  ('Think Like a Monk', 'Jay Shetty', 320, 288),
  ('The Power of Now', 'Eckhart Tolle', 290, 236),
  ('Deep Work', 'Cal Newport', 380, 296);
`);

};

module.exports = initializeDB;
