

function getNextMonday() {
    return getNextDayOfWeekDate(1);
}

function getNextFriday() {
    return getNextDayOfWeekDate(5);
}

function getNextDayOfWeekDate(dayOfWeek: number) {
    const date = new Date();
    date.setDate(date.getDate() + (dayOfWeek + 7 - date.getDay()) % 7);
    return date;
}

function getFullMonthRange(date: Date) {
    const fromDate = new Date(date);
    fromDate.setDate(1);
    const toDate = new Date(date);
    toDate.setMonth(toDate.getMonth() + 1);
    toDate.setDate(0);

    return {
        fromDate,
        toDate,
    }
}

function getRestMonthRange(date: Date) {
    const fromDate = new Date(date);
    fromDate.setDate(fromDate.getDate() + 1);

    const toDate = new Date(date);
    toDate.setMonth(toDate.getMonth() + 1);
    toDate.setDate(0);

    return {
        fromDate,
        toDate,
    }
}

export function getRanges() {
    const today = new Date();
    const nextMonday = getNextMonday();
    if (nextMonday.getMonth() !== today.getMonth()) {
        return [
            getFullMonthRange(nextMonday),
        ]
    }

    const nextFriday = getNextFriday();
    if (nextFriday.getMonth() !== today.getMonth()) {
        return [
            getRestMonthRange(today),
            getFullMonthRange(nextFriday),
        ]
    }

    return [
        getRestMonthRange(today),
    ]
}