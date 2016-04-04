(function (angular) {

  'use strict';

  angular
    .module('app')
    .factory('KSP', ksp);

  var kspAdapter = {
    satisfy:function(arr){
      arr.forEach(function(v,i){
        if(i==0) kspAdapter.progress.gender = v;
        kspAdapter.progress.current = i + 1;
        if('number' === typeof v) {
          kspAdapter.results.setOption(kspAdapter.typeHints[kspAdapter.progress.current][v]);
          kspAdapter.progress[kspAdapter.progress.states[kspAdapter.progress.current]] = v;
        }
        else if(Array.isArray(v)) {
          kspAdapter.progress[kspAdapter.progress.states[kspAdapter.progress.current]] = [];
          v.forEach(function(n,k){ if(n) {
            kspAdapter.progress[kspAdapter.progress.states[kspAdapter.progress.current]].push(k);
          }});
        }
      });
      return kspAdapter.results.prepare();
    },
    progress:{
      current:1,
      gender:-1,
      states:['start','gender','age','maried','childs','hobby','chars1','chars2','auto'],
      ksp:[],
      kspInc:[]
    },
    in_array:function (needle, haystack, strict) {
      var found = false, key, strict = !!strict;
      for (key = 0; key < haystack.length; key++) {
        if ((strict && haystack[key] === needle) || (!strict && haystack[key] == needle)) {
          found = true;
          break;
        }
      }
      return found;
    },
    results:{
      type:0,
      find:{
        order:[],
        default:[]
      },
      pathFinderOptions:[],
      setOption:function(opt){
        kspAdapter.results.type += parseInt(opt);
        if(kspAdapter.progress.current==2||kspAdapter.progress.current==4) {
          kspAdapter.results.pathFinderOptions.push(kspAdapter.results.type);
          kspAdapter.results.type = 0;
        }
      },
      prepare:function(){
        kspAdapter.ksp = kspGlobal;
        kspAdapter.results.carType = kspAdapter.results.getCarType();
        kspAdapter.results.findAditionalTypes();
        kspAdapter.results.pathFinderOptions.forEach(function(v,i){
          kspAdapter.results.pathFinder(v);
        });
        kspAdapter.results.find.order.sort(function(a,b){return a-b;});
        kspAdapter.personalization();
        var result = {
          //kspIds: kspAdapter.results.find.order.concat(kspAdapter.results.find.default),
          kspIds: kspAdapter.results.find.order,
          kspIdsExt: kspAdapter.results.find.default,
          title: kspAdapter.results.title,
          carName: kspAdapter.progress.carName,
          carImgFolder: kspAdapter.progress.carName.split(' ').join(''),
          //carType: kspAdapter.progress.carName.replace(' ',''),
          personaIds: kspAdapter.personaIds,
          personalTexts: kspAdapter.persona
        };
        return result;
      },
      findAditionalTypes:function(){
        if(kspAdapter.in_array(6,kspAdapter.progress.hobby)) kspAdapter.results.pathFinderOptions.push(10);
        if(kspAdapter.in_array(5,kspAdapter.progress.auto)) kspAdapter.results.pathFinderOptions.push(10);
        if(kspAdapter.in_array(4,kspAdapter.progress.auto)) kspAdapter.results.pathFinderOptions.push(50);
        if(kspAdapter.in_array(2,kspAdapter.progress.auto)) kspAdapter.results.pathFinderOptions.push(40);
        if(kspAdapter.in_array(1,kspAdapter.progress.auto)) kspAdapter.results.pathFinderOptions.push(20);
        if(kspAdapter.in_array(0,kspAdapter.progress.auto)) kspAdapter.results.pathFinderOptions.push(10);
        if(kspAdapter.in_array(0,kspAdapter.progress.auto)) kspAdapter.results.pathFinderOptions.push(30);
      },
      getCarType:function(){
        var rx200t = 0;
        var rx350 = 0;
        var rx450h = 0;
        var fsport = false;

        kspAdapter.progress.hobby.forEach(function(v,i){
          switch (v){
            case 0: rx200t++; break;
            case 1: rx200t++; break;
            case 2: rx350++; break;
            case 3: rx200t++; break;
            case 4: rx350++; break;
            case 5: rx450h++; break;
          }
        });
        kspAdapter.progress.auto.forEach(function(v,i){
          switch (v){
            case 1: fsport = true; break;
            case 2: rx350++; break;
            case 3: rx350++; break;
            case 4: rx350++; break;
            case 5: rx450h++; break;
          }
        });


        var car = 0;
        var carName = ' ';

        if( rx200t > rx350 && rx200t > rx450h ){
          car = 200;
          if(fsport){ carName = 'RX 200t F SPORT'; }
          else{ carName = 'RX 200t'; }
        }
        else if( rx350 > rx200t && rx350 > rx450h ){
          car = 300;
          if(fsport){ carName = 'RX 350 F SPORT'; }
          else{ carName = 'RX 350'; }
        }
        else if( rx450h > rx200t && rx450h > rx350 ){
          if(fsport && (rx350 > rx200t) ){ car = 300; carName = 'RX 350 F SPORT'; }
          else if(fsport){ car = 200; carName = 'RX 200t F SPORT'; }
          else{ car = 400; carName = 'RX 450h'; }
        }
        else {
          if( rx200t == rx350 || rx200t == rx450h ){
            car = 200;
            if(fsport){ carName = 'RX 200t F SPORT'; }
            else{ carName = 'RX 200t'; }
          }
          else if( rx450h == rx350 ){
            car = 300;
            if(fsport){ carName = 'RX 350 F SPORT'; }
            else{ carName = 'RX 350'; }
          }
          else{
            car = 200;
            if(fsport){ carName = 'RX 200t F SPORT'; }
            else{ carName = 'RX 200t'; }
          }
        }
        kspAdapter.progress.carName = carName;
        return car;
      },
      pathFinder:function(type){
        for(var each in kspAdapter.ksp){
          if(kspAdapter.ksp.hasOwnProperty(each)){
            if(kspAdapter.in_array(kspAdapter.results.carType, kspAdapter.ksp[each]['engine'])) {
              if(kspAdapter.in_array(type, kspAdapter.ksp[each]['order'])) {
                if(!kspAdapter.in_array(each, kspAdapter.results.find.order)) {
                  kspAdapter.results.find.order.push(each);
                }
              }
              if(kspAdapter.in_array(type, kspAdapter.ksp[each]['types'])) {
                if(!kspAdapter.in_array(each, kspAdapter.results.find.default)&&!kspAdapter.in_array(each, kspAdapter.results.find.order)) {
                  kspAdapter.results.find.default.push(each);
                }
              }
            }
          }
        }
      }
    },
    questions:{
      "1":"ваш пол",
      "2":"ваш возраст",
      "3":"семейное положение",
      "4":"есть ли дети?",
      "5":"в свободное время вы предпочитаете",
      "6":["какой стиль одежды вы предпочитаете?","какая ваша сильная черта характера?"],
      "7":["легко ли вы доверяете людям?","легко ли вы заводите новых знакомых?"],
      "8":"для чего вы используете автомобиль?"
    },
    answers:[
      [],
      ['Женщина','Мужчина'],
      ['18-29','30-39','40-49','50 и выше'],
      ['В браке','Не в браке'],
      ['Нет','Да, один','Два и более'],
      ['Путешествовать и открывать новое','Активный образ жизни и спорт','Шопинг и езду по городу','Отрываться на вечеринках и в клубах','Встречаться с друзьями и близкими','Проводить время на природе'],
      [['Деловой','Спортивный','Элегантный','Уличная мода','Свой стиль'],['Организованность','Коммуникабельность','Решительность','Ответственность']],
      [['Да','Нет','Только самым близким','Зависит от человека'],['Да','Нет','Зависит от ситуации','Не люблю заводить новые знакомства']],
      ['Поездки за город и на дачу','Люблю скорость и динамичное вождение','Для шопинга','Езжу на работу с комфортом','Отвожу детей в школу','Люблю дальние поездки за рулем']
    ],
    typeHints:[
      [],
      [2000,1000],
      [200,300,400,500],
      [0,0,0,0,0,0,0,0,0],
      [0,1,2],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [10,20,40,0,50,0]
    ],
    personalization:function(){

      kspAdapter.persona.push(kspAdapter.character[0][kspAdapter.progress.gender]);
      kspAdapter.persona.push(kspAdapter.character[1][kspAdapter.progress.age]);
      kspAdapter.persona.push(kspAdapter.character[2][kspAdapter.progress.maried]);
      kspAdapter.persona.push(kspAdapter.character[3][kspAdapter.progress.gender][kspAdapter.progress.childs]);

      kspAdapter.personaIds.push(kspAdapter.progress.gender);
      kspAdapter.personaIds.push(kspAdapter.progress.age);
      kspAdapter.personaIds.push(kspAdapter.progress.maried);
      kspAdapter.personaIds.push(kspAdapter.progress.childs);

      if(kspAdapter.progress.hobby.length==2){
        kspAdapter.persona.push(kspAdapter.character[4][kspAdapter.progress.gender][6]);
        kspAdapter.personaIds.push(6);
      }

      else if(kspAdapter.progress.hobby.length==3) {
        kspAdapter.persona.push(kspAdapter.character[4][kspAdapter.progress.gender][7]);
        kspAdapter.personaIds.push(7);
      }
      else if(kspAdapter.progress.hobby.length>3) {
        kspAdapter.persona.push(kspAdapter.character[4][kspAdapter.progress.gender][8]);
        kspAdapter.personaIds.push(8);
      }
      else {
        kspAdapter.persona.push(kspAdapter.character[4][kspAdapter.progress.gender][kspAdapter.progress.hobby[0]]);
        kspAdapter.personaIds.push(kspAdapter.progress.hobby[0]);
      }

      kspAdapter.persona.push(kspAdapter.character[5][kspAdapter.progress.gender][kspAdapter.progress.chars1]);
      kspAdapter.persona.push(kspAdapter.character[6][kspAdapter.progress.gender][kspAdapter.progress.chars2]);

      kspAdapter.personaIds.push(kspAdapter.progress.chars1);
      kspAdapter.personaIds.push(kspAdapter.progress.chars2);

      if(kspAdapter.progress.auto.length==2) {
        kspAdapter.persona.push(kspAdapter.character[7][kspAdapter.progress.gender][6]);
        kspAdapter.personaIds.push(6);
      }
      else if(kspAdapter.progress.auto.length==3) {
        kspAdapter.persona.push(kspAdapter.character[7][kspAdapter.progress.gender][7]);
        kspAdapter.personaIds.push(7);
      }
      else if(kspAdapter.progress.auto.length>3) {
        kspAdapter.persona.push(kspAdapter.character[7][kspAdapter.progress.gender][8]);
        kspAdapter.personaIds.push(8);
      }
      else {
        if(parseInt(kspAdapter.progress.auto[0]) == 4 && kspAdapter.progress.childs == 0) {

        }
        else {
          kspAdapter.persona.push(kspAdapter.character[7][kspAdapter.progress.gender][kspAdapter.progress.auto[0]]);
          kspAdapter.personaIds.push(kspAdapter.progress.auto[0]);
        }
      }
      kspAdapter.results.title = kspAdapter.charTitles[kspAdapter.progress.gender][kspAdapter.progress.chars1];
      kspAdapter.results.titleId = kspAdapter.progress.chars1;
    },
    persona:[],
    personaIds:[],
    character:[
      ['Женщина','Мужчина'],
      ['18-29', '30-39', '40-49', 'от 50 и выше'],
      ['В браке', 'Не в браке'],
      [
        [
          'Вы цените личную независимость, но умеете проявлять гибкость.',
          'Вы оптимистичны, и это качество помогает вам преодолевать любые препятствия!',
          'Для многих вы пример человека, у которого всё получается с легкостью. А вот сколько усилий стоит за этой легкостью – знаете только вы одна.'
        ],
        [
          'У вас независимый характер,  вы не даете пустых обещаний.',
          'Вам нравится держать ситуацию под контролем.',
          'Ваши близкие знают –  на вас точно можно положиться!'
        ]
      ],
      [

        [
          'Неиссякаемый источник вашего жизнелюбия и оптимизма – новые впечатления, новые места и знакомства.',
          'Вечный двигатель – это про вас! Вокруг вас всё бурлит, всё в движении. Возможно, вы с удовольствием предались бы лени, да она вас никак не догонит!',
          'Вы любите яркие эмоции и сильные впечатления. Это и не удивительно – такая яркая личность, как вы, не потерпит скуки и уныния.',
          'Вы и сами умеете «зажигать» и зажигаете всех вокруг своим жизнелюбием и оптимизмом.',
          'Вы знаете истинную ценность общения с близкими по духу людьми.',
          'Вас не так легко вывести из состояния равновесия. Вы  находитесь в гармонии со своими чувствами и эмоциями.',
          'Вы легко умеете находить интересное в том, что вас окружает.',
          'Вы в постоянном движении, у вас масса идей и планов для их реализации.',
          'Скука? Это слово явно не из вашего лексикона. Вы легко увлекаетесь новыми идеями. Вам интересно получать новые знания и умения.'
        ],
        [
          'Вас не назовешь домоседом! Но даже на новом месте вы чувствуете себя, как дома.',
          'Твердости вашего характера  позавидовал бы гранит. Всё чего вы достигли – вы достигли собственными силами.',
          'Ваш девиз: всё новое – это хорошо! Вы не боитесь пробовать, экспериментировать и с лёгкостью отказываетесь от старых привычек и вещей.',
          'Вы легки на подъем и стремитесь быть в центре событий. Ваши друзья знают – с вами не соскучишься!',
          'Шумным вечеринкам вы предпочитаете общение в кругу семьи и с близкими по духу людьми.',
          'Вы не растрачиваете силы на ненужное общение. Вас окружают настоящие друзья, с которыми вы понимаете друг друга практически с полуслова.',
          'Вы легко умеете находить интересное в том, что вас окружает.',
          'Вы в постоянном движении, у вас масса идей и планов для их реализации.',
          'Скука? Это слово явно не из вашего лексикона. Вы легко увлекаетесь новыми идеями. Вам интересно получать новые знания и умения.'
        ]

      ],
      [
        [
          'Вас отличает любовь к порядку и планированию. Ваши мечты – это ваши цели. А недостижимых целей, вы себе никогда не ставите.',
          'Ваша легкая, увлекающаяся натура не терпит рамок и ограничений. Вы всегда в движении, всегда на подъеме!',
          'Ваше чувство стиля безупречно. Вы всегда на высоте – даже если на вас надеты балетки на плоской подошве.',
          'Ритм больших городов  совпадает с биением вашего сердца. В бесконечном движении мегаполисов вы находите свой источник энергии и вдохновения.',
          'Вы свободны от стереотипов. Любите экспериментировать, пробовать новое. Вы легко меняете свои предпочтения, но всегда остаетесь верной самой себе.'
        ],
        [
          'Многие удивляются вашей способности добиваться успеха. А вы просто четко следуете плану. Именно он в конечном результате и приводит вас к поставленной цели.',
          'Люди тянутся к вам,  потому что вы обладаете редкими качествами – умеете слушать и понимать собеседника.',
          'Вы считаете, что невыполнимых задач не бывает. Трудности вас не пугают вас, наоборот – их преодоление только заряжает вас  энергией.',
          'Вы не из тех, кто бросает слова на ветер. Если вы пообещали, что бы ни произошло, вы выполните обещанное.'
        ]
      ],
      [
        [
          'Вы порывисты и эмоциональны. Вас отличает многообразие интересов.',
          'Вы не из тех, кто действует по настроению и совершает необдуманные поступки.',
          'Вы цените своих друзей, их доверие для вас – важнее всего.',
          'У вас сильно развита интуиция. Но главное –  вы не сторонник делать поспешные суждения и оценки.'
        ],
        [
          'Вы эмоциональны и любознательны. Общение с вами доставляет удовольствие окружающим.',
          'Вы не привыкли попусту расточать свои эмоции и чувства.',
          'Вы не из тех, кто совершает необдуманные поступки.',
          'Вас отличает надежность и практичность. Вы сторонник традиций и ритуалов.'
        ]
      ],
      [
        [
          'Вы знаете истинную цену вещей.',
          'Вы не боитесь проявлять инициативу и брать на себя ответственность.',
          'У вас отменное чувство стиля – вы точно знаете границу, где шик превращается  в китч.',
          'Вы умеете быть рациональной и эффективной. За это вас ценят и друзья, и коллеги по работе.',
          'Планировать пытаются все. А вот следовать планам – получается далеко не у каждого. Вы – одна из тех, кто умеет это делать.',
          'Вы полагаетесь на собственные силы и не привыкли отступать ни перед какими трудностями.',
          'Зацикливаться на чем-то одном? Это точно не про вас!',
          'Вы умеете распределять свои силы и здраво оцениваете свои  возможности.',
          'Вряд ли кто-то сможет попрекнуть вас за ваш стиль вождения. На дороге за рулем вы чувствуете себя так же комфортно и спокойно, как на любимом диване с журналом в руках.'
        ],
        [
          'Вы находите гармонию в общении с природой.',
          'Вы умеете быстро оценивать ситуацию и принимать правильное решение.',
          'Вы перфекционист. Ваше правило – всё должно быть безупречно: и костюм, и ботинки, и мысли.',
          'Вы цените каждое мгновение, проведенное наедине с собой и умеете эффективно использовать это.',
          'Вы привыкли планировать всё заранее. Именно эта черта позволяет вам рационально использовать свое время и силы.',
          'Независимость – ваша основная черта. Она характеризует вас, как сильную личность',
          'Вы разносторонняя личность, умеете быстро переключаться с одной задачи на другую.',
          'Хочешь сделать хорошо – сделай всё сам. Это точно про вас!',
          'Автомобиль – это ваше продолжение. Вы из тех людей, которые всем другим видам передвижения предпочитают передвижение за рулем любимого автомобиля.'
        ]
      ]
    ],
    charTitles:[
      [
        {'1':'ВЫ НАЦЕЛЕНЫ<br/>НА РЕЗУЛЬТАТ'},
        {'2':'ВЫ ДОВЕРЯЕТЕ<br/>СВОИМ ЧУВСТВАМ'},
        {'3':'ВАША ЦЕЛЬ –<br/>ТОЛЬКО ИДЕАЛ'},
        {'4':'ВЫ ЛЮБИТЕ<br/>ВСЕ НОВОЕ'},
        {'5':'ВЫ МЫСЛИТЕ<br/>НЕСТАНДАРТНО'}
      ],
      [
        {'6':'В ЖИЗНИ<br/>ВЫ ОПТИМИСТ'},
        {'7':'ПО НАТУРЕ<br/>ВЫ ЛИДЕР'},
        {'8':'ВЫ ЦЕНИТЕ<br/>НЕЗАВИСИМОСТЬ'},
        {'9':'НА ВАС МОЖНО<br/>ПОЛОЖИТЬСЯ'}
      ]
    ]
  };
  var maxKspsCount = 15;

  // @ngInject
  function ksp() {
    return {
      result: function (answers) {
        // analization
        var ksp = kspAdapter.satisfy(answers);

        ksp.items = [];
        ksp.titles = [];
        ksp.categories = [];

        if(ksp.carName.search('SPORT') !== -1) {
          ksp.carColor = carColor.filter(function(color) {
            return color.color !== 'korichneviy';
          });
        } else {
          ksp.carColor = carColor;
        }

//        ksp.kspIds.map(function (id) {
//          if(ksp.titles.indexOf(kspGlobal[id].title) == -1)
//          {
//            ksp.items.push({id:id, data:kspGlobal[id]});
//            ksp.titles.push(kspGlobal[id].title);
//
//            ksp.categories.push({
//              title: kspGlobal[id].category,
//              check: true
//            });
//          }
//        });

        var allKSPs = ksp.kspIds.slice(0);
        var allKSPsExt = allKSPs.map(function(el){
            return {val: el, title: kspGlobal[el].title};
          });
        var prevTitle = '', counter = 0;
        for (var i = 0; i < allKSPsExt.length; i++) {
          if (allKSPsExt[i].title === prevTitle) {
            continue;
          }
          counter ++;
        }
        if (counter < maxKspsCount) {
          allKSPs = allKSPs.concat(ksp.kspIdsExt.slice(0));
        }
        allKSPs.sort(function(a,b){return a-b;});
        var kspCounter = 0, prevAdvTitle = '';
        for (var i = 0; i < allKSPs.length; i++) {
            var val = allKSPs[i];
            if (kspCounter === maxKspsCount) {
              break;
            }
            if(prevAdvTitle === kspGlobal[val].title){
              ksp.items[ksp.items.length - 1].data.text += '<br/>' + kspGlobal[val].text;
            } else {
              ksp.items.push({id:val, data:kspGlobal[val]});
              ksp.titles.push(kspGlobal[val].title);

              ksp.categories.push({
                title: kspGlobal[val].category,
                check: true
              });
              kspCounter++;
            }

            prevAdvTitle = kspGlobal[val].title;
        }

        ksp.categories = ksp.categories.unique();
        return ksp;
      }
    };
  }

  // Unique array function
  Array.prototype.unique = function () {
    var im = {}, uniq = [];
    for (var i = 0; i < this.length; i++) {
      var type = (this[i]).constructor.name,
        val = type + (!/num|str|regex|bool/i.test(type) ? JSON.stringify(this[i]) : this[i]);
      if (!(val in im)) {
        uniq.push(this[i]);
      }
      im[val] = 1;
    }
    return uniq;
  };

  var carColor = [
    {
      color: '#fff',
      file: 'beliy'
    },
    {
      color: '#e2e1c4',
      file: 'begeviy'
    },
    {
      color: '#202020',
      file: 'cherniymet'
    },
    {
      color: '#000000',
      file: 'cherniynem'
    },
    {
      color: '#380f0f',
      file: 'korichneviy'
    },
    {
      color: '#872525',
      file: 'krasniy'
    },
    {
      color: '#e2e2e2',
      file: 'serebristiy'
    },
    {
      color: '#6d6a5f',
      file: 'seriy'
    },
    {
      color: '#c4c4c4',
      file: 'svetloseriy'
    },
    {
      color: '#234093',
      file: 'temnosiniy'
    }
  ];

  var kspGlobal = {
    "1": {
      "types": [1200, 1300, 2200, 2300, 20, 40],
      "order": [1200, 1300, 2200, 2300],
      "engine": [200, 300, 400],
      "title": "Новый динамичный дизайн экстерьера",
      "text": "Приготовьтесь, ваша жизнь может измениться! За рулем нового RX вы станете постоянным объектом внимания! Каждая деталь этого автомобиля подчеркивает его уникальность и выделяет из&nbsp;общего потока: 1. Выразительная трапециевидная решетка радиатора с &nbsp;хромированной окантовкой создает эффектное первое впечатление. 2. Светодиодные фары с&nbsp;тремя линзами  L-образной формы и&nbsp;обновленные светодиодные противотуманные фары добавляют динамики. 3. Затемненные задние стойки создают уникальную иллюзию парящей крыши.",
      "category": "new_design",
      "video": "./public/result/adv/videos/exterior_overview",
      "poster": "./public/result/adv/images/exterior_overview"
    },
    "2": {
      "types": [1200, 1300, 2200, 2300, 20, 40],
      "order": [1200, 1300, 2200, 2300],
      "engine": [200, 300, 400],
      "title": "Новые 20-дюймовые литые диски",
      "text": "Эффектные 20-дюймовые 5-спицевые легкосплавленные диски можно дополнительно персонализировать по&nbsp;вашему вкусу за&nbsp;счет добавления цветных вставок. Сделайте ваш новый RX по-настоящему уникальным.",
      "category": "new_design"
    },
    "3": {
      "types": [1200, 2200, 1],
      "order": [],
      "engine": [200],
      "title": "Начальные комплектации с&nbsp;богатым оснащением",
      "text": "Новый премиальный кроссовер располагает богатым оснащением уже в&nbsp;стандартной комплектации: роскошная отделка и&nbsp;высокотехнологичные функции для&nbsp;комфортного вождения.",
      "category": "true_lexus"
    },
    "4": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500],
      "order": [],
      "engine": [200, 300, 400],
      "title": "Высокое качество материалов",
      "text": "Интерьер нового RX украшен вставками с&nbsp;лазерной гравировкой черного дерева, а&nbsp;его кожаные кресла прошиваются командой мастеров Такуми. Роскошно? Да! Комфортно? Безусловно!",
      "category": "true_lexus"
    },
    "5": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500],
      "order": [],
      "engine": [200, 300, 400],
      "title": "Новые деревянные вставки с&nbsp;лазерной гравировкой",
      "text": "Интерьер нового RX соблазнит вас роскошью и&nbsp;комфортом. Салон автомобиля украшен вставками из&nbsp;черного дерева. Сначала на деревянную отделку наносят затейливый рисунок, используя для&nbsp;этого лазерную гравировку, а&nbsp;затем вручную полируют ее до&nbsp;ярчайшего блеска.",
      "category": "true_lexus"
    },
    "6": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 10, 20],
      "order": [10, 20],
      "engine": [300],
      "title": "Новая автоматическая 8-ступенчатая коробка передач для&nbsp;улучшения динамики и&nbsp;топливной экономичности",
      "text": "Новый кроссовер RX 350 AWD предлагает совершенно неповторимый опыт вождения в&nbsp;вашей жизни. Автомобиль оснащается бензиновым двигателем V6 объемом 3,5&nbsp;л, отличающимся исключительной плавностью работы, а&nbsp;также чрезвычайно отзывчивой восьмиступенчатой автоматической коробкой передач, которая позволяет экономить топливо и&nbsp;сообщать больший крутящий момент на&nbsp;низких оборотах двигателя.",
      "category": "driving_pleasure"
    },
    "7": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 10, 20, 30, 50],
      "order": [10, 20, 30],
      "engine": [200, 300, 400],
      "title": "Усиленная жесткость кузова, более спортивные настройки подвески и&nbsp;рулевого управления для&nbsp;динамичного вождения",
      "text": "При создании нового RX использовались инновационные технологии лазерной сварки и&nbsp;склеивания, за&nbsp;счет чего удалось сделать шасси более жестким. В сочетании с&nbsp;улучшенной передней подвеской и&nbsp;новой технологией рулевого управления это позволило значительно повысить точность вождения и&nbsp;устойчивость RX на дороге – для безопасности вашей жизни.",
      "category": "driving_pleasure"
    },
    "8": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 10, 20, 30],
      "order": [10, 20, 30],
      "engine": [200, 300, 400],
      "title": "Усовершенствованная адаптивная регулируемая подвеска (AVS)",
      "text": "Невероятную отзывчивость автомобиля во&nbsp;время движения обеспечивают адаптивная регулируемая подвеска (AVS) со&nbsp;спортивными настройками, которая  интеллектуально контролирует амортизаторы всех четырех колес. Вы чувствуете дорогу буквально на&nbsp;кончиках пальцев.",
      "category": "driving_pleasure"
    },
    "9": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500],
      "order": [],
      "engine": [200, 300, 400],
      "title": "Аудиосистема премиум класса Mark Levinson&reg; с&nbsp;поддержкой CD/MP3/WMA/DVD 15 динамиков",
      "text": "Какие&nbsp;бы музыкальные направления вы не&nbsp;предпочитали – аудиосистема объемного звучания премиум класса Mark Levinson&reg; с&nbsp;пятнадцатью встроенными динамиками подарит вам непревзойденное качество воспроизведения ваших любимых композиций в&nbsp;любом из&nbsp;форматов CD/MP3/WMA/DVD.",
      "category": "functionality"
    },
    "10": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 10],
      "order": [1200, 2200, 2300],
      "engine": [200, 300, 400],
      "title": "12,3-дюймовый цветной LCD дисплей на&nbsp;центральной консоли",
      "text": "Управлять различными системами вашего RX как&nbsp;голосом, так&nbsp;и&nbsp;с&nbsp;помощью джойстика Remote Touch можно через большой дисплей с&nbsp;диагональю 12,3&nbsp;дюйма, расположенный на&nbsp;центральной консоли. Разделение экрана на&nbsp;несколько зон позволяет одновременно искать различную информацию, например,  карты навигационной системы и&nbsp;вашу любимую музыкальную композицию.",
      "category": "functionality"
    },
    "11": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 10],
      "order": [2200, 2300],
      "engine": [200, 300, 400],
      "title": "12,3-дюймовый цветной LCD дисплей на&nbsp;центральной консоли",
      "text": "Большой дисплей с диагональю 12,3&nbsp;дюйма расположен на&nbsp;центральной консоли на&nbsp;комфортной высоте для&nbsp;ваших глаз - что, например, позволяет получить навигационные данные или данные аудиосистемы, не&nbsp;отрывая взгляда от&nbsp;дороги. К тому&nbsp;же управлять различными системами вашего RX можно  с&nbsp;помощью  голосового управления.",
      "category": "functionality"
    },
    "12": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 10],
      "order": [1200, 1500],
      "engine": [200, 300, 400],
      "title": "Джойстик управления Remote-Touch",
      "text": "Жизнь за&nbsp;рулем становится легче и&nbsp;комфортнее! В&nbsp;новом RX вся необходимая вам информация может отображаться на&nbsp;ветровом стекле с&nbsp;помощью проекционного дисплея или&nbsp;на&nbsp;мультиинформационном дисплее между панелями приборов.  А&nbsp;современный джойстик Remote Touch с&nbsp;сенсорным управлением гарантирует простоту настроек аудиосистемы, климат-контроля и системы навигации. Жизнь за&nbsp;рулем становится легче и&nbsp;комфортнее!",
      "category": "functionality"
    },
    "13": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 10],
      "order": [2200, 2300],
      "engine": [200, 300, 400],
      "title": "Джойстик управления Remote-Touch",
      "text": "Благодаря современному джойстику Remote Touch с&nbsp;сенсорным управлением вы&nbsp;можете мгновенно настраивать аудиосистемы, климат-контроль и&nbsp;системы навигации - не&nbsp;отрываясь от&nbsp;дороги.",
      "category": "functionality"
    },
    "14": {
      "types": [1200, 1300, 2200, 2300, 10],
      "order": [1200, 1300, 2200, 2300],
      "engine": [200, 300, 400],
      "title": "Беспроводное зарядное устройство для&nbsp;смартфона",
      "text": "Лишним проводам не&nbsp;место в&nbsp;вашей жизни! Теперь вы&nbsp;можете зарядить свой смартфон с&nbsp;помощью беспроводной зарядной станции, которая удобно расположена в&nbsp;отсеке центральной консоли. Элегантное и&nbsp;функциональное решение!",
      "category": "functionality",
      "video": "./public/result/adv/videos/phone_charging",
      "poster": "./public/result/adv/images/phone_charging"
    },
    "16": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 10],
      "order": [1500, 2200, 2300, 2400, 2500],
      "engine": [200, 300, 400],
      "title": "Навигационная система с&nbsp;SD-картой",
      "text": "Вы&nbsp;можете самостоятельно обновлять данные вашей навигационной системы.",
      "category": "functionality"
    },
    "17": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 10],
      "order": [1500, 2200, 2300, 2400, 2500],
      "engine": [200, 300, 400],
      "title": "Навигационная система с&nbsp;SD-картой",
      "text": "Карты штатной навигационной системы хранятся на&nbsp;SD карте: процесс обновления занимает всего пару секунд!",
      "category": "functionality"
    },
    "18": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 10, 30, 40],
      "order": [2200, 2300, 2400, 2500, 1, 2, 10, 30, 40],
      "engine": [200, 300, 400],
      "title": "Электропривод задней двери с&nbsp;бесконтактным сенсором",
      "text": "Не&nbsp;всегда в&nbsp;жизни автомобиль бывает идеально чистым. Просто поднесите руку к&nbsp;значку Lexus, не&nbsp;касаясь&nbsp;его, и&nbsp;дверь багажника автоматически откроется (конечно, если&nbsp;ключ от&nbsp;автомобиля находится в&nbsp;Вашем кармане или&nbsp;сумке), а&nbsp;ваши руки останутся чистыми. ",
      "category": "unbeatable_comfort",
      "video": "./public/result/adv/videos/back_door",
      "poster": "./public/result/adv/images/back_door"
    },
    "19": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 10, 30, 40],
      "order": [2200, 2300, 2400, 2500, 1, 2, 30, 40],
      "engine": [200, 300, 400],
      "title": "Электропривод задней двери с&nbsp;бесконтактным сенсором",
      "text": "Система запоминает высоту открытия двери багажника, удобной для&nbsp;вашего роста и&nbsp;автоматически фиксирует ее&nbsp;в&nbsp;этой точке.",
      "category": "unbeatable_comfort",
      "video": "./public/result/adv/videos/back_door",
      "poster": "./public/result/adv/images/back_door"
    },
    "20": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 10, 30, 40],
      "order": [30, 40],
      "engine": [200, 300, 400],
      "title": "Электропривод задней двери с&nbsp;бесконтактным сенсором",
      "text": "Система зафиксирует открытие двери багажника на&nbsp;нужной вам&nbsp;высоте, что&nbsp;удобно, если&nbsp;у&nbsp;вас гараж с&nbsp;невысоким потолком.",
      "category": "unbeatable_comfort",
      "video": "./public/result/adv/videos/back_door",
      "poster": "./public/result/adv/images/back_door"
    },
    "21": {
      "types": [1200, 1300, 1400, 1500, 10],
      "order": [],
      "engine": [300],
      "title": "Мощный и&nbsp;эффективный 2,0-литровый турбированный двигатель",
      "text": "Революционное сочетание головки блока цилиндров с&nbsp;жидкостным охлаждением, встроенный выпускной коллектор и&nbsp;турбонагнетатель с&nbsp;двойной «улиткой» обеспечивают новому 2,0-литровый турбированному двигателю Lexus высокую приемистость и&nbsp;захватывающую дух мощность. Эти&nbsp;характеристики позволяют ему избегать &laquo;турбоямы&raquo; при&nbsp;разгоне и&nbsp;обеспечивают стремительный разгон без&nbsp;рывков и&nbsp;запаздываний.",
      "category": "driving_pleasure"
    },
    "22": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 10],
      "order": [2400, 2500, 10],
      "engine": [300],
      "title": "Мощный и&nbsp;эффективный 2,0-литровый турбированный двигатель",
      "text": "Мощный и&nbsp;эффективный 2,0-литровый турбированный двигатель обладает инновационным механизмом газораспределения, который позволяет переключаться между циклами Отто и&nbsp;Аткинсона, что&nbsp;существенно уменьшает расход топлива.",
      "category": "driving_pleasure"
    },
    "23": {
      "types": [1200, 1300, 1400, 1500, 10, 20],
      "order": [1200, 20],
      "engine": [300],
      "title": "Мощный и&nbsp;эффективный 2,0-литровый турбированный двигатель",
      "text": "Благодаря мощному 2,0-литрововому турбированному двигателю RX обладает динамичным разгоном, что&nbsp;увеличивает безопасность при&nbsp;обгоне.",
      "category": "driving_pleasure"
    },
    "24": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 10, 30],
      "order": [1200, 2200, 2300, 30],
      "engine": [300, 400],
      "title": "4 Камеры панорамного обзора с&nbsp;3D визуализацией",
      "text": "В&nbsp;жизни часто бывают ситуации, когда&nbsp;парковка затруднена. Быстро и&nbsp;аккуратно припарковать автомобиль вам&nbsp;поможет система панорамного обзора Panoramic View Monitor, которая обеспечивает практически круговой 3D-обзор. А&nbsp;подсказки на&nbsp;экране сделают процесс парковки еще&nbsp;более&nbsp;легким. В&nbsp;жизни часто бывают ситуации, когда&nbsp;парковка затруднена. Быстро и&nbsp;аккуратно припарковать автомобиль вам&nbsp;поможет система панорамного обзора Panoramic View Monitor, которая обеспечивает практически круговой 3D-обзор.",
      "category": "unbeatable_comfort"
    },
    "25": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 10],
      "order": [2200, 2300, 1, 2],
      "engine": [300, 400],
      "title": "4 Камеры панорамного обзора с&nbsp;3D визуализацией",
      "text": "Cистема панорамного обзора Panoramic View Monitor, которая предоставляет практически круговой 3D-обзор, обеспечит безопасное вождение на&nbsp;узких улочках в центре города: ее&nbsp;боковые камеры работают даже в&nbsp;сложеном положении.",
      "category": "unbeatable_comfort"
    },
    "26": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 10],
      "order": [2200, 2300],
      "engine": [300, 400],
      "title": "4 Камеры панорамного обзора с&nbsp;3D визуализацией",
      "text": "Четыре камеры обеспечивают практически круговой обзор и&nbsp;тем самым упрощают движение в&nbsp;ограниченном пространстве. Камеры создают виртуальное трехмерное изображение автомобиля, которое помогает выполнять маневры в&nbsp;городе и на&nbsp;парковке.",
      "category": "unbeatable_comfort"
    },
    "27": {
      "types": [1200, 1300, 1400, 2200, 2300, 2400],
      "order": [1200, 2200, 2300, 2400],
      "engine": [400],
      "title": "Высокоэффективная гибридная система с&nbsp;двигателем 3.5&nbsp;л, V6 и&nbsp;двумя электромоторами",
      "text": "В режиме электромобиля ваш&nbsp;мощный кроссовер может двигаться практически бесшумно, не&nbsp;расходовать при&nbsp;этом бензин и&nbsp;не&nbsp;загрязнять атмосферу выбросами CO2 или&nbsp;NO. Сам аккумулятор не&nbsp;требует зарядки от&nbsp;внешнего источника тока и&nbsp;заряжается во&nbsp;время движения автомобиля.",
      "category": "driving_pleasure",
      "video": "./public/result/adv/videos/hybrid_drive",
      "poster": "./public/result/adv/images/hybrid_drive"
    },
    "28": {
      "types": [1400, 1500, 2400, 2500, 2],
      "order": [1400, 1500],
      "engine": [400],
      "title": "Высокоэффективная гибридная система с&nbsp;двигателем 3.5&nbsp;л, V6 и&nbsp;двумя электромоторами",
      "text": "В систему Lexus Hybrid Drive входит 3,5-литровый бензиновый двигатель V6 и&nbsp;два высокопроизводительных электромотора. Приятным дополнением для&nbsp;вас станут налоговые льготы, предусмотренные для владельцев&nbsp;автомобилей с&nbsp;гибридным двигателем.",
      "category": "driving_pleasure",
      "video": "./public/result/adv/videos/hybrid_drive",
      "poster": "./public/result/adv/images/hybrid_drive"
    },
    "29": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 10],
      "order": [1400, 1500, 10],
      "engine": [400],
      "title": "Высокоэффективная гибридная система с&nbsp;двигателем 3.5&nbsp;л, V6 и&nbsp;двумя электромоторами",
      "text": "Режим электромобиля обеспечивает большую мощность и сокращает расход топлива — от&nbsp;5,2&nbsp;л/100&nbsp;км. Вам нет&nbsp;необходимости часто заправляться и&nbsp;искать заправку.",
      "category": "driving_pleasure",
      "video": "./public/result/adv/videos/hybrid_drive",
      "poster": "./public/result/adv/images/hybrid_drive"
    },
    "30": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 10],
      "order": [1500, 2200, 2300, 2400, 2500],
      "engine": [300, 400],
      "title": "Вентиляция сидений первого ряда",
      "text": "Удовольствие от&nbsp;вождения не&nbsp;зависит от&nbsp;погоды за&nbsp;бортом. Система вентиляции сидений первого ряда поддержит комфортную температуру даже в&nbsp;самый жаркий сезон.",
      "category": "unbeatable_comfort"
    },
    "31": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 10],
      "order": [2200, 2300, 1, 2],
      "engine": [300, 400],
      "title": "Cистема помощи при&nbsp;выезде с&nbsp;парковки задним ходом (RCTA)",
      "text": "Ограниченное пространство для&nbsp;парковки? Не&nbsp;самая приятная жизненная ситуация. Но&nbsp;в&nbsp;новом  RX вы&nbsp;в&nbsp;полной безопасности! При&nbsp;движении задним ходом, установленные в&nbsp;заднем бампере радарные датчики обнаруживают препятствия в&nbsp;плохо просматриваемой зоне позади автомобиля и&nbsp;в&nbsp;случае опасности предупреждают водителя с&nbsp;помощью звукового и&nbsp;светового сигнала.",
      "category": "unbeatable_comfort",
      "video": "./public/result/adv/videos/check_surroundings_for_safety",
      "poster": "./public/result/adv/images/check_surroundings_for_safety"
    },
    "32": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 10],
      "order": [1200, 2200, 2300, 1, 2],
      "engine": [300, 400],
      "title": "Cистема помощи при&nbsp;выезде с&nbsp;парковки задним ходом (RCTA)",
      "text": "Что и говорить: движение задним ходом не самый приятный маневр, но&nbsp;только не&nbsp;в&nbsp;новом RX! Почувствовать себя уверенно поможет система контроля «слепых зон», которая обнаружит препятствия и&nbsp;предупредит вас&nbsp;о&nbsp;них с&nbsp;помощью звукового и&nbsp;светового сигнала.",
      "category": "unbeatable_comfort",
      "video": "./public/result/adv/videos/check_surroundings_for_safety",
      "poster": "./public/result/adv/images/check_surroundings_for_safety"
    },
    "33": {
      "types": [1, 2],
      "order": [1, 2],
      "engine": [300, 400],
      "title": "Панорамная крыша с&nbsp;открывающейся секцией",
      "text": "Естественный свет сквозь окна и&nbsp;панорамный люк оказывают позитивный эффект на&nbsp;наше настроение, эмоции и&nbsp;улучшают восприятие жизни в&nbsp;целом. Чтобы&nbsp;еще&nbsp;лучше обеспечить естественное освещение салона, позиция открытия люка была смещена на&nbsp;10 миллиметров вперед.",
      "category": "unbeatable_comfort"
    },
    "34": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 10],
      "order": [1, 2],
      "engine": [300, 400],
      "title": "Панорамная крыша с&nbsp;открывающейся секцией",
      "text": "Большая панорамная крыша наполняет салон RX светом, а&nbsp;также создает ощущение дополнительного пространства и&nbsp;свободы. Она оснащена открывающейся стеклянной секцией в&nbsp;передней части, которая дает возможность по-настоящему насладиться открытым пространством.",
      "category": "unbeatable_comfort"
    },
    "35": {
      "types": [2200, 2300, 2400, 2500],
      "order": [2200, 2300, 2400, 2500],
      "engine": [200, 300, 400],
      "title": "Электромеханический стояночный тормоз",
      "text": "Электромеханический стояночный тормоз включается простым нажатием кнопки на панели управления.",
      "category": "unbeatable_comfort"
    },
    "36": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 10],
      "order": [2200, 2300],
      "engine": [200, 300, 400],
      "title": "Электромеханический стояночный тормоз",
      "text": "Выключение электромеханического стояночного тормоза производится автоматически, как&nbsp;только автомобиль трогается с&nbsp;места. Это в&nbsp;том&nbsp;числе позволяет предотвратить откатывание автомобиля при&nbsp;трогании на&nbsp;подъеме.",
      "category": "unbeatable_comfort"
    },
    "37": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 10],
      "order": [1, 2, 10],
      "engine": [200, 300, 400],
      "title": "Светодиодная подсветка поворотов",
      "text": "Для жизненных ситуаций, когда&nbsp;приходится ездить в&nbsp;ночное время суток это незаменимая функция. Передние и&nbsp;задние светодиодные сигналы поворота с&nbsp;эффектом бегущей строки дополняют элегантный облик нового RX и&nbsp;обеспечивают более безопасное вождение.",
      "category": "unbeatable_comfort"
    },
    "38": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 10, 30, 40, 50],
      "order": [2200, 2300, 1, 2, 30, 40, 50],
      "engine": [300, 400],
      "title": "Сиденья второго ряда с&nbsp;электроприводом складывания",
      "text": "Сиденья второго ряда снабжены механизмом автоматического электропривода для&nbsp;складывания, управление которым осуществляется с&nbsp;помощью удобно расположенных кнопок. Пассажиры на&nbsp;заднем ряду также могут частично откинуть спинки сидений для большего комфорта, но&nbsp;при&nbsp;этом центральный подлокотник остается идеально ровным.",
      "category": "unbeatable_comfort"
    },
    "39": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 10, 30, 40],
      "order": [2200, 2300, 2400, 2500, 1, 2, 30, 40],
      "engine": [300, 400],
      "title": "Сиденья второго ряда с&nbsp;электроприводом складывания",
      "text": "В жизни бывают ситуации, когда вам&nbsp;нужно сложить сиденья второго ряда, например, для транспортировки габаритного груза. Теперь вы&nbsp;можете это сделать прямо со&nbsp;стороны багажника.",
      "category": "unbeatable_comfort"
    },
    "40": {
      "types": [1200, 1300, 1400, 2200, 2300, 2400],
      "order": [1200, 1300, 2200, 2300],
      "engine": [200, 300, 400],
      "title": "2 USB разъема (c&nbsp;возможностью подключения iPod)",
      "text": "Вы хотите послушать музыку со&nbsp;своего телефона, а&nbsp;телефон вашего спутника нуждается в&nbsp;подзарядке. Знакомая жизненная ситуация? На&nbsp;консоли нового RX два USB-разъема: вы&nbsp;можете подключить свой любимый плей-лист и&nbsp;одновременно заряжать еще&nbsp;одно электронное устройство.",
      "category": "functionality"
    },
    "41": {
      "types": [1200, 1300, 1400, 1500, 10, 20],
      "order": [10, 20],
      "engine": [200, 300, 400],
      "title": "Вентиляция сидений первого ряда",
      "text": "Часто находитесь за&nbsp;рулем подолгу? При вашем образе жизни вы&nbsp;не&nbsp;будете испытывать ни&nbsp;малейшего дискомфорта благодаря системе вентиляции сидений переднего ряда.",
      "category": "unbeatable_comfort",
      "video": "./public/result/adv/videos/conditioner",
      "poster": "./public/result/adv/images/conditioner"
    },
    "42": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 10],
      "order": [1500, 2400, 2500],
      "engine": [200, 300, 400],
      "title": "Новый дизайн интерьера",
      "text": "Как только вы оказываетесь в салоне нового RX, как&nbsp;тут&nbsp;же окунаетесь в&nbsp;ощущение гармонии: плавные, мягкие линии в&nbsp;интерьере создают атмосферу комфорта и&nbsp;уюта, а&nbsp;продуманное расположение всех органов управления максимально упрощает их&nbsp;использование и&nbsp;дарит незабываемое удовольствие от&nbsp;вождения.",
      "category": "new_design",
      "video": "./public/result/adv/videos/interior_overview",
      "poster": "./public/result/adv/images/interior_overview"
    },
    "43": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 10],
      "order": [1500, 2200, 2300, 2400, 2500],
      "engine": [200, 300, 400],
      "title": "Новая форма и&nbsp;функциональность руля",
      "text": "Эргономическое рулевое колесо с&nbsp;кожаной отделкой было разработано специально для&nbsp;нового RX. Оно приятно на&nbsp;ощупь и&nbsp;послушно малейшему вашему прикосновению. В&nbsp;некоторых комплектациях рулевое колесо выполнено с&nbsp;использованием  вставок из&nbsp;уникального дерева.",
      "category": "unbeatable_comfort"
    },
    "44": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 10],
      "order": [2200, 2300, 1, 2],
      "engine": [200, 300, 400],
      "title": "Новая форма и&nbsp;функциональность руля",
      "text": "Абсолютно новые ощущения в&nbsp;вашей жизни. Рулевое колесо с&nbsp;кожаной отделкой было разработано специально для&nbsp;нового RX. Его&nbsp;покрытие приятно на&nbsp;ощупь, а&nbsp;в&nbsp;зоне досягаемости больших пальцев рук водителя расположены основные кнопки управления - вам нет нужды лишний раз отрываться от&nbsp;дороги.",
      "category": "unbeatable_comfort"
    },
    "45": {
      "types": [1, 2, 10, 30, 50],
      "order": [30, 50],
      "engine": [200, 300, 400],
      "title": "Увеличенное пространство для&nbsp;ног пассажиров на&nbsp;сиденьях второго ряда",
      "text": "Поверьте, споров кто поедет впереди, а&nbsp;кто сзади теперь поубавится! Увеличенное пространство для&nbsp;ног на&nbsp;сиденьях второго ряда подарит вашим пассажирам ощущения непревзойденного комфорта. Увидите - им&nbsp;понравится!",
      "category": "unbeatable_comfort"
    },
    "46": {
      "types": [1, 2, 30, 50],
      "order": [1, 2, 30, 50],
      "engine": [200, 300, 400],
      "title": "Увеличенное пространство для&nbsp;ног пассажиров на&nbsp;сиденьях второго ряда",
      "text": "Эта функция значительно облегчает жизнь молодых родителей! Увеличенное пространство для&nbsp;пассажиров на&nbsp;сиденьях второго ряда позволит вам&nbsp;быстро установить и&nbsp;так&nbsp;же быстро снять автокресло для&nbsp;вашего малыша.",
      "category": "unbeatable_comfort"
    },
    "47": {
      "types": [1, 2, 10, 30, 40, 50],
      "order": [1, 30, 40, 50],
      "engine": [200, 300, 400],
      "title": "Сиденья второго ряда с&nbsp;регулируемым наклоном спинок",
      "text": "Одним касанием руки ваши&nbsp;пассажиры на&nbsp;втором ряду могут настроить сидения под&nbsp;свои персональные параметры. А&nbsp;подогрев сидений подарит им&nbsp;ощущение комфорта и&nbsp;уюта в&nbsp;холодное время года.",
      "category": "unbeatable_comfort"
    },
    "48": {
      "types": [1, 2, 10, 50],
      "order": [1, 2, 50],
      "engine": [200, 300, 400],
      "title": "Вместительный и&nbsp;удобный багажник",
      "text": "Вместительный, глубокий багажник для&nbsp;всего на&nbsp;свете. Вы&nbsp;сами удивитесь, сколько он&nbsp;способен вместить. А&nbsp;если&nbsp;еще сложить задние сидения!",
      "category": "unbeatable_comfort"
    },
    "49": {
      "types": [1, 2, 10, 50],
      "order": [1, 2, 50],
      "engine": [200, 300, 400],
      "title": "Вместительный и&nbsp;удобный багажник",
      "text": " В новом RX багажник расположен низко, что&nbsp;существенно упрощает жизнь! Теперь вам легче загружать и&nbsp;выгружать вещи.",
      "category": "unbeatable_comfort"
    },
    "50": {
      "types": [10, 20],
      "order": [10, 20],
      "engine": [200, 300, 400],
      "title": "Неполноразмерное запасное колесо",
      "text": "Запасное колесо входит в&nbsp;комплектацию. Даже на&nbsp;безлюдном загородном шоссе вы&nbsp;не&nbsp;останетесь один на&nbsp;один с&nbsp;проблемой спущенного колеса. ",
      "category": "unbeatable_comfort"
    },
    "51": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 10, 40],
      "order": [1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 40],
      "engine": [200, 300, 400],
      "title": "Неполноразмерное запасное колесо",
      "text": "Запасное колесо занимает совсем немного места, не&nbsp;затрагивая место в&nbsp;багажнике.",
      "category": "unbeatable_comfort"
    },
    "52": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 10],
      "order": [1500, 2400, 2500],
      "engine": [200, 300, 400],
      "title": "Светодиодная фоновая подсветка салона",
      "text": "Светодиодная подсветка с сенсорным включением кнопок управления - всё&nbsp;на&nbsp;виду, всё под&nbsp;рукой.",
      "category": "unbeatable_comfort"
    },
    "53": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 10],
      "order": [2200, 2300, 2400, 2500],
      "engine": [200, 300, 400],
      "title": "Полностью светодиодные фары",
      "text": "В похожих на&nbsp;бриллианты фарах используется светодиодный источник и&nbsp;для дальнего и&nbsp;для&nbsp;ближнего света, что&nbsp;обеспечивает прекрасную видимость  и&nbsp;повышает безопасность вождения в&nbsp;ночное время суток.",
      "category": "new_design"
    },
    "54": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 10, 20],
      "order": [1200, 1300, 2200, 2300, 2400, 2500, 20],
      "engine": [300, 400],
      "title": "Полностью светодиодные фары",
      "text": "Благодаря L-образной форме передних фар повышается видимость вашего автомобиля для&nbsp;других водителей, а&nbsp;для&nbsp;вас обеспечивается мощное, кристально чистое освещение дороги.",
      "category": "new_design"
    },
    "55": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 10],
      "order": [1200, 1300, 2200, 2300],
      "engine": [200, 300, 400],
      "title": "Характерная для Lexus трапециевидная решетка радиатора",
      "text": "Эксклюзивная трапециевидная решетка радиатора с&nbsp;хромированной окантовкой создает эффектное первое впечатление и&nbsp;придает новому RX мускулистый вид.",
      "category": "new_design"
    },
    "56": {
      "types": [10],
      "order": [10],
      "engine": [200, 300, 400],
      "title": "Черные пластиковые накладки на&nbsp;колесные арки",
      "text": "Комплект черных пластиковых накладок на&nbsp;колесные арки обеспечивает надежную защиту кузова от&nbsp;пескоструйного эффекта и&nbsp;негативного влияния агрессивных антигололедных реагентов, а&nbsp;также способствуют повышению уровня шумоизоляции.",
      "category": "new_design"
    },
    "57": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 10],
      "order": [1500, 2200, 2300, 2400, 2500],
      "engine": [200, 300, 400],
      "title": "Приветственная подсветка ручек дверей",
      "text": "Ваш автомобиль приветствует вас! Датчики Lexus RX считывают наличие ключа Smart Key в&nbsp;вашем кармане или&nbsp;сумке и&nbsp;включают мягкую подсветку ручек дверей. А&nbsp;еще&nbsp;эта функция облегчит вам жизнь в&nbsp;ночное время на&nbsp;неосвещаемом паркинге.",
      "category": "unbeatable_comfort"
    },
    "58": {
      "types": [1200, 1300, 2200, 2300, 20],
      "order": [1200, 1300, 2200, 2300, 20],
      "engine": [300, 400],
      "title": "Комплектация F SPORT",
      "text": "Новый RX в&nbsp;комплектации F&nbsp;SPORT подчеркнет  вашу яркую индивидуальность. Куда бы&nbsp;в&nbsp;жизни вы&nbsp;не&nbsp;направлялись, взгляды окружающих будут прикованы к&nbsp;вам и&nbsp;вашему автомобилю. Более широкая трапециевидная решетка радиатора, состоящая из&nbsp;эксклюзивной передней решетки и&nbsp;нижнего спойлера с&nbsp;глянцевым хромированным покрытием, придают автомобилю динамичный внешний вид. А&nbsp;такие детали, как&nbsp;эмблема F&nbsp;SPORT, черные боковые зеркала, эксклюзивный задний бампер и&nbsp;эффектные 20-дюймовые легкосплавные диски делают акцент на&nbsp;сильном характере кроссовера.",
      "category": "driving_pleasure"
    },
    "59": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 10],
      "order": [],
      "engine": [200, 300, 400],
      "title": "Боковые зеркала уникального дизайна",
      "text": "Элегантные наружные зеркала заднего вида специально спроектированы таким образом, чтобы&nbsp;уменьшить шум от&nbsp;ветра. В&nbsp;них встроены индикаторы поворота и&nbsp;система подогрева - зеркала не&nbsp;замерзают в&nbsp;холод и&nbsp;не&nbsp;запотевают во&nbsp;время дождя",
      "category": "unbeatable_comfort"
    },
    "60": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 10],
      "order": [1, 2],
      "engine": [200, 300, 400],
      "title": "Боковые зеркала уникального дизайна",
      "text": "В наружных зеркалах использована электро-хроматической технология, которая помогает предотвратить ослепления в&nbsp;ночное время. Жизненно необходимая функция!",
      "category": "unbeatable_comfort"
    },
    "61": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 10, 30, 40, 50],
      "order": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 1, 50],
      "engine": [200, 300, 400],
      "title": "Электрообогрев ветрового стекла (всей поверхности)",
      "text": "Чтобы обеспечить вам&nbsp;комфорт и&nbsp;удовольствие от&nbsp;вождения в&nbsp;новом кроссовере продумано всё до&nbsp;мелочей. Не&nbsp;нужно тратить силы и&nbsp;время на&nbsp;очищение стекла ото&nbsp;льда. Эту не&nbsp;самую приятную в&nbsp;вашей жизни работу обогрев сделает сам всего за&nbsp;пару минут.",
      "category": "unbeatable_comfort"
    },
    "62": {
      "types": [1, 2, 50],
      "order": [1, 2, 50],
      "engine": [200, 300, 400],
      "title": "Сиденья второго ряда с&nbsp;подогревом",
      "text": "Сиденья второго ряда оснащены отдельно регулирующейся системой  подогрева – ваши пассажиры это оценят!",
      "category": "unbeatable_comfort"
    },
    "63": {
      "types": [1200, 1300, 1400, 2200, 2300, 2400, 1, 2, 20, 50],
      "order": [1200, 1300, 2200, 2300, 1, 2, 20],
      "engine": [200, 300, 400],
      "title": "10-дюймовый цветной проекционный дисплей (HUD)",
      "text": "Чтобы узнать основные параметры не&nbsp;нужно отвлекаться от&nbsp;дороги. Дизайнеры позаботились не&nbsp;только о&nbsp;вашем комфорте, но&nbsp;и&nbsp;безопасности:  информация ненавязчиво направляется в&nbsp;поле зрения, отображаясь на&nbsp;ветровом стекле с&nbsp;помощью проекционного дисплея.",
      "category": "functionality",
      "video": "./public/result/adv/videos/navigation_on_glass",
      "poster": "./public/result/adv/images/navigation_on_glass"
    },
    "64": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 10, 20, 40, 50],
      "order": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 20],
      "engine": [300, 400],
      "title": "Система интегрированного управления динамикой автомобиля (VDIM)",
      "text": "VDIM проверяет основные электронные системы автомобиля, включая системы контроля торможения, тягу, устойчивость и&nbsp;управление автомобилем. При&nbsp;передвижении по&nbsp;скользким и&nbsp;сложным участкам это обеспечивает более слаженную и&nbsp;динамичную работу систем, чем&nbsp;если&nbsp;бы&nbsp;они работали независимо друг от&nbsp;друга, а&nbsp;значит, повышает вашу безопасность.",
      "category": "driving_pleasure"
    },
    "65": {
      "types": [1200, 1300, 1400, 1500, 2200, 2300, 2400, 2500, 1, 2, 10, 50],
      "order": [2200, 2300, 2400, 2500, 50],
      "engine": [200, 300, 400],
      "title": "10 подушек безопасности",
      "text": "Не просто роскошный кроссовер! Система безопасности в&nbsp;новом RX продумана на&nbsp;самом высоком уровне. В&nbsp;случае аварии ваша жизнь и&nbsp;жизнь ваших пассажиров защищена десятью подушками безопасности, включая инновационную сдвоенную подушку и&nbsp;дополнительную защиту для&nbsp;коленей для&nbsp;пассажиров на&nbsp;передних сиденьях. А&nbsp;защитные шторки безопасности раскрываются по&nbsp;всей длине боковых окон. ",
      "category": "true_lexus"
    },
    "66": {
      "types": [1, 2, 10, 50],
      "order": [1, 2, 50],
      "engine": [300, 400],
      "title": "10 подушек безопасности",
      "text": "Система безопасности нового RX  позволяет отнести этот&nbsp;роскошный кроссовер в&nbsp;ранг семейного автомобиля. Вы&nbsp;и&nbsp;ваши пассажиры находитесь под&nbsp;надежной защитой. Новый RX оснащен десятью подушками безопасности, включая инновационную сдвоенную подушку и&nbsp;дополнительную защиту для&nbsp;коленей для&nbsp;пассажиров на&nbsp;передних сиденьях. А&nbsp;защитные шторки безопасности раскрываются по&nbsp;всей длине боковых окон. Для&nbsp;нас безопасность вашей жизни превыше всего!",
      "category": "true_lexus"
    }
  }

})(angular);
