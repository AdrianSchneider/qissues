# Design Philosophy

This is sort of a living document of the current design philosophies and rules. I am by no means a UI designer, so this is meant to both remind me and explain the choices made so far.

## Data

**Caching**: data should be cached aggressively, with the user expectation that they know they are seeing a cached copy if there was no loading pause. If they know they need the latest data, they can always refresh the view. Metadata is cached longer than issue data.

**Lazy Loading**: data is fetched as late as possible to prevent up front loading of things they will not use. Questions are also asked as late as possible.

## Interactions

**Keyboard Shortcuts**: shortcuts are generally vim-like by default, but configurable. `hjkl` for navigation, `enter` for selection, `/` for inline-searching, `escape` to close modals, etc.

**Paging**: `less`-like. `ctrl+f`/`ctrl+b` for pages. `j`/`k` for lines. `g`/`G` for top/bottom.

**Composable**: again, like vim. leader, verb then noun:

- `,ct` - change title
- `,cs` - change status
- `,fs` - filter by status

`t` is title everywhere whenever a verb is accepted.

**Instant**: Always let the user know they have done something. Show a loading indicator right away, and if possible, prepare the next view and embed the indicator there. Never punish a fast typer.

**Consistency**: Every widget should use the same hotkeys. Every widget should be searchable. Every widget should be have the same way. Don't introduce a change/feature in one place only.

## Visuals

**Content First**: The UI should get out of the way. Obviousy with text-only this is easier, but no permanent menus should be shown. Color code important things.