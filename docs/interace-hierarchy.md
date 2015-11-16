# Interface Design


## Layers

It's not feasible to redraw the entire screen for everything. It leaves gaps and flashing.

### 0: Screen

The screen is built in, so let's just assume everything is on top of that. While it's typically attached to `stdin/stdout` it could also be over a server.

### 1: Application Frame

The entire app will be embedded on a 100% width, 100% height container with a border and some baisc padding.

### 2: View Hierarchy

1. Issue List
	1. View Single Issue
		1. Post Inline Comment
		2. Post External Comment
	2. Create Issue
	3. Filter List
	4. Reports List
	5. Arbitrary Filter Prompts
	
## Loading Indicators

## Hotkeys and Discoverability