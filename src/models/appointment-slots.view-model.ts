
import * as ko from 'knockout';
import { visaCenterService } from '../services/visa-center-service';
import { checkIsSlotAvailable, checkIsSlotAvailableResponse } from '../api/check-is-slot-available';
import { getCurrentTimeString } from '../utils/date-time';
import { Failed, Ok } from '../utils/elements';
import { ReservationWorkerClient } from '../workers/reservation-worker-client';


function getMessage(response: checkIsSlotAvailableResponse | null) {

    const hasDates = response !== null && response.error === null;

    const messageBuilder = [];

    const time = getCurrentTimeString();
    messageBuilder.push(time);
    messageBuilder.push('&nbsp;');

    messageBuilder.push(hasDates ? Ok : Failed);
    messageBuilder.push('<hr/>');

    if (hasDates) {
        messageBuilder.push(`EarliestDate: ${response.earliestDate}`);
    }
    else if (response !== null) {
        messageBuilder.push(`${response.error.code} - ${response.error.description}`);
    }

    return messageBuilder.join('');
}

export class AppointmentSlotsViewModel {
    centers = ko.observableArray([]);
    visaCategories = ko.observableArray([]);
    visaSubCategories = ko.observableArray([]);
    selectedCenter = ko.observable('');
    selectedVisaCategory = ko.observable('');
    selectedVisaSubCategory = ko.observable('');
    enablePulling = ko.observable(false);
    pullInterval = ko.observable('2');
    message = ko.observable('');

    workerClient: ReservationWorkerClient;

    constructor(workerClient: ReservationWorkerClient) {
        this.workerClient = workerClient;

        this.setup();
    }

    private togglePulling() {
        const enablePulling = this.enablePulling();
        if (enablePulling) {
            this.workerClient.startSlotCheking(+this.pullInterval() * 60);
        }
        else {
            this.workerClient.stopSlotCheking();
        }

    }
    private async setup() {

        this.workerClient.observables.slotChekingUpdated.subscribe(response => {
            this.message(getMessage(response));
        });
        this.enablePulling.subscribe(() => this.togglePulling());
        this.pullInterval.subscribe(() => this.togglePulling());

        visaCenterService
            .getCenters()
            .then(centers => this.centers(centers));

        await this.changeCenter(visaCenterService.selectedCenter);
        this.selectedCenter(visaCenterService.selectedCenter);
        await this.changeVisaCategory(visaCenterService.selectedCenter, visaCenterService.selectedVisaCategory);
        this.selectedVisaCategory(visaCenterService.selectedVisaCategory);
        this.selectedVisaSubCategory(visaCenterService.selectedVisaSubCategory);

        this.selectedCenter.subscribe(centerCode => {
            visaCenterService.selectedCenter = centerCode;
            const visaCategory: string = this.selectedVisaCategory();
            this.changeCenter(centerCode);
            this.changeVisaCategory(centerCode, visaCategory);
        });
        this.selectedVisaCategory.subscribe(visaCategory => {
            visaCenterService.selectedVisaCategory = visaCategory;
            const centerCode: string = this.selectedCenter();
            this.changeVisaCategory(centerCode, visaCategory);
        });
        this.selectedVisaSubCategory.subscribe(visaSubCategory => {
            visaCenterService.selectedVisaSubCategory = visaSubCategory;
        });
    }

    async changeCenter(centerCode: string) {

        if (!centerCode) {
            return;
        }

        const visaCategories = await visaCenterService.getVisaCategories(centerCode);

        this.visaCategories(visaCategories);
    }

    async changeVisaCategory(centerCode: string, visaCategory: string) {

        if (!centerCode || !visaCategory) {
            return;
        }

        const visaSubCategories = await visaCenterService.getVisaSubCategories(centerCode, visaCategory);

        this.visaSubCategories(visaSubCategories);
    }

    async checkSlots() {
        const vacCode = this.selectedCenter();
        const visaCategoryCode = this.selectedVisaSubCategory();

        try {
            const response = await checkIsSlotAvailable({ vacCode, visaCategoryCode });
            const data = await response.json() as checkIsSlotAvailableResponse;
            this.message(getMessage(data));
        }
        catch {
            this.message(getMessage(null));
        }
    }
}