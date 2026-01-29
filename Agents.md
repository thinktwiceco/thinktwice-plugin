# Agent Instructions

## Communication Style

- **Keep a concise tone** - Be direct and to the point in all communications
- Avoid unnecessary explanations or verbose responses

## Implementation Scope

- **Implement only what's requested** - Do not add extra features, methods, or functionality beyond the explicit request
- Focus strictly on the specific task at hand

## Pre-Implementation Process

Before implementing any feature or change, follow these steps:

### 1. Research Phase

- **Perform research** of all components involved in the implementation
- **Document findings** in a `research.md` file
- Identify:
  - Existing components, functions, or classes that may be affected
  - Dependencies and relationships between components
  - Current patterns and conventions used in the codebase

### 2. Implementation Planning

- **Define your implementation plan** based on research findings
- Outline the approach, components to modify/create, and expected outcomes

### 3. Plan Review

Before proceeding with implementation, review the plan to ensure:

#### Separation of Concerns

- Each component has a single, well-defined responsibility
- Logic is properly separated (UI, business logic, data access, etc.)
- No component handles multiple unrelated concerns

#### No Interface Leaks

- Internal implementation details are not exposed through public interfaces
- Abstractions are maintained and respected
- Dependencies flow in the correct direction (high-level modules don't depend on low-level modules)

#### Established or Maintain Clear Patterns

- Follow existing patterns and conventions in the codebase
- Maintain consistency with current architecture
- If introducing new patterns, ensure they align with the overall system design

#### Reusability

- **Look for existing functions or classes** that already implement similar functionalities
- Reuse existing code rather than duplicating functionality
- Extract common logic into reusable components when appropriate
- Avoid reinventing solutions that already exist in the codebase

## Testing

When writing a new test:

### Before Writing Tests

- **Look for implemented patterns** - Follow existing test structure and conventions
- **Look for implemented mocks and fixtures** - Reuse existing test utilities and data
- **When possible, re-use them** - Avoid duplicating test setup code

### After Implementing a Test

- **Execute the test** - Run the specific test to verify it works correctly
- **Execute all the tests** - Run the full test suite to ensure no regressions

## Workflow Summary

1. Research → Create `research.md`
2. Plan → Define implementation approach
3. Review → Verify separation of concerns, no interface leaks, clear patterns, reusability
4. Implement → Execute the reviewed plan
