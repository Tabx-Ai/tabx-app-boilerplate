# Plan — 008-identity-context

## Approach

The parser first, because everything downstream takes its output; then the class's questions;
then the frontend hook, which is a thin thing over the client that already exists.

## Why a class and not the parsed object

- **One home for the questions.** "Do they have a manager?", "do they hold this role?", "is this
  person their manager?" — asked by services and by policies, and otherwise answered slightly
  differently in each.
- **A construction guarantee.** Built by the parser and by nothing else, so an unvalidated
  context cannot exist. **A bare object can be forged by any caller** — and after this change it
  no longer compiles where a context is expected, which is how the sample's own tests had to
  change.
- **A stable signature.** When the platform widens the context again, the class widens; every
  service's signature stays as it is.

**What it costs:** the class must stay framework-free and immutable or it becomes a service
locator. The layering test already forbids the imports that would start that.

## The fixture, and why it goes through the parser

`test/context.fixture.ts` builds a real context by parsing one. A fixture that could **forge**
one would not be testing what services actually receive — and if it stops compiling because the
platform widened the shape, that is the signal rather than a nuisance.

## Constitution-compliance check

| Article | Compliance |
| --- | --- |
| **V §1** | **Extended by this spec**: what the context carries, and that it is a class. |
| **IV** | The envelope and the handler are untouched. |
| **This app's layering** | The class is framework-free; the hook sits above the client. |

## Risks

- **The hook fetching per consumer** — the classic mistake with a hook over a request. A test
  asserts one call for ten consumers.
- **A test stubbing the network for a page under the app prefix** must answer **per URL**:
  landing there fires the page's own call *and* the identity call, so one blanket answer feeds
  one of them the other's shape.
