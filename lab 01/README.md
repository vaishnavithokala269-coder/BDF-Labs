# Lab 1: Node.js and Express Server

## Student Details

- **Name:** T.Vaishnavi
- **Registration Number:** 252U1R1242
  - **Section:** CSE-2E
- **University:** Aurora University

## Objective

To understand Node.js, create a basic HTTP server, and build an Express server with multiple GET routes and appropriate HTTP status codes.

## Technologies Used

- Node.js
- Express.js
- JavaScript
- Visual Studio Code

## Project Structure

- `server-http.js` – Creates a basic HTTP server using Node.js.
- `server.js` – Creates an Express server with multiple routes.
- `package.json` – Contains project information and dependencies.
- `package-lock.json` – Records the installed dependency versions.
- `.gitignore` – Specifies files and folders that should not be uploaded to GitHub.
- `screenshots/` – Stores screenshots of the tested endpoints.

## How to Run

### Prerequisites

Install Node.js and npm.

### Step 1: Install Dependencies

Open the terminal in the `lab-01` folder and run:

npm install

### Step 2: Start the Express Server

Run:

node server.js

The server will start on port 3000 by default.

### Step 3: Open the Browser

Open:

[http://localhost:3000](http://localhost:3000)

### Step 4: Test the Routes

| **Method** | **Endpoint** | **Expected Result**                          |
| ---------- | ------------ | -------------------------------------------- |
| GET        | `/`          | Welcome message; status 200                  |
| GET        | `/about`     | Student name and section in JSON; status 200 |
| GET        | `/time`      | Current date and time in JSON; status 200    |
| GET        | `/contact`   | Route not found message; status 404          |

### Run the Basic HTTP Server

Stop the Express server first by pressing `Ctrl + C` in the terminal.

Then run:

node server-http.js

Open [http://localhost:3000](http://localhost:3000) in your browser. The page should display `Hello`.

**Note:** Only one of these servers should run on port 3000 at a time.

## Deployment

**Status:** Not deployed yet. The server is currently running locally. Screenshots of the tested endpoints will be included in the repository.

## Problems and Solutions

- **Problem:** The server may not start if the required dependencies are missing.
- **Solution:** Run `npm install` in the project folder.
- **Problem:** Port 3000 may already be in use.
- **Solution:** Stop the other server using `Ctrl + C` before starting this server.

## Conclusion

Successfully created a basic Node.js HTTP server and an Express server with GET routes, JSON responses, and a 404 response for unknown routes.
