# reely

> A lightweight 360° slider for showcasing your products

* No jQuery dependency
* Heavily inspired by [rollerblade](https://github.com/austenpayan/rollerblade)
* touch-friendly
* Progressively loading images on initialization

## Installation

```bash
npm install --save reely
```

## Usage

```html
<div class="reely">
  <img src="images/0000.jpg">
</div>
```

```javascript
import reely from 'reely';

const images = [
  'images/0000.jpg',
  'images/0001.jpg',
  'images/0002.jpg'
];

const container = document.querySelector('.reely');

const slider = reely(container, {
  imageArray: images,
});

slider.init();
```

## API

| Method | Arguments | Description |
|--------|-----------|-------------|
| init | options | Initializes reely with [options](#options) |
| slideTo | slideNumber | Slides `slideNumber` |

## Options
At initialization reely accepts multiple options:

| Property Name | Type | Default | Description |
|---------------|------|---------|-------------|
| sensitivity | `number` | `35` | The lower the number, the more sensitive the rotator will be. The number value represents distance in pixels between each frame change.|
| drag | `boolean` | `true` | Determines if the rotator is draggable. If set to false, image will rotate on any mouse movement along the X axis of the page. |
| auto | `boolean` | `false` | Determines if rotator should spin by itself. Default is set to false. If set to true, rotator will spin and user interaction will be disabled. |
| edgeStop | `boolean` | `false`  | Determines if the rotator should keep on rotating when the first or last image is reached. |


## Events

| Event Name | Description |
|------------|-------------|
| slideChanged | Emits after the current slide has changed. Carries `e.detail.currentSlide` (see `/examples` folder) |


## Contribution

```bash
npm run dev
```

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2018-present, Klaus Fischer
