(function (angular) {

    'use strict';

    angular
        .module('app')
        .service('fbAuth', fbAuth)
        .service('vkAuth', vkAuth);


  // @ngInject
  function fbAuth($rootScope, $q){

    var noFriends = false;

    this.login = login;

    function login() {
      var deferred = $q.defer();

      FB.login(function (resp) {
        if (resp.authResponse) {
          FB.api('/me', {
            fields: 'id,email,gender,birthday,name,picture,taggable_friends{name,picture},movies,music,relationship_status'
          }, function(resp) {
            deferred.resolve(resp);
          });
        }
        else {
          deferred.reject('error_app');
        }
      }, {scope: 'email,publish_actions,user_likes,user_birthday,user_friends,user_relationships'});

      return deferred.promise;

    }

  }


  // @ngInject
  function vkAuth($rootScope, $q){
    var deferred = $q.defer();
    var getUserVK = function () {
      var code;
      code = 'return {';
      code += 'me: API.getProfiles({uids: API.getVariable({key: 1280}), fields: "bdate,relatives,relation, photo_100, photo_200_orig, sex, music, movies"})[0]';
      code += '};';
      VK.Api.call('execute', {'code': code}, function (resp) {
        if (resp.response) {

          console.log('me',resp.response);

          VK.Api.call('friends.get', {
            fields: 'photo_200_orig,sex,nickname',
            order: 'random',
            count: 5
          }, function (result) {

            var userData = {
              taggable_friends:
              {
                data:[]
              }
            };

            for (var i = 0; i < result.response.length; i++) {
              userData.taggable_friends.data.push({
                id: result.response[i].uid,
                name: result.response[i].first_name + ' ' + result.response[i].last_name,
                nickname: result.response[i].nickname,
                picture: {
                  data: {
                    url: result.response[i].photo_200_orig
                  }
                }
              })
            }

            resp.response.me.taggable_friends = userData.taggable_friends;

            deferred.resolve(resp.response.me);
          });

        }
      });


    };

    this.login = login;

    function login() {
      VK.Auth.getLoginStatus(function (response) {
        if (response.session) {
          getUserVK();
        }
        else {
          VK.Auth.login(function (response) {
            if (response.session) {
              getUserVK();
            }
            else {
              deferred.reject('error_app');
            }
          });
        }
      });
      return deferred.promise;
    }

  }

})(angular);
