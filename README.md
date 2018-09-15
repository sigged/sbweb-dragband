# DragBand #

UI library to create a draggable list bar
 - Native javascript
 - Responsive
 - Supports swiping

## Usage #

```js
// create a dragBar with itemindex 11 selected by default
var myDragBand = dragBand.init(
    document.querySelector('#myul'), 11, {
        leftScroller : document.getElementById('left-scroll-button'),
        rightscroller : document.getElementById('right-scroll-button'),
        scrollstep : 50,
        elasticWidth : 100,
        hideScrollerMargin : 20
    });

// select no item
myDragBand.selectItem(null);

// select item with index 2
myDragBand.selectItem(2);


// create object with default options and no scrollbuttons
var simpleDragBand = dragBand.init(document.querySelector('#simple'));
```

## Options

Configure the third parameter of `init` method as an object with the following properties:

| Property                | Type    |  Description                              | default |
|:------------------------|:-------:|:------------------------------------------| :------:|
| `leftScroller`          | Object  | element representing left scrollbutton    | `null`  |
| `rightscroller`         | Object  | element representing right scrollbutton   | `null`  |
| `scrollstep`            | number  | px to scroll when using wheel/scrollbutton| `50`    |
| `elasticWidth`          | number  | elasticity beyond left/right edges in px  | `100`   |
| `hideScrollerMargin` | number  | hidden buttons when with margin from edge | `20`    |

## Example #

Check https://codepen.io/anon/pen/vzaaoL for an example.

