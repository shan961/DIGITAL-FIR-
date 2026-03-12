# Smart FIR System 🚓

## Overview

Smart FIR System is a backend application that allows users to digitally file FIR complaints.
It uses authentication and simple AI-based crime detection to automatically classify the type of crime based on the complaint description.

The system allows users to:

* Register and login securely
* Generate FIR complaints
* Automatically detect crime type
* View their FIR history

---

## Features

* JWT Authentication
* Role-based access control
* FIR generation
* AI-based crime type detection
* User-specific FIR tracking
* RESTful API design

---

## Tech Stack

**Backend**

* Node.js
* Express.js

**Database**

* MongoDB
* Mongoose

**Authentication**

* JWT (JSON Web Token)
* bcrypt password hashing

**API Testing**

* Postman

---

## Project Structure

```
smart-fir-system
│
├── controllers
├── middleware
│   ├── authMiddleware.js
│   └── roleMiddleware.js
│
├── models
│   ├── User.js
│   └── FIR.js
│
├── routes
│   ├── authRoutes.js
│   └── firRoutes.js
│
├── utils
│   └── detectCrimeType.js
│
├── config
│   └── db.js
│
├── server.js
└── .env
```

---

## Installation

Clone the repository:

```
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

Go into the project folder:

```
cd smart-fir-system
```

Install dependencies:

```
npm install
```

---

## Environment Variables

Create a `.env` file in the root directory and add:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

## Run the Server

```
npm run dev
```

Server will start at:

```
http://localhost:5000
```

---


## Future Improvements


* FIR status tracking
* Crime analytics dashboard
* Email notifications
* NLP-based crime detection

---

## Author

Roshan Roy Chowdhury
