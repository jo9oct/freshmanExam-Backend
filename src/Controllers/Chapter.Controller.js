
import {Chapters} from "../models/Chapter.js"
import mongoose from "mongoose";


// Get all chapters (sorted by ChapterNumber inside each course)
export const GetChapters = async (req, res) => {
  try {
    // Fetch all courses with chapters
    const Chapter = await Chapters.find({});

    // Sort chapters inside each course by ChapterNumber
    const sortedChapter = Chapter.map(course => {
      course.Chapters.sort((a, b) => a.ChapterNumber - b.ChapterNumber);
      return course;
    });

    res.status(200).json(sortedChapter);
  } catch (error) {
    console.error("Error in fetching Chapter:", error.message);
    res.status(404).json({
      success: false,
      message: "Chapter Not Found",
    });
  }
};

// Create new chapters or add to an existing course
export const CreateChapters = async (req, res) => {
  const chapterData = req.body;

  // Validate courseCode and chapters array
  if (
    !chapterData.CourseCode ||
    !Array.isArray(chapterData.Chapters) ||
    chapterData.Chapters.length === 0
  ) {
    return res.status(400).json({
      success: false,
      message: "CourseCode and at least one Chapter are required",
    });
  }

  // Check if any chapter is missing required fields
  const invalidChapter = chapterData.Chapters.find(
    (ch) =>
      !ch.ChapterNumber || !ch.ChapterTitle || !ch.ChapterDescription
  );

  if (invalidChapter) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields",
    });
  }

  try {
    // Check if course already exists
    let existingCourse = await Chapters.findOne({ CourseCode: chapterData.CourseCode });

    if (existingCourse) {
      // Collect chapter numbers from existing course and new chapters
      const existingNumbers = existingCourse.Chapters.map(ch => ch.ChapterNumber);
      const newNumbers = chapterData.Chapters.map(ch => ch.ChapterNumber);

      // Find duplicates
      const duplicateNumbers = newNumbers.filter(num => existingNumbers.includes(num));

      if (duplicateNumbers.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Course chapter(s) already exist: ${duplicateNumbers.join(", ")}`,
        });
      }

      // Add new chapters to existing course
      existingCourse.Chapters.push(...chapterData.Chapters);
      await existingCourse.save();

      return res.status(200).json({
        success: true,
        message: "Chapters added to existing course",
        data: existingCourse,
      });
    } else {
      // If no course found, create a new one
      const newCourse = new Chapters(chapterData);
      await newCourse.save();

      return res.status(201).json({
        success: true,
        message: "New course with chapters created",
        data: newCourse,
      });
    }
  } catch (error) {
    console.error("Error in creating Chapter:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Update a specific chapter by ID
export const UpdateChapters = async (req, res) => {
  const chapterId = req.params.id;
  const updatedChapter = req.body;

  // Validate chapter ID
  if (!mongoose.Types.ObjectId.isValid(chapterId)) {
    return res.status(400).json({ success: false, message: "Invalid Chapter ID" });
  }

  try {
    // Update the specific chapter inside the Chapters array
    const result = await Chapters.findOneAndUpdate(
      { "Chapters._id": chapterId },
      {
        $set: {
          "Chapters.$.ChapterNumber": updatedChapter.ChapterNumber,
          "Chapters.$.ChapterTitle": updatedChapter.ChapterTitle,
          "Chapters.$.ChapterDescription": updatedChapter.ChapterDescription,
        },
      },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ success: false, message: "Chapter not found" });
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error in updating Chapter:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Delete a specific chapter by ID
export const DeleteChapters = async (req, res) => {
  const chapterId = req.params.id;

  // Validate chapter ID
  if (!mongoose.Types.ObjectId.isValid(chapterId)) {
    return res.status(400).json({ success: false, message: "Invalid Chapter ID" });
  }

  try {
    // Pull chapter from the course's Chapters array
    const result = await Chapters.findOneAndUpdate(
      { "Chapters._id": chapterId },
      { $pull: { Chapters: { _id: chapterId } } },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ success: false, message: "Chapter not found" });
    }

    res.status(200).json({
      success: true,
      message: "Chapter deleted",
      data: result,
    });
  } catch (error) {
    console.error("Error deleting chapter:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
