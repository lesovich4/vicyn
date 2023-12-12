import { ReservationWorkerClient } from "../workers/reservation-worker-client";
import { ApplicantViewModel } from "./applicant-view-model";
import { AppointmentSlotsViewModel } from "./appointment-slots.view-model";
import { TokenViewModel } from "./token-view-model";

export class MainViewModel {
    workerClient: ReservationWorkerClient;

    token: TokenViewModel;
    appointmentSlots: AppointmentSlotsViewModel;;
    applicant: ApplicantViewModel;

    constructor(workerClient: ReservationWorkerClient) {
        this.token = new TokenViewModel(workerClient);
        this.appointmentSlots = new AppointmentSlotsViewModel(workerClient);
        this.applicant =  new ApplicantViewModel(workerClient);
        this.workerClient = workerClient;
    }
}