const express = require("express");
const mongoose = require("mongoose");
const Book = require("../models/Book");

const router = express.Router();

router.post("/", async (req, res) => {
  const { title, author, category } = req.body;

  if (typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ message: "Title is required" });
  }
  if (typeof author !== "string" || typeof category !== "string") {
    return res.status(400).json({ message: "Author and category are required" });
  }

  try {
    const book = new Book({ title, author, category });

    await book.save();
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: "Could not add book" });
  }
});


router.get("/", async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  try {
    const books = await Book.find()
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await Book.countDocuments();

    res.json({ books, page, total });
  } catch (error) {
    res.status(500).json({ message: "Could not get books" });
  }
});


router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { available } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid book ID" });
  }
  if (typeof available !== "boolean") {
    return res.status(400).json({ message: "Availability must be true or false" });
  }

  try {
    const book = await Book.findByIdAndUpdate(
      id,
      { available },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: "Could not update book" });
  }
});

module.exports = router;
