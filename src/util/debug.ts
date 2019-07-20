import { noop } from './options';

export let warn = noop;

if (process.env.NODE_ENV !== 'production') {
    warn = (msg: any) => {
        console.warn(`[Weekly Warn]: ${msg}`);
    };
}
