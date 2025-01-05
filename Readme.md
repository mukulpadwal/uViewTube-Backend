# uViewTube Backend

Welcome to the uViewTube Backend repository! This project serves as the backend for the uViewTube application, providing APIs for user management, video handling, comments, likes, playlists, and more.

## Table of Contents

- [uViewTube Backend](#uviewtube-backend)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Technologies Used](#technologies-used)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [API Endpoints](#api-endpoints)
    - [User Routes](#user-routes)
    - [Video Routes](#video-routes)
    - [Comment Routes](#comment-routes)
    - [Like Routes](#like-routes)
    - [Playlist Routes](#playlist-routes)
    - [Subscription Routes](#subscription-routes)
    - [Tweet Routes](#tweet-routes)
    - [Dashboard Routes](#dashboard-routes)
    - [Healthcheck Routes](#healthcheck-routes)
  - [Models](#models)
    - [User Model](#user-model)
    - [Video Model](#video-model)
    - [Comment Model](#comment-model)
    - [Playlist Model](#playlist-model)
  - [Error Handling](#error-handling)
  - [Logging](#logging)
  - [Contributing](#contributing)

## Features

- User authentication and authorization
- Video upload, update, and deletion
- Commenting on videos
- Liking videos and comments
- Creating and managing playlists
- Subscriptions to user channels
- Fetching user watch history

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Cloudinary for media storage
- Winston for logging
- Prettier for code formatting

## Getting Started

### Prerequisites

- Node.js installed
- MongoDB instance running
- Cloudinary account

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/mukulpadwal/uViewTube-Backend.git
    cd uViewTube-Backend
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a `.env` file based on the `.env.example` provided and fill in the necessary environment variables.

4. Start the server:
    ```sh
    npm start
    ```

## Environment Variables

The following environment variables need to be set in your `.env` file:

```env
# Server Configuration
PORT= # Port number on which the server will run
CORS_ORIGIN= # Allowed origins for CORS

# Database Configuration
MONGODB_URI= # MongoDB connection string

# JWT Configuration
ACCESS_TOKEN_SECRET= # Secret key for access token
ACCESS_TOKEN_EXPIRY= # Expiry time for access token
REFRESH_TOKEN_SECRET= # Secret key for refresh token
REFRESH_TOKEN_EXPIRY= # Expiry time for refresh token

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME= # Cloudinary cloud name
CLOUDINARY_API_KEY= # Cloudinary API key
CLOUDINARY_API_SECRET= # Cloudinary API secret

# Environment
NODE_ENV= # Environment (development, production, etc.)
```

## API Endpoints

### User Routes

- `POST /api/v1/users/register` - Register a new user
- `POST /api/v1/users/login` - Login a user
- `POST /api/v1/users/refresh-token` - Refresh access token
- `GET /api/v1/users/logout` - Logout a user
- `PATCH /api/v1/users/update-details` - Update user details
- `PATCH /api/v1/users/update-avatar` - Update user avatar
- `PATCH /api/v1/users/update-coverimage` - Update user cover image
- `GET /api/v1/users/watch-history` - Get user watch history

### Video Routes

- `POST /api/v1/videos/upload` - Upload a new video
- `PATCH /api/v1/videos/update/:videoId` - Update video details
- `DELETE /api/v1/videos/delete/:videoId` - Delete a video

### Comment Routes

- `POST /api/v1/comments/add/:videoId` - Add a comment to a video
- `GET /api/v1/comments/:videoId` - Get comments for a video
- `PATCH /api/v1/comments/update/:commentId` - Update a comment
- `DELETE /api/v1/comments/delete/:commentId` - Delete a comment

### Like Routes

- `PATCH /api/v1/likes/toggle/video/:videoId` - Like or unlike a video
- `PATCH /api/v1/likes/toggle/comment/:commentId` - Like or unlike a comment

### Playlist Routes

- `POST /api/v1/playlists/create` - Create a new playlist
- `GET /api/v1/playlists/user/:userId` - Get playlists for a user
- `GET /api/v1/playlists/id/:playlistId` - Get a playlist by ID
- `PATCH /api/v1/playlists/update/:playlistId` - Update a playlist
- `DELETE /api/v1/playlists/delete/:playlistId` - Delete a playlist

### Subscription Routes

- `PATCH /api/v1/subscriptions/toggle/:userId` - Subscribe or unsubscribe to a user

### Tweet Routes

- `POST /api/v1/tweets/create` - Create a new tweet
- `GET /api/v1/tweets` - Get user tweets
- `PATCH /api/v1/tweets/update/:tweetId` - Update a tweet
- `DELETE /api/v1/tweets/delete/:tweetId` - Delete a tweet

### Dashboard Routes

- `GET /api/v1/dashboard/videos` - Get channel videos
- `GET /api/v1/dashboard/stats` - Get channel stats

### Healthcheck Routes

- `GET /api/v1/healthcheck` - Health check

## Models

### User Model

- `username`
- `email`
- `fullname`
- `avatar`
- `avatarPublicID`
- `coverImage`
- `coverImagePublicID`
- `watchHistory`
- `password`
- `refreshToken`

### Video Model

- `title`
- `description`
- `url`
- `thumbnail`
- `owner`
- `views`
- `likes`
- `comments`

### Comment Model

- `video`
- `content`
- `owner`

### Playlist Model

- `name`
- `description`
- `videos`
- `owner`

## Error Handling

Errors are handled using custom `APIError` and `APIResponse` classes. These ensure consistent error responses across the API.

## Logging

Logging is handled using Winston. Logs are output to the console and saved to `app.log`.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
