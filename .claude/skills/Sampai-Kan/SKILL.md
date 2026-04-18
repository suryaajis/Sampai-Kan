```markdown
# Sampai-Kan Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns used in the Sampai-Kan JavaScript codebase, which is built on the Express framework. You'll learn how to follow the project's coding conventions, including file naming, import/export styles, commit message formatting, and testing patterns. This guide helps ensure consistency and maintainability when contributing to Sampai-Kan.

## Coding Conventions

### File Naming
- Use **camelCase** for all file names.
  - Example: `userController.js`, `orderRoutes.js`

### Import Style
- Use **relative imports** for modules.
  - Example:
    ```javascript
    import { getUser } from './userService.js';
    ```

### Export Style
- Use **named exports** exclusively.
  - Example:
    ```javascript
    // userService.js
    export function getUser(id) { /* ... */ }
    export function createUser(data) { /* ... */ }
    ```

### Commit Messages
- Follow **Conventional Commits** with the `feat` prefix for features.
- Average commit message length: ~53 characters.
  - Example:
    ```
    feat: add user authentication middleware
    ```

## Workflows

_No automated workflows detected in this repository._

## Testing Patterns

- **Test File Pattern:** All test files follow the `*.test.*` naming convention.
  - Example: `userService.test.js`
- **Testing Framework:** Not explicitly detected; check project dependencies for specifics.
- **Test Example:**
  ```javascript
  // userService.test.js
  import { getUser } from './userService.js';

  test('should fetch user by ID', () => {
    const user = getUser(1);
    expect(user.id).toBe(1);
  });
  ```

## Commands
| Command | Purpose |
|---------|---------|
| /commit-guidelines | Show commit message conventions |
| /test-patterns     | Show how to write and name tests |
| /coding-style      | Show import/export and file naming rules |
```
