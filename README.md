# ro-traffic-rules
A web-based trainer for the Romanian traffic rules examination.

# Overview

This is a simple single-page application built with React, designed to help users prepare for the Romanian traffic rules test. The application presents questions from a predefined YAML file and tracks the user's progress, including the number of correct and incorrect answers for each question.

To persist user data and maintain progress across sessions, the application utilizes the browser's `localStorage`. This allows for a lightweight, serverless architecture where all logic and data reside on the client-side.

# Technology Stack

*   **Framework:** [React](https://reactjs.org/) - A JavaScript library for building user interfaces. We'll use functional components with Hooks.
*   **Data Source:** [YAML](https://yaml.org/) - Questions are stored in a simple, human-readable `questions.yaml` file. We will use a library like `js-yaml` to parse this file within the application.
*   **State Management:** React Hooks (`useState`, `useReducer`, `useContext`) will be used for managing component-level and application-level state.
*   **Client-side Storage:** [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) - To store user progress, such as scores and error counts per question. It's simple, widely supported, and sufficient for this project's needs.
*   **Build Tool:** [Vite](https://vitejs.dev/) - A modern and fast build tool for web development that provides an excellent developer experience with features like Hot Module Replacement (HMR).
*   **Styling:** Standard CSS with [CSS Modules](https://github.com/css-modules/css-modules) to locally scope styles to components, preventing class name collisions.

# Project Structure

The project will follow a standard feature-based directory structure to keep the codebase organized and maintainable.

```
ro-traffic-rules/
├── public/
│   ├── questions.yaml    # The source of all traffic rule questions.
│   └── index.html        # The main HTML file.
├── src/
│   ├── assets/           # Images, fonts, and other static assets.
│   ├── components/       # Reusable UI components.
│   │   ├── Quiz.jsx      # Main component to display questions.
│   │   ├── Question.jsx  # Component for a single question.
│   │   ├── Results.jsx   # Component to show final results.
│   │   └── Progress.jsx  # Component to show user's progress.
│   ├── hooks/            # Custom React hooks.
│   │   ├── useQuiz.js    # Hook for quiz logic and state.
│   │   └── useStorage.js # Hook for interacting with localStorage.
│   ├── styles/           # Global styles and variables.
│   │   └── main.css
│   ├── App.jsx           # Main application component.
│   └── main.jsx          # Entry point of the application.
├── .gitignore
├── package.json
└── README.md
```

# Data Flow

1.  **Initialization**:
    *   The `App` component mounts.
    *   The application fetches the `questions.yaml` file from the `/public` directory.
    *   The YAML content is parsed into a JavaScript array of question objects.
    *   The application retrieves the user's progress from `localStorage`. If no progress data is found, it initializes a new progress object.

2.  **Quiz Session**:
    *   The `Quiz` component receives the questions and displays the current one.
    *   The user selects an answer.
    *   Upon submission, the application validates the answer against the correct one defined in the question object.
    *   The user's progress (e.g., `correct_answers`, `incorrect_answers` for that question ID) is updated in the state and persisted to `localStorage`.

3.  **Displaying Progress**:
    *   The `Progress` component reads from `localStorage` to display statistics, such as overall performance or a list of questions that are frequently answered incorrectly.

# Getting Started

To get the project running locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/<your-username>/ro-traffic-rules.git
    cd ro-traffic-rules
    ```

2.  **Install dependencies:**
    This project uses `npm` as the package manager.
    ```bash
    npm install
    ```

3.  **Run the development server:**
    This will start the Vite development server.
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

# Features to Implement

*   Load questions from `questions.yaml`.
*   Display one question at a time with multiple-choice answers.
*   Provide immediate feedback after the user answers.
*   Track correct and incorrect answers for each question in `localStorage`.
*   A "Results" or "Progress" page summarizing the user's performance.
*   Ability to reset progress.
