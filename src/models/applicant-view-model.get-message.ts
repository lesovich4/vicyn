import { createApplicantResponse } from '../api/create-applicant';
import { getSlotsResponse } from '../api/get-slots';
import { scheduleResponse } from '../api/schedule';
import { getCurrentTimeString, } from '../utils/date-time';
import { Failed, Ok } from '../utils/elements';

export function getApplicantMessage(response: createApplicantResponse | null) {
    const success = response !== null && response.error === null;

    const messageBuilder = [];

    const time = getCurrentTimeString();
    messageBuilder.push(time);
    messageBuilder.push('&nbsp;');

    messageBuilder.push(success ? Ok : Failed);
    messageBuilder.push('<hr/>');

    if (success) {
        messageBuilder.push(`URN: ${response.urn}`);
    }
    else if (response !== null) {
        messageBuilder.push(`${response.error.code} - ${response.error.description}`);
    }

    return messageBuilder.join('');
}export function getSlotsMessage(response: getSlotsResponse[] | null) {
    const success = response !== null && response.length > 0 && response[0].error === null;

    const messageBuilder = [];

    const time = getCurrentTimeString();
    messageBuilder.push(time);
    messageBuilder.push('&nbsp;');

    messageBuilder.push(success ? Ok : Failed);
    messageBuilder.push('<hr/>');

    if (success) {
        messageBuilder.push('Available Dates: ');
        messageBuilder.push(response.map(item => item.date).join(', '));
    }
    else if (response !== null && response.length > 0 && response[0].error !== null) {
        messageBuilder.push(`${response[0].error.code} - ${response[0].error.description}`);
    }

    return messageBuilder.join('');

}
export function getScheduleMessage(response: scheduleResponse | null) {
    const success = response !== null && response.IsAppointmentBooked;

    const messageBuilder = [];

    const time = getCurrentTimeString();
    messageBuilder.push(time);
    messageBuilder.push('&nbsp;');

    messageBuilder.push(success ? Ok : Failed);
    messageBuilder.push('<hr/>');

    if (success) {
        messageBuilder.push('Appointment Booked');
    }
    else if (response !== null && response.error) {
        messageBuilder.push(`${response.error.code} - ${response.error.description}`);
    }

    return messageBuilder.join('');

}

