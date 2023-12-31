import * as ko from 'knockout';
import * as moment from 'moment';
import 'moment/locale/ru';
import { createApplicant, createApplicantResponse } from '../api/create-applicant';
import { visaCenterService } from '../services/visa-center-service';
import { allocation, applicantService } from '../services/appicant-service';
import { getSlots, getSlotsResponse } from '../api/get-slots';
import { schedule, scheduleResponse } from '../api/schedule';
import { publicIpv4 } from 'public-ip';
import { ReservationWorkerClient } from '../workers/reservation-worker-client';
import { getApplicantMessage, getSlotsMessage, getScheduleMessage } from './applicant-view-model.get-message';
import { getRanges } from '../services/slots-utils';
import { getErrorHtml, getInfoHtml } from '../utils/elements';

export class ApplicantViewModel {
    urn = ko.observable(applicantService.urn);
    allocation = ko.observable(applicantService.allocation);
    message = ko.observable('');
    visaTokenMessage = ko.observable(ApplicantViewModel.getVisaTokenMessage(applicantService.visaTokenLastUpdated));
    nationalId = ko.observable(applicantService.nationalId);
    visaToken = ko.observable(applicantService.visaToken);
    firstName = ko.observable(applicantService.firstName);
    lastName = ko.observable(applicantService.lastName);
    sex = ko.observable(applicantService.sex);
    dateOfBirth = ko.observable(applicantService.dateOfBirth);
    passportNumber = ko.observable(applicantService.passportNumber);
    passportExpiry = ko.observable(applicantService.passportExpiry);
    phoneCode = ko.observable(applicantService.phoneCode);
    phoneNumber = ko.observable(applicantService.phoneNumber);
    emailId = ko.observable(applicantService.emailId);
    autoSchedule = ko.observable(false);
    displayExtraFields = ko.observable(ApplicantViewModel.getIsVisaTokenRequired(applicantService.dateOfBirth));

    buttonText = ko.computed(() => {
        if (!this.urn()) {
            return 'Создать заявителя';
        }
        if (!this.allocation()) {
            return 'Получить слот';
        }

        return 'Записать';
    });
    workerClient: ReservationWorkerClient;

    constructor(workerClient: ReservationWorkerClient) {
        this.workerClient = workerClient;

        this.nationalId.subscribe(nationalId => applicantService.nationalId = nationalId);
        this.visaToken.subscribe(visaToken => applicantService.visaToken = visaToken);
        this.firstName.subscribe(firstName => applicantService.firstName = firstName);
        this.lastName.subscribe(lastName => applicantService.lastName = lastName);
        this.sex.subscribe(sex => applicantService.sex = sex);
        this.dateOfBirth.subscribe(dateOfBirth => {
            applicantService.dateOfBirth = dateOfBirth;
            const isVisaTokenRequired = ApplicantViewModel.getIsVisaTokenRequired(dateOfBirth);
            this.displayExtraFields(isVisaTokenRequired);
            if(!isVisaTokenRequired){
                this.nationalId(null);
                this.visaToken(null);
            }
        });
        this.passportNumber.subscribe(passportNumber => applicantService.passportNumber = passportNumber);
        this.passportExpiry.subscribe(passportExpiry => applicantService.passportExpiry = passportExpiry);
        this.phoneCode.subscribe(phoneCode => applicantService.phoneCode = phoneCode);
        this.phoneNumber.subscribe(phoneNumber => applicantService.phoneNumber = phoneNumber);
        this.emailId.subscribe(emailId => applicantService.emailId = emailId);
        this.autoSchedule.subscribe(autoSchedule => {
            if (autoSchedule) {
                this.workerClient.enableScheduler();
            } else {
                this.workerClient.disableScheduler();
            }
        });

        this.workerClient.observables.applicantCreated.subscribe(data => {
            if (data !== null) {
                this.urn(data.urn);
            }
            else {
                this.urn(null);
            }
            this.message(getApplicantMessage(data));
        });

        this.workerClient.observables.allocationUpdated.subscribe(allocation => {
            this.allocation(allocation);
        });

        this.workerClient.observables.getSlotsUpdated.subscribe(data => {
            this.message(getSlotsMessage(data));
        });

        this.workerClient.observables.scheduleUpdated.subscribe(data => {
            this.message(getScheduleMessage(data));
        });

        setInterval(
            () => this.visaTokenMessage(ApplicantViewModel.getVisaTokenMessage(applicantService.visaTokenLastUpdated))
            , 1000);
    }

    static getVisaTokenMessage(visaTokenLastUpdated: Date) {
        if (visaTokenLastUpdated) {
            const visaTokenLastUpdatedMoment = moment(visaTokenLastUpdated);
            const nowMoment = moment(new Date());
            if (nowMoment.diff(visaTokenLastUpdatedMoment, 'minutes') < 60) {
                const ago = visaTokenLastUpdatedMoment.fromNow();
                return getInfoHtml(`Токен обновлен ${ago}.`);
            }
        }
        return getErrorHtml('Токен устарел!');
    }

    static getIsVisaTokenRequired(dateOfBirth: string) {
        const dob = moment(dateOfBirth, 'dd/MM/YYYY');
        const now = moment(new Date());
        const years = now.diff(dob, 'years');
        return 18 <= years && years < 60;
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
                emailId: this.emailId(),
                centerCode: visaCenterService.selectedCenter,
                visaCategoryCode: visaCenterService.selectedVisaSubCategory,
                ipAddress,
                nationalId: this.nationalId(),
                visaToken: this.visaToken(),
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
            const allocations: allocation[] = [];
            const ranges = getRanges();

            for (let i = 0; i < ranges.length; i++) {
                const { fromDate, toDate } = ranges[i];
                const response = await getSlots({
                    centerCode: visaCenterService.selectedCenter,
                    visaCategoryCode: visaCenterService.selectedVisaSubCategory,
                    fromDate,
                    toDate,
                });
                const data = await response.json() as getSlotsResponse[];

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
                this.message(getSlotsMessage(data));
            }
            if (allocations.length > 0) {
                const allocation = allocations[Math.floor(Math.random() * allocations.length)];
                applicantService.allocation = allocation;
                this.allocation(allocation);
            }
            else {
                this.removeAllocation();
            }

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

    async process() {
        if (!applicantService.urn) {
            await this.createApplicant();
            return;
        }

        if (!applicantService.allocation) {
            await this.getSlots();
            return;
        }

        await this.schedule();
    }
}