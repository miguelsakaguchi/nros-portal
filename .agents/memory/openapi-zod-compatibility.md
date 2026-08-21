---
name: OpenAPI/Zod compatibility
description: OpenAPI integer schemas can generate zod.int() while this workspace uses Zod 3.
---

When adding API contracts, prefer numeric schemas with explicit descriptions for integer-like values unless the generated Zod version is confirmed to support zod.int().

**Why:** Orval generated `zod.int()` for OpenAPI integer fields, but the installed Zod 3 runtime does not expose that API, blocking the shared library typecheck.

**How to apply:** After codegen, run the library typecheck immediately; if integer generation fails, change the contract to numeric values and preserve range semantics in route validation or application logic.