export function makeRandomString(length: number, characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
    let id = [];
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        id.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
    }
    return id.join('');
}

export function makeUniqueQueryParameterName(length: number){
    return makeRandomString(length, 'abcdefghijklmnopqrstuvwxyz')
}
export function makeUniqueQueryParameterValue(length: number){
    return makeRandomString(length, 'abcdefghijklmnopqrstuvwxyz0123456789')
}