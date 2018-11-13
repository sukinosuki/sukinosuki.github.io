var ua = navigator.userAgent.toLowerCase();
if (ua.indexOf("ipad") !== -1 ||
    ua.indexOf("ipod") !== -1 ||
    ua.indexOf("iphone") !== -1 ||
    ua.indexOf("android") !== -1) {

    var path  = '/sp/'
    if(window && window.location && window.location.pathname && window.location.pathname.indexOf('/news/') === 0){
        path = '/sp' + window.location.pathname
    }
    if(window && window.location && window.location.search && window.location.search != ''){
        path = path + window.location.search;
    }
    location.href = path;
}

$(function() {
  var $body = $('body');
  var $paraBack = $('#paraContainerBack');
  var $paraFront = $('#paraContainerFront');
  var paraBack; //parallax前面適用済みか確認用
  var paraFront; //parallax後面適用済みか確認用

  var $paraCharaBack = $('#paraCharaback');
  var $paraCharaFront = $('#paraCharaFront');
  var paraCharaBack; //parallax前面適用済みか確認用
  var paraCharaFront; //parallax後面適用済みか確認用

  var $onlyTopRegi = $('.btn_preregistration');
  var $onlyTopTwCm = $('.btn_twicampaign');
  var $onlyTopComi = $('#banner_area');
  var $naviGlp = $('#navi  [class^=navi_]');

  var twitterWidgetFile = '//platform.twitter.com/widgets.js';

  var openingAnimeTime = 9000;

  var isFirstLoad = true;
  var $bgInShared = $('#bg .in_shared_main');
  var $bgInWorld = $('#bg .in_world_main');
  var $bgInStory = $('#bg .in_story_main');
  var $topBgGlp = $('#bg .top_page, #bg .character, #bg .front, #bg .lay, #bg #paraContainerBack, #bg #paraCharaback, #bg .chara03, #bg #paraCharaFront, #bg #paraContainerFront');

  var pageNaviNumber = {
    'top': 'navi_01',
    'world': 'navi_03',
    'story': 'navi_04',
    'character': 'navi_05',
    'system': 'navi_06',
    'creator': 'navi_07',
    'special': 'navi_08',
    'news': 'navi_02',
  };

  //BGMをIDで管理
  var bgmList = {
    1: 'bgm_01',
    2: 'bgm_02',
    3: 'bgm_03',
  };

  var bgmNum = $.cookie('sinoalice_bgm_number') !== undefined ? $.cookie('sinoalice_bgm_number') : 1;
  var bgmVol = $.cookie('sinoalice_bgm_volume') !== undefined ? $.cookie('sinoalice_bgm_volume') : 1;
  var bgmTime = 0;

  var url = location.href;
  var folder = url.match(/http:\/\/.*?\/(.*?)\//);
  var isTop = folder === null ? true : false;
  // 初回読み込みの処理
  if (isTop) {
    preLoad();

  } else {
    $('#loading').css('display', 'none');
    pageChangeInit();

    // BGM開始
    initBgm(bgmList[bgmNum]);
  }

  function writeCookie(key, val) {
    $.cookie(key, val, {
      expires: 7,
      path: '/'
    });
  }

  var newUrl = '';
  var pageChangeTime = 1500;
  $.pjax({
    area: '#container',
    wait: pageChangeTime,
    link: '.pjaxLink',
    callbacks: {
      ajax: {
        beforeSend: function(event, arg, data, settings) {
          // 遷移先を取得し、bodyのidに設定
          var matchUrl = settings.url.match(/http:\/\/.*?\/(.*?)\//);
          newUrl = matchUrl !== null ? matchUrl[1] : 'top';

          // colorboxを閉じる
          if ($.colorbox) {
            $.colorbox.close();
          }

          // ロールオーバー処理解除
          offRolloverFunc();

          if ($body.attr('id') === 'special' || $body.attr('id') === 'top') {
            // BGMが0なら再開
            if ($('#bgm_0' + bgmNum).get(0).volume < 1 && $('#sound_area > p.volume > img:nth-child(1)').hasClass('jsCurrentVol')) {
              playBgm();
            }
            // トップページ以外のpopアップでBGMが切れないように
            removeYoutubeEvent();
          }

          // 中ページ用のBGを制御
          if (newUrl === 'top') {
            $topBgGlp.velocity('stop').velocity({
              opacity: 1,
            }, pageChangeTime);
            $bgInShared.velocity('stop').velocity({
              opacity: 0,
            }, pageChangeTime);
            $bgInWorld.velocity('stop').velocity({
              opacity: 0,
            }, pageChangeTime);
            $bgInStory.velocity('stop').velocity({
              opacity: 0,
            }, pageChangeTime);
          } else {
            setTimeout(function() {
              $topBgGlp.css('opacity', '0');
            }, pageChangeTime);

            // ページ内容を非表示に
            setTimeout(function() {
              $body.removeClass('jsAppear');
            }, pageChangeTime - 40);
            // 中ページごとの遷移処理
            if (newUrl === 'world') {
              $bgInShared.velocity('stop').velocity({
                opacity: 0,
              }, pageChangeTime);
              $bgInStory.velocity('stop').velocity({
                opacity: 0,
              }, pageChangeTime);
              $bgInWorld.velocity('stop').velocity({
                opacity: 1,
              }, pageChangeTime);
            } else if (newUrl === 'story') {
              $bgInShared.velocity('stop').velocity({
                opacity: 0,
              }, pageChangeTime);
              $bgInStory.velocity('stop').velocity({
                opacity: 1,
              }, pageChangeTime);
              $bgInWorld.velocity('stop').velocity({
                opacity: 0,
              }, pageChangeTime);
            } else {
              $bgInShared.velocity('stop').velocity({
                opacity: 1,
              }, pageChangeTime);
              $bgInStory.velocity('stop').velocity({
                opacity: 0,
              }, pageChangeTime);
              $bgInWorld.velocity('stop').velocity({
                opacity: 0,
              }, pageChangeTime);
            }
          }
          // ページ切り替え前にcontainerをフェードアウト
          $('#container').velocity('stop').velocity({
            opacity: 0,
          }, pageChangeTime);
          $onlyTopRegi.velocity('stop').velocity({
            opacity: 0,
          }, pageChangeTime);
          $onlyTopTwCm.velocity('stop').velocity({
            opacity: 0,
          }, pageChangeTime);
          $onlyTopComi.velocity('stop').velocity({
            opacity: 0,
          }, pageChangeTime);
        }
      },
      update: {
        complete: function(event, arg, data) {
          $body.attr('id', newUrl);

          //GAデータ送信
          ga('send', 'pageview', { 'page': location.pathname });

          // 遷移が完了したら初期化
          pageChangeInit();

          $('#container').velocity('stop').velocity({
            opacity: 1,
          }, pageChangeTime);
          $onlyTopRegi.velocity('stop').velocity({
            opacity: 1,
          }, pageChangeTime);
          $onlyTopTwCm.velocity('stop').velocity({
            opacity: 1,
          }, pageChangeTime);
          $onlyTopComi.velocity('stop').velocity({
            opacity: 1,
          }, pageChangeTime);
        }
      }
    },
    callback: function(event, arg, data, status) {},
  });

  // 読み込み時の初期化を振り分け
  function pageChangeInit() {
    // ナビカレント設定
    currentNavi();

    // ロールオーバー処理
    $.fn.rollover();

    if ($body.attr('id') === 'top') {
      // トップページでの処理
      // モーダル
      $(".modal").colorbox({ inline: true, width: 1280, innerWidth: 850, innerHeight: 480, transition: "fade", speed: "500", fadeOut: "400", scrolling: false, returnFocus: false, closeButton: false, className: "movie", rel: 'movie' });

      // twitterウィジェット用ファイル読み込み
      $.getScript(twitterWidgetFile);

      // twitterウィジェットにCSSを適用
      changeTwitterWidgetDesign();

      // twitterエリアポップアップ
      popTwitterArea();

      // youtubeポップアップ時にBGMを消す
      addYoutubeEvent();

      // ロールーバー処理
      rolloverFunc();

      if (isFirstLoad) {
        // トップページの初回処理
        isFirstLoad = false;
        initFirstTop();
      } else {
        $topBgGlp.css('transition', 'none');
        $naviGlp.css('transition', 'none');
        $onlyTopRegi.css('transition', 'none');
        $onlyTopTwCm.css('transition', 'none');
        $onlyTopComi.css('transition', 'none');
        setTimeout(function() {
          hoverParallax();
        }, 400);
      }
    } else {
      // トップページ以外での処理
      isFirstLoad = false;
      if ($body.attr('id') === 'preregistration') {
        $(".modal").colorbox({ inline: true, innerWidth: 980, innerHeight: 730, transition: "fade", speed: "500", fadeOut: "400", scrolling: false, returnFocus: false, closeButton: false, className: "inline" });
        $(".modal2").colorbox({ inline: true, innerWidth: 980, innerHeight: 680, scrolling: false, returnFocus: false, closeButton: false, className: "inline2" });
      }
      if ($body.attr('id') === 'story') {
        $(".modal").colorbox({ inline: true, width: 1280, innerWidth: 980, innerHeight: 680, transition: "fade", speed: "500", fadeOut: "400", scrolling: false, returnFocus: false, closeButton: false, className: "slideshow", rel: 'keyword' });
      }
      if ($body.attr('id') === 'character') {
        $(".modal").colorbox({ inline: true, width: 1280, innerWidth: 980, innerHeight: 680, transition: "fade", speed: "500", fadeOut: "400", scrolling: false, returnFocus: false, closeButton: false, className: "slideshow", rel: 'characetr' });
        rolloverFunc();
      }
      if ($body.attr('id') === 'special') {
        $(".modal").colorbox({ inline: true, width: 1280, innerWidth: 850, innerHeight: 480, transition: "fade", speed: "500", fadeOut: "400", scrolling: false, returnFocus: false, closeButton: false, className: "movie", rel: 'movie' });

        // youtubeポップアップ時にBGMを消す
        addYoutubeEvent();

        rolloverFunc();
      }
      if ($body.attr('id') === 'system') {
        systemPageFunc();
      }
      initShare();
    }
    // colorboxのコンプリートイベントを設定
    AddCompFuncColorbox();
  }

  // twitterウィジェットにCSSを適用
  function changeTwitterWidgetDesign() {
    var $twitter_widget = $('iframe.twitter-timeline');
    var $twitter_widget_contents = $twitter_widget.contents();

    if ($twitter_widget.length > 0 && $twitter_widget[0].contentWindow.document.body.innerHTML !== "") {
      $twitter_widget_contents.find('head').append('<link href="http://sinoalice.jp/css/style.css" rel="stylesheet" type="text/css">');
    } else {
      setTimeout(function() {
        changeTwitterWidgetDesign();
      }, 350);
    }
  }

  // twitterエリアポップアップ
  function popTwitterArea() {
    var $target = $('.twitter_area');
    var $trigger = $('.twitter_area .trigger');
    var $allow = $('.twitter_area p img');
    var animeTime = 400;
    var easing = '';

    $trigger.on('click', function() {
      if ($target.is(":animated")) {
        // アニメーション中なら何もせずに返す
        return;
      }
      // OPアニメ用のディレイを元に戻す
      $target.css('transition-duration', '0s');
      $target.css('transition-delay', '0s');
      $target.css('transition-timing-function', 'linear');

      if (!$target.hasClass('jsAppear')) {
        $target.addClass('jsAppear');
        $target.velocity('stop').velocity({
          translateY: '-418px',
        }, animeTime, easing);
        $allow.velocity('stop').velocity({
          rotateZ: '180deg'
        }, animeTime, easing);
      } else {
        $target.removeClass('jsAppear');
        $target.velocity('stop').velocity({
          translateY: '0',
        }, animeTime, easing);
        $allow.velocity('stop').velocity({
          rotateZ: '0deg'
        }, animeTime, easing);
      }
    });
  }

  // トップページの初回読み込み時初期化
  function initFirstTop() {

    // OPアニメーション開始タイミング
    $body.addClass('jsAppear');

    // OPアニメーションのSE
    setTimeout(function() {
      if (bgmVol == 1) {
        var $se = $('#se_01');
        $se.get(0).play();
      }
    }, 4250);

    // bgが終わったらホバーイベント設定
    setTimeout(function() {
      hoverParallax();
    }, 4600);

    // coming出現が終わったらtransition再設定
    setTimeout(function() {
      $('#navi').addClass('jsAppear');
      $topBgGlp.css('transition', 'none');
      $naviGlp.css('transition', 'none');
      $onlyTopRegi.css('transition', 'none');
      $onlyTopTwCm.css('transition', 'none');
      $onlyTopComi.css('transition', 'none');
    }, openingAnimeTime);
  }

  function gNavAccordion() {
    $('.navi_09').on("click", function(){
      var navi_09H = $(this).height();
      if(navi_09H == "32"){
        $(this).animate({height: '96'})
        .addClass('open');
      } else {
        $(this).animate({height: '32'})
        .removeClass('open');
      }
    });
    $("[class^='navi_']:not('.navi_09')").on("click", function(){
      $('.navi_09').animate({height: '32'})
      .removeClass('open');
    });
  }
  gNavAccordion();

  // 中ページの初期化
  function initShare() {
    // 中ページ用BGを表示
    var pageId = $('body').attr('id');
    if (pageId === 'world') {
      $bgInWorld.css('opacity', '1');
    } else if (pageId === 'story') {
      $bgInStory.css('opacity', '1');
    } else {
      $bgInShared.css('opacity', '1');
    }

    // 出現タイミング調整
    $('.jsEffectAppear').each(function(i) {
      $(this).css('transition-delay', i * 200 + 'ms');
    });
    setTimeout(function() {
      $('#navi').addClass('jsAppear');
      $body.addClass('jsAppear');
    }, 100);
  }

  // システムページのスライダー
  function systemPageFunc() {
    var $sliderContainer = $('#system_slider_container');
    var $sliderFlame = $('#system_slider_flame');
    var $slider = $('#system_slider_inner');
    var slideWidth = $slider.find('li').width();
    var slideHeight = $slider.find('li').height();
    var slideLength = $slider.find('li').length;
    var $sliderNavi = $('.system_slider_navi');

    var sliderPosition = {
      'system_slider_navi_battle': [1, slideWidth * 0],
      'system_slider_navi_cross_story': [2, slideWidth * 3],
      'system_slider_navi_weapon_story': [3, slideWidth * 2],
      'system_slider_navi_job_story': [4, slideWidth * 1]
    };

    var slideOrder = [
      '.system_slider_battle',
      '.system_slider_cross_story',
      '.system_slider_weapon_story',
      '.system_slider_job_story',
    ];

    // スライダーに幅を設定
    $slider.width(slideWidth * slideLength);
    var sliderWidth = $slider.width();

    // クローンを作る
    var $clone = $slider.clone(true);
    $clone.attr('id', $clone.attr('id') + '_clone');
    $clone.css({
      'position': 'absolute',
      'top': 0,
      'left': -sliderWidth,
    });

    // コンテナのcss設定
    $sliderFlame.css({
      'position': 'relative',
      'height': slideHeight
    });

    // cssの初期設定
    $slider.css({
      'position': 'absolute',
      'top': 0,
      'left': 0
    });

    // クローンを追加する
    $sliderFlame.append($clone);

    var sliderCurrent = 1; // 現在表示中のスライド
    var sliderFlamePos = 0; // 現在のスライダーの位置

    // prevボタンを設定
    $('#system_slider_prev').on('click', function(e) {
      e.preventDefault();

      // アニメーションしていない時のみ処理
      if (!$sliderFlame.hasClass('velocity-animating')) {

        // 表示中のスライドを保存
        var slideNow = sliderCurrent;

        // 表示中のスライドのカウント
        if (sliderCurrent > 1) {
          sliderCurrent--;
        } else {
          sliderCurrent = slideLength;
        }

        // スライダーの位置を更新
        sliderFlamePos += slideWidth;

        // カレントの設定
        $sliderNavi.removeClass('current');
        $sliderNavi.eq(sliderCurrent - 1).addClass('current');

        // アニメーションの設定
        $sliderFlame
          .velocity({
            'translateX': sliderFlamePos,
          }, {
            begin: function() {
              $(slideOrder[slideNow - 1])
                .velocity({ opacity: -1 }, 800);
            },
            duration: 800,
            easing: 'easeInOutSine',
            complete: function() {
              $(slideOrder[slideNow - 1]).css({ opacity: 1 });

              // スライダーが左端に来た場合位置を初期化
              if (sliderFlamePos >= sliderWidth) {
                $sliderFlame.velocity({ 'translateX': 0 }, { duration: 0 });
                sliderFlamePos = 0;
              }

            }
          });
      }
    });

    // nextボタンを設定
    $('#system_slider_next').on('click', function(e) {
      e.preventDefault();

      // アニメーションしていない時のみ処理
      if (!$sliderFlame.hasClass('velocity-animating')) {

        // 表示中のスライドを保存
        var slideNow = sliderCurrent;
        var sliderFlameNow = sliderFlamePos;

        // 表示中のスライドのカウント
        if (sliderCurrent < slideLength) {
          sliderCurrent++;
        } else {
          sliderCurrent = 1;
        }

        // スライダーの位置を更新
        if (sliderFlamePos === 0) {
          $sliderFlame.velocity({ 'translateX': sliderWidth }, { duration: 0 });
          sliderFlamePos = sliderWidth - slideWidth;
        } else {
          sliderFlamePos -= slideWidth;
        }

        // カレントの設定
        $sliderNavi.removeClass('current');
        $sliderNavi.eq(sliderCurrent - 1).addClass('current');

        // アニメーションの設定
        $sliderFlame
          .velocity({
            'translateX': sliderFlamePos,
          }, {
            begin: function() {
              $(slideOrder[slideNow - 1])
                .velocity({ opacity: -1 }, 800);
            },
            duration: 800,
            easing: 'easeInOutSine',
            complete: function() {
              $(slideOrder[slideNow - 1]).css({ opacity: 1 });
            }
          });
      }
    });

    // 準備完了したらカーソルを追加
    $('#system_slider_prev, #system_slider_next, .system_slider_navi').css('cursor', 'pointer');
    // カレントをバトルに設定
    $('#system_slider_navi_battle').addClass('current');

    // サブナビをクリックしたときの動作
    $sliderNavi.on('click', function(e) {
      e.preventDefault();

      var id = $(this).attr('id');

      // アニメーションしていない時のみ処理
      if (!$sliderFlame.hasClass('velocity-animating')) {

        // 現在位置と同じ場合は何もしない
        if (sliderCurrent == sliderPosition[id][0]) {
          return;
        }

        // カレントの設定
        $sliderNavi.removeClass('current');
        $('#' + id).addClass('current');

        var slideNow = sliderCurrent;

        // 表示中のスライドのカウント
        sliderCurrent = sliderPosition[id][0];

        // スライダーの位置を更新
        if (sliderFlamePos === 0) {
          $sliderFlame.velocity({ 'translateX': sliderWidth }, { duration: 0 });
        }

        // 移動先スライド位置が0の場合調整してから移動
        if (sliderPosition[id][1] === 0) {
          sliderFlamePos = sliderWidth;
        } else {
          sliderFlamePos = sliderPosition[id][1];
        }

        // 表示中と移動先以外のスライダーを透明に
        for (var i = 1; i <= slideLength; i++) {
          if (i !== slideNow && i !== sliderCurrent) {
            $(slideOrder[i - 1]).css('opacity', 0);
          }
        }

        // アニメーションの設定
        $sliderFlame
          .velocity({
            'translateX': sliderFlamePos,
          }, {
            begin: function() {
              $(slideOrder[slideNow - 1])
                .velocity({ opacity: -1 }, 800);
            },
            duration: 800,
            easing: 'easeInOutSine',
            complete: function() {
              $('.system_slider_item').css({ opacity: 1 });

              // スライド位置が0の場合調整した分を元に戻す
              if (sliderPosition[id][1] === 0) {
                $sliderFlame.velocity({ 'translateX': 0 }, { duration: 0 });
                sliderFlamePos = 0;
              }

            }
          });
      }

    });
  }

  // ロールオーバー処理
  function rolloverFunc() {
    $('.jsRollover').on('mouseenter', function() {
      var target = $(this).data('jsRolloverTrigger');
      $('#jsRollover_' + target)
        .velocity('stop').velocity({ 'opacity': '1' }, 400);
    });
    $('.jsRollover').on('mouseleave', function() {
      var target = $(this).data('jsRolloverTrigger');
      $('#jsRollover_' + target)
        .velocity('stop').velocity({ 'opacity': '0' }, 400);
    });
  }

  function offRolloverFunc() {
    $('.jsRollover').off('mouseenter mouseleave');
  }

  // マウスホバーパララックス
  function hoverParallax() {
    // easingの調整
    if (!paraBack) {
      paraBack = new Parallax($paraBack.get(0), {
        calibrateX: true,
        calibrateY: false,
        invertX: true,
        invertY: false,
        limitX: false,
        limitY: 0,
        scalarX: 5,
        scalarY: 0,
        frictionX: 0.01,
        frictionY: 0,
        originX: 0.5,
        originY: 0
      });
    }
    if (!paraFront) {
      paraFront = new Parallax($paraFront.get(0), {
        calibrateX: true,
        calibrateY: false,
        invertX: true,
        invertY: false,
        limitX: false,
        limitY: 0,
        scalarX: 5,
        scalarY: 0,
        frictionX: 0.01,
        frictionY: 0,
        originX: 0.5,
        originY: 0
      });
    }
    if (!paraCharaBack) {
      paraCharaBack = new Parallax($paraCharaBack.get(0), {
        calibrateX: true,
        calibrateY: false,
        invertX: true,
        invertY: false,
        limitX: false,
        limitY: 0,
        scalarX: 5,
        scalarY: 0,
        frictionX: 0.01,
        frictionY: 0,
        originX: 0.5,
        originY: 0
      });
    }
    if (!paraCharaFront) {
      paraCharaFront = new Parallax($paraCharaFront.get(0), {
        calibrateX: true,
        calibrateY: false,
        invertX: true,
        invertY: false,
        limitX: false,
        limitY: 0,
        scalarX: 5,
        scalarY: 0,
        frictionX: 0.01,
        frictionY: 0,
        originX: 0.5,
        originY: 0
      });
    }
  }

  // Naviのカレント処理
  function currentNavi() {
    var bodyId = $body.attr('id');
    for (var key in pageNaviNumber) {
      if (key == bodyId) {
        $('#navi .' + pageNaviNumber[key]).addClass('current');
      } else {
        $('#navi .' + pageNaviNumber[key]).removeClass('current');
      }
    }
  }
  currentNavi();

  // BGM開始と切り替え
  function initBgm() {
    changeBgmIcon();

    if (bgmVol == 1) {
      playBgm();
    }
  }

  function changeBgmIcon() {
    if (bgmVol == 1) {
      $('#sound_area .volume img:nth-child(1)').addClass('jsCurrentVol');
      $('#sound_area .volume img:nth-child(2)').removeClass('jsCurrentVol');
    } else {
      $('#sound_area .volume img:nth-child(2)').addClass('jsCurrentVol');
      $('#sound_area .volume img:nth-child(1)').removeClass('jsCurrentVol');
    }
    $('#sound_area .button img').each(function(i) {
      i++;
      if (i == bgmNum) {
        $(this).addClass('jsCurrentBgm');
      } else {
        $(this).removeClass('jsCurrentBgm');
      }
    });
  }

  function playBgm() {
    $('#bgm_0' + bgmNum).get(0).currentTime = bgmTime;
    $('#bgm_0' + bgmNum).get(0).play();
    $('#bgm_0' + bgmNum).stop().animate({ volume: '1' }, 800);
  }

  function pauseBgm() {
    bgmTime = Math.floor($('#bgm_0' + bgmNum).get(0).currentTime, 2);
    $('#bgm_0' + bgmNum).stop().animate({ volume: '0' },
      800
    );
  }

  // ボリュームボタン
  $('#sound_area .volume').on('click', function() {
    if (bgmVol == 1) {
      bgmVol = 0;
      writeCookie('sinoalice_bgm_volume', 0);
      pauseBgm();
    } else if (bgmVol == 0) {
      bgmVol = 1;
      writeCookie('sinoalice_bgm_volume', 1);
      playBgm();
    }
    changeBgmIcon();
  });
  // 曲切り替えボタン
  $('#sound_area .button').on('click', function() {
    bgmVol = 1;
    writeCookie('sinoalice_bgm_volume', 1);
    bgmNum++;
    if (bgmNum > Object.keys(bgmList).length) {
      bgmNum = 1;
    }
    changeBgmIcon();
    writeCookie('sinoalice_bgm_number', bgmNum);
    for (var key in bgmList) {
      $('#' + bgmList[key]).get(0).pause();
      $('#' + bgmList[key]).get(0).currentTime = 0;
    }
    playBgm();
  });
  // youtubeポップアップ時にBGMを消す
  function addYoutubeEvent() {
    $(document).on('cbox_open', function() {
      pauseBgm();
    });
    $(document).on('cbox_closed', function() {
      if (bgmVol == 1) {
        playBgm();
      }
    });
  }

  function removeYoutubeEvent() {
    $(document).off('cbox_open cbox_closed');
  }

  // voice再生
  var currentChara;
  var currentVoice = 1;

  function AddCompFuncColorbox() {
    if ($.colorbox) {
      // 現在開いているcolorboxを取得
      $.colorbox.settings.onComplete = function(e) {
        if ($body.attr('id') === 'character') {
          currentChara = 'chara' + $(e.el).attr('class').match(/click(\d{2})/)[1];

          // ボタンの初期化
          $('#' + currentChara + ' .jsPlayVoice').children('img:first').css('opacity', '1');
          $('#' + currentChara + ' .jsPlayVoice').children('img').not(':first').css('opacity', '0');

          // colorboxを閉じた際の処理
          $(document).on('cbox_closed', function() {
            stopVoice();

            // 自イベント削除
            $(this).off('cbox_closed');
            // next, prev遷移イベント削除
            $(document).off('cbox_complete.voiceBoxChange');

            // currentVoiceを戻す
            currentVoice = 1;
          });

          // next, prevで遷移した場合の処理
          $(document).on('cbox_complete.voiceBoxChange', function() {
            stopVoice();

            // 自イベント削除
            $(this).off('cbox_complete');
          });

          playVoice();
        }
        if ($body.attr('id') === 'preregistration') {
          if ($(e.el).attr('href') == '#pre_twitter') {
            history.replaceState(null, null, '/preregistration/#twitter');
          }
          if ($(e.el).attr('href') == '#pre_line') {
            history.replaceState(null, null, '/preregistration/#line');
          }
          if ($(e.el).attr('href') == '#pre_facebook') {
            history.replaceState(null, null, '/preregistration/#facebook');
          }
          // colorboxを閉じた際の処理
          $(document).on('cbox_closed', function() {
            history.replaceState(null, null, '/preregistration/');

            // 自イベント削除
            $(this).off('cbox_closed');
          });
        }
      };
    }
  }

  function stopVoice() {
    var $target = $('#' + currentChara + '_voice_0' + currentVoice);
    var target = $target.get(0);
    var $voice = $('#' + currentChara + ' .jsPlayVoice');

    // voiceを停止
    if (!target.paused) {
      target.pause();
      target.currentTime = 0;
    }

    // voiceを初期化
    currentVoice = 1;

    // BGMの音量を戻す
    if($('#sound_area > p.volume > img:nth-child(1)').hasClass('jsCurrentVol')) {
      $('#bgm_0' + bgmNum).animate({ volume: '1' }, 400);
    }

    // イベント削除
    $target.off('ended');
    $('#' + currentChara + ' .jsPlayVoice').off('click');
  }

  function playVoice() {
    // currentVoice = 1;
    var VOICE_MAX = 3;
    var $voice = $('#' + currentChara + ' .jsPlayVoice');
    var animeTime = 200;

    $voice.on('click', function(e) {
      e.preventDefault();
      var $target = $('#' + currentChara + '_voice_0' + currentVoice);
      var target = $target.get(0);
      if (target.paused) {
        // 再生中でなければ再生
        target.play();
        // BGMの音量を下げる
        $('#bgm_0' + bgmNum).animate({ volume: '0' }, 400);
      } else {
        // 再生中なら停止
        target.pause();
        target.currentTime = 0;
        $target.off('ended');

        // currentVoiceを更新
        proceedVoiceNum();
        $target = $('#' + currentChara + '_voice_0' + currentVoice);
        target = $target.get(0);

        // 再生
        target.play();
      }
      // 終了処理
      $target.on('ended', function() {
        // currentVoiceを更新
        proceedVoiceNum();

        // BGMの音量を戻す
        $('#bgm_0' + bgmNum).animate({ volume: '1' }, 400);

        $(this).off('ended');
      });
    });

    function proceedVoiceNum() {
      // 現在のボタンを消去
      $voice.children('img').eq(currentVoice - 1).stop().animate({
        opacity: '0',
      }, animeTime);

      // 最後でない場合進める
      if (currentVoice < VOICE_MAX) {
        currentVoice++;
      } else {
        currentVoice = 1;
      }

      // 次のボタン出現
      $voice.children('img').eq(currentVoice - 1).stop().animate({
        opacity: '1',
      }, animeTime);
    }
  }

  function preLoad() {
    // ローディングの前にだけ表示
    $('#loading').css('display', 'block');

    // 読み込む外部ファイル情報
    var manifest = [];
    $('img').each(function() {
      if ($(this).attr('src').indexOf('square-enix.com') == -1) {
        manifest.push($(this).attr('src'));
      }
    });
    manifest.push($('#bgm_0' + bgmNum + ' source').attr('src'));

    // LoadQueueクラス
    var loadQueue = new createjs.LoadQueue();

    // 読み込みの進行状況が変化した
    loadQueue.addEventListener("progress", handleProgress);
    // 全てのファイルを読み込み終わったら
    loadQueue.addEventListener("complete", handleComplete);

    // 読み込み開始
    loadQueue.loadManifest(manifest);
    // loadQueue.loadManifest();

    function handleProgress(e) {
      // 読み込み率を0.0~1.0で取得
      var progress = e.progress;
      var parcent = Math.floor(progress * 100);

      // パーセントの数字
      $('#loading .gauge span').html(parcent);
    }

    // ローディング完了後の処理
    function handleComplete() {
      setTimeout(function() {
        $('#loading').fadeOut(1000);
        pageChangeInit();

        // BGM開始
        initBgm(bgmList[bgmNum]);
      }, 250);
    }
  }
});
