function CountDownWorker(url, defaultListener, onError) {
    const instance = this;
    const worker = new Worker(url);
    const listeners = {};

    this.defaultListener = defaultListener ?? (() => { });

    if (onError) {
        worker.onerror = onError;
    }

    this.postMessage = (message) => {
        worker.postMessage(message);
    };

    this.terminate = () => {
        worker.terminate();
    };

    this.addListener = (name, listener) => {
        listeners[name] = listener;
    };

    this.removeListener = (name) => {
        delete listeners[name];
    };

    this.setup = (name, countDownSeconds) => {
        const countDownMethod = 'setup';
        const countDownMethodArguments = [name, countDownSeconds];
        worker.postMessage({
            countDownMethod,
            countDownMethodArguments,
        });
    };

    worker.onmessage = (event) => {
        if (
            event.data instanceof Object &&
            Object.hasOwn(event.data, "countDownMethodListener") &&
            Object.hasOwn(event.data, "countDownMethodArguments")
        ) {
            listeners[event.data.countDownMethodListener].apply(
                instance,
                event.data.countDownMethodArguments
            );
        } else {
            this.defaultListener.call(instance, event.data);
        }
    };
}

const countDown = new CountDownWorker(`countdown-worker.js?time=${new Date().getTime()}`);

countDown.addListener("accessTokenData.callback", (value) => {
    if (value === 0) {
        getToken();
    }
});

function clickGetToken() {
    setTimeout(getAppointmentSlots, 100);
    countDown.setup('accessTokenData', 60 * 60);
}

function getToken() {
    const $form = $('form#accessTokenForm');
    const values = $form.serializeArray();
    const Ne = forge.pki.publicKeyFromPem('-----BEGIN PUBLIC KEY-----'
        + 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCpigN3/5Ti/WJk51pbPQdpCe96\n  TPVoeMAk/cUlAPpYh8zGpr6zssbM11Je1SoQTiuipxIL+c0oGXti8vLzln3yfS+N\n  56wuSh0Hyt1Z+waSx6IDFlfzImEtq8m1osS32B83HRiFZbeKB8QIRJhZil1pJSzM\n  sg0Y0QmDyv1yR4FzIQIDAQAB'
        + '-----END PUBLIC KEY-----');
    const password = values.find(function (input) {
        return input.name == 'password';
    });
    password.value = window.btoa(Ne.encrypt(password.value));
    const body = $.param(values);

    const xhr = new XMLHttpRequest();

    const method = $form.attr('method');
    const tokenUri = $form.attr('action');

    xhr.open(method, tokenUri, false);

    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.send(body);

    const time = getCurrentTimeString();

    const message = `${time} - ${xhr.response}`;
    $('#accessTokenData').html(message);
    console.log(message);

    const token = JSON.parse(xhr.response);
    $('#loginUser').val(token.loginUser);
    window.token = token;
}

countDown.addListener("appointmentSlots.callback", (value) => {
    if (value === 0) {
        getAppointmentSlots();
    }
    $('#appointmentSlotsBtn').text(`Auto Pull in ${value}s...`);
});

function clickPullAppointmentSlots() {
    setTimeout(getAppointmentSlots, 100);
    const pullTimeoutSeconds = getPullTimeoutSeconds();
    countDown.setup('appointmentSlots', pullTimeoutSeconds);
}

function getAppointmentSlots() {

    const $form = $('form#appointmentSlotsForm');
    const query = $form.serialize();

    const xhr = new XMLHttpRequest();

    const method = $form.attr('method');
    const tokenUri = $form.attr('action');

    const requestUrl = new URL(`${tokenUri}?__t=${new Date().getTime()}&${query}`);
    xhr.open(method, requestUrl, false);

    const accessToken = token.accessToken;
    xhr.setRequestHeader("Authorization", accessToken);
    xhr.setRequestHeader("Content-Type", "application/json;charset=utf-8");
    xhr.setRequestHeader("Route", "blr/ru/pol");

    xhr.send('');

    const time = getCurrentTimeString();

    var slots = JSON.parse(xhr.response);
    if (Array.isArray(slots) && slots[0].error == null) {
        sendEmail(time, slots.map(item => item.date));
    }

    const message = `${time} - ${xhr.response}`;
    $('#appointmentSlotsData').html(message);
    console.log(message);
}

function getCurrentTimeString() {
    const now = new Date();
    const timeString = formatTime(now);
    return timeString;
}

function formatTime(date) {
    const timeString = `${padStartZero(date.getHours())}:${padStartZero(date.getMinutes())}:${padStartZero(date.getSeconds())}`;
    return timeString;
}

function formatDate(date) {
    const dateString = `${padStartZero(date.getDate())}/${padStartZero(date.getMonth() + 1)}/${date.getFullYear()}`;
    return dateString;
}

function padStartZero(value) {
    return `${value}`.padStart(2, '0');
}

function sendEmail(time, dates) {

    const centerCode = $('#centerCode option:selected').text().trim();
    const visaCategoryCode = $('#visaCategoryCode option:selected').text().trim();
    const subject = `Даты ${centerCode} - ${visaCategoryCode}`;
    const message = dates ? `Доступны даты: ${dates.join(', ')}` : 'Проверка';

    const to = $('#username').val();
    Email.send({
        Host: "smtp.elasticemail.com",
        Username: "pavel.lesovich@gmail.com",
        Password: "934E2E8D1FFDDF19E3071A85955E8673DED9",
        To: to,
        From: "pavel.lesovich@gmail.com",
        Subject: subject,
        Body: `${time} -  ${message}`,
    })
        .then(function (message) {
            $('#sendEmailData').html(message);
        });
}

function persistInput($input) {
    var key = `input-${$input.attr('id')}`;
    var storedValue = localStorage.getItem(key);
    if (storedValue)
        $input.val(storedValue);

    $input.change(function () {
        localStorage.setItem(key, $input.val());
    });
}

function getPullTimeoutSeconds() {
    return window.pullTimeoutSeconds || 6 * 60;
}

(function () {
    const now = new Date();
    const fromDate = new Date();
    fromDate.setDate(now.getDate() + 1);
    const toDate = new Date();
    toDate.setDate(now.getDate() + 121);
    $('#fromDate').val(formatDate(fromDate));
    $('#toDate').val(formatDate(toDate));

    $('#centerCode').change(function () {
        const value = $('#centerCode').val();

        $('#visaCategoryCode option').addClass('hidden');
        const $options = $(`#visaCategoryCode option[data-center-code='${value}']`);
        $options.removeClass('hidden');
        $('#visaCategoryCode').val($options.first().attr('value'));
    });

    persistInput($('#username'));
    persistInput($('#password'));
    persistInput($('#centerCode'));
    persistInput($('#visaCategoryCode'));
})();