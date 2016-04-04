(function (angular) {

    'use strict';

    angular
        .module('app')
        .service('$query', $query)
        .factory('$cacher', $cacher);

    // query request factory
    // @ngInject
    function $query($http, $q, $cacher, $locale) {
        var that = this,
            param = function (data) {
                if (!data) {
                    return;
                }
                return Object.keys(data).map(function (k) {
                    if (Array.isArray(data[k])) {
                        var keyE = encodeURIComponent(k + '[]');
                        return data[k].map(function (subData) {
                            return keyE + '=' + encodeURIComponent(subData);
                        }).join('&');
                    } else {
                        return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]);
                    }
                }).join('&');
            };

        this.get = function (url, p, reload) {
            var deferred = $q.defer(),
                uri = angular.API + url + (p ? '?' + param(p) : ''),
                resp = $cacher.get(uri);
            if (!resp || reload === true) {
                $http.
                    get(uri).
                    success(function (resp) {
                        $cacher.put(uri, resp);
                        deferred.resolve(resp);
                    }).
                    error(function (error) {
                        deferred.reject(error);
                    });
            }
            else {
                deferred.resolve(resp);
            }
            return deferred.promise;
        };

        this.post = function (url, p) {
            var deferred = $q.defer(),
                //uri = angular.API + url;
                uri = url;
            $http.
                post(uri, p, {headers: {'Content-Type': 'application/json'}}).
                success(function (resp) {
                    deferred.resolve(resp);
                }).
                error(function (error) {
                    deferred.reject(error);
                });
            return deferred.promise;
        };

        this.queue = function () {

        }

    }

    // ������� �����������
    // @ngInject
    function $cacher($cacheFactory) {
        return $cacheFactory('$cacher', {});
    }

})(angular);