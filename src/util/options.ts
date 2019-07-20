import { config } from '../core/config';

export function getIndexForEventTarget(daysOfMonth: any, target: HTMLElement): number {
    return Array.prototype.slice.call(daysOfMonth).indexOf(target) + 1;
}

export function extend(to: any, from: any): object {
    if (typeof Object.assign === 'function') {
        return Object.assign(from, to);
    }

    for (const key in from) {
        to[key] = from[key];
    }
    return to;
}

