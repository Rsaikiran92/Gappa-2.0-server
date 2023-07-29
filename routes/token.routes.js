const express = require("express");
const { tokenModel } = require("../Models/token.model");

const tokenRouter = express.Router();

/* { TOKEN } */

// GET REQUEST
// token route to get all users
tokenRouter.get("/", async (req, res) => {
  try {
    const token = await tokenModel.find({});
    res.status(200).json(token);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

// POST REQUEST
// token route to add a group
tokenRouter.post("/", async (req, res) => {
  try {
    const { username, number, token } = req.body;

    // Create a new token document using the tokenModel
    const newToken = new tokenModel({ username, number, token });

    // Save the new token document to the database
    const savedToken = await newToken.save();

    res.json(savedToken);
  } catch (err) {
    res.status(500).json({ error: "Failed to create token." });
  }
});

// PATCH REQUEST
// token router for handling the PATCH request to update group information
tokenRouter.put("/:tokenId", async (req, res) => {
  try {
    const { tokenId } = req.params;
    const { username, number, token } = req.body;

    // Find the document by ID and update its fields
    const updatedToken = await tokenModel.findByIdAndUpdate(
      tokenId,
      { username, number, token },
      { new: true } // This option returns the updated document
    );

    res.json(updatedToken);
  } catch (err) {
    res.status(500).json({ error: "Failed to update token." });
  }
});

//DELETE REQUEST
// token route to delete a user by their ID
tokenRouter.delete("/:tokenId", async (req, res) => {
  try {
    const { tokenId } = req.params;

    // Find the document by ID and remove it
    const deletedToken = await tokenModel.findByIdAndRemove(tokenId);

    if (!deletedToken) {
      return res.status(404).json({ error: "Token not found." });
    }

    res.json({ message: "Token deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete token." });
  }
});

module.exports = {
  tokenRouter,
};
