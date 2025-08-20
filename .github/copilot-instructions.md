# GitHub Copilot Instructions for the ro-traffic-rules Repository

## 1. Core Principles & Technology Stack

Our goal is to build a clean, modern, and maintainable client-side application.

- **Framework:** **React**. All components must be **functional components**. Use **React Hooks** for state and side effects (`useState`, `useEffect`, `useReducer`, `useContext`). Class components are not permitted.
- **Build Tool:** The project is set up with **Vite**. Be mindful of Vite-specific conventions, such as using `import.meta.env` for environment variables if needed.
- **Language:** **JavaScript (ES6+)**. Use modern syntax like `const`, `let`, arrow functions, and destructuring.
- **Data Source:** The questions are defined in a `questions.yaml` file located in the `/public` directory. Use the `js-yaml` library to parse this file. Do not hardcode questions in the components.
- **Client-side Storage:** All user progress (scores, errors per question) must be persisted in the browser's **`localStorage`**. All interactions with `localStorage` should be abstracted into a custom hook (`useStorage.js`).
- **Styling:** Use **CSS Modules** for component-level styling. Each component should have its own `[ComponentName].module.css` file. Avoid inline styles and global CSS unless absolutely necessary (for base styles in `main.css`).

## 2. Project Structure

Adhere strictly to the established project structure. When generating new files or suggesting imports, use the following layout as your guide:
ro-traffic-rules/
├── public/ 
│ └── questions.yaml 
├── src/ 
│ ├── assets/ 
│ ├── components/ # Reusable UI components (e.g., Quiz.jsx, Question.jsx) 
│ ├── hooks/ # Custom React hooks (e.g., useQuiz.js, useStorage.js) 
│ ├── styles/ # Global styles 
│ ├── App.jsx # Main application component 
│ └── main.jsx # Application entry point
├── .github/ 
│ └── copilot-instructions.md


- Place all reusable UI components inside `src/components/`.
- Place all custom hooks for logic abstraction inside `src/hooks/`.
- Global styles are located in `src/styles/`.

## 3. Key Implementation Patterns

- **State Management:**
  - For simple, local component state, use `useState`.
  - For complex state logic related to the quiz (e.g., managing questions, user answers, score), prefer `useReducer` to centralize the logic. The main quiz state should be managed within the `useQuiz` hook.
  - Use `useContext` if state needs to be shared across multiple, deeply nested components without prop drilling.

- **Custom Hooks:**
  - **`useStorage`**: This hook is the single source of truth for `localStorage` interactions. It should expose methods like `getItem(key)` and `setItem(key, value)`. Components should **not** call `localStorage.getItem()` or `localStorage.setItem()` directly.
  - **`useQuiz`**: This hook should encapsulate all the business logic for the quiz. This includes:
    - Fetching and parsing questions from `questions.yaml`.
    - Tracking the current question index.
    - Validating user answers.
    - Updating the score.
    - Interacting with `useStorage` to save progress.

- **Data Flow:**
  1.  The main `App.jsx` or a top-level component should initiate the fetching of `questions.yaml`.
  2.  The parsed questions and any stored progress from `localStorage` should be passed into the main `Quiz` component.
  3.  When a user answers a question, the state is updated, and the new progress is immediately saved to `localStorage` via the `useStorage` hook.

## 4. Code Style and Quality

- **Clarity and Readability:** Write clean, self-documenting code. Use meaningful names for variables and functions.
- **Comments:** Add JSDoc-style comments to explain complex logic, especially within custom hooks and utility functions.
- **Error Handling:** Implement basic error handling, for instance, if `questions.yaml` fails to load.
- **No Unused Code:** Ensure your suggestions do not include unused imports or variables.
