
const express = require("express");
const initializeDB = require("./database");

const app = express();

app.use(express.json());

const PORT = 3000;
let db;

// 1. GET all books + Search + Sort + Filter + Pagination
app.get("/books", async (req, res) => {
  try {
    const {
      search_q = "",
      order_by = "id",
      order = "ASC",
      limit = "10",
      offset = "0",
      min_price,
      max_price
    } = req.query;

    // Validate sorting columns and order
    const allowedColumns = [
      "id",
      "title",
      "author",
      "price",
      "pages"
    ];

    if (
      !allowedColumns.includes(order_by) ||
      typeof order !== "string" ||
      !["ASC", "DESC"].includes(order.toUpperCase())
    ) {
      return res.status(400).json({
        message: "Invalid sorting parameters"
      });
    }

    // Validate pagination
    const pageLimit = Number(limit);
    const pageOffset = Number(offset);

    if (
      !Number.isInteger(pageLimit) ||
      pageLimit <= 0 ||
      !Number.isInteger(pageOffset) ||
      pageOffset < 0
    ) {
      return res.status(400).json({
        message: "Invalid limit or offset"
      });
    }

    // Search books by title
    let sql = "SELECT * FROM book WHERE title LIKE ?";
    const params = [`%${search_q}%`];

    // Minimum price filter
    if (min_price !== undefined) {
      const min = Number(min_price);

      if (!Number.isFinite(min) || min < 0) {
        return res.status(400).json({
          message: "Invalid minimum price"
        });
      }

      sql += " AND price >= ?";
      params.push(min);
    }

    // Maximum price filter
    if (max_price !== undefined) {
      const max = Number(max_price);

      if (!Number.isFinite(max) || max < 0) {
        return res.status(400).json({
          message: "Invalid maximum price"
        });
      }

      sql += " AND price <= ?";
      params.push(max);
    }

    // Check minimum price is not greater than maximum price
    if (
      min_price !== undefined &&
      max_price !== undefined &&
      Number(min_price) > Number(max_price)
    ) {
      return res.status(400).json({
        message: "Minimum price cannot exceed maximum price"
      });
    }

    // Sorting
    sql += ` ORDER BY ${order_by} ${order.toUpperCase()}`;

    // Pagination
    sql += " LIMIT ? OFFSET ?";
    params.push(pageLimit, pageOffset);

    const books = await db.all(sql, params);

    res.status(200).json(books);

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// 2. GET book by ID
app.get("/books/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;

    // Validate book ID
    if (
      !Number.isInteger(Number(bookId)) ||
      Number(bookId) <= 0
    ) {
      return res.status(400).json({
        message: "Invalid book ID"
      });
    }

    const book = await db.get(
      "SELECT * FROM book WHERE id = ?",
      [bookId]
    );

    if (!book) {
      return res.status(404).json({
        message: "Book not found"
      });
    }

    res.status(200).json(book);

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// 3. POST - Add a new book
app.post("/books", async (req, res) => {
  try {
    const { title, author, price, pages } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof author !== "string" ||
      !author.trim() ||
      typeof price !== "number" ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(pages) ||
      pages <= 0
    ) {
      return res.status(400).json({
        message: "Valid title, author, price and pages are required"
      });
    }

    const result = await db.run(
      `INSERT INTO book (title, author, price, pages)
       VALUES (?, ?, ?, ?)`,
      [title.trim(), author.trim(), price, pages]
    );

    res.status(201).json({
      message: "Book added successfully",
      bookId: result.lastID
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// 4. PUT - Update book details
app.put("/books/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;

    // Validate book ID
    if (
      !Number.isInteger(Number(bookId)) ||
      Number(bookId) <= 0
    ) {
      return res.status(400).json({
        message: "Invalid book ID"
      });
    }

    const { title, author, price, pages } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof author !== "string" ||
      !author.trim() ||
      typeof price !== "number" ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(pages) ||
      pages <= 0
    ) {
      return res.status(400).json({
        message: "Valid title, author, price and pages are required"
      });
    }

    const result = await db.run(
      `UPDATE book
       SET title = ?, author = ?, price = ?, pages = ?
       WHERE id = ?`,
      [title.trim(), author.trim(), price, pages, bookId]
    );

    if (result.changes === 0) {
      return res.status(404).json({
        message: "Book not found"
      });
    }

    res.status(200).json({
      message: "Book updated successfully"
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// 5. DELETE - Delete a book
app.delete("/books/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;

    // Validate book ID
    if (
      !Number.isInteger(Number(bookId)) ||
      Number(bookId) <= 0
    ) {
      return res.status(400).json({
        message: "Invalid book ID"
      });
    }

    const result = await db.run(
      "DELETE FROM book WHERE id = ?",
      [bookId]
    );

    if (result.changes === 0) {
      return res.status(404).json({
        message: "Book not found"
      });
    }

    res.status(200).json({
      message: "Book deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Start server
const startServer = async () => {
  try {
    db = await initializeDB();

    app.listen(PORT, () => {
      console.log(
        `Server running at http://localhost:${PORT}`
      );
    });

  } catch (error) {
    console.log(error.message);
  }
};

startServer();
