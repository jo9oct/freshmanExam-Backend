
import { Views } from "../models/View.js";


// ---------------- Create a new view entry for a course ----------------
export const CreateView = async (req, res) => {
  const { TotalCourseView, TotalQuestionView, CourseCode } = req.body;

  try {
    // Try to get existing view document (there should be only one)
    let existingView = await Views.findOne();
    if (!existingView) {
      existingView = new Views(); // Create a new document if none exists
    }

    // Check if the course already exists in the CorseView array
    const courseExists = existingView.CorseView.some(
      (c) => c.CourseCode === CourseCode
    );

    if (!courseExists) {
      // If course doesn't exist, add it with initial counts
      existingView.CorseView.push({
        CourseCode,
        TotalCourseView: TotalCourseView ? 1 : 0,
        TotalQuestionView: TotalQuestionView ? 1 : 0,
      });

      await existingView.save();

      return res.status(201).json({
        success: true,
        message: "New course view added successfully",
        data: existingView,
      });
    } else {
      // If course already exists, suggest using updateView
      return res.status(409).json({
        success: false,
        message: "Course already exists. Use updateView to increment counts.",
      });
    }
  } catch (error) {
    console.error("Error in CreateView:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error in CreateView",
    });
  }
};

// ---------------- Update existing view counts ----------------
export const updateView = async (req, res) => {
  const {
    TotalView,
    TotalBlogView,
    TotalBlogReader,
    TotalCourseView,
    TotalQuestionView,
    CourseCode,
  } = req.body;

  try {
    // Get the existing view document
    const existingView = await Views.findOne();

    if (!existingView) {
      return res.status(404).json({
        success: false,
        message: "No existing view data to update",
      });
    }

    // Increment global counts if provided
    if (TotalView) existingView.TotalView += 1;
    if (TotalBlogView) existingView.TotalBlogView += 1;
    if (TotalBlogReader) existingView.TotalBlogReader += 1;

    // Update course-specific counts if provided
    const isTrue = TotalCourseView || TotalQuestionView;
    if (isTrue) {
      const courseIndex = existingView.CorseView.findIndex(
        (c) => c.CourseCode === CourseCode
      );

      if (courseIndex !== -1) {
        if (TotalCourseView)
          existingView.CorseView[courseIndex].TotalCourseView += 1;
        if (TotalQuestionView)
          existingView.CorseView[courseIndex].TotalQuestionView += 1;
      }
    }

    // Save updated view document
    await existingView.save();

    return res.status(200).json({
      success: true,
      message: "View(s) updated successfully",
      data: existingView,
    });
  } catch (error) {
    console.error("Error in updateView:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error in updateView",
    });
  }
};

// ---------------- Get current view data ----------------
export const GetView = async (req, res) => {
  try {
    const data = await Views.findOne();

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "There is no view data available",
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error in GetView:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error in GetView",
    });
  }
};
