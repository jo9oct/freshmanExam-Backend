

import { Questions } from "../models/Question.js";
import mongoose from "mongoose";

// Utility function to generate a unique 6-digit numeric ID for each question
const generateNumericId = async () => {
  let newId;
  let exists = true;

  while (exists) {
    newId = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit random number
    exists = await Questions.findOne({ "Questions.id": newId }); // Check if it already exists in DB
  }
  return newId;
};

// ---------------- Get All Questions ----------------
export const GetQuestions = async (req,res) => {
  try {
    const Question = await Questions.find({}); // Fetch all questions

    // Sort each course's questions by QuestionNumber
    const sortedQuestion = Question.map(course => {
      course.Questions.sort((a, b) => a.QuestionNumber - b.QuestionNumber);
      return course;
    });

    res.status(200).json(sortedQuestion);
  } catch(error) {
    console.error("Error in fetching Question" , error.message);
    res.status(404).json({
      success: false,
      message: "Question Not Found",
    });
  }
}

// ---------------- Create Questions ----------------
export const CreateQuestions = async (req, res) => {
  const QuestionData = req.body;
  
  // Validate required fields
  if (
    !QuestionData.CourseCode ||
    !Number.isInteger(QuestionData.CourseChapter) ||
    !Array.isArray(QuestionData.Questions) ||
    QuestionData.Questions.length === 0
  ) {
    return res.status(400).json({
      success: false,
      message: "CourseCode, CourseChapter and at least one Question are required",
    });
  }
 
  // Validate each individual question
  const invalidQuestion = QuestionData.Questions.find(ch => {
    return (
      !ch.question ||
      !Array.isArray(ch.options) || ch.options.length === 0 ||
      !ch.correctAnswer ||
      !ch.explanation ||
      ch.allowedTime === undefined || ch.allowedTime === null
    );
  });

  if (invalidQuestion) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields in each question",
    });
  }

  try {
    const seenIds = new Set();

    // Ensure each question has a unique ID
    for (let q of QuestionData.Questions) {
      while (
        !q.id ||                        // No ID
        seenIds.has(q.id) ||            // Already exists in local set
        await Questions.findOne({ "Questions.id": q.id }) // Already exists in DB
      ) {
        q.id = await generateNumericId();
      }
      seenIds.add(q.id);
    }
    
    // Check if course chapter already exists
    const existingCourse = await Questions.findOne({
      CourseCode: QuestionData.CourseCode,
      CourseChapter: QuestionData.CourseChapter,
    });

    if (existingCourse) {
      // Add new questions to existing course chapter
      existingCourse.Questions.push(...QuestionData.Questions);
      await existingCourse.save();

      return res.status(200).json({
        success: true,
        message: "Questions added to existing course chapter",
        data: existingCourse,
      });
    } else {
      // Create new chapter document
      const newChapterDoc = new Questions(QuestionData);
      await newChapterDoc.save();

      return res.status(201).json({
        success: true,
        message: "Added new chapter to existing course code",
        data: newChapterDoc,
      });
    }
    
  } catch (error) {
    console.error("Error in creating Question:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ---------------- Update Question ----------------
export const UpdateQuestions = async (req, res) => {
  const QuestionId = req.params.id;
  const updatedQuestion = req.body;

  // Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(QuestionId)) {
    return res.status(400).json({ success: false, message: "Invalid Question ID" });
  }

  try {
    // Update question inside nested array (Questions.$)
    const result = await Questions.findOneAndUpdate(
      { "Questions._id": QuestionId },
      {
        $set: {
          "Questions.$.question": updatedQuestion.question,
          "Questions.$.options": updatedQuestion.options,
          "Questions.$.correctAnswer": updatedQuestion.correctAnswer,
          "Questions.$.explanation": updatedQuestion.explanation,
          "Questions.$.allowedTime": updatedQuestion.allowedTime,
        },
      },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error in updating Question:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ---------------- Delete Question ----------------
export const DeleteQuestions = async (req, res) => {
  const QuestionId = req.params.id;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(QuestionId)) {
    return res.status(400).json({ success: false, message: "Invalid Question ID" });
  }

  try {
    // Remove question from nested array using $pull
    const result = await Questions.findOneAndUpdate(
      { "Questions._id": QuestionId },
      { $pull: { Questions: { _id: QuestionId } } },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }

    res.status(200).json({ success: true, message: "Question deleted", data: result });
  } catch (error) {
    console.error("Error deleting Question:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
