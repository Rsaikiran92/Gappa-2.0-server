const express = require("express");
const { userModel } = require("../Models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userRouter = express.Router();

// user route to get all users
userRouter.get("/", async (req, res) => {
  try {
    const users = await userModel.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

// User route to get a user by their ID
userRouter.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch the user." });
  }
});

// user route to register a new user
userRouter.post("/register", async (req, res) => {
  try {
    const { name, whatsappNumber, email, password } = req.body;

    // Check if the user already exists with the provided email
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "User with this email already exists." });
    }

    bcrypt.hash(password, 5, async (err, secure_password) => {
      if (err) {
        console.log(err);
      } else {
        const newUser = new userModel({
          name,
          whatsappNumber,
          email,
          password: secure_password,
          group: [],
        });
        await newUser.save();

        res.status(201).json(newUser);
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to register the new user." });
  }
});

// user route to login an user
userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.find({ email });
    const hashed_password = user[0].password;
    if (user.length > 0) {
      bcrypt.compare(password, hashed_password, (err, result) => {
        if (result) {
          const token = jwt.sign({ userID: user[0]._id }, "masai");
          res.send({ msg: "Login Successful", token: token });
        } else {
          res.send("Wrong Credential");
        }
      });
    } else {
      res.send("Wrong Credential");
    }
  } catch (err) {
    res.send("Something went wrong");
    console.log(err);
  }
});

userRouter.post("/groups/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const { groupId, groupName, description, paid, groupLink } =
      req.body;

    const newGroup = {
      groupId,
      groupName,
      description,
      paid,
      groupLink,
      template: [],
    };

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.group.push(newGroup);
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding group", error: error.message });
  }
});

// Edit a template
userRouter.put("/users/:userId/groups/:groupId/templates", async (req, res) => {
  try {
    const userId = req.params.userId;
    const groupId = req.params.groupId;
    const { templates } = req.body;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const group = await user.findOneAndUpdate(
      { "group._id": groupId },
      { $set: { "group.$.template": templates } },
      { new: true }
    );

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error editing template", error: error.message });
  }
});

// User route to update user's template
userRouter.put("/:userId/template", async (req, res) => {
  try {
    const userId = req.params.userId;
    const { template } = req.body;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    user.group.standard.template = template;
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user tags." });
  }
});

// user route to delete a user by their ID
userRouter.delete("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await userModel.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete the user." });
  }
});

// user route to delete a dynamic group of a user by group ID
userRouter.delete("/:userId/groups/:groupId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const groupId = req.params.groupId;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Remove the dynamic group with the given group ID
    user.group = user.group.filter((groups) => groups.groupId !== groupId);
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete the dynamic group." });
  }
});

module.exports = {
  userRouter,
};
