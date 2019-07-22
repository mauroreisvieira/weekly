/**
 * Create HTML elements for Hello Week.
 *
 * @param {string}     className
 * @param {string}     textNode
 */
function createElement(className, content) {
    const elem = document.createElement('div');
    elem.classList.add(className);
    if (!content) {
        elem.appendChild(document.createTextNode(content));
    }
    return elem;
}
/**
 * Append HTML element inside other HTML element.
 *
 * @param      {HTMLElement}  element
 * @param      {HTMLElement}  parentElement
 */
function append(element, parentElement) {
    parentElement.appendChild(element);
}

function setAttr(el, name, value) {
    return el.setAttribute(name, value);
}
function setStyle(el, prop, value) {
    return el.style.setProperty(prop, value);
}
function addClass(el, className) {
    return el.classList.add(className);
}
function removeClass(el, className) {
    return el.classList.remove(className);
}
function toggleClass(el, className) {
    return el.classList.toggle(className);
}

/* @enum {string} */
const cssClasses = {
    CALENDAR: 'weekly',
    DAY: 'day',
    MONTH: 'month',
    NAVIGATION: 'navigation',
    NEXT: 'next',
    PERIOD: 'period',
    PREV: 'prev',
    RTL: 'rtl',
    WEEK: 'week',
};
/* @enum {string} */
const cssStates = {
    IS_DISABLED: 'is-disabled',
    IS_HIGHLIGHT: 'is-highlight',
    IS_SELECTED: 'is-selected',
    IS_TODAY: 'is-today',
    IS_WEEKEND: 'is-weekend',
};
/* @enum {string} */
const daysWeek = {
    FRIDAY: 5,
    MONDAY: 1,
    SATURDAY: 6,
    SUNDAY: 0,
    THURSDAY: 4,
    TUESDAY: 2,
    WEDNESDAY: 3,
};

function getIndexForEventTarget(daysOfMonth, target) {
    return Array.prototype.slice.call(daysOfMonth).indexOf(target) + 1;
}
function extend(to, from) {
    if (typeof Object.assign === 'function') {
        return Object.assign(from, to);
    }
    for (const key in from) {
        to[key] = from[key];
    }
    return to;
}

function error(msg) {
    throw new Error(`[Weekly Error]: ${msg}`);
}

function isString(val) {
    return typeof val === 'string';
}

const config = {
    daysHighlight: null,
    daysSelected: null,
    defaultDate: null,
    disableDates: null,
    disableDaysOfWeek: null,
    disablePastDays: false,
    format: {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        timeZone: 'UTC'
    },
    lang: 'en-GB',
    locked: false,
    maxDate: null,
    minDate: null,
    monthShort: false,
    multiplePick: false,
    nav: ['◀', '▶'],
    range: false,
    rtl: false,
    selector: '.weekly',
    todayHighlight: true,
    weekShort: true,
    weekStart: 0,
    onLoad: () => { },
    onClear: () => { },
    onNavigation: () => { },
    onSelect: () => { },
};

function formatDate(day, month, year) {
    return `${year}-${('0' + (month + 1)).slice(-2)}-${('0' + (day)).slice(-2)}`;
}
/**
 * Set date timestamp to human format.
 *
 * @param      {number}  timestamp
 * @param      {string}  format
 * @return     {string}
 */
function timestampToHuman(timestamp, lang, format) {
    const dt = new Date(timestamp);
    return new Intl.DateTimeFormat(lang ? lang : config.lang, format ? format : config.format).format(dt);
}
/**
 * Set date human format to timestamp.
 *
 * @param      {string}
 * @return     {number}
 */
function humanToTimestamp(date) {
    if (date && (!isNaN(Number(date)) || date.split('-').length !== 3)) {
        throw new Error(`The date ${date} is not valid!`);
    }
    if (date || typeof date === 'string') {
        return new Date(date + 'T00:00:00Z').getTime();
    }
    return new Date().setHours(0, 0, 0, 0);
}

class Weekly {
    constructor(options = {}) {
        this.calendar = {};
        this.daysSelected = [];
        this.lastSelectedDay = 0;
        this.options = extend(options, config);
        this.initOptions = extend(options, config);
        this.selector = isString(this.options.selector) ? document.querySelector(this.options.selector) :
            this.options.selector;
        // early throw if selector doesn't exists
        if (this.selector === null) {
            error('You need to specify a selector!');
        }
        if (this.options.selector !== cssClasses.CALENDAR) {
            addClass(this.selector, cssClasses.CALENDAR);
        }
        this.calendar.navigation = createElement(cssClasses.NAVIGATION, this.selector);
        if (this.options.nav) {
            this.calendar.prevMonth = createElement(cssClasses.PREV, this.options.nav[0]);
            this.calendar.period = createElement(cssClasses.PERIOD);
            this.calendar.nextMonth = createElement(cssClasses.NEXT, this.options.nav[1]);
            console.log(this.calendar.period);
            append(this.calendar.navigation, this.selector);
            append(this.calendar.prevMonth, this.calendar.navigation);
            append(this.calendar.period, this.calendar.navigation);
            append(this.calendar.nextMonth, this.calendar.navigation);
            this.calendar.prevMonth.addEventListener('click', () => { this.prev(); });
            this.calendar.nextMonth.addEventListener('click', () => { this.next(); });
        }
        else {
            this.calendar.period = createElement(cssClasses.PERIOD);
            append(this.calendar.period, this.calendar.navigation);
        }
        this.calendar.week = createElement(cssClasses.WEEK);
        this.calendar.month = createElement(cssClasses.MONTH);
        append(this.calendar.week, this.selector);
        append(this.calendar.month, this.selector);
        if (this.options.rtl) {
            addClass(this.calendar.week, cssClasses.RTL);
            addClass(this.calendar.month, cssClasses.RTL);
        }
        this.init();
    }
    /**
     * Destroy the calendar and remove the instance from the target element.
     */
    destroy() {
        this.removeStatesClass();
        this.selector.remove();
    }
    /**
     * Change the month to the previous, also you can send a callback function like a parameter.
     * @param {() => void} callback
     */
    prev(callback) {
        const prevMonth = this.date.getMonth() - 1;
        this.date.setMonth(prevMonth);
        this.update();
        this.options.onNavigation.call(this);
        if (callback) {
            callback.call(this);
        }
    }
    /**
     * Change the month to the next, also you can send a callback function like a parameter.
     * @param {() => void} callback
     */
    next(callback) {
        const nextMonth = this.date.getMonth() + 1;
        this.date.setMonth(nextMonth);
        this.update();
        this.options.onNavigation.call(this);
        if (callback) {
            callback.call(this);
        }
    }
    /**
     * Update and redraws the events for the current month.
     * @public
     */
    update() {
        this.clearCalendar();
        this.mounted();
    }
    /**
     * Reset calendar
     * @public
     */
    reset(options = {}, callback) {
        this.clearCalendar();
        this.options = extend(options, this.initOptions);
        this.init(callback);
    }
    /**
     * Move the calendar to current day.
     * @public
     */
    goToday() {
        this.date = this.todayDate;
        this.date.setDate(1);
        this.update();
    }
    /**
     * Move the calendar to arbitrary day.
     * @param {any} date
     * @public
     */
    goToDate(date = this.todayDate) {
        this.date = new Date(date);
        this.date.setDate(1);
        this.update();
    }
    /**
     * Returns the selected days with the format specified.
     * @return {any}
     */
    getDays() {
        return this.daysSelected.map((day) => timestampToHuman(day, this.options.format, this.langs));
    }
    /**
     * Gets the day selected.
     * @return {number}
     */
    getDaySelected() {
        return this.lastSelectedDay;
    }
    /**
     * Returns the highlight dates.
     * @return {object}
     */
    getDaysHighlight() {
        return this.daysHighlight;
    }
    /**
     * Returns the current month selected.
     * @return {string}
     */
    getMonth() {
        return this.date.getMonth() + 1;
    }
    /**
     * Returns the current year selected.
     * @return {string}
     */
    getYear() {
        return this.date.getFullYear();
    }
    /**
     * Set highlight dates,
     */
    setDaysHighlight(daysHighlight) {
        this.daysHighlight = [...this.daysHighlight, ...daysHighlight];
    }
    /**
     * Sets calendar with multiple pick.
     * @param {boolean} state
     */
    setMultiplePick(state) {
        this.options.multiplePick = state;
    }
    /**
     * Sets calendar with disable past days.
     * @param {boolean} state
     */
    setDisablePastDays(state) {
        this.options.disablePastDays = state;
    }
    /**
     * Sets calendar with today highlight.
     * @param {boolean} state
     */
    setTodayHighlight(state) {
        this.options.todayHighlight = state;
    }
    /**
     * Sets calendar locked.
     * @param {boolean} state
     */
    setLocked(state) {
        this.options.locked = state;
    }
    /**
     * Set min date.
     * @param {string} date
     */
    setMinDate(date) {
        this.options.minDate = new Date(date);
        this.options.minDate.setHours(0, 0, 0, 0);
        this.options.minDate.setDate(this.options.minDate.getDate() - 1);
    }
    /**
     * Set max date.
     * @param {string} date
     */
    setMaxDate(date) {
        this.options.maxDate = new Date(date);
        this.options.maxDate.setHours(0, 0, 0, 0);
        this.options.maxDate.setDate(this.options.maxDate.getDate() + 1);
    }
    /**
     * @param {() => void} callback
     */
    init(callback) {
        this.daysHighlight = this.options.daysHighlight ? this.options.daysHighlight : [];
        this.daysSelected = this.options.daysSelected ? this.options.daysSelected : [];
        if (this.daysSelected.length > 1 && !this.options.multiplePick) {
            error(`There are ${this.daysSelected.length} dates selected, but the multiplePick option
                is ${this.options.multiplePick}!`);
        }
        this.todayDate = humanToTimestamp();
        this.date = new Date();
        this.defaultDate = new Date();
        if (this.options.defaultDate) {
            this.date = new Date(this.options.defaultDate);
            this.defaultDate = new Date(this.options.defaultDate);
            this.defaultDate.setDate(this.defaultDate.getDate());
        }
        this.date.setDate(1);
        if (this.options.minDate) {
            this.setMinDate(this.options.minDate);
        }
        if (this.options.maxDate) {
            this.setMaxDate(this.options.maxDate);
        }
        this.mounted();
        this.options.onLoad.call(this);
        if (callback) {
            callback.call(this);
        }
    }
    /**
     * Select day
     * @param {() => void} callback
     */
    selectDay(callback) {
        this.daysOfMonth =
            this.selector.querySelectorAll('.' + cssClasses.MONTH + ' .' + cssClasses.DAY);
        for (const i of Object.keys(this.daysOfMonth)) {
            this.handleClickInteraction(this.daysOfMonth[i], callback);
        }
    }
    /**
     * @param {HTMLElement} target
     * @param {() => void} callback
     */
    handleClickInteraction(target, callback) {
        target.addEventListener('click', (event) => {
            const index = getIndexForEventTarget(this.daysOfMonth, event.target);
            if (this.days[index].locked) {
                return;
            }
            this.lastSelectedDay = this.days[index].timestamp;
            if (this.options.multiplePick) {
                if (this.days[index].timestamp) {
                    this.daysSelected = this.daysSelected
                        .filter((day) => humanToTimestamp(day) !== this.lastSelectedDay);
                }
                if (!this.days[index].isSelected) {
                    this.daysSelected
                        .push(timestampToHuman(this.lastSelectedDay));
                }
            }
            else {
                if (!this.days[index].locked) {
                    this.removeStatesClass();
                }
                this.daysSelected = [];
                this.daysSelected.push(timestampToHuman(this.lastSelectedDay));
            }
            toggleClass(event.target, cssStates.IS_SELECTED);
            this.days[index].isSelected = !this.days[index].isSelected;
            this.options.onSelect.call(this);
            if (callback) {
                callback.call(this);
            }
        });
    }
    /**
     * @param      {string}  dayShort
     */
    creatWeek(dayShort) {
        const weekDay = document.createElement('span');
        addClass(weekDay, cssClasses.DAY);
        weekDay.textContent = dayShort;
        this.calendar.week.appendChild(weekDay);
    }
    createMonth() {
        const currentMonth = this.date.getMonth();
        while (this.date.getMonth() === currentMonth) {
            this.createDay(this.date);
            this.date.setDate(this.date.getDate() + 1);
        }
        this.date.setMonth(this.date.getMonth() - 1);
        this.selectDay(() => { });
    }
    /**
     * Create days inside weekly
     * @param {Date} date
     */
    createDay(date) {
        const num = date.getDate();
        const day = date.getDay();
        const newDay = document.createElement('div');
        const dayOptions = {
            day: num,
            timestamp: humanToTimestamp(formatDate(date.getDate(), date.getMonth(), date.getFullYear())),
            isWeekend: false,
            locked: false,
            isToday: false,
            isSelected: false,
            isHighlight: false
        };
        this.days = this.days || {};
        newDay.textContent = String(dayOptions.day);
        addClass(newDay, cssClasses.DAY);
        if (dayOptions.day === 1) {
            if (this.options.weekStart === daysWeek.SUNDAY) {
                setStyle(newDay, this.options.rtl ? 'margin-right' : 'margin-left', ((day) * (100 / Object.keys(daysWeek).length)) + '%');
            }
            else {
                if (day === daysWeek.SUNDAY) {
                    setStyle(newDay, this.options.rtl ? 'margin-right' : 'margin-left', ((Object.keys(daysWeek).length - this.options.weekStart) *
                        (100 / Object.keys(daysWeek).length)) + '%');
                }
                else {
                    setStyle(newDay, this.options.rtl ? 'margin-right' : 'margin-left', ((day - 1) * (100 / Object.keys(daysWeek).length)) + '%');
                }
            }
        }
        if (day === daysWeek.SUNDAY || day === daysWeek.SATURDAY) {
            addClass(newDay, cssStates.IS_WEEKEND);
            dayOptions.isWeekend = true;
        }
        if (this.options.locked
            || this.options.disableDaysOfWeek && this.options.disableDaysOfWeek.includes(day)
            || this.options.disablePastDays && +this.date.setHours(0, 0, 0, 0)
                <= +this.defaultDate.setHours(0, 0, 0, 0) - 1
            || this.options.minDate && (+this.options.minDate >= dayOptions.timestamp)
            || this.options.maxDate && (+this.options.maxDate <= dayOptions.timestamp)) {
            addClass(newDay, cssStates.IS_DISABLED);
            dayOptions.locked = true;
        }
        if (this.options.disableDates) {
            this.setDaysDisable(newDay, dayOptions);
        }
        if (this.todayDate === dayOptions.timestamp && this.options.todayHighlight) {
            addClass(newDay, cssStates.IS_TODAY);
            dayOptions.isToday = true;
        }
        this.daysSelected.find((daySelected) => {
            if (daySelected === dayOptions.timestamp ||
                humanToTimestamp(daySelected.toString()) === dayOptions.timestamp) {
                addClass(newDay, cssStates.IS_SELECTED);
                dayOptions.isSelected = true;
            }
        });
        if (this.daysHighlight) {
            this.setDayHighlight(newDay, dayOptions);
        }
        if (this.calendar.month) {
            this.calendar.month.appendChild(newDay);
        }
        this.days[dayOptions.day] = dayOptions;
    }
    /**
     * Sets the days disable.
     * @param      {HTMLElement}  newDay
     * @param      {any}  dayOptions
     */
    setDaysDisable(newDay, dayOptions) {
        if (this.options.disableDates[0] instanceof Array) {
            this.options.disableDates.map((date) => {
                if (dayOptions.timestamp >= humanToTimestamp(date[0]) &&
                    dayOptions.timestamp <= humanToTimestamp(date[1])) {
                    addClass(newDay, cssStates.IS_DISABLED);
                    dayOptions.locked = true;
                }
            });
        }
        else {
            this.options.disableDates.map((date) => {
                if (dayOptions.timestamp === humanToTimestamp(date)) {
                    addClass(newDay, cssStates.IS_DISABLED);
                    dayOptions.locked = true;
                }
            });
        }
    }
    /**
     * Set day highlight.
     * @param      {HTMLElement}  newDay
     * @param      {any}  dayOptions
     */
    setDayHighlight(newDay, dayOptions) {
        for (const key in this.daysHighlight) {
            if (this.daysHighlight[key].days[0] instanceof Array) {
                this.daysHighlight[key].days.map((date) => {
                    if (dayOptions.timestamp >= humanToTimestamp(date[0]) &&
                        dayOptions.timestamp <= humanToTimestamp(date[1])) {
                        this.setStyleDayHighlight(newDay, key, dayOptions);
                    }
                });
            }
            else {
                this.daysHighlight[key].days.map((date) => {
                    if (dayOptions.timestamp === humanToTimestamp(date)) {
                        this.setStyleDayHighlight(newDay, key, dayOptions);
                    }
                });
            }
        }
    }
    /**
     * Sets styles for days highlight.
     * @param      {HTMLElement}  newDay
     * @param      {any}  key
     * @param      {any}  dayOptions
     */
    setStyleDayHighlight(newDay, key, dayOptions) {
        addClass(newDay, cssStates.IS_HIGHLIGHT);
        if (this.daysHighlight[key].title) {
            dayOptions.tile = this.daysHighlight[key].title;
            setAttr(newDay, 'data-title', this.daysHighlight[key].title);
        }
        if (this.daysHighlight[key].color) {
            setStyle(newDay, 'color', this.daysHighlight[key].color);
        }
        if (this.daysHighlight[key].backgroundColor) {
            setStyle(newDay, 'background-color', this.daysHighlight[key].backgroundColor);
        }
        dayOptions.isHighlight = true;
    }
    monthsAsString() {
        const options = { month: this.options.monthShort ? 'short' : 'long' };
        return this.date.toLocaleString(this.options.lang, options);
    }
    weekAsString() {
        const options = { month: this.options.weekShort ? 'short' : 'long' };
        return this.date.toLocaleString(this.options.lang, options);
    }
    mounted() {
        const listDays = [];
        if (this.calendar.period) {
            this.calendar.period.innerHTML = this.monthsAsString() + ' ' + this.date.getFullYear();
        }
        /** define week format */
        this.calendar.week.textContent = '';
        for (let i = this.options.weekStart; i < 7; i++) {
            listDays.push(i);
        }
        for (let i = 0; i < this.options.weekStart; i++) {
            listDays.push(i);
        }
        for (const day of listDays) {
            this.creatWeek(this.weekAsString());
        }
        this.createMonth();
    }
    /**
     * Clean calendar.
     */
    clearCalendar() {
        this.calendar.month.textContent = '';
    }
    /**
     * Removes all selected classes.
     */
    removeStatesClass() {
        for (const i of Object.keys(this.daysOfMonth)) {
            removeClass(this.daysOfMonth[i], cssStates.IS_SELECTED);
            this.days[+i + 1].isSelected = false;
        }
    }
}

export { Weekly };
