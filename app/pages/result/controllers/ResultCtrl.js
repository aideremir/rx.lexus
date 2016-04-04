(function (angular) {

    "use strict";

    angular
        .module('app')
        .controller('ResultCtrl', ResultCtrl);

    // @ngInject
    function ResultCtrl($scope, KSP, $ionicScrollDelegate, $ionicPosition, $ionicPopup, $query, $ionicLoading) {
        var result = this,
            root = $scope.root,
            beginCarColor = !!root.answerUser[0] ? 'temnosiniy' : 'beliy';

        if (root.answerUser.length === 0) {
            document.location = '/';
            return;
        }

        result.bonusStrings = [
            'Точь-в-точь как ',
            'В этом вы похожи на ',
            'С вами разделяет это увлечение ',
            'Вас окружают настоящие друзья, с которыми вы понимаете друг друга практически с полуслова. Один из них ', 'Это качество ценит в вас ']
        ;
        result.ksp = KSP.result(root.answerUser);
        result.isAllCat = true;
        result.isOpenCarColorMenu = false;

        if (!!root.answerUser[0]) {
            result.ksp.carColor.push(result.ksp.carColor.shift());
        }
        result.ksp.carColor.map(function (color) {
            color.show = color.file === beginCarColor;
        });


        var musicTexts = [
            'Мощный, послушный  автомобиль и «xxx» в колонках –  настоящее удовольствие от вождения.',
            '«xxx» - возьми с собой в дорогу и наслаждайся путешествием.',
            '«xxx» вдохновит вас на новые путешествия.'
        ];
        var movieTexts = [
            'Возможно, в кинотеатре под открытым небом фильм «xxx» произведет на вас еще более глубокое впечатление.',
            '«xxx» точно стоит посмотреть в компании ваших близких друзей.',
            'Любимые фильмы никогда не надоедают. Может быть пришла пора пересмотреть «xxx»?'
        ];
        result.circlesList = [];
        var circle = {}, rnd = 0;

        for (var i = 3; i < result.ksp.personalTexts.length; i++) {

            rnd = Math.floor(Math.random() * 3) + 0;

            circle = {
                image:'',
                text:'',
                bonusText:'',
                friensName:''
            };

            circle.image = './public/result/personal_circles/' + (!!root.answerUser[0] ? 'man' : 'woman') + '/' + (i - 2) + '/' + (result.ksp.personaIds[i] + 1) + '.png';
            circle.text = result.ksp.personalTexts[i];

            if(!!root.userData && !!root.userData.taggable_friends && root.userData.taggable_friends.data.length >= 5)
            {
                circle.friendName = root.userData.taggable_friends.data[i-3].name;
                circle.bonusText = result.bonusStrings[i-3];
                circle.friendAvatar = root.userData.taggable_friends.data[i-3].picture.data.url;
            }

            if (i == 4 && !!root.userData && !!root.userData.movies) {
                circle.image = './public/result/personal_circles/cinema.png';
                circle.text = movieTexts[rnd].replace('xxx', root.userData.movies[0]);
                circle.bonusText = 'Поделитесь этим с ';
            }

            if (i == 6 && !!root.userData && !!root.userData.music) {
                circle.image = './public/result/personal_circles/music.png';
                circle.text = musicTexts[rnd].replace('xxx', root.userData.music[0]);
                circle.bonusText = 'Расскажите об этом ';
            }

            result.circlesList.push(circle);

        }

        console.log(result.circlesList);

        root.GA('result', result.ksp.carName);
        root.GA('end');

        result.showSubscribe = true;
        result.selectColorCar = selectColorCar;
        result.num2word = num2word;
        result.categoryCheck = categoryCheck;
        result.allCheck = allCheck;
        result.href = href;
        result.frontHeader = frontHeader;
        result.backHeader = backHeader;
        result.getTitle = getTitle;
        result.scrollToKSP = scrollToKSP;
        result.sharePopup = sharePopup;
        result.closeSharePopup = closeSharePopup;
        result.authSharePopup = authSharePopup;
        result.subscribe = subscribe;

        result.shareStandard = {
            vkontakte: function (purl, ptitle, pimg, text) {
                var url = 'http://www.vkontakte.ru/share.php?';
                url += 'url=' + encodeURIComponent(purl);
                url += '&title=' + encodeURIComponent(ptitle);
                url += '&description=' + encodeURIComponent(text);
                url += '&image=' + encodeURIComponent(pimg);
                url += '&noparse=true';
                result.shareStandard.popup(url);
            },
            odnoklassniki: function (purl, text) {

                //http://www.odnoklassniki.ru/dk?st.cmd=addShare&st._surl=http%3A%2F%2Fobiny2015back.aider.dev.bstd.ru%2F%23%2Fitems%2Fredgold
                var url = 'http://www.odnoklassniki.ru/dk?st.cmd=addShare&st.s=1';
                url += '&st.comments=' + encodeURIComponent(text);
                url += '&st._surl=' + encodeURIComponent(purl);
                result.shareStandard.popup(url);
            },
            facebook: function (purl, ptitle, pimg, text) {
                var url = 'https://m.facebook.com/sharer.php?u=' + encodeURIComponent(purl);
                result.shareStandard.popup(url);
            },
            twitter: function (purl, ptitle) {
                var url = 'http://twitter.com/share?';
                url += 'text=' + encodeURIComponent(ptitle);
                url += '&url=' + encodeURIComponent(purl);
                url += '&counturl=' + encodeURIComponent(purl);
                result.shareStandard.popup(url);
            },
            mailru: function (purl, ptitle, pimg, text) {
                var url = 'http://connect.mail.ru/share?';
                url += 'url=' + encodeURIComponent(purl);
                url += '&title=' + encodeURIComponent(ptitle);
                url += '&description=' + encodeURIComponent(text);
                url += '&imageurl=' + encodeURIComponent(pimg);
                result.shareStandard.popup(url)
            },

            popup: function (url) {
                /*console.log(url);*/
                window.open(url, '', 'toolbar=0,status=0,width=626,height=436');
            }
        }


        function sharePopup() {

            var circles = [];
            for (var i = 0; i < result.ksp.personalTexts.length; i++) {
                if (i > 2) {
                    if (i == 4 && !!root.userData && !!root.userData.movies) {
                        circles.push('cinema');
                    }
                    else if (i == 6 && !!root.userData && !!root.userData.music) {
                        circles.push('music');
                    }
                    else {
                        circles.push((!!root.answerUser[0] ? '1' : '0') + '/' + (i - 2) + '/' + (result.ksp.personaIds[i] + 1));
                    }

                }

            }

            root.answerUser.endDate = new Date();
            var postObj = {
                titleText: result.getTitle(result.ksp.title),
                carName: result.ksp.carName,
                car_id: result.ksp.carImgFolder.toUpperCase(),
                bg_id: !!root.answerUser[0] ? 'male' : 'female',
                ksp_id: circles,
                raw_data: root.answerUser
            };
            var avatars = {};
            if (!!root.userData) {
                avatars.main = root.userData.picture.data.url;
                if (root.userData.taggable_friends !== undefined && root.userData.taggable_friends.data.length >= 5) {

                    var friends = root.userData.taggable_friends.data;

                    avatars[1] = friends[0].picture.data.url;
                    avatars[2] = friends[1].picture.data.url;
                    avatars[3] = friends[2].picture.data.url;
                    avatars[4] = friends[3].picture.data.url;
                    avatars[5] = friends[4].picture.data.url;
                }

                postObj.user_id = root.userData.id;
                postObj.user_name = root.userData.name;

            } else {
                avatars.main = !!root.answerUser[0] ? 'http://rx.lexus.ru/img/male.png' : 'http://rx.lexus.ru/img/female.png';
            }
            postObj.avatars = avatars;

            $ionicLoading.show({
                template: '<ion-spinner></ion-spinner><p class="item-icon-left">Пожалуйста, подождите...</p>'
            });

            $query.post('/getHash', postObj).then(function (data) {
                result.shareLink = data;

                result.sharingPopup = $ionicPopup.show({
                    template: '<button class="button button-full button-vk"  ng-click="result.authSharePopup(\'vk\')">\n  ВКОНТАКТЕ\n</button>\n<button class="button button-full button-fb" ng-click="result.authSharePopup(\'fb\')">\n  FACEBOOK\n</button>\n<label ng-show="result.showSubscribe" class="item item-input"><input type="email" placeholder="Ваш EMAIL" ng-model="result.email"></label>\n<button ng-show="result.showSubscribe" class="button button-full button-stable" ng-click="result.subscribe()">\n  ПОДПИСАТЬСЯ\n</button><label ng-show="!result.showSubscribe">ВЫ ПОДПИСАНЫ НА ЖУРНАЛ LEXUS BEYOND</label><button class="button button-full button-clear button-stable" ng-click="result.closeSharePopup()">\n  ОТМЕНА\n</button>',
                    title: 'ПОДЕЛИТЕСЬ РЕЗУЛЬТАТОМ',
                    subTitle: 'и получите подписку на журнал Lexus&nbsp;Beyond',
                    scope: $scope
                });

                $ionicLoading.hide();
            });

        }

        function authSharePopup(social) {
            switch (social) {
                case 'fb':

                    result.shareStandard.facebook(result.shareLink, 'LEXUS RX – отражение Вашей жизни', null, 'Я  уже знаю, кто я по версии Lexus. Узнай и ты, каким тебя видит Lexus');
                    root.GA('sharef', result.shareLink);
                    break;

                case 'vk':

                    result.shareStandard.vkontakte(result.shareLink, 'LEXUS RX – отражение Вашей жизни', null, 'Я  уже знаю, кто я по версии Lexus. Узнай и ты, каким тебя видит Lexus');
                    root.GA('sharev', result.shareLink);
                    break;
            }
        }


        function closeSharePopup() {
            //console.log('Closing popup');
            result.sharingPopup.close();
        }

        function subscribe() {

            if (!result.email)
                return false;

            $ionicLoading.show({
                template: '<ion-spinner></ion-spinner><p class="item-icon-left">Пожалуйста, подождите...</p>'
            });


            $query.post('/subscribe', {email: result.email}).then(function (data) {
                root.GA('subscribe', result.email);
                result.showSubscribe = false;
                $ionicLoading.hide();
            })

        }


        function selectColorCar(item) {
            if (!result.isOpenCarColorMenu) {
                result.isOpenCarColorMenu = true;
            } else {
                result.ksp.carColor.map(function (color) {
                    color.show = false;
                });
                result.ksp.carColor.splice(result.ksp.carColor.indexOf(item), 1);
                result.ksp.carColor.push(item);
                item.show = true;
                result.isOpenCarColorMenu = false;
            }
        }

        function num2word(num, words) {
            num = num % 100;
            if (num > 19) {
                num = num % 10;
            }
            switch (num) {
                case 1:
                    return words[0];
                case 2:
                case 3:
                case 4:
                    return words[1];
                default:
                    return words[2];
            }
        }

        function categoryCheck() {
            result.isAllCat = !result.ksp.categories.some(function (cat) {
                return !cat.check;
            });
            result.ksp.items.map(function (item) {
                var category = result.ksp.categories.filter(function (cat) {
                    return cat.title === item.category;
                })[0];
                if (!category.check) {
                    item.hidden = true;
                } else {
                    delete item.hidden;
                }
            });
        }

        function allCheck(isAllCat) {
            result.ksp.categories.map(function (cat) {
                cat.check = isAllCat;
            });
            categoryCheck();
        }

        function href(href) {
            document.location = href;
            return;
        }

        function frontHeader() {
            return {'background-image': 'url(./public/result/adv/' + (!!root.answerUser[0] ? 'women/' : 'man/') + result.ksp.carType.replace(' ', '') + '/' + result.isCarColor.file + '.png)'};
        }

        function backHeader() {
            return {'background-image': (!!root.answerUser[0] ? 'url(./img/bgMale.jpg)' : 'url(./img/bgFemale.jpg)')};
        }

        function getTitle(title) {
            var result = null;

            angular.forEach(title, function (value, key) {
                result = value;
            });

            return result;

        }

        function scrollToKSP() {
            $ionicScrollDelegate.scrollTo(0, $ionicPosition.offset(angular.element(document.getElementById('ksps'))).top - 20, true);
        };

    }

})(angular);

