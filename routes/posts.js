import express from "express";
import multer from "multer";
import Post from "../model/post.js";
import User from "../model/user.js";

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// POST /api/posts - Create a new post
router.post("/", upload.single("image"), async (req, res) => {
  const { userId, text } = req.body;
  const image = req.file ? req.file.path.replace(/\\/g, "/") : "";

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const newPost = new Post({
      userId,
      username: user.name,
      text,
      image,
    });

    await newPost.save();
    res
      .status(201)
      .json({ post: newPost, message: "Post created successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error." });
  }
});


// PATCH /api/posts/:postId/like - Like/Unlike a post
router.patch("/:postId/like", async (req, res) => {
  const { userId } = req.body;
  const { postId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid userId." });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    // Toggle like
    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter((id) => id !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.status(200).json({ post, message: "Post liked/unliked successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error." });
  }
});

// PATCH /api/posts/:postId/save - Save/Unsave a post
router.put("/:postId/save", async (req, res) => {
  const { userId } = req.body;
  try {
    const post = await Post.findById(req.params.postId);
    if (post.saves.includes(userId)) {
      post.saves = post.saves.filter((id) => id !== userId);
    } else {
      post.saves.push(userId);
    }
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: "Failed to save post." });
  }
});

// GET /api/posts - Fetch all posts
router.get("/", async (req, res) => {
    try {
      // Fetch posts and populate userId with name and profilePicture
      const posts = await Post.find()
        .sort({ createdAt: -1 })
        .populate("userId", "name profilePicture");
  
      res.status(200).json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ error: "Server error." });
    }
  });

// Get user's posts
router.get("/user/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
      const posts = await Post.find({ userId }).sort({ createdAt: -1 });
      res.status(200).json(posts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      res.status(500).json({ error: "Server error while fetching user posts." });
    }
  });
  
  // Get user's saved posts
  router.get("/saved/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
      const posts = await Post.find({ saves: userId }).populate("userId", "name profilePicture").sort({ createdAt: -1 });
      res.status(200).json(posts);
    } catch (error) {
      console.error("Error fetching saved posts:", error);
      res.status(500).json({ error: "Server error while fetching saved posts." });
    }
  });
  
  

export default router;
