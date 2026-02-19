# Coding Guidelines

The TODO app should be developed with consistency, readability, and long-term maintainability in mind. Contributors are expected to write code that is easy to understand, straightforward to test, and safe to extend as requirements evolve.

Use consistent formatting throughout the project. Keep indentation, spacing, and line breaks uniform so files are easy to scan and review. Prefer clear naming for variables, functions, and components, and choose names that express purpose rather than implementation detail. Small, focused functions are preferred over large multi-purpose blocks of logic.

Organize imports in a predictable order. Group external dependencies first, then internal modules, then local relative imports. Keep import lists tidy, remove unused imports, and avoid circular dependencies. If files become crowded, refactor shared logic into reusable modules.

Follow established project conventions for file structure and code style in both backend and frontend packages. Keep components and modules focused on a single responsibility, and favor composition over duplication. Apply the DRY (Don’t Repeat Yourself) principle by extracting repeated logic into shared helpers when it improves clarity.

Use modern JavaScript best practices: prefer `const` by default, use `let` only when reassignment is needed, handle errors explicitly, and avoid deeply nested conditionals where guard clauses improve readability. Keep side effects controlled and isolate business logic from presentation logic where possible.

Code quality should be enforced with automated linting. Use a linter to catch formatting issues, unused variables, potential bugs, and inconsistent patterns before code review. Contributors should run lint checks locally and resolve warnings/errors relevant to their changes before merging.

When adding or updating features, keep maintainability in focus: write code that future contributors can reason about quickly, avoid premature optimization, and include tests that validate expected behavior. Prefer incremental, reviewable changes over broad refactors unless a refactor is necessary to support correctness or clarity.