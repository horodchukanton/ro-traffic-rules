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

## 4. Error Handling & Robustness

- **Network Errors:** Always handle fetch failures gracefully with user-friendly error messages and retry functionality.
- **Data Validation:** Validate the structure of questions.yaml data before using it.
- **Timeout Handling:** Implement reasonable timeouts for network requests (15 seconds recommended).
- **Storage Fallbacks:** Handle cases where localStorage is unavailable with in-memory fallbacks.
- **User Feedback:** Show loading states, error states, and success states clearly in the UI.

### Required Error Scenarios to Handle:
- Questions file not found (404)
- Invalid YAML format 
- Empty questions array
- Network connectivity issues
- localStorage quota exceeded
- Malformed question data

## 5. Testing Requirements

- **Unit Tests:** All custom hooks must have comprehensive test coverage using Vitest and React Testing Library.
- **Component Tests:** Test all user interactions, loading states, and error states.
- **Mocking:** Use vi.mock() for external dependencies like fetch and localStorage.
- **Act Wrapping:** Wrap state updates in act() to avoid React warnings.
- **Error Testing:** Include tests for error scenarios and edge cases.

### Test Patterns:
```javascript
// Test error handling
test('handles network errors gracefully', async () => {
  fetch.mockRejectedValue(new Error('Network error'));
  // Test error UI appears
});

// Test loading states  
test('shows loading spinner while fetching', () => {
  // Test loading UI
});
```

## 6. Code Style and Quality

- **Clarity and Readability:** Write clean, self-documenting code. Use meaningful names for variables and functions.
- **Comments:** Add JSDoc-style comments to explain complex logic, especially within custom hooks and utility functions.
- **Error Handling:** Implement comprehensive error handling for all async operations, network requests, and data parsing. Provide user-friendly error messages and retry mechanisms.
- **No Unused Code:** Ensure your suggestions do not include unused imports or variables.

## 7. Performance & UX Considerations

- **Loading States:** Always show loading indicators during async operations.
- **Retry Logic:** Implement retry mechanisms for failed network requests with exponential backoff.
- **Caching:** Use appropriate cache headers for static assets while preventing stale question data.
- **Accessibility:** Ensure error messages and loading states are accessible to screen readers.
- **Progressive Enhancement:** The app should work even if localStorage is disabled.
