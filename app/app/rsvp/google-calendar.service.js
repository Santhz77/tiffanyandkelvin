/**
 * Created by Kelvin on 8/9/2016.
 */
(function() {
    'use strict';

    angular.module('tiffanyAndKelvin')
        .service('GoogleCalendar', GoogleCalendar);

    function GoogleCalendar($q, $window) {
        var CLIENT_ID = '194227013541-5qbqe4dgvvvfrncs40jgkvsh512hm6u1.apps.googleusercontent.com';

        var SCOPES = ['https://www.googleapis.com/auth/calendar'];

        var self = this;

        var calendarDefer = $q.defer();

        var script = document.createElement('script');

        var authorized = false;

        self.initialized = calendarDefer.promise;

        self.setCalendarEvent = function() {
            var defer = $q.defer();

            var setEvent = function() {
                // TODO: check if event is already there
                var event = {
                    'summary': 'Tiffany and Kelvin Wedding',
                    'location': '3555 S Las Vegas Blvd, Las Vegas, NV 89109',
                    'description': 'Tiffany and Kelvin are getting married.',
                    'guestsCanInviteOthers': false,
                    'start': {
                        'dateTime': '2016-12-18T15:00:00',
                        'timeZone': 'America/Los_Angeles'
                    },
                    'end': {
                        'dateTime': '2016-12-19T00:00:00',
                        'timeZone': 'America/Los_Angeles'
                    },
                    'reminders': {
                        'useDefault': false,
                        'overrides': [
                            {'method': 'email', 'minutes': 24 * 60 * 7},
                            {'method': 'popup', 'minutes': 24 * 60}
                        ]
                    }
                };
                 var insertRequest = gapi.client.calendar.events.insert({
                     'calendarId': 'primary',
                     'resource': event
                 });

                 insertRequest.execute(function(event) {
                     // success
                     defer.resolve();
                     //TODO: save to firebase database.
                 });
            };
            if(!authorized) {
                gapi.auth.authorize({client_id: CLIENT_ID, scope: SCOPES, immediate: false}).then(function() {
                    return gapi.client.load('calendar', 'v3');
                }, function() {
                    // user clicks deny
                    defer.reject('denied');
                }).then(setEvent);
            } else {
                gapi.client.load('calendar', 'v3').then(setEvent);
            }

            return defer.promise;
        };

        // callback function - resolving promise after maps successfully loaded
        $window.gapiInitialized = function () {
            gapi.auth.authorize({'client_id': CLIENT_ID, 'scope': SCOPES.join(' '), 'immediate': true}, function (authResult) {
                authorized = (authResult && !authResult.error);
                calendarDefer.resolve();
            });
        };

        script.src = 'https://apis.google.com/js/client.js?onload=gapiInitialized';
        document.body.appendChild(script);
    }
})();