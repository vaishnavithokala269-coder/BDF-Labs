
const express = require("express");
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = "./books-database.db";
let db = null;

app.get("/books/", async (request, response) => {
  try {
    const {
      search_q = "",
      order_by = "id",
      order = "ASC",
      limit = "10",
      offset = "0",
      min_price,
      max_price,
    } = request.query;

    const allowedColumns = ["id", "title", "author", "price", "pages"];

    if (!allowedColumns.includes(order_by)) {
      return response.status(400).json({
        message: "Invalid order_by value",
      });
    }

    const sortOrder = order.toUpperCase();

    if (!["ASC", "DESC"].includes(sortOrder)) {
      return response.status(400).json({
        message: "Order must be ASC or DESC",
      });
    }

    const pageLimit = Number(limit);
    const pageOffset = Number(offset);

    if (
      !Number.isInteger(pageLimit) ||
      !Number.isInteger(pageOffset) ||
      pageLimit <= 0 ||
      pageOffset < 0
    ) {
      return response.status(400).json({
        message: "Invalid limit or offset",
      });
    }

    const params = [`%${search_q}%`];
    let query = "SELECT * FROM book WHERE title LIKE ?";

    if (min_price !== undefined) {
      const minPrice = Number(min_price);

      if (!Number.isFinite(minPrice) || minPrice < 0) {
        return response.status(400).json({
          message: "Invalid minimum price",
        });
      }

      query += " AND price >= ?";
      params.push(minPrice);
    }

    if (max_price !== undefined) {
      const maxPrice = Number(max_price);

      if (!Number.isFinite(maxPrice) || maxPrice < 0) {
        return response.status(400).json({
          message: "Invalid maximum price",
        });
      }

      query += " AND price <= ?";
      params.push(maxPrice);
    }

    if (
      min_price !== undefined &&
      max_price !== undefined &&
      Number(min_price) > Number(max_price)
    ) {
      return response.status(400).json({
        message: "Minimum price cannot exceed maximum price",
      });
    }

    query += ` ORDER BY ${order_by} ${sortOrder} LIMIT ? OFFSET ?`;
    params.push(pageLimit, pageOffset);

    const books = await db.all(query, params);
    response.status(200).json(books);
  } catch (error) {
    response.status(500).json({
      message: "Internal server error",
    });
  }
});

app.get("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;

    if (!/^[1-9]\d*$/.test(bookId)) {
      return response.status(400).json({
        message: "Invalid book ID",
      });
    }

    const query = "SELECT * FROM book WHERE id = ?";
    const book = await db.get(query, [bookId]);

    if (!book) {
      return response.status(404).json({
        message: "Book not found",
      });
    }

    response.status(200).json(book);
  } catch (error) {
    response.status(500).json({
      message: "Internal server error",
    });
  }
});

app.post("/books/", async (request, response) => {
  try {
    const { title, author, price, pages } = request.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof author !== "string" ||
      !author.trim() ||
      price === undefined ||
      typeof price !== "number" ||
      !Number.isFinite(price) ||
      price < 0 ||
      pages === undefined ||
      !Number.isInteger(pages) ||
      pages <= 0
    ) {
      return response.status(400).json({
        message: "Provide valid title, author, numeric price and positive pages",
      });
    }

    const query = `
      INSERT INTO book (title, author, price, pages)
      VALUES (?, ?, ?, ?)
    `;

    const result = await db.run(query, [
      title.trim(),
      author.trim(),
      price,
      pages,
    ]);

    response.status(201).json({
      message: "Book added successfully",
      bookId: result.lastID,
    });
  } catch (error) {
    response.status(500).json({
      message: "Internal server error",
    });
  }
});

app.put("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;
    const { title, author, price, pages } = request.body;

    if (!/^[1-9]\d*$/.test(bookId)) {
      return response.status(400).json({
        message: "Invalid book ID",
      });
    }

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
      return response.status(400).json({
        message: "Provide valid title, author, numeric price and positive pages",
      });
    }

    const checkQuery = "SELECT * FROM book WHERE id = ?";
    const existingBook = await db.get(checkQuery, [bookId]);

    if (!existingBook) {
      return response.status(404).json({
        message: "Book not found",
      });
    }

    const updateQuery = `
      UPDATE book
      SET title = ?, author = ?, price = ?, pages = ?
      WHERE id = ?
    `;

    await db.run(updateQuery, [
      title.trim(),
      author.trim(),
      price,
      pages,
      bookId,
    ]);

    response.status(200).json({
      message: "Book updated successfully",
    });
  } catch (error) {
    response.status(500).json({
      message: "Internal server error",
    });
  }
});

app.delete("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;

    if (!/^[1-9]\d*$/.test(bookId)) {
      return response.status(400).json({
        message: "Invalid book ID",
      });
    }

    const checkQuery = "SELECT * FROM book WHERE id = ?";
    const existingBook = await db.get(checkQuery, [bookId]);

    if (!existingBook) {
      return response.status(404).json({
        message: "Book not found",
      });
    }

    const deleteQuery = "DELETE FROM book WHERE id = ?";
    await db.run(deleteQuery, [bookId]);

    response.status(200).json({
      message: "Book deleted successfully",
    });
  } catch (error) {
    response.status(500).json({
      message: "Internal server error",
    });
  }
});

const initializeDBAndServer = async () => {
  try {
    db = await sqlite.open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error("Database Error:", error.message);
    process.exit(1);
  }
};

initializeDBAndServer();
