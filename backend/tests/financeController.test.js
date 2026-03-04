// backend/tests/financeController.test.js

import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app.js";
import User from "../src/models/userModel.js";
import Finance from "../src/models/financeModel.js";
import jwt from "jsonwebtoken";

// --------------------------------------------------
// Create fake user token
// --------------------------------------------------
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );
};

let token;
let user;

// ================================================================
// BEFORE ALL TESTS
// Connect to test DB
// ================================================================
beforeAll(async () => {

    await mongoose.connect(process.env.MONGO_URI);

    // Create test user
    user = await User.create({
        name: "TestUser",
        email: "test@email.com",
        password: "1234567890"
    });

    token = generateToken(user._id);
});

// ================================================================
// AFTER ALL TESTS
// Clean database
// ================================================================
afterAll(async () => {
    await User.deleteMany();
    await Finance.deleteMany();
    await mongoose.connection.close();
});

// ================================================================
// TEST CREATE FINANCE ENTRY
// ================================================================
test("POST /api/finance should create finance entry", async () => {

    const response = await request(app)
        .post("/api/finance")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Groceries",
            type: "expense",
            category: "Food",
            items: [
                { name: "Milk", amount: 100 },
                { name: "Bread", amount: 50 }
            ]
        });

    // Check HTTP status
    expect(response.statusCode).toBe(201);

    // Check response format
    expect(response.body.success).toBe(true);

    // Check data exists
    expect(response.body.data.title).toBe("Groceries");

    // Check DB actually saved it
    const dbEntry = await Finance.findOne({ title: "Groceries" });
    expect(dbEntry).not.toBeNull();
});
