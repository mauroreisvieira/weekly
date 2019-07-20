/**
 * Create HTML elements for Hello Week.
 * @param {string}      className
 * @param {HTMLElement} parentElement
 * @param {string} textNode
 * @public
 */
export function createElement(
        className: string,
        parentElement: HTMLElement,
        textNode?: string | undefined
    ) {

    const elem = document.createElement('div');
    elem.classList.add(className);
    if (!textNode) {
        const text = document.createTextNode(textNode as string);
        elem.appendChild(text);
    }
    parentElement.appendChild(elem);
    return elem;
}
