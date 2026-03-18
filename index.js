const express = require("express");
const flibusta = require("flibusta-api");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 4444;

app.get("/", (req, res) => {
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

app.get("/api/download/:id", async (req, res) => {
  try {
    const { id: bookId } = req.params;
    const format = req.query.format || "epub";

    const bookInfo = await flibusta.getBookInfo(bookId);
    const title = bookInfo?.title || `book_${bookId}`;
    const safeTitle = title.replace(/[<>:"/\\|?*]/g, "_").slice(0, 100);

    const downloadUrl = flibusta.getUrl(bookId, format);

    const response = await axios({
      method: "get",
      url: downloadUrl,
      responseType: "stream",
    });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeTitle}.${format}"`,
    );
    res.setHeader("Content-Type", "application/octet-stream");

    response.data.pipe(res);
  } catch (e) {
    console.error("DOWNLOAD ERROR:", e.message);
    res.status(500).json({ error: "Download failed" });
  }
});

app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));
