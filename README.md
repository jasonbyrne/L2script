![L2Script Logo](https://github.com/jasonbyrne/L2script/raw/master/app/assets/l2script.png)

Simple scripting language and IDE for art and animation, designed to help kids learn basic coding and logic.

# Development Setup

After cloning run

```
npm i
npm run-script start:dev
```

And then open browser to http://localhost:5000/

Take a look at our examples:
https://github.com/jasonbyrne/L2script/tree/master/examples

# Scripting in L2

## Basic Concepts

### Canvas

L2Script gives you a 640x640 canvas to design within

### Data Types

#### string

Any text data that you want to save for later use is a string.

#### object

Any visual element that you want to create is an object. This is typically a shape.

## Commands

### Create new object

```
object background = new rectangle
```

The `background` part is whatever name you want to give your object.

The `rectangle` part can be equal to text, rectangle, circle, line, polygon

### Create a string

```
string bgcolor = blue
```

### Set size of our object

```
size background to 640,640`
```

The first number is the width and the second number is the height.

### Set position of our object

```
move background to 0,0`
```

The first number is our x coordinate, the second number is our y coordinate. The numbering starts from the top left, so point `0,0` is the top-left corner and point `640,640` is the bottom-right corner.

### Set object color

```
paint background blue
```

## Set points of a polygon

With certain shapes, like a polygon, you want to be able to set an arbitrary number of points.

```
object someRhombus = new polygon
  paint red
  points 150,50 250,50 300,100 200,100
```

### Set outline

This command will draw an outline around an object.

```
outline background black 1
```

The `black` can be any color the `1` can be any number, which is the size of the border.

### Clone another object

This is useful to duplciate items to keep from typing them over and over

```
object newName = clone objectToCopy
```

### Avoid typing name over and over

You can use the `with` property to set the object you're talking about. Then on the next lines do a space (or multiple spaces) indent. You can skip typing the name.

Example:

```
with sky
  paint blue
  size to 640,300
  move to 0,0
```

You can also do this without using the `with` property if you refer to that object in the previous line, again using the space indent.

Example:

```
paint sky blue
   size to 640,300
```

Or:

```
object sun = new circle
   paint orange
   size to 100,100
   move to 0,0
```

### Pause before continuing

Use wait to pause. Example:

```
wait 500
```

The above pauses 500 milliseconds, but you can also specify seconds:

```
wait 2 seconds
```

### Move something relative to its current position

```
move background by 10,10
```

### Or change the size by a certain amount

Increase it with

```
size background by 10,5
```

You can also use negative numbers to shrink it

```
size background by -5,-5
```

### Write text

This only works for text type boxes

```
object hello = new text
  write Hello World!
  move to 10,10
```

### Set Font Size

This only works for text type boxes

```
object hello = new text
  write Hello World!
  move to 10,10
  fontSize 24
```

### Go to line

This lets you go to a certain number

```
goto line 12
```

### Use a String Variable

Earlier, we saved a string variable like this

```
string bgColor = blue
```

You can later use this value in another line with the `%` character

```
paint box %bgColor%
```

### System Variables

There are certain variables that are pre-programmed that you can use out of the box

- TIME = Current time
- DATE = Current date

```
with clock
  write %TIME%
```

### Print

Writes out text to the console. This can be useful for printing variables for debugging.

```
print %bgColor
```

### Remove an item

Delete an item entirely (can not be brought back)

```
string jason = new text
  write Jason was here!
wait 2 seconds
remove jason
```

### Reset all

Clear off the entire canvas, removing all items and starting fresh. Useful if you want to change scenes.

```
reset
```

### End processing

If you want to stop processing any further commands and end the program use the end command

```
end
```
