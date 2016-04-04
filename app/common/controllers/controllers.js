(function (angular) {

  "use strict";

  angular
    .module('app')
    .controller('RootCtrl', RootCtrl);

  // @ngInject
  function RootCtrl($scope, $timeout, $window, $filter, $location) {

    var root = this;

    root.orientation = $window.innerWidth > $window.innerHeight;
    root.answerUser = [];
    root.counter = 0;
    root.loc = $location.path();
    root.answerCounters = [0];
    for (var i = 1; i < 7; i++) {
      root.answerCounters[i] = Math.floor(Math.random() * 2) + ((i > 3) ? 2 : 1);
    }
    var total = 0;
    root.answerCounters.forEach(function (v) {
      total += v;
    });
    root.answerCounters[7] = 15 - total;
    root.userData = {};
    root.isOpenMenu = false;
    root.menu = [
      {
        title: 'Конфигуратор',
        href: 'http://www.lexus.ru/car-configurator/?RX/submodel'
      },
      {
        title: 'тест-драйв',
        href: 'http://www.lexus.ru/forms/testdrive'
      },
      {
        title: 'предзаказ',
        href: 'http://www.lexus.ru/car-models/rx/rx-house/preorder'
      },
      {
        title: 'рассчитать кредит',
        href: 'http://www.lexus.ru/financial-services/'
      },
      {
        title: 'обратный звонок',
        href: 'http://www.lexus.ru/forms/request-callback'
      },
      {
        title: 'скачать брошюру',
        href: 'http://content.v10.lexus-russia.ru/pdf/10.5/brochures/NewRX.pdf'
      }/*,
       {
       title: 'прайс-лист',
       href: ''
       }
       */
    ];

    root.GA = GA;

    $window.onbeforeunload = function () {
      GA('exit', root.loc);
    };

    $window.onload = function () {
      GA('load');
    };

    $window.onresize = function () {
      $scope.$apply(function() {
        root.orientation = $window.innerWidth > $window.innerHeight;
      });
    };


    function GA(type, data) {
      switch (type) {
        case 'menu-link':
          ga('send', 'event', 'global', 'menu-link', data);
          break;
        case 'exit':
          ga('send', 'event', 'global', 'exit', data);
          break;
        case 'authf':
          ga('send', 'social', 'facebook', 'auth', data);
          break;
        case 'authv':
          ga('send', 'social', 'vkontakte', 'auth', data);
          break;
        case 'sharef':
          ga('send', 'social', 'facebook', 'share', data);
          break;
        case 'sharev':
          ga('send', 'social', 'vkontakte', 'share', data);
          break;
        case 'load':
          ga('send', 'event', 'start', 'load', 'start-page');
          break;
        case 'auth':
          ga('send', 'event', 'start', 'auth', 'default');
          break;
        case 'logout':
          ga('send', 'event', 'start', 'logout');
          break;
        case 'start':
          ga('send', 'event', 'poll', 'start', $filter('date')(new Date().getTime(), 'yyyy.MM.dd HH:mm:ss'));
          break;
        case 'question':
          ga('send', 'event', 'poll', 'question', data);
          break;
        case 'answer':
          ga('send', 'event', 'poll', 'answer', data);
          break;
        case 'next':
          ga('send', 'event', 'poll', 'next', data);
          break;
        case 'prew':
          ga('send', 'event', 'poll', 'prew', data);
          break;
        case 'result':
          ga('send', 'event', 'poll', 'result', data);
          break;
        case 'end':
          ga('send', 'event', 'poll', 'end', $filter('date')(new Date().getTime(), 'yyyy.MM.dd HH:mm:ss'));
          break;
        case 'button':
          ga('send', 'event', 'result', 'button', data);
          break;
        case 'subscribe':
          ga('send', 'event', 'result', 'subscribe', data);
          break;
        default :
          break;
      }
    }

  }

})(angular);
