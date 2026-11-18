
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./database");

const app = express();

app.use(express.json());

const JWT_SECRET = "my_secret_key";

// REGISTER API
app.post("/register/", async (req, res) => {
    const { username, name, password } = req.body;

    try {
        // Check existing username
        db.get(
            "SELECT * FROM users WHERE username = ?",
            [username],
            async (err, user) => {

                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                if (user) {
                    return res.status(400).json({
                        message: "Username already exists"
                    });
                }

                // Hash password
                const hashedPassword = await bcrypt.hash(password, 10);

                // Save user
                db.run(
                    "INSERT INTO users (username, name, password) VALUES (?, ?, ?)",
                    [username, name, hashedPassword],
                    function (err) {

                        if (err) {
                            return res.status(500).json({ error: err.message });
                        }

                        res.status(201).json({
                            message: "Registration successful"
                        });
                    }
                );
            }
        );

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// LOGIN API
app.post("/login/", (req, res) => {
    const { username, password } = req.body;

    db.get(
        "SELECT * FROM users WHERE username = ?",
        [username],
        async (err, user) => {

            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (!user) {
                return res.status(400).json({
                    message: "User not found"
                });
            }

            const isValid = await bcrypt.compare(
                password,
                user.password
            );

            if (!isValid) {
                return res.status(400).json({
                    message: "Invalid password"
                });
            }

            const token = jwt.sign(
                { username: user.username },
                JWT_SECRET
            );

            res.status(200).json({
                jwt_token: token
            });
        }
    );
});

// Start server
app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
