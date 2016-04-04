(function (angular) {

  "use strict";

  angular
    .module('app')
    .controller('QuestCtrl', QuestCtrl);

  // @ngInject
  function QuestCtrl($scope, $location, $stateParams, $interval) {

    var quest = this,
      root = $scope.root;

    quest.number = Number($stateParams.number);

    if (quest.number > 0 && root.answerUser.length === 0){
      document.location = '/';
      return;
    }

    if (!quest.number) {
      if (!!root.userData && !!root.userData.gender) {
        root.answerUser[quest.number] = root.userData.gender === 'man' ? 1 : 0;
      }
    }

    if (quest.number === 1) {
      if (!!root.userData && !!root.userData.age_range) {
        root.answerUser[quest.number] = root.userData.age_range;
      }
    }

    if (quest.number === 2) {
      if (!!root.userData && !!root.userData.relation) {

        if (root.userData.relation == 1) {
          root.answerUser[quest.number] = 1;
        }

        if (root.userData.relation == 4) {
          root.answerUser[quest.number] = 0;
        }
      }
    }

    if (quest.number === 3) {
      if (!!root.userData && !!root.userData.relatives) {

        var childCount = 0;
        root.userData.relatives.forEach(function(v){
          if(v.type == 'child')
          {
            childCount++;
          }
        });

        if(childCount == 0)
        {
          root.answerUser[quest.number] = 0;
        }

        if(childCount == 1)
        {
          root.answerUser[quest.number] = 1;
        }

        if(childCount >= 2)
        {
          root.answerUser[quest.number] = 2;
        }
      }
    }

    if (quest.number === 4 || quest.number === 7) {
      root.answerUser[quest.number] = root.answerUser[quest.number] || [];
    }

    /*
     if(typeof root.answerUser[quest.number] === 'undefined' && quest.number) {
     $location.path('/app/start');
     }
     */

    quest.questionsJson = {
      "questions": [
        ["Ваш пол"],
        ["Ваш возраст"],
        ["Семейное положение"],
        ["Есть ли дети?"],
        ["В свободное время вы предпочитаете"],
        [
          "Какой стиль одежды вы предпочитаете?",
          "Какая ваша сильная черта характера?"
        ],
        [
          "Легко ли вы доверяете людям?",
          "Легко ли вы заводите новых знакомых?"
        ],
        ["Для чего вы используете автомобиль?"]
      ],
      "answers": [
        [
          "Женщина",
          "Мужчина"
        ],
        [
          "18-29",
          "30-39",
          "40-49",
          "50 и выше"
        ],
        [
          "В браке",
          "Не в браке"
        ],
        [
          "Нет",
          "Да, один",
          "Два и более"
        ],
        [
          'Путешествовать и открывать новое',
          'Активный образ жизни и спорт',
          'Шопинг и езду по городу',
          'Отрываться на вечеринках и в клубах',
          'Встречаться с друзьями и близкими',
          'Проводить время на природе'
        ],
        [
          [
            "Деловой",
            "Спортивный",
            "Элегантный",
            "Уличная мода",
            "Свой стиль"
          ],
          [
            "Организованность",
            "Коммуникабельность",
            "Решительность",
            "Ответственность"
          ]
        ],
        [
          [
            "Да",
            "Нет",
            "Только самым близким",
            "Зависит от человека"
          ],
          [
            "Да",
            "Нет",
            "Зависит от ситуации",
            "Не люблю заводить новые знакомства"
          ]
        ],
        [
          'Поездки за город и на дачу',
          'Только скорость и динамичное вождение',
          'Для шопинга',
          'Езжу на работу с комфортом',
          'Отвожу детей в школу',
          'Люблю дальние поездки за рулем'
        ]
      ]
    };

    root.counter = 0;
    for (var i = 0; i < quest.number; i++){
      root.counter += root.answerCounters[i];
    }

    root.GA('question', quest.number + ':' + questionsSex());

    quest.frontHeader = frontHeader;
    quest.backHeader = backHeader;
    quest.next = next;
    quest.prev = prev;
    quest.questionsSex = questionsSex;
    quest.answersSex = answersSex;
    quest.isAnswer = isAnswer;
    quest.counter = root.counter;
    quest.changeCounter = changeCounter;

    function backHeader() {
      return {'background-image': 'url(' + (!quest.number ? './img/bgNoCar.jpg' : './public/result/adv/' + (!!root.answerUser[0] ? 'man/' : 'woman/') + (quest.number) + '.jpg') + ')'};
    }


    function frontHeader() {
      return '';

      return {'background-image': (!quest.number ? 'none' : (!root.answerUser[0] ? 'url(./img/bgMale.jpg)' : 'url(./img/bgFemale.jpg)'))};
    }


    function next() {
      stopCounter();
      root.GA('next', quest.number);
      if (isAnswer()) {
        if(Array.isArray(root.answerUser[quest.number])) {
          var arr = [];
          root.answerUser[quest.number].map(function(item, key) {
            if(key) {
              arr.push(answersSex()[key]);
            }
          });
          root.GA('answer', quest.number + ':' + arr.join('; '));
        } else {
          root.GA('answer', quest.number + ':' + answersSex()[root.answerUser[quest.number]]);
        }
        if (quest.number < quest.questionsJson.questions.length - 1) {
          $location.path('/app/quest/' + (quest.number + 1));
        } else {
          $location.path('/app/result');
        }
      }
    }

    function prev() {
      stopCounter();
      root.GA('prew', quest.number);
      if (quest.number != 0) {
        $location.path('/app/quest/' + (quest.number - 1));
      } else {
        $location.path('/app/start');
      }
    }

    function questionsSex() {
      if (quest.questionsJson.questions[quest.number].length > 1) {
        return quest.questionsJson.questions[quest.number][root.answerUser[0]];
      }
      return quest.questionsJson.questions[quest.number][0];
    }

    function answersSex() {
      if (Array.isArray(quest.questionsJson.answers[quest.number][0])) {
        return quest.questionsJson.answers[quest.number][root.answerUser[0]];
      }
      return quest.questionsJson.answers[quest.number];
    }

    function isAnswer() {
      if (Array.isArray(root.answerUser[quest.number])) {
        return root.answerUser[quest.number].some(function (item) {
          return !!item;
        })
      }
      return typeof root.answerUser[quest.number] !== 'undefined';
    }

    var counterInterval;
    function changeCounter() {
      stopCounter();
      quest.counter = root.counter;
      if (isAnswer()) {
        counterInterval = $interval(function(){
            if (quest.counter < root.counter + root.answerCounters[quest.number]) {
              quest.counter++;
            }
            if (quest.counter === root.counter + root.answerCounters[quest.number]){
              stopCounter();
            }
          }, 200);
      }
    }
    function stopCounter() {
      if (angular.isDefined(counterInterval)) {
        $interval.cancel(counterInterval);
        counterInterval = undefined;
      }
    }

  }

})(angular);

