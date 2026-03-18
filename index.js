const express = require("express");
const flibusta = require("flibusta-api");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 4444;

app.use(express.static(path.join(__dirname, "public")));

app.get("/api", (req, res) => {
  res.json({
    name: "Flibusta API",
    version: "1.0.0",
    endpoints: {
      search: {
        method: "GET",
        path: "/api/search",
        params: { name: "string (required) - book title or author to search" },
        example: "/api/search?name=lovecraft",
        response: "Array of books with id, title, author",
      },
      download: {
        method: "GET",
        path: "/api/download/:id",
        params: {
          id: "string (required) - book ID from search results",
          format: "string (optional) - epub, fb2, txt (default: epub)",
        },
        example: "/api/download/2085?format=epub",
        response: "File download",
      },
    },
  });
});

app.get("/api/search", async (req, res) => {
  try {
    const { name: query } = req.query;
    if (!query)
      return res.status(400).json({ error: "Query name is required" });

    console.log(`Searching for: ${query}...`);

    const books = await flibusta.searchBooks(query);

    if (!books || !books.length) return res.json([]);

    const result = books.map(({ id, title, author }) => ({
      id,
      title,
      author,
    }));

    res.json(result);
  } catch (e) {
    console.error("SEARCH ERROR:", e.message);
    res.status(500).json({ error: "Search failed", details: e.message });
  }
});

app.get("/api/book", async (req, res) => {
  try {
    const { name: query } = req.query;
    if (!query)
      return res.status(400).json({ error: "Query name is required" });

    const books = await flibusta.searchBooks(query);
    res.json(books || []);
  } catch (e) {
    console.error("BOOK SEARCH ERROR:", e.message);
    res.status(500).json({ error: "Book search failed", details: e.message });
  }
});

app.get("/api/author", async (req, res) => {
  try {
    const { name: query } = req.query;
    if (!query)
      return res.status(400).json({ error: "Author name is required" });

    const books = await flibusta.searchByAuthor(query);
    res.json(books || []);
  } catch (e) {
    console.error("AUTHOR SEARCH ERROR:", e.message);
    res.status(500).json({ error: "Author search failed", details: e.message });
  }
});

app.get("/api/download/:id", async (req, res) => {
  try {
    const { id: bookId } = req.params;
    const format = req.query.format || "epub";

    const downloadUrl = flibusta.getUrl(bookId, format);
    console.log(`Downloading: ${downloadUrl}`);

    const response = await axios({
      method: "get",
      url: downloadUrl,
      responseType: "arraybuffer",
      timeout: 30000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      maxRedirects: 5,
    });

    console.log(
      `Status: ${response.status}, Size: ${response.data.length} bytes`,
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="book_${bookId}.${format}"`,
    );
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Length", response.data.length);

    res.send(response.data);
  } catch (e) {
    console.error("DOWNLOAD ERROR:", e.message);
    if (e.response) console.error("Status:", e.response.status);
    res.status(500).json({ error: "Download failed", details: e.message });
  }
});

app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));
