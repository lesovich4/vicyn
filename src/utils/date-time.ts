
export function getCurrentTimeString() {
    const now = new Date();
    const timeString = formatTime(now);
    return timeString;
}

export function formatTime(date: Date) {
    const timeString = `${padStartZero(date.getHours())}:${padStartZero(date.getMinutes())}:${padStartZero(date.getSeconds())}`;
    return timeString;
}

export function formatDateDDMMYYYY(date: Date) {
    const dateString = `${padStartZero(date.getDate())}/${padStartZero(date.getMonth() + 1)}/${date.getFullYear()}`;
    return dateString;
}

function padStartZero(value: number) {
    return `${value}`.padStart(2, '0');
}