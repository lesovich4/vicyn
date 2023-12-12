import * as ko from 'knockout';
import { createApplicant, createApplicantResponse } from '../api/create-applicant';
import { visaCenterService } from '../services/visa-center-service';
import { allocation, applicantService } from '../services/appicant-service';
import { getCurrentTimeString } from '../utils/date-time';
import { Failed, Ok } from '../utils/elements';
import { getSlots, getSlotsResponse } from '../api/get-slots';
import { schedule, scheduleResponse } from '../api/schedule';
import { publicIpv4 } from 'public-ip';
import { ReservationWorkerClient } from '../workers/reservation-worker-client';


function getApplicantMessage(response: createApplicantResponse | null) {
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
}

function getSlotsMessage(response: getSlotsResponse[] | null) {
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

function getScheduleMessage(response: scheduleResponse | null) {
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

export class ApplicantViewModel {
    urn = ko.observable(applicantService.urn);
    allocation = ko.observable(applicantService.allocation);
    message = ko.observable('');
    firstName = ko.observable(applicantService.firstName);
    lastName = ko.observable(applicantService.lastName);
    sex = ko.observable(applicantService.sex);
    dateOfBirth = ko.observable(applicantService.dateOfBirth);
    passportNumber = ko.observable(applicantService.passportNumber);
    passportExpiry = ko.observable(applicantService.passportExpiry);
    phoneCode = ko.observable(applicantService.phoneCode);
    phoneNumber = ko.observable(applicantService.phoneNumber);
    autoSchedule = ko.observable(false);

    buttonText = ko.computed(() => {
        if (!this.urn()) {
            return 'Create Applicant';
        }
        if (!this.allocation()) {
            return 'Pick up Slot';
        }

        return 'Schedule';
    });
    workerClient: ReservationWorkerClient;

    constructor(workerClient: ReservationWorkerClient) {
        this.workerClient = workerClient;

        this.firstName.subscribe(firstName => applicantService.firstName = firstName);
        this.lastName.subscribe(lastName => applicantService.lastName = lastName);
        this.sex.subscribe(sex => applicantService.sex = sex);
        this.dateOfBirth.subscribe(dateOfBirth => applicantService.dateOfBirth = dateOfBirth);
        this.passportNumber.subscribe(passportNumber => applicantService.passportNumber = passportNumber);
        this.passportExpiry.subscribe(passportExpiry => applicantService.passportExpiry = passportExpiry);
        this.phoneCode.subscribe(phoneCode => applicantService.phoneCode = phoneCode);
        this.phoneNumber.subscribe(phoneNumber => applicantService.phoneNumber = phoneNumber);
        this.autoSchedule.subscribe(value => {
            if (value) {
                this.workerClient.enableScheduler();
            } else {
                this.workerClient.disableScheduler();
            }
        });

        this.workerClient.observables.applicantCreated.subscribe(data => {
            if (data !== null) {
                this.urn(data.urn);
                this.message(getApplicantMessage(data));
            }
            else {
                this.removeUrn();
                this.message(getApplicantMessage(null));
            }
        });

        this.workerClient.observables.allocationUpdated.subscribe(allocation => {
            if (allocation !== null) {
                this.allocation(allocation);
            }
            else {
                this.removeAllocation();
            }
        });

        this.workerClient.observables.getSlotsUpdated.subscribe(data => {
            this.message(getSlotsMessage(data));
        });

        this.workerClient.observables.scheduleUpdated.subscribe(data => {
            this.message(getScheduleMessage(data));
        });
    }

    async createApplicant() {
        const ipAddress = await publicIpv4();
        try {
            const response = await createApplicant({
                firstName: this.firstName(),
                lastName: this.lastName(),
                sex: this.sex(),
                dateOfBirth: this.dateOfBirth(),
                passportNumber: this.passportNumber(),
                passportExpiry: this.passportExpiry(),
                phoneCode: this.phoneCode(),
                phoneNumber: this.phoneNumber(),
                centerCode: visaCenterService.selectedCenter,
                visaCategoryCode: visaCenterService.selectedVisaSubCategory,
                ipAddress
            });
            const data = await response.json() as createApplicantResponse;
            applicantService.urn = data.urn;
            this.urn(data.urn);
            this.message(getApplicantMessage(data));
        }
        catch {
            this.removeUrn();
            this.message(getApplicantMessage(null));
        }

    }

    async getSlots() {
        try {
            const response = await getSlots({
                centerCode: visaCenterService.selectedCenter,
                visaCategoryCode: visaCenterService.selectedVisaSubCategory
            });
            const data = await response.json() as getSlotsResponse[];


            const allocations: allocation[] = [];
            data.forEach(item => {
                if (!item.counters) {
                    return;
                }
                item.counters.forEach(counter => {
                    counter.groups.forEach(group => {
                        group.timeSlots.forEach(timeSlot => {
                            allocations.push({
                                id: timeSlot.allocationId,
                                text: `${item.date} - ${timeSlot.timeSlot}`,
                            });
                        });
                    });
                });
            });
            if (allocations.length > 0) {
                const allocation = allocations[Math.floor(Math.random() * allocations.length)];
                applicantService.allocation = allocation;
                this.allocation(allocation);
            }
            else {
                this.removeAllocation();
            }

            this.message(getSlotsMessage(data));
        }
        catch {
            this.removeAllocation();
            this.message(getSlotsMessage(null));
        }

    }
    async schedule() {
        try {
            const response = await schedule({
                allocationId: applicantService.allocation.id,
                centerCode: visaCenterService.selectedCenter,
                urn: applicantService.urn
            });
            const data = await response.json() as scheduleResponse;


            this.message(getScheduleMessage(data));
        }
        catch {
            this.message(getScheduleMessage(null));
        }

    }

    removeUrn() {
        applicantService.urn = null;
        this.urn(null);
    }

    removeAllocation() {
        applicantService.allocation = null;
        this.allocation(null);
    }


    async save() {
        if (!applicantService.urn) {
            await this.createApplicant();
        }
        else if (!applicantService.allocation) {
            await this.getSlots();
        }
        else {
            await this.schedule();
        }
    }
}