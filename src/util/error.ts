import { noop } from './options';

export let error = noop;

error = (msg: any) => {
    throw new Error(`[Weekly Error]: ${msg}`);
};
