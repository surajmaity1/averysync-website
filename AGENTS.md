# Agent Guidelines & Development Standards

## 1. Test-Driven Development (TDD) Workflow

Before modifying or adding any application code, **always** follow the Red-Green-Refactor cycle:

1. **🔴 RED**:
   - Write a failing test first in `tests/` that clearly defines the expected behavior or reproduces the bug.
   - Run `pnpm test` and verify that the test fails for the expected reason. Do not write implementation code yet.
2. **🟢 GREEN**:
   - Write the minimal implementation in `src/` required to make the test pass.
   - Run `pnpm test` and verify that all tests pass.
3. **🔵 REFACTOR**:
   - Clean up code, eliminate duplication, and improve clarity and type safety without changing behavior.
   - Ensure all tests remain green and typechecks pass (`pnpm test && pnpm build`).

---

## 2. React Official Standards & Best Practices

Follow official React documentation standards ([react.dev](https://react.dev)):

- **Component Purity**: Components must be pure functions of props and state. Never trigger side effects during render.
- **Avoid Redundant `useEffect`**: Do not use effects to calculate derived state or mirror props. Derive state directly in render.
- **Minimal State**: Store only the minimal necessary state. Calculate everything else on the fly.
- **Rules of Hooks**: Call hooks only at the top level of React functions; never in conditionals, loops, or nested functions.
- **User-Centric Testing**: Follow React Testing Library best practices. Query elements by accessible role (`getByRole`), label, or text over test IDs or CSS selectors. Test user behavior, not implementation details.
- **Type Safety**: Write strict TypeScript types for props, state, and return types. Avoid `any`.

---

## 3. Verification Commands

- **Run Tests**: `pnpm test`
- **Watch Tests (TDD)**: `pnpm test:watch`
- **Typecheck & Build**: `pnpm build`
- **Format & Lint Check**: `pnpm check`
