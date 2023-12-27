
import * as ko from 'knockout';
import { visaCenterService } from '../services/visa-center-service';
import { checkIsSlotAvailable, checkIsSlotAvailableResponse } from '../api/check-is-slot-available';
import { getCurrentTimeString } from '../utils/date-time';
import { Failed, Ok } from '../utils/elements';
import { ReservationWorkerClient } from '../workers/reservation-worker-client';


function getMessage(response: checkIsSlotAvailableResponse | null) {

    const hasDates = response && !response.error;

    const messageBuilder = [];

    const time = getCurrentTimeString();
    messageBuilder.push(time);
    messageBuilder.push('&nbsp;');

    messageBuilder.push(hasDates ? Ok : Failed);
    messageBuilder.push('<hr/>');

    if (hasDates) {
        messageBuilder.push(`EarliestDate: ${response.earliestDate}`);
    }
    else if (response && response.error) {
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
    pullInterval = ko.observable('150');
    message = ko.observable('');

    workerClient: ReservationWorkerClient;

    constructor(workerClient: ReservationWorkerClient) {
        this.workerClient = workerClient;

        this.setup();
    }

    private togglePulling() {
        const enablePulling = this.enablePulling();
        if (enablePulling) {
            this.workerClient.startSlotCheking(+this.pullInterval());
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

        await this.setupCenters();
        await this.setupVisaCategories(visaCenterService.selectedCenter);
        this.selectedCenter(visaCenterService.selectedCenter);
        await this.setupVisaSubCategories(visaCenterService.selectedCenter, visaCenterService.selectedVisaCategory);
        this.selectedVisaCategory(visaCenterService.selectedVisaCategory);
        this.selectedVisaSubCategory(visaCenterService.selectedVisaSubCategory);

        this.selectedCenter.subscribe(centerCode => {
            visaCenterService.selectedCenter = centerCode;
            const visaCategory: string = this.selectedVisaCategory();
            this.setupVisaCategories(centerCode);
            this.setupVisaSubCategories(centerCode, visaCategory);
        });
        this.selectedVisaCategory.subscribe(visaCategory => {
            visaCenterService.selectedVisaCategory = visaCategory;
            const centerCode: string = this.selectedCenter();
            this.setupVisaSubCategories(centerCode, visaCategory);
        });
        this.selectedVisaSubCategory.subscribe(visaSubCategory => {
            visaCenterService.selectedVisaSubCategory = visaSubCategory;
        });
    }

    async refreshCenters() {
        await this.setupCenters(true);
    }

    async refreshVisaCategories() {
        const centerCode: string = this.selectedCenter();
        this.setupVisaCategories(centerCode, true);
    }

    async refreshVisaSubCategories() {
        const centerCode: string = this.selectedCenter();
        const visaCategory: string = this.selectedVisaCategory();
        this.setupVisaSubCategories(centerCode, visaCategory, true);
    }

    async setupCenters(skipCache?: boolean) {
        const centers = await visaCenterService.getCenters(skipCache);
        this.centers(centers);
    }

    async setupVisaCategories(centerCode: string, skipCache?: boolean) {

        if (!centerCode) {
            return;
        }

        const visaCategories = await visaCenterService.getVisaCategories(centerCode, skipCache);

        this.visaCategories(visaCategories);
    }

    async setupVisaSubCategories(centerCode: string, visaCategory: string, skipCache?: boolean) {

        if (!centerCode || !visaCategory) {
            return;
        }

        const visaSubCategories = await visaCenterService.getVisaSubCategories(centerCode, visaCategory, skipCache);

        this.visaSubCategories(visaSubCategories);
    }

    async checkSlots() {
        const vacCode = this.selectedCenter();
        const visaCategoryCode = this.selectedVisaSubCategory();

        try {
            const response = await checkIsSlotAvailable({ vacCode, visaCategoryCode });
            const data = await response.json() as checkIsSlotAvailableResponse;
            if (data.earliestDate !== null) {
                this.workerClient.schedule();
            }
            this.message(getMessage(data));
        }
        catch {
            this.message(getMessage(null));
        }
    }
}