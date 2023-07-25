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
          res.send({
            msg: "Login Successful",
            token: token,
            userID: user[0]._id,
          });
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

// user route to add a group
userRouter.post("/groups/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const { groupId, groupName, description, paid, groupLink } = req.body;

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

    user.community.push(newGroup);
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding group", error: error.message });
  }
});

// user route to add a community
userRouter.post("/community/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const {
      groupName,
      description,
      banner,
      displayProfile,
      groupRules,
      paid,
      groupLink,
      questionSet,
    } = req.body;

    const newCommunity = {
      groupName,
      description,
      banner,
      displayProfile,
      groupRules,
      paid,
      groupLink,
      questionSet,
      answerSet: [],
    };

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.community.push(newCommunity);
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding group", error: error.message });
  }
});

// user route to add a template
userRouter.post("/template/:groupsId/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const groupId = req.params.groupsId;
    const { content } = req.body;

    const newTemplate = {
      content,
    };

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Push the new template to the 'template' array inside the found group
    const groupIndex = user.group.findIndex(
      (group) => group.groupId === groupId
    );
    if (groupIndex === -1) {
      console.error("Group not found in user");
      res.status(404).json({ error: "Group not found" });
      return;
    }

    user.group[groupIndex].template.push(newTemplate);
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding group", error: error.message });
  }
});

// user route for handling the GET request to fetch questions and answers
userRouter.get("/:userId/:communityId/:answerId/question", (req, res) => {
  const { userId, communityId, answerId } = req.params;

  userModel.findById(userId, (err, user) => {
    if (err) {
      console.error("Error finding user:", err);
      return res.status(500).json({ error: "Server error" });
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const community = user.community.find(
      (c) => c._id.toString() === communityId
    );
    if (!community) {
      return res
        .status(404)
        .json({ error: "Community not found for the user" });
    }

    const answer = community.answerSet.find(
      (c) => c._id.toString() === answerId
    );
    if (!answer) {
      return res.status(404).json({ error: "answer not found for the user" });
    }

    return res.status(200).json(answer);
  });
});

// user route to add a customer question and answer
userRouter.post("/:userId/:communityId/answer", (req, res) => {
  const { userId, communityId } = req.params;
  const { answer } = req.body;

  userModel.findById(userId, (err, user) => {
    if (err) {
      console.error("Error finding user:", err);
      return res.status(500).json({ error: "Server error" });
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const community = user.community.find(
      (c) => c._id.toString() === communityId
    );
    if (!community) {
      return res
        .status(404)
        .json({ error: "Community not found for the user" });
    }

    const question = community.questionSet;

    // Add the question and answer to the questionSet and answerSet array
    community.answerSet.push({ question, answer });

    // Save the updated user object
    user.save((saveErr) => {
      if (saveErr) {
        console.error("Error saving user:", saveErr);
        return res.status(500).json({ error: "Server error" });
      }

      return res
        .status(201)
        .json({ message: "Question and answer added successfully" });
    });
  });
});

// Route for handling the PUT request to update a question
userRouter.put("/:userId/:communityId/:questionIndex", (req, res) => {
  const { userId, communityId, questionIndex } = req.params;
  const { question } = req.body;

  userModel.findById(userId, (err, user) => {
    if (err) {
      console.error("Error finding user:", err);
      return res.status(500).json({ error: "Server error" });
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const community = user.community.find(
      (c) => c._id.toString() === communityId
    );
    if (!community) {
      return res
        .status(404)
        .json({ error: "Community not found for the user" });
    }

    // Check if the provided questionIndex is valid
    if (questionIndex < 0 || questionIndex >= community.questionSet.length) {
      return res.status(400).json({ error: "Invalid question index" });
    }

    // Update the question content
    community.questionSet[questionIndex] = { question: question };

    // Save the updated user object
    user.save((saveErr) => {
      if (saveErr) {
        console.error("Error saving user:", saveErr);
        return res.status(500).json({ error: "Server error" });
      }

      return res.status(200).json({ message: "Question updated successfully" });
    });
  });
});

// Route for handling the PUT request to change community details
/* userRouter.put("/:userId/:communityId", (req, res) => {
  const { userId, communityId } = req.params;
  const {
    groupName,
    description,
    banner,
    displayProfile,
    groupRules,
    paid,
    groupLink,
  } = req.body;

  userModel.findById(userId, (err, user) => {
    if (err) {
      console.error("Error finding user:", err);
      return res.status(500).json({ error: "Server error" });
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const community = user.community.find(
      (c) => c._id.toString() === communityId
    );
    if (!community) {
      return res
        .status(404)
        .json({ error: "Community not found for the user" });
    }

    // Update the community details
    community.groupName = groupName;
    community.description = description;
    community.banner = banner;
    community.displayProfile = displayProfile;
    community.groupRules = groupRules;
    community.paid = paid;
    community.groupLink = groupLink;

    // Save the updated user object
    user.save((saveErr) => {
      if (saveErr) {
        console.error("Error saving user:", saveErr);
        return res.status(500).json({ error: "Server error" });
      }

      return res
        .status(200)
        .json({ message: "Community details updated successfully" });
    });
  });
}); */

// Route for handling the PATCH request to change community details
userRouter.patch("/:userId/:communityId", (req, res) => {
  const { userId, communityId } = req.params;
  const {
    groupName,
    description,
    banner,
    displayProfile,
    groupRules,
    paid,
    groupLink,
  } = req.body;

  userModel.findById(userId, (err, user) => {
    if (err) {
      console.error("Error finding user:", err);
      return res.status(500).json({ error: "Server error" });
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const community = user.community.find(
      (c) => c._id.toString() === communityId
    );
    if (!community) {
      return res
        .status(404)
        .json({ error: "Community not found for the user" });
    }

    (community.groupName = groupName),
      (community.description = description),
      (community.banner = banner),
      (community.displayProfile = displayProfile),
      (community.groupRules = groupRules),
      (community.paid = paid),
      (community.groupLink = groupLink),
      // Save the updated user object
      user.save((saveErr) => {
        if (saveErr) {
          console.error("Error saving user:", saveErr);
          return res.status(500).json({ error: "Server error" });
        }

        return res.status(200).json({
          message: "Community details updated successfully",
          community: community,
          user,
        });
      });
  });
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

// user route to delete a group of a user by group ID
userRouter.delete("/:userId/groups/:groupId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const groupId = req.params.groupId;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Remove the group with the given group ID
    user.group = user.group.filter((groups) => groups.groupId !== groupId);
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete the dynamic group." });
  }
});

// user Route for handling the DELETE request to delete a community group
userRouter.delete("/:userId/community/:communityId", (req, res) => {
  const { userId, communityId } = req.params;

  userModel.findById(userId, (err, user) => {
    if (err) {
      console.error("Error finding user:", err);
      return res.status(500).json({ error: "Server error" });
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find the index of the community in the user's community array
    const communityIndex = user.community.findIndex(
      (c) => c._id.toString() === communityId
    );

    if (communityIndex === -1) {
      return res
        .status(404)
        .json({ error: "Community not found for the user" });
    }

    // Remove the community from the user's community array
    user.community.splice(communityIndex, 1);

    // Save the updated user object
    user.save((saveErr) => {
      if (saveErr) {
        console.error("Error saving user:", saveErr);
        return res.status(500).json({ error: "Server error" });
      }

      return res
        .status(200)
        .json({ message: "Community group deleted successfully" });
    });
  });
});

module.exports = {
  userRouter,
};
