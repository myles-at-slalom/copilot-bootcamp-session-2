# UI Guidelines

This document defines the core user interface guidelines for the TODO app.

## Design Principles

1. Prioritize clarity and simplicity over decorative styling.
2. Keep interactions predictable and consistent across all views.
3. Make primary actions obvious and secondary actions unobtrusive.

## Layout and Structure

4. Use a single-column layout optimized for task entry and task list scanning.
5. Keep the task input area visible at the top of the app.
6. Group controls by purpose: task creation, filtering, and task actions.
7. Maintain consistent spacing between UI elements using a shared spacing scale.

## Components and Controls

8. Use consistent button styles for primary, secondary, and destructive actions.
9. Use clear labels for all buttons and controls; avoid icon-only actions unless a text label is also available.
10. Use checkbox controls to represent task completion state.
11. Use standard date input controls for due dates.
12. Use inline editable fields or a clear edit mode for task text updates.

## Visual Style

13. Use a limited, accessible color palette with one primary accent color.
14. Use color to support meaning, not as the only indicator of state.
15. Ensure text has strong contrast against backgrounds.
16. Keep typography consistent with a clear hierarchy for headings, body text, and metadata.

## Task List Behavior

17. Visually distinguish completed tasks (for example, reduced emphasis or strikethrough) while preserving readability.
18. Show due date metadata in a consistent location for each task row.
19. Highlight overdue active tasks with a clear but non-disruptive visual treatment.

## Interaction and Feedback

20. Provide immediate visual feedback for create, edit, complete, and delete actions.
21. Show validation messages near the relevant input when required fields are missing.
22. Ensure focus states are visible for all interactive elements.

## Accessibility Requirements

23. Ensure all functionality is fully usable by keyboard.
24. Provide semantic labels for form controls and interactive elements.
25. Ensure screen readers can announce task state, due date, and available actions.
26. Meet WCAG 2.1 AA contrast requirements for text and interactive controls.

## Responsive Behavior

27. Ensure the UI works on small screens without horizontal scrolling.
28. Preserve touch-friendly target sizes for interactive elements on mobile devices.
29. Keep critical actions visible and reachable across viewport sizes.