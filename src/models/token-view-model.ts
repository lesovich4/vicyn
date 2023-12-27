import { getToken, getTokenResponse } from '../api/get-token';
import { authenticationService } from '../services/authentication-service';
import { formatTime } from '../utils/date-time';
import * as ko from 'knockout';
import { Failed, Ok } from '../utils/elements';
import { ReservationWorkerClient } from '../workers/reservation-worker-client';
import { encryptPassword } from '../utils/encrypt-password';

function getMessage() {
    const isLiveToken = authenticationService.isAuthenticated() && !authenticationService.isExpiried;

    const messageBuilder = [];

    const time = formatTime(authenticationService.lastUpdated);
    messageBuilder.push(time);
    messageBuilder.push('&nbsp;');

    messageBuilder.push(isLiveToken ? Ok : Failed);
    messageBuilder.push('<hr/>');

    if (isLiveToken) {
        messageBuilder.push('Access Token is Live');
    }

    return messageBuilder.join('');
}

export class TokenViewModel {
    username = ko.observable(authenticationService.username());
    password = ko.observable(authenticationService.password());
    enablePulling = ko.observable(false);
    isAuthenticated = ko.observable(authenticationService.isAuthenticated());
    accessToken = ko.observable(authenticationService.accessToken());
    message = ko.observable(getMessage());

    workerClient: ReservationWorkerClient;

    constructor(workerClient: ReservationWorkerClient) {
        this.workerClient = workerClient;

        this.workerClient.observables.tokenUpdated.subscribe(response => {
            const { isAuthenticated, accessToken } = response;
            this.updateState({ isAuthenticated, accessToken }, false);
        });

        this.username.subscribe(authenticationService.username);
        this.password.subscribe(password => {
            const passwordEncrypted = encryptPassword(password);
            authenticationService.password(password);
            authenticationService.passwordEncrypted(passwordEncrypted);

        });
        this.enablePulling.subscribe(value => {
            if (value) {
                this.workerClient.startPullingTokens();
            }
            else {
                this.workerClient.stopPullingTokens();
            }
        });
    }

    getToken() {
        const username = this.username();
        const encryptedPassword = encryptPassword(this.password());
        getToken({ encryptedPassword, username })
            .then(response => response.json() as Promise<getTokenResponse>)
            .then(token => {
                this.updateState(token, true);
            })
            .catch(_ => {
                this.updateState({ isAuthenticated: false, accessToken: '' }, true);
            });
    }

    removeAccessToken() {
        this.updateState({ isAuthenticated: false, accessToken: '' }, true);
    }

    private updateState(state: { isAuthenticated: boolean; accessToken: string; }, updateService: boolean) {
        const { isAuthenticated, accessToken } = state;
        if (updateService) {
            authenticationService.isAuthenticated(isAuthenticated);
            authenticationService.accessToken(accessToken);
        }
        this.isAuthenticated(isAuthenticated);
        this.accessToken(accessToken);
        this.message(getMessage());
    }
}