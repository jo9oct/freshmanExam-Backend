
import {Courses} from "../models/Course.js"
import mongoose from "mongoose";


// Get all courses (sorted by newest first)
export const GetCourses = async (req, res) => {
  try {
    // Fetch all courses and sort by creation date (descending)
    const course = await Courses.find({}).sort({ createdAt: -1 });

    res.status(200).json(course);
  } catch (error) {
    console.error("Error in fetching course:", error.message);
    res.status(404).json({
      success: false,
      message: "Course Not Found",
    });
  }
};

// Create a new course
export const CreateCourses = async (req, res) => {
  const courseData = req.body;

  // Validate required fields
  if (
    !courseData.CourseIcon ||
    !courseData.CourseCode ||
    !courseData.CourseTitle ||
    !courseData.CourseDescription ||
    !courseData.TotalChapter
  ) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields",
    });
  }

  try {
    // Check if CourseCode already exists
    const existingCourse = await Courses.findOne({ CourseCode: courseData.CourseCode });

    if (existingCourse) {
      return res.status(409).json({
        success: false,
        message: "Course Code already exists",
      });
    }

    // Create new course
    const newCourse = new Courses(courseData);
    await newCourse.save();

    res.status(201).json({
      success: true,
      message: newCourse,
    });
  } catch (error) {
    console.error("Error in creating course:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Update a course by ID
export const UpdateCourses = async (req, res) => {
  const id = req.params.id;
  const course = req.body;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Invalid Course ID" });
  }

  try {
    // Update course and return new document
    const updateData = await Courses.findByIdAndUpdate(id, course, { new: true });

    if (!updateData) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Save after update (ensures hooks/middleware run)
    await updateData.save();

    res.status(200).json({
      success: true,
      data: updateData,
    });
  } catch (error) {
    console.error("Error in updating course:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Delete a course by ID
export const DeleteCourses = async (req, res) => {
  const id = req.params.id;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Invalid Course ID" });
  }

  try {
    // Delete course
    const deletedCourse = await Courses.findByIdAndDelete(id);

    if (!deletedCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Course Deleted",
    });
  } catch (error) {
    console.error("Error in deleting course:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
