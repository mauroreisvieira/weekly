/**
 * Create HTML elements for Hello Week.
 *
 * @param {string}     className
 * @param {string}     textNode
 */
export function createElement(className: string, content?: string | undefined): HTMLElement {

    const elem = document.createElement('div');
    elem.classList.add(className);

    if (!content) {
        elem.appendChild(document.createTextNode(content as string));
    }

    return elem;
}

/**
 * Append HTML element inside other HTML element.
 *
 * @param      {HTMLElement}  element
 * @param      {HTMLElement}  parentElement
 */
export function append(element: HTMLElement, parentElement: HTMLElement) {
    parentElement.appendChild(elem);
}
