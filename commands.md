# Commands
All the commands that can be recognized through the command bar.
## Settings
Settings applied to the overall application environment.
### resize
```
resize WIDTH HEIGHT
```
Default: `resize 80 48`

Resizes the window to with the values multiplied by the size of a single character.
### Colored Screen Names
```
colorname [true/false/1/0]
```
Default: `colorname false`

Colors user name using their profile theme color.

If set to true, default colors will be only applied to the @ before the user name.

## Tabs
A tab in Text Transmitter is a space to contain tweets, mostly from a single timeline you can get using the API.
### add
```
add DISPLAY_NAME [URI] [POSITION]
```
Adds a tab between other tabs using the given position value.

If position is not defined the tab will be placed at the rightmost position.

`DISPLAY_NAME` is one of the predefined names below. You can name it whatever you want instead with adding the URI in the command manually.

name | URI
--- | ---
mention | 
user | 
home | 
### rename
### reorder
### remove
### flush

## Actions
User actions in Twitter, including fetching tweets, posting a tweet.
### update
### search
