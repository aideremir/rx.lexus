(function (angular) {

  "use strict";
  angular
    .module('app', ['ionic'])
    .config(Config)
    .run(IonicPlatform);

  // @ngInject
  function IonicPlatform($ionicPlatform, $window) {
    $ionicPlatform.ready(function () {
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleLightContent();
      }
    });


  }

  // @ngInject
  function Config($ionicConfigProvider, $httpProvider, $stateProvider, $urlRouterProvider) {

    $ionicConfigProvider.views.transition('android');

    $httpProvider.defaults.withCredentials = true;
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common["X-Requested-With"];

    $stateProvider

      .state('main', {
        url: "/app",
        abstract: true,
        templateUrl: "templates/main.html"
      })

      .state('main.start', {
        url: '/start',
        views: {
          'appView': {
            templateUrl: 'templates/start.html',
            controller: 'StartCtrl as start'
          }
        }
      })

      .state('main.quest', {
        url: '/quest/:number',
        views: {
          'appView': {
            templateUrl: 'templates/quest.html',
            controller: 'QuestCtrl as quest'
          }
        }
      })

      .state('main.result', {
        url: '/result',
        views: {
          'appView': {
            templateUrl: 'templates/result.html',
            controller: 'ResultCtrl as result'
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/start');

  }

})(angular);
