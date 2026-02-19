# Testing Guidelines

This document defines the core testing strategy for the TODO app and sets clear expectations for contributors.

## Summary of Testing Practices

The project follows these foundational testing practices:

1. Tests are written to validate behavior, not implementation details.
2. Test coverage includes happy paths, validation errors, and edge cases.
3. New features and bug fixes include tests that prove the change works.
4. Tests remain readable, maintainable, and focused on user-facing outcomes.
5. The automated test suite runs consistently in local and CI environments.

## Test Pyramid Requirements

The TODO app must include automated tests at three levels:

1. Unit tests
2. Integration tests
3. End-to-end (E2E) tests

## Unit Testing Requirements

1. Unit tests verify isolated logic (utility functions, state transitions, data validation).
2. Unit tests run quickly and do not depend on network or external services.
3. Unit tests cover core task behaviors including create, edit, complete, uncomplete, and delete actions.
4. Unit tests cover due date parsing, sorting logic, and filter behavior.

## Integration Testing Requirements

1. Integration tests validate interactions between UI components, API routes, and persistence layers.
2. Integration tests cover full task workflows, including input, save, list refresh, and state updates.
3. Integration tests verify backend/frontend contracts and expected request/response behavior.
4. Integration tests include validation scenarios such as empty title rejection and invalid input handling.

## End-to-End (E2E) Testing Requirements

1. E2E tests validate critical user journeys in a real browser environment.
2. E2E tests cover creating tasks, editing tasks, setting due dates, marking complete, filtering views, and deleting tasks.
3. E2E tests verify persistence across page refresh and application restart scenarios when applicable.
4. E2E tests are deterministic and avoid flaky timing assumptions.

## Definition of Done for Changes

1. Every new feature includes appropriate unit and integration tests at minimum.
2. User-critical flows changed by a feature are updated or added in E2E tests.
3. All relevant tests pass before merge.
4. Test names clearly describe the expected behavior.

## Test Maintainability Standards

1. Prefer shared test helpers to reduce duplication.
2. Keep tests independent so they can run in any order.
3. Avoid brittle assertions tied to non-essential UI text or internal implementation.
4. Update tests when requirements change; remove obsolete tests that no longer represent product behavior.