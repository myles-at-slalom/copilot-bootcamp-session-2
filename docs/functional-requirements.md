# Functional Requirements

This document defines the core functional requirements for the TODO app.

## Core Task Management

1. The user can create a new task with a required title.
2. The user can edit an existing task title.
3. The user can delete an existing task.
4. The user can mark a task as complete.
5. The user can mark a completed task as incomplete.

## Task Details

6. The user can assign an optional due date to a task.
7. The user can update or remove a task due date.

## Organization and Visibility

8. Tasks are displayed in a consistent, predictable order.
9. Tasks are sorted with incomplete tasks first, then completed tasks.
10. Within each completion group, tasks are sorted by earliest due date first.
11. Tasks without a due date are shown after tasks with due dates within the same completion group.

## Filtering

12. The user can filter tasks by status: all, active, or completed.
13. The task list updates immediately when a filter is selected.

## Persistence

14. Tasks and their attributes (title, completion status, due date) persist across page refreshes.

## Validation and Feedback

15. The app prevents creating a task with an empty title.
16. The app prevents saving an edit with an empty title.
17. The UI provides clear feedback when validation rules fail.