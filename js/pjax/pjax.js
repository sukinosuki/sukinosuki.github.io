

$(function () {
  var matchIndex = false
  if (location.pathname === '/') {
    matchIndex = true
  }
  function IsPC () {
    var userAgentInfo = navigator.userAgent
    var Agents = ["Android", "iPhone", "Windows Phone", "iPad", "iPod"]
    for (var v = 0; v < Agents.length; v++) {
      if (userAgentInfo.indexOf(Agents[v]) > 0) {
        return false
      }
    }

    return true
  }
  var isPc = IsPC()

  // $('.material-post_container').addClass('reset')            

  // 初始化标题
  function initFixedHeaderPostTitle () {
    var title = document.title.split('|')[0]
    $('.post-title').text(title)
  }
  initFixedHeaderPostTitle()
  // pjax---------------------------start
  // 是否是返回主页
  // pjax 等待
  var waitTime = 1000
  // 滚动一顶部方法
  function scrollToTop () {
    $("html, body").animate({ scrollTop: 0 + "px" }, { duration: 500, easing: "swing" })
  }
  function pjaxInit () {
    $.pjax({
      area: '#main',
      wait: waitTime,
      interval: 1000,
      link: ['.pjax-link', '.post_category-link', '.sidebar_archives-link'],
      // cache: {
      // },
      // fix: {
      //   // scroll: false
      // },
      // // scroll: { delay: 1000 },
      // // scrollTop: 4000,
      // load: {
      //   // script: true
      // },
      callbacks: {
        ajax: {
          beforeSend: function (event, arg, data, settings) {
            matchIndex = settings.url == 'http://127.0.0.1:4000/?pjax=1'
            if (matchIndex) {
              $('.sidebar-toggle').removeClass('hide')
              $('.back-arrow').addClass('hide')
              
            } else {
              $('.sidebar-toggle').addClass('hide')
              $('.back-arrow').removeClass('hide')
            }
            pjaxSend()
          }
        },
        update: {
          complete: function (event, arg, data, settings) {
            pjaxComplete()
          }
        }
      },
      callback: function (event, arg, data, status) {
        setTimeout(() => {
          $('.post_entry-module').removeClass('out')
          $('#post-content').removeClass('out')
        }, 500);
      }
    })
  }
  function pjaxSend () {
    // 前往首页
    NProgress.start()
    // 滚动到顶部
    scrollToTop()

    $('#main').velocity(
      {
        opacity: 0,
      },
      {
        duration: 500
      }
    )
    $('.post-title').velocity(
      {
        opacity: 0,
      },
      {
        duration: 500
      }
    )
  }
  function pjaxComplete () {
    NProgress.done()
    var postTitle = document.title.split('|')[0]

    $('.post-title').text(postTitle)

    $('#main').velocity(
      {
        opacity: 1,
      },
      {
        duration: 1000
      }
    )

    $('.post-title').velocity(
      {
        opacity: 1
      },
      {
        duration: 500
      }
    )
  }
    pjaxInit()
  // pjax---------------------------end

  // scroll-------------------------start
  var scrollTopValue = 0
  function scrollHandler () {
    var _scrollTopValue = $(window).scrollTop();
    // 向下滚动的时候隐藏fixed-header
    // 向上滚动的时候显示fixed-header
    if (_scrollTopValue > scrollTopValue) {
      // console.log('向下滚动')
      $('.fixed-header').addClass('top-hide')
    } else {
      $('.fixed-header').removeClass('top-hide')
      // console.log('向上滚动')
    }
    // console.log('_scrollTopValue ', _scrollTopValue)
    // 滚动到顶部的时候设置fixed-header的颜色为透明
    if (_scrollTopValue <= 100) {
      $('.fixed-header').addClass('transpatent')
    } else {
      $('.fixed-header').removeClass('transpatent')
    }

    scrollTopValue = _scrollTopValue
  }
  $(window).on('scroll', scrollHandler)
  // scroll-------------------------end

  // 刷新时淡入
  // $('body').velocity(
  //   {
  //     opacity: 1
  //   },
  //   {
  //     duration: 500
  //   }
  // )

  // bgmconfig-----------------------------start
  var isBgmPlay = false
  var audioBgm = document.getElementById('audio-bgm')
  function bgmHandler () {
    if (isBgmPlay) {
      $('.menu-bgm').removeClass('on')
      audioBgm.pause()
    } else {
      var src = $('.menu-bgm').addClass('on')
      audioBgm.play()
    }

    isBgmPlay = !isBgmPlay
  }
  $('.menu-bgm').on('click', bgmHandler)
  // bgmconfig-----------------------------end

  // loading-------------------------------start


  // loading-------------------------------end
  // preload--------------------------------start
  var queue = new createjs.LoadQueue()
  queue.installPlugin(createjs.Sound)
  queue.on('complete', handleComplete, this)
  queue.on('progress', function (e) {
    // console.log('progress ', e.progress, typeof e.progress)
    $('.progress-num').text(e.progress * 100)
  })
  queue.loadFile({ id: 'bgm', src: '/img/bgm.mp3' })
  queue.loadManifest([
    // { id: 'issen', src: '/img/issen.png' },
    { id: 'img1', src: '/img/bg.png' },
    { id: 'img2', src: '/img/sidebar_header.png' },
    { id: 'mihono', src: '/img/mihono.png' },
    { id: 'post_qiuji01', src: '/img/post_qiuji01.png' },
    { id: 'logo', src: '/img/logo.png' },
    { id: 'goto_top', src: '/img/goto_top.png' },
    { id: 'goku_BG01', src: '/img/goku_BG01.png' },
    { id: 'goku_bg02', src: '/img/goku_bg02.png' },
    { id: 'mainvisual1', src: '/img/mainvisual1.png' }
  ])
  function handleComplete () {
    setTimeout(() => {
      $('.loading-tip').velocity(
        {
          opacity: 0
        },
        {
          duration: 500,
          delay: 500
        }
      )
      $('.issen').velocity(
        {
          width: '100%'
        },
        {
          duration: 200,
          easing: 'ease-in',
        }
      ).velocity(
        {
          opacity: 0
        },
        {
          duration: 500,
        }
      )
      $('.loading').velocity(
        {
          opacity: 0
        },
        {
          duration: 1000,
          delay: 1500,
          complete: function () {
            setTimeout(() => {
              $('.issen').hide()
              $('.loading').hide()
            }, 500);
          }
        }
      )
    }, 500);
  }
  // preload--------------------------------end
})