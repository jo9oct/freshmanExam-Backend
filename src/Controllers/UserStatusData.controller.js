
import { StatusData } from "../models/UserStatusData.js";


// Create a new status data entry for a user
export const CreateStatusData = async (req, res) => {
  const { userName } = req.body; 

  try {
    // Create a new document in StatusData collection
    const statusData = new StatusData({ userName });
    await statusData.save();

    return res.status(200).json({
      success: true,
      message: "Status data created successfully",
      data: statusData,
    });
  } catch (error) {
    console.error("Error in CreateStatusData:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error in CreateStatusData",
    });
  }
};

// Update the status data for a specific user and chapter
export const UpdateStatusData = async (req, res) => {
  const { userName, chapterName, data } = req.body;

  try {
    // Find existing user status record
    const existingData = await StatusData.findOne({ userName });

    if (!existingData) {
      return res.status(404).json({
        success: false,
        message: "username not found",
      });
    }

    // Check if chapter already exists inside StatusData array
    const chapterIndex = existingData.StatusData.findIndex(
      (item) => item.chapterName === chapterName
    );

    if (chapterIndex === -1) {
      // If chapter doesn't exist → push new entry
      existingData.StatusData.push({ chapterName, data });
    } else {
      // If chapter exists → update the data field
      existingData.StatusData[chapterIndex].data = data;
    }

    // Save updated document
    await existingData.save();

    return res.status(200).json({
      success: true,
      message: "Status data updated successfully",
      data: existingData,
    });
  } catch (error) {
    console.error("Error in UpdateStatusData:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error in UpdateStatusData",
    });
  }
};

// Get all status data records
export const GetStatusData = async (req, res) => {
  try {
    const data = await StatusData.find();

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "There is no view data available",
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error in GetStatusData:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error in GetStatusData",
    });
  }
};

// Delete user/admin data history by username
export const deleteDataHistory = async (req, res) => {
  const { userName } = req.body;

  try {
    // Try to find and delete the user by username
    const admin = await User.findOneAndDelete({ username: userName });

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "admin not deleted",
      });
    }

    res.status(200).json({
      success: true,
      message: "admin deleted",
    });
  } catch (error) {
    console.log("error in deleting admin", error);
    res.status(500).json({
      success: false,
      message: "Server error in deleteDataHistory",
    });
  }
};
