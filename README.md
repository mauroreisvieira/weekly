# Weekly

Lightweight and simple calendar in pure JavaScript based on Hello-Week.

<p align="center">Weekly <b>10kB</b> calendar in pure JavaScript.</p>

## Quick start

#### Installation

```bash
npm install weekly --save
```

```bash
yarn add weekly
```

#### Including files:

```html
<link rel="stylesheet" type="text/css" href="weekly.min.css" />
<link rel="stylesheet" type="text/css" href="weekly.theme.min.css" />

<script type="text/javascript" src="weekly.min.js"></script>
<script>
  new Weekly();
</script>
```


## Options

Weekly comes with a few (optional) settings that you can change by passing an object as an argument.
Default values are presented below.

```js
new Weekly({
    selector: '.weekly',
    lang: 'en',
    format: {},
    weekShort: true,
    monthShort: false,
    multiplePick: true,
    defaultDate: null,
    todayHighlight: true,
    disablePastDays: false,
    disableDaysOfWeek: null,
    disableDates: null,
    weekStart: 0, // week start on Sunday
    daysHighlight: null,
    daysSelected: null,
    rtl: false,
    locked: false,
    minDate: null,
    maxDate: null,
    nav: ['◀', '▶'],
    onLoad: () => { /** callback function */ },
    onChange: () => { /** callback function */ },
    onSelect: () => { /** callback function */ },
    onClear: () => { /** callback function */ }
});
```


### Useful links

- [Demos](https://mauroreisvieira.github.io/weekly/)
- [Changelog](CHANGELOG.md)
- [Contributing](CONTRIBUTING.md)

### Supported Browsers:

- Chrome 49
- Firefox 31
- Opera 36
- Safari 9.3
- Edge 17
- iOS Safari 6.0

### License

**Weekly** is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT)
