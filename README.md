# Transcript Management System Frontend

This is the frontend application for the Transcript Management System, built with Vue 3 and Vuetify.

## Project Setup

```bash
# Install dependencies
npm install

# Serve with hot reload at localhost:8080
npm run serve

# Build for production
npm run build

# Lint and fix files
npm run lint
```

## Project Structure

- `src/components/` - Vue components for each entity

  - `University.vue` - University management
  - `OCCourse.vue` - OC Course management
  - `UniversityCourse.vue` - University Course management
  - `UniversityTranscript.vue` - University Transcript management
  - `TranscriptCourse.vue` - Transcript Course management

- `src/views/` - Page components

  - `Home.vue` - Dashboard
  - `Login.vue` - Login page

- `src/store/` - Vuex store

  - `index.js` - Store configuration
  - `modules/auth.js` - Authentication module

- `src/router/` - Vue Router configuration
  - `index.js` - Route definitions

## Features

- User authentication
- CRUD operations for all entities
- Responsive design with Vuetify
- Form validation
- Error handling
- Navigation drawer
- Protected routes

## Dependencies

- Vue 3
- Vuetify 3
- Vuex 4
- Vue Router 4
- Axios
- Material Design Icons

## Backend API

The frontend communicates with the backend API at `http://localhost:8080`. Make sure the backend server is running before starting the frontend application.

## Development

1. Clone the repository
2. Install dependencies with `npm install`
3. Start the development server with `npm run serve`
4. Access the application at `http://localhost:8080`

## Production

1. Build the application with `npm run build`
2. The built files will be in the `dist` directory
3. Deploy the contents of the `dist` directory to your web server
