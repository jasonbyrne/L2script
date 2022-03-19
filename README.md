# L2script

Simple scripting language for art and animation, designed to help people learn to code.

After cloning run

```
npm i
npm run-script start:dev
```

And then open browser to http://localhost:5000/

Take a look at our examples:
https://github.com/jasonbyrne/L2script/tree/master/examples

## Commands

### Create new object

`new $type as $name`

$type can be text, rectangle, circle, line, polygon
$name can be any unique string or can be left off and a random name will be generated, but then you won't be able to reference it later

```
new rectangle as sky
```

### Set size

`size $name to $width,$height`

### Set position

`move $name to $x,$y`

## Set points

With certain shapes, like a polygon, you want to be able to set an arbitrary number of points.

```
new polygon as someRhombus
  paint red
  points 150,50 250,50 300,100 200,100
```

### Set color

`paint $name $color`

### Set outline

`outline $name $color $thickness`

### Clone another object

This is useful to duplciate items to keep from typing them over and over

`clone $objectToCopy as $newName`

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
new circle as sun
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

`move $name by 10,10`

### Or change the size by a certain amount

Increase it with

`size $name by 10,5`

You can also use negative numbers to shrink it

`size $name by -5,-5`

### Write text

This only works for text type boxes

```
new text as hello
  write Hello World!
  move to 10,10
```

# Set Font Size

This only works for text type boxes

```
new text as hello
  write Hello World!
  move to 10,10
  fontSize 24
```

# Go to line

This lets you go to a certain number

```
goto line 12
```

# Set Variable

Saves a variable with a given name and value

```
set bgColor = blue
```

You can later use this value in another line with the % character

```
paint box %bgColor
```

# System Variables

There are certain variables that are pre-programmed that you can use out of the box

- TIME = Current time
- DATE = Current date

```
with clock
  write %TIME
```

# Print

Writes out text to the console. This can be useful for printing variables for debugging.

```
print %bgColor
```

### Remove an item

Delete an item entirely (can not be brought back)

```
new text as jason
  write Jason was here!
wait 2 seconds
remove jason
```

### Reset all

Clear off the entire canvas, removing all items and starting fresh. Useful if you want to change scenes.

```
reset
```
