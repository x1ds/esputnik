class Esputnik {
    constructor (apiKey) {
        if (apiKey !== undefined) {
            this.apiKey = apiKey;
        } else {
            throw new Error('Api Key not installed');
        }
    }
    sendRequest(url, method, data) {
        if (method === "GET") {
            url = url + '?' + new URLSearchParams(data).toString();
        }

        return fetch(url, {
            method: method,
            headers: {
                "Content-Type": 'application/json',
                "Authorization": 'Basic ' + btoa('any' + ':' + this.apiKey)
            },
            body: method === "POST" ? JSON.stringify(data) : null,
        }).then(function(response) {
            if (!response.ok) {
                response.json().then(function(data) {
                    throw new Error(data.error);
                })
            } else {
                return response.json();
            }
        }).catch((error) => {
            console.log(error)
        });
    }
    sendPostRequest(url, data) {
        return this.sendRequest(url, 'POST', data);
    }
    sendGetRequest(url, data) {
        return this.sendRequest(url, 'GET', data);
    }
    searchContacts(searchData) {
        return this.sendGetRequest('https://esputnik.com/api/v1/contacts', searchData);
    }
    getContactIdFromEmail(email) {
        let searchContactsPromise = this.searchContacts({'email': email, 'maxrows': 1});

        return searchContactsPromise.then(data => {
            if (data === undefined) {
                throw new Error('data for promise undefined');
            }

            if (data[0] !== undefined && data[0]['id'] !== undefined) {
                return data[0]['id'];
            }

            return 0;
        });
    }
    sendEvent(eventData) {
        if (eventData.email == null && eventData.phone == null) {
            throw 'params email or phone must be filled';
        }

        let sendData = {
            "eventTypeKey": eventData.eventTypeKey ?? 'sendEvent',
            "keyValue": eventData.email ?? eventData.phone,
            "params": [
                {
                    "name": "email",
                    "value": eventData.email ?? null
                },
                {
                    "name": "phone",
                    "value": eventData.phone ?? null
                }
            ]
        };

        return this.sendPostRequest('https://esputnik.com/api/v1/event', sendData);
    }
    createContactSubscribe(contactData) {
        if (contactData.email == null && contactData.phone == null) {
            throw 'params email or phone must be filled';
        }

        let sendData = {
            "contact" : {
                "firstName": contactData.firstName ?? null,
                "lastName": contactData.lastName ?? null,
                "channels": [],
            },
            "formType": contactData.formType ?? null,
        }

        if (contactData.email) {
            sendData.contact.channels.push({
                "type": "email",
                "value" : contactData.email
            });
        }

        if (contactData.phone) {
            sendData.contact.channels.push({
                "type": "sms",
                "value" : contactData.phone
            });
        }

        return this.sendPostRequest('https://esputnik.com/api/v1/contact/subscribe', sendData);
    }
}