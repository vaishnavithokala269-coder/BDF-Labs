
const initializeDB = require("./database");

const addBooks = async () => {
  const db = await initializeDB();

  const books = [
    ["Wings of Fire", "A.P.J. Abdul Kalam", 250, 180],
    ["The Alchemist", "Paulo Coelho", 300, 208],
    ["Harry Potter", "J.K. Rowling", 400, 350],
    ["The Hobbit", "J.R.R. Tolkien", 350, 310],
    ["Atomic Habits", "James Clear", 450, 320],
    ["Ikigai", "Hector Garcia", 280, 200],
    ["Rich Dad Poor Dad", "Robert Kiyosaki", 320, 250],
    ["The Power of Now", "Eckhart Tolle", 290, 220]
  ];

  try {
    const result = await db.get(
      "SELECT COUNT(*) AS count FROM book"
    );

    if (result.count === 0) {
      for (const book of books) {
        await db.run(
          `INSERT INTO book (title, author, price, pages)
           VALUES (?, ?, ?, ?)`,
          book
        );
      }
    }

    console.log("Books added successfully!");
  } catch (error) {
    console.log(error.message);
  } finally {
    await db.close();
  }
};

addBooks();
