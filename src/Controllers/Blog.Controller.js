

import {Blogs} from "../models/Blog.js"
import mongoose from "mongoose";


// Get all blogs (sorted by newest first)
export const GetBlogs = async (req, res) => {
  try {
    // Fetch all blogs from DB, sort by createdAt descending
    const Blog = await Blogs.find({}).sort({ createdAt: -1 });

    res.status(200).json(Blog);
  } catch (error) {
    console.error("Error in fetching Blog:", error.message);
    res.status(404).json({
      success: false,
      message: "Blog Not Found",
    });
  }
};

// Create a new blog
export const CreateBlogs = async (req, res) => {
  const BlogData = req.body;

  // Validate required fields
  if (
    !BlogData.BlogAuthor ||
    !BlogData.BlogTitle ||
    !BlogData.BlogSlug ||
    !BlogData.BlogContent ||
    !BlogData.BlogDescription ||
    !BlogData.BlogTag ||
    BlogData.BlogPublish === undefined || // fixed logic here
    !BlogData.BlogImg ||
    !BlogData.BlogTime
  ) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields",
    });
  }

  try {
    // Create new blog instance
    const newBlog = new Blogs(BlogData);
    await newBlog.save();

    res.status(201).json({
      success: true,
      message: newBlog,
    });
  } catch (error) {
    console.error("Error in creating Blog:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Update blog by ID
export const UpdateBlogs = async (req, res) => {
  const id = req.params.id;
  const Blog = req.body;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Invalid Blog ID" });
  }

  try {
    // Find blog by ID and update
    const updateData = await Blogs.findByIdAndUpdate(id, Blog, { new: true });

    if (!updateData) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Save updated blog
    await updateData.save();

    res.status(200).json({
      success: true,
      data: updateData,
    });
  } catch (error) {
    console.error("Error in updating Blog:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Delete blog by ID
export const DeleteBlogs = async (req, res) => {
  const id = req.params.id;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Invalid Blog ID" });
  }

  try {
    // Delete blog by ID
    const deletedBlog = await Blogs.findByIdAndDelete(id);

    if (!deletedBlog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Blog Deleted",
    });
  } catch (error) {
    console.error("Error in deleting Blog:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
