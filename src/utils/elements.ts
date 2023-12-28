export const Failed = getErrorHtml('Failed!');
export const Ok = getInfoHtml('Ok!');

export function getErrorHtml(text: string){
    return `<span style="color: red">${text}</span>`;
}
export function getInfoHtml(text: string){
    return `<span style="color: green">${text}</span>`;
}