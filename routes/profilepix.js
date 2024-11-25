import express from "express";
import multer from "multer";
import User from "../model/user.js";

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// POST /api/uploads - Upload profile picture
router.post("/", upload.single("profilePicture"), async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);

    const userId = req.body.userId;
    const profilePicturePath = req.file?.path;

    if (!userId || !profilePicturePath) {
      return res
        .status(400)
        .json({ error: "Invalid input data. Missing userId or file." });
    }

    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid userId format." });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture: profilePicturePath },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json({
      user,
      message: "Profile picture uploaded successfully!",
    });
  } catch (error) {
    console.error("Error during upload:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// GET /api/uploads/:userId - Fetch user profile data including profile picture
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Normalize the profilePicture path (replace backslashes with forward slashes)
    if (user.profilePicture) {
      user.profilePicture = user.profilePicture.replace(/\\/g, "/");
    }

    // Respond with the user data
    res.status(200).json({
      user,
      message: "User profile fetched successfully!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error." });
  }
});


export default router;
