process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app"); 
const db = require("../db"); 

beforeAll(async () => {
  await db.query(`CREATE TABLE IF NOT EXISTS books (
    isbn VARCHAR PRIMARY KEY,
    amazon_url VARCHAR,
    author VARCHAR NOT NULL,
    language VARCHAR NOT NULL,
    pages INTEGER,
    publisher VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    year INTEGER
  )`);
});

afterEach(async () => {
  await db.query("DELETE FROM books");
});

afterAll(async () => {
  await db.query("DROP TABLE books");
  await db.end();
});

describe("Books API", () => {
  describe("POST /books", () => {
    it("should create a new book with valid data", async () => {
      const response = await request(app)
        .post("/books")
        .send({
          isbn: "1234567890",
          amazon_url: "http://amazon.com/example-book",
          author: "John Doe",
          language: "English",
          pages: 300,
          publisher: "Example Publisher",
          title: "Example Book Title",
          year: 2023
        });
      
      expect(response.status).toBe(201);
      expect(response.body.book).toHaveProperty("isbn", "1234567890");
    });

    it("should return 400 for invalid input", async () => {
      const response = await request(app)
        .post("/books")
        .send({
          // Missing required fields
          author: "John Doe",
          title: "Example Book Title"
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("PUT /books/:isbn", () => {
    beforeEach(async () => {
      // Create a book to update
      await db.query(`
        INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year)
        VALUES ('1234567890', 'http://amazon.com/example-book', 'John Doe', 'English', 300, 'Example Publisher', 'Example Book Title', 2023)
      `);
    });

    it("should update the book with valid data", async () => {
      const response = await request(app)
        .put("/books/1234567890")
        .send({
          author: "Paulo Carrera",
          title: "The Hunger Games"
        });

      expect(response.status).toBe(200);
      expect(response.body.book).toHaveProperty("author", "Paulo Carrera");
      expect(response.body.book).toHaveProperty("title", "The Hunger Games");
    });

    it("should return 404 for non-existent book", async () => {
      const response = await request(app)
        .put("/books/nonexistent")
        .send({
          author: "Paulo Carrera",
          title: "The Hunger Games"
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });

    it("should return 400 for invalid input", async () => {
      const response = await request(app)
        .put("/books/1234567890")
        .send({
          // Invalid data (missing title)
          author: "Paulo Carrera"
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });
});
