# L2script
Simple scripting language for art and animation, designed to help people learn to code.

After cloning run

```
npm i
npm run-script build
npm run-script start
```

And then open browser to http://localhost:5000/

== Commands ==

=== Create new object ===

new $type $name

$type can be text, rectangle, circle, line
$name can be any unique string or can be left off and a random name will be generated, but then you won't be able to reference it later

```
new rectangle sky
```

=== Set size ===

size $name $width $height

=== Set position ===

position $name $x $y

=== Set color ===

paint $name $color

=== Set outline ===

outline $name $color $thickness

=== Clone another object ===

This is useful to duplciate items to keep from typing them over and over

clone $objectToCopy $newName

=== Avoid typing name over and over ===

You can use the `with` property to set the object you're talking about. Then on the next lines do a space (or multiple spaces) indent. You can skip typing the name.

Example:

```
with sky
  paint blue
  size 640 300
  position 0 0
```

You can also do this without using the `with` property if you refer to that object in the previous line, again using the space indent.

Example:

```
paint sky blue
   size 640 300
```

Or:

```
new circle sun
   paint orange
   size 100 100
   position 0 0
```

=== Pause before continuing ===
 
Use wait to pause. Example:

```
wait 500
```

The above pauses 500 milliseconds, but you can also specify seconds:

```
wait 2 seconds
````

=== Move something relative to its current position ===

move $name 10 10

=== Or change the size by a certain amount ===

Increase it with

grow $name 10 5

You can also use negative numbers to shrink it

grow $name -5 -5

