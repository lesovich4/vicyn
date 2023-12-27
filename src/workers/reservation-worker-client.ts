import * as ko from "knockout";
import { getTokenResponse } from "../api/get-token";
import { CacheObj, CacheSource } from "../services/cache-service";
import { checkIsSlotAvailableResponse } from "../api/check-is-slot-available";
import { createApplicantResponse } from "../api/create-applicant";
import { allocation } from "../services/appicant-service";
import { getSlotsResponse } from "../api/get-slots";
import { scheduleResponse } from "../api/schedule";

export class ReservationWorkerClient {

    defaultListener: Function;
    onError: Function;
    worker: Worker;

    observables = {
        cacheUpdated: ko.observable<CacheObj>(null),
        tokenUpdated: ko.observable<getTokenResponse>(null),
        slotChekingUpdated: ko.observable<checkIsSlotAvailableResponse>(null),
        applicantCreated: ko.observable<createApplicantResponse>(null),
        allocationUpdated: ko.observable<allocation>(null),
        getSlotsUpdated: ko.observable<getSlotsResponse[]>(null),
        scheduleUpdated: ko.observable<scheduleResponse>(null),
    };

    constructor(defaultListener?: Function, onError?: ((this: AbstractWorker, ev: ErrorEvent) => any) | null) {
        this.defaultListener = defaultListener ?? (() => { });
        if (onError) {
            this.worker.onerror = onError;
        }
        this.worker = new Worker(new URL('./reservation-worker.ts', import.meta.url));

        this.worker.onmessage = (event) => {
            if (
                event.data instanceof Object &&
                Object.hasOwn(event.data, "method") &&
                Object.hasOwn(event.data, "methodArgument")
            ) {
                this.observables[event.data.method as keyof typeof this.observables](event.data.methodArgument);
            } else {
                this.defaultListener.call(this, event.data);
            }
        };
    }

    setCache(cache: CacheObj) {
        this.worker.postMessage({
            method: 'setCache',
            methodArguments: [cache]
        });
    }

    startPullingTokens() {
        this.worker.postMessage({
            method: 'startPullingToken',
            methodArguments: []
        });
    }

    stopPullingTokens() {
        this.worker.postMessage({
            method: 'stopPullingToken',
            methodArguments: []
        });
    }

    startSlotCheking(pullInterval: number) {
        this.worker.postMessage({
            method: 'startSlotCheking',
            methodArguments: [pullInterval]
        });
    }

    stopSlotCheking() {
        this.worker.postMessage({
            method: 'stopSlotCheking',
            methodArguments: []
        });
    }

    enableScheduler() {
        this.worker.postMessage({
            method: 'enableScheduler',
            methodArguments: []
        });
    }

    disableScheduler() {
        this.worker.postMessage({
            method: 'disableScheduler',
            methodArguments: []
        });
    }

    schedule() {
        this.worker.postMessage({
            method: 'schedule',
            methodArguments: []
        });
    }

    terminate() {
        this.worker.terminate();
    };
}