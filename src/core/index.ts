import { createElement } from '../vdom/create-element';
import { addClass, removeClass, setAttr, setStyle, toggleClass } from '../vdom/patch';
import { cssClasses, cssStates, daysWeek } from '../shared/constants';
import { error, extend, isString, getIndexForEventTarget } from '../util/index';
import { formatDate, humanToTimestamp, timestampToHuman } from './format';
import { config } from './config';

export class Weekly {
    private readonly initOptions: any;
    private calendar: any = {};
    private date: any;
    private days: any;
    private daysHighlight: any;
    private daysOfMonth: any;
    private daysSelected: any = [];
    private defaultDate: any;
    private langs: any;
    private lastSelectedDay: number = 0;
    private options: any;
    private selector: any;
    private todayDate: any;

    constructor(options: any = {}) {
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

        this.calendar.navigation = createElement(
            cssClasses.NAVIGATION,
            this.selector
        );

        if (this.options.nav) {
            this.calendar.prevMonth = createElement(
                cssClasses.PREV,
                this.calendar.navigation,
                this.options.nav[0]
            );

            this.calendar.period = createElement(
                cssClasses.PERIOD,
                this.calendar.navigation
            );
            this.calendar.nextMonth = createElement(
                cssClasses.NEXT,
                this.calendar.navigation, this.options.nav[1]
            );

            this.calendar.prevMonth.addEventListener('click', () => { this.prev(); });
            this.calendar.nextMonth.addEventListener('click', () => { this.next(); });

        } else {
            this.calendar.period = createElement(
                cssClasses.PERIOD,
                this.calendar.navigation
            );
        }

        this.calendar.week = createElement(cssClasses.WEEK, this.selector);
        this.calendar.month = createElement(cssClasses.MONTH, this.selector);

        if (this.options.rtl) {
            addClass(this.calendar.week, cssClasses.RTL);
            addClass(this.calendar.month, cssClasses.RTL);
        }

        this.init();
    }

    /**
     * Destroy the calendar and remove the instance from the target element.
     */
     destroy(): void {
        this.removeStatesClass();
        this.selector.remove();
     }

    /**
     * Change the month to the previous, also you can send a callback function like a parameter.
     * @param {() => void} callback
     */
     prev(callback?: () => void): void {
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
     next(callback?: () => void): void {
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
     update(): void {
         this.clearCalendar();
         this.mounted();
     }

    /**
     * Reset calendar
     * @public
     */
     reset(options: any = {}, callback?: () => void): void {
         this.clearCalendar();
         this.options = extend(options, this.initOptions);
         this.init(callback as () => void);
     }

    /**
     * Move the calendar to current day.
     * @public
     */
     goToday(): void {
         this.date = this.todayDate;
         this.date.setDate(1);
         this.update();
     }

    /**
     * Move the calendar to arbitrary day.
     * @param {any} date
     * @public
     */
     goToDate(date: any = this.todayDate): void {
         this.date = new Date(date);
         this.date.setDate(1);
         this.update();
     }

    /**
     * Returns the selected days with the format specified.
     * @return {any}
     */
     getDays(): any {
         return this.daysSelected.map((day: number) =>
             timestampToHuman(day, this.options.format, this.langs));
     }

    /**
     * Gets the day selected.
     * @return {number}
     */
     getDaySelected(): number {
         return this.lastSelectedDay;
     }

    /**
     * Returns the highlight dates.
     * @return {object}
     */
     getDaysHighlight(): string {
         return this.daysHighlight;
     }

    /**
     * Returns the current month selected.
     * @return {string}
     */
     getMonth(): string {
         return this.date.getMonth() + 1;
     }

    /**
     * Returns the current year selected.
     * @return {string}
     */
     getYear(): string {
         return this.date.getFullYear();
     }

    /**
     * Set highlight dates,
     */
     setDaysHighlight(daysHighlight: any): void {
         this.daysHighlight = [...this.daysHighlight, ...daysHighlight];
     }

    /**
     * Sets calendar with multiple pick.
     * @param {boolean} state
     */
     setMultiplePick(state: boolean) {
         this.options.multiplePick = state;
     }

    /**
     * Sets calendar with disable past days.
     * @param {boolean} state
     */
     setDisablePastDays(state: boolean) {
         this.options.disablePastDays = state;
     }

    /**
     * Sets calendar with today highlight.
     * @param {boolean} state
     */
     setTodayHighlight(state: boolean) {
         this.options.todayHighlight = state;
     }

    /**
     * Sets calendar locked.
     * @param {boolean} state
     */
     setLocked(state: boolean) {
         this.options.locked = state;
     }

    /**
     * Set min date.
     * @param {string} date
     */
     setMinDate(date: number | string) {
         this.options.minDate = new Date(date);
         this.options.minDate.setHours(0, 0, 0, 0);
         this.options.minDate.setDate(this.options.minDate.getDate() - 1);
     }

    /**
     * Set max date.
     * @param {string} date
     */
     setMaxDate(date: number | string) {
         this.options.maxDate = new Date(date);
         this.options.maxDate.setHours(0, 0, 0, 0);
         this.options.maxDate.setDate(this.options.maxDate.getDate() + 1);
     }

    /**
     * @param {() => void} callback
     */
    private init(callback?: () => void) {
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
     private selectDay(callback: () => void): void {
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
     private handleClickInteraction(target: HTMLElement, callback: () => void): void {
         target.addEventListener('click', (event: any) => {
             const index = getIndexForEventTarget(this.daysOfMonth, event.target);
             if (this.days[index].locked) {
                 return;
             }

             this.lastSelectedDay = this.days[index].timestamp;

             if (this.options.multiplePick) {
                 if (this.days[index].timestamp) {
                     this.daysSelected = this.daysSelected
                     .filter((day: string) => humanToTimestamp(day) !== this.lastSelectedDay);
                 }
                 if (!this.days[index].isSelected) {
                     this.daysSelected
                     .push(timestampToHuman(this.lastSelectedDay));
                 }
             } else {
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
     private creatWeek(dayShort: string): void {
         const weekDay = document.createElement('span');
         addClass(weekDay, cssClasses.DAY);
         weekDay.textContent = dayShort;
         this.calendar.week.appendChild(weekDay);
     }

    private createMonth(): void {
        const currentMonth = this.date.getMonth();
        while (this.date.getMonth() === currentMonth) {
            this.createDay(this.date);
            this.date.setDate(this.date.getDate() + 1);
        }
        this.date.setMonth(this.date.getMonth() - 1);
        this.selectDay(() => { /** callback function */ });
    }

    /**
     * Create days inside hello-week
     * @param {Date} date
     */
    private createDay(date: Date): void {
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
            isHighlight: false,
            element: false,
        };

        this.days = this.days || {};
        newDay.textContent = dayOptions.day;
        addClass(newDay, cssClasses.DAY);

        if (dayOptions.day === 1) {
            if (this.options.weekStart === daysWeek.SUNDAY) {
                setStyle(newDay, this.options.rtl ? 'margin-right' : 'margin-left',
                    ((day) * (100 / Object.keys(daysWeek).length)) + '%');
            } else {
                if (day === daysWeek.SUNDAY) {
                    setStyle(newDay, this.options.rtl ? 'margin-right' : 'margin-left',
                        ((Object.keys(daysWeek).length - this.options.weekStart) *
                            (100 / Object.keys(daysWeek).length)) + '%');
                } else {
                    setStyle(newDay, this.options.rtl ? 'margin-right' : 'margin-left',
                        ((day - 1) * (100 / Object.keys(daysWeek).length)) + '%');
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

        this.daysSelected.find( (daySelected: number) => {
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

        dayOptions.element = newDay;
        this.days[dayOptions.day] = dayOptions;
    }

    /**
     * Sets the days disable.
     * @param      {HTMLElement}  newDay
     * @param      {any}  dayOptions
     */
     private setDaysDisable(newDay: HTMLElement, dayOptions: any): void {
        if (this.options.disableDates[0] instanceof Array) {
            this.options.disableDates.map((date: any) => {
                if (dayOptions.timestamp >= humanToTimestamp(date[0]) &&
                    dayOptions.timestamp <= humanToTimestamp(date[1])) {
                    addClass(newDay, cssStates.IS_DISABLED);
                    dayOptions.locked = true;
                }
            });
        } else {
             this.options.disableDates.map((date: any) => {
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
     private setDayHighlight(newDay: HTMLElement, dayOptions: any): void {
         for (const key in this.daysHighlight) {
             if (this.daysHighlight[key].days[0] instanceof Array) {
                 this.daysHighlight[key].days.map((date: any, index: number) => {
                     if (dayOptions.timestamp >= humanToTimestamp(date[0]) &&
                         dayOptions.timestamp <= humanToTimestamp(date[1])) {
                         this.setStyleDayHighlight(newDay, key, dayOptions);
                 }
             });
             } else {
                 this.daysHighlight[key].days.map((date: any) => {
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
     private setStyleDayHighlight(newDay: HTMLElement, key: any, dayOptions: any) {
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

    /**
     * @param      {number}  monthIndex
     * @return     {object}
     */
     private monthsAsString(monthIndex: number): any {
         return this.options.monthShort ? this.langs.monthsShort[monthIndex] : this.langs.months[monthIndex];
     }

    /**
     * @param      {number}  weekIndex
     * @return     {object}
     */
     private weekAsString(weekIndex: number): any {
         return this.options.weekShort ? this.langs.daysShort[weekIndex] : this.langs.days[weekIndex];
     }

     private mounted(): void {
         const listDays: number[] = [];
         if (this.calendar.period) {
             this.calendar.period.innerHTML = this.monthsAsString(this.date.getMonth()) + ' ' + this.date.getFullYear();
         }
         /** define week format */
         this.calendar.week.textContent = '';
         for (let i = this.options.weekStart; i < this.langs.daysShort.length; i++) {
             listDays.push(i);
         }

         for (let i = 0; i < this.options.weekStart; i++) {
             listDays.push(i);
         }

         for (const day of listDays) {
             this.creatWeek(this.weekAsString(day));
         }

         this.createMonth();
     }

    /**
     * Clean calendar.
     */
     private clearCalendar(): void {
         this.calendar.month.textContent = '';
     }

    /**
     * Removes all selected classes.
     */
     private removeStatesClass(): void {
         for (const i of Object.keys(this.daysOfMonth)) {
             removeClass(this.daysOfMonth[i], cssStates.IS_SELECTED);
             this.days[+i + 1].isSelected = false;
         }
     }
}
