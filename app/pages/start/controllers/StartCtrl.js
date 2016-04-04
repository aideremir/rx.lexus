(function (angular) {

  "use strict";

  angular
    .module('app')
    .controller('StartCtrl', StartCtrl);

  // @ngInject
  function StartCtrl($scope, $window, $location, $ionicPopup, fbAuth, vkAuth) {

    var start = this,
      root = $scope.root;

    start.next = next;
    start.socialPopup = socialPopup;
    start.closeSocialPopup = closeSocialPopup;
    start.authSocialPopup = authSocialPopup;

    function next() {
      root.GA('start');
      $location.path('/app/quest/0');
    }

    function socialPopup() {
      VK.init({
        apiId: window.vkAppId
      });
      FB.init({
        appId: window.fbAppId,
        status: true,
        cookie: true,
        xfbml: true,
        version: 'v2.4'
      });
      start.authPopup = $ionicPopup.show({
        template: '<button class="button button-full button-vk" ng-click="start.authSocialPopup(\'vk\')">\n  ВКОНТАКТЕ\n</button>\n<button class="button button-full button-fb" ng-click="start.authSocialPopup(\'fb\')">\n  FACEBOOK\n</button>\n<button class="button button-full button-clear button-stable" ng-click="start.closeSocialPopup()">\n  ОТМЕНА\n</button>',
        title: 'Вход через социальную сеть',
        subTitle: 'Выберите, через какую социальную сеть вы хотите войти',
        scope: $scope
      });
    }

    function closeSocialPopup() {
      start.authPopup.close();
    }

    function sliceUpFriends(array){
      var sliceStart = Math.floor(Math.random() * 19) + 1;

      return array.slice(sliceStart, sliceStart + 5)
    }

    function getAgeRange(bdate, splitter) {

      var _self = this;

      if (bdate) {
        var today = new Date(),
        nowYear = today.getFullYear(),
            year = parseInt(bdate.split(splitter)[2]),
            age = nowYear - year,
            age_range = 0;

        if (year < 1900)
          return null;

        if (age >= 18 && age < 29) {
          age_range = 0;
        }

        if (age >= 30 && age < 39) {
          age_range = 1;
        }

        if (age >= 40 && age < 49) {
          age_range = 2;
        }

        if (age >= 50) {
          age_range = 3;
        }

        return age_range;
      }
    }

    function authSocialPopup(social) {
      switch (social) {
        case 'fb':
          fbAuth.login().
            then(function (data) {
              if (!data['error']) {

                data.taggable_friends.data = sliceUpFriends(data.taggable_friends.data);

                root.userData = {
                  id: data.id,
                  name: data.name,
                  gender: data.gender === 'female' ? 'woman' : 'man',
                  relation: data.relationship_status == "Married" ? 4 : 1,
                  age_range: getAgeRange(data.birthday, '/'),
                  picture: {
                    data: {
                      url: data.picture.data.url
                    }
                  },
                  taggable_friends: data.taggable_friends,
                  movies: [],
                  music: []
                };

                if(!!data.movies && data.movies.data.length > 0)
                {
                  root.userData.movies = [];
                  data.movies.data.forEach(function(v){
                    root.userData.movies.push(v.name);
                  })
                }

                if(!!data.music && data.music.data.length > 0)
                {
                  root.userData.music = [];
                  data.music.data.forEach(function(v){
                    root.userData.music.push(v.name);
                  })
                }

                root.GA('authf', data.id);

                start.authPopup.close();
                $location.path('/app/quest/0');
              }
            }, function (error) {
            });
          break;
        case 'vk':
          vkAuth.
            login().
            then(function (data) {
              if (!data['error']) {

                console.log(data);

                root.userData = {
                  id: data.uid,
                  name: data.first_name + ' ' + data.last_name,
                  gender: !data.sex ? '' : (data.sex === 1 ? 'woman' : 'man'),
                  relation: data.relation,
                  relatives: data.relatives,
                  age_range: getAgeRange(data.bdate, '.'),
                  picture: {
                    data: {
                      url: data.photo_200_orig
                    }
                  },
                  taggable_friends: data.taggable_friends,
                  movies: data.movies.split(','),
                  music: data.music.split(',')
                };

                root.GA('authv', data.uid);

                start.authPopup.close();
                $location.path('/app/quest/0');
              }
            }, function (error) {
            });
          break;
      }
    }

  }

})(angular);

