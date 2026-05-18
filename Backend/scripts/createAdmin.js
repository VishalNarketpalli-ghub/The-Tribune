/**
 * createAdmin.js — developer seed script for creating an admin account.
 *
 * Best Practice: Admin users are never created through the public registration API.
 * Instead, a trusted developer runs this script directly on the server (or locally
 * against the production DB). This prevents privilege escalation from the outside.
 *
 * Usage:
 *   1. Set ADMIN_EMAIL and ADMIN_PASSWORD as environment variables, OR edit the
 *      defaults below before running.
 *   2. Run:  node Backend/scripts/createAdmin.js
 *
 * The script is idempotent: it will skip creation if an admin with that email
 * already exists, so it is safe to run multiple times.
 */

import { connect, disconnect } from "mongoose"
import bcrypt from "bcrypt"
import { config } from "dotenv"
import { UserTypeModel } from "../Models/UserModel.js"

config()

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || "admin@thetribune.com"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@1234"
const ADMIN_FIRST    = "Tribune"
const ADMIN_LAST     = "Admin"

async function createAdmin() {
    try {
        // Connect to the same database the application uses
        await connect(process.env.DB_URL)
        console.log("Connected to database")

        // Check whether an admin with this email already exists to stay idempotent
        const existing = await UserTypeModel.findOne({ email: ADMIN_EMAIL })
        if (existing) {
            console.log(`Admin with email "${ADMIN_EMAIL}" already exists — skipping creation.`)
            return
        }

        // Hash the password with the same cost factor used by the auth service
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10)

        // Create the admin user document directly via the model, bypassing the
        // public registration route so the ADMIN role can be assigned explicitly
        const admin = new UserTypeModel({
            firstName:       ADMIN_FIRST,
            lastName:        ADMIN_LAST,
            email:           ADMIN_EMAIL,
            password:        hashedPassword,
            role:            "ADMIN",
            isActive:        true,
            profileImageUrl: null
        })

        await admin.save()
        console.log(`Admin account created successfully:`)
        console.log(`  Email:    ${ADMIN_EMAIL}`)
        console.log(`  Password: ${ADMIN_PASSWORD}`)
        console.log(`  Role:     ADMIN`)
        console.log(`\nIMPORTANT: Change the password after the first login.`)

    } catch (err) {
        console.error("Error creating admin:", err.message)
    } finally {
        // Always disconnect cleanly so the process exits
        await disconnect()
        console.log("Disconnected from database")
    }
}

createAdmin()
