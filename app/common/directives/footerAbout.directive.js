(function () {

  'use strict';

  angular
    .module('app')
    .directive('footerAbout', footerAbout);

  // @ngInject
  function footerAbout() {
    var directive = {
      restrict: 'E',
      templateUrl: 'templates/footer_about.html',
      replace: true,
      link: link
    };

    return directive;

    function link(scope, element, attrs) {

      scope.$$postDigest(function () {
        var height = window.innerHeight - 44;
        element.css('top', height + 'px');
      });

    }
  }

})();
