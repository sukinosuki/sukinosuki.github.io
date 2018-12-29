
//スマホ判定
var is_sp = false;
if ((navigator.userAgent.indexOf('iPhone') > 0 && navigator.userAgent.indexOf( 'iPad') == -1) || navigator.userAgent.indexOf('iPod') > 0 || navigator.userAgent.indexOf('Android') > 0) {
	is_sp = true;
}

var flg = {};
Barba.Pjax.Dom.wrapperId = 'container';
Barba.Pjax.Dom.containerClass = 'contents';

var instaData;
var pages ={
	home: Barba.BaseView.extend({
		namespace: 'home',
		onEnter: function() {
			article_hover();
			movie_item();
			$(".gnavi-list").attr("data-index",0);
		},
		onEnterCompleted: function(){
			//twitter widgets
			if(window.twttr){
				window.twttr.widgets.load();
			}
			if(!instaData){
				$.ajax({
					url:'https://api.instagram.com/v1/users/self/media/recent/?access_token=8380537238.34b333a.94efeeb26ac448eabc964513fc9e0cb8',
					dataType: 'json',
					success: function(arr){
						var list = "";
						for(var i =0; i<6; i++){
							list += '<li class="home-insta-item"><a href="'+arr['data'][i]['link']+'" target="_blank"><img src="'+arr['data'][i]['images']['thumbnail']['url']+'"></a></li>';
						}
						instaData = '<ul class="home-insta-list">'+list+'<ul>';
						$(".home-insta-elm").append(instaData);
					}
				})
			}else{
				$(".home-insta-elm").append(instaData);
			}
		},
		onLeave: function(){
			createjs.Ticker.removeEventListener('tick',listener);
		}
	}),
	news: Barba.BaseView.extend({
		namespace: 'news',
		onEnter: function() {
			article_hover();
			term_link();
		}
	}),
	products: Barba.BaseView.extend({
		namespace: 'products',
		onEnter: function() {
			article_hover();
			term_link();
		}
	}),
	staffcast: Barba.BaseView.extend({
		namespace: 'staffcast',
		onEnter: function() {
			//コメント
			$(".staffcast-comment").on({
				click: function(e){
					e.preventDefault();
					var i = Number($(this).data("index"));
					$(".staffcast-popup").attr("data-index",i).addClass("open");
				}
			});
			//CLOSE
			$(".staffcast-popup-close,.staffcast-popup-cover,.staffcast-popup-inclose").on({
				click:function(e){
					e.preventDefault();
					$(".staffcast-popup").attr("data-index","").removeClass("open");
				}
			})
		}
	}),
	movie: Barba.BaseView.extend({
		namespace: 'movie',
		onEnter: function() {
			$(".term-item").on({
				click:function(){
					$(".active").removeClass("active");
					$(this).addClass("active");
					$(".movie-list").attr("data-category",$(this).attr("data-category"));
				}
			});
			movie_item();
		},
		onLeave: function(){
			createjs.Ticker.removeEventListener('tick',listener);
		}
	}),
	special: Barba.BaseView.extend({
		namespace: 'special',
		onEnter: function() {
		},
		onLeave: function(){
			createjs.Ticker.removeEventListener('tick',listener);
		}
	}),
	character: Barba.BaseView.extend({
		namespace: 'character',
		onEnterCompleted: function(){
			character_setting();
		}
	}),
	story: Barba.BaseView.extend({
		namespace: 'story',
		onEnterCompleted: function () {
			var storySwiper = new Swiper('.swiper-container', {
				slidesPerView: 1.3,
				centeredSlides:true,
				loop: true,
				navigation: {
					nextEl: '.swiper-next',
					prevEl: '.swiper-prev',
				},
				on: {
					transitionEnd:function(){
						if (typeof storySwiper != "undefined"){
							$(".swiper-nav").attr("data-viewIndex", storySwiper.realIndex);
						}
					}
				},
			});
			//
			$(".swiper-nav-link").off("click").on({
				click:function(e){
					e.preventDefault();
					var i = $(".swiper-nav-link").index(this);
					storySwiper.slideToLoop(i);
				}
			});
		}
	}),
	single: Barba.BaseView.extend({
		namespace: 'single',
		onEnter: function() {
			$(".single-navi-list a").on({
				click:function(e){
					e.preventDefault();
					flg.minTransition = true;
				}
			});
		},
		onLeave: function(){
			createjs.Ticker.removeEventListener('tick',listener);
		}
	}),
	keyword: Barba.BaseView.extend({
		namespace: 'keyword',
		onEnterCompleted: function(){
			keyword_setting();
		}
	})
}
pages.home.init();
pages.news.init();
pages.products.init();
pages.staffcast.init();
pages.movie.init();
pages.special.init();
pages.character.init();
pages.story.init();
pages.single.init();
pages.keyword.init();

Barba.Prefetch.init();
Barba.Pjax.start();

/* アニメーションの関数を記述
--------------------------------------------------*/
var PageTransition = Barba.BaseTransition.extend({
	start: function () {
		Promise.all([this.newContainerLoading, this.moveOut()]).then(this.moveIn.bind(this));
	},
	moveOut: function () {
		if(flg.minTransition){
			return $(this.oldContainer).addClass("hide").promise();
		}else if(flg.singleTransition){
			//ページ遷移simple
			return $(this.oldContainer).addClass("hideScale").delay(300).promise();
		}else{
			//リムル遷移
			$("body").addClass("pagechanging");
			var i = Math.floor( Math.random() * (3 + 1 - 0) ) + 0;
			//var i = 3;
			var set = [
				{x:"-50%",y:"-200%",top:"50%",left:"50%", width:"50%", height:"auto"},
				{x:"-50%",y:"100%",top:"50%",left:"50%", width:"50%", height:"auto"},
				{x:"-200%",y:"-50%",top:"50%",left:"50%", width:"50%", height:"auto"},
				{x:"100%",y:"-50%",top:"50%",left:"50%", width:"50%", height:"auto"},
			];
			var stop_pos = [
				{x:"-50%", y:"-100%"},
				{x:"-50%", y:"0%"},
				{x:"-120%", y:"-30%"},
				{x:"40%", y:"-80%"}
			];
			$(".pagechanger").css({"visibility":"visible"});
			return $(".pagechanger-riml")
						.css(set[i])
						.transition(stop_pos[i],150,"snap")
						.transition({
							delay:0,
							x:"-50%",
							y:"-50%"
						}, 200, "cubic-bezier(.17,.67,.34,1.52)")
						.transition({
							delay:0,
							top:"50%",
							left: "50%",
							width:"100%",
							height:"100vh",
							"border-radius":0
						}, 200, "cubic-bezier(.17,.67,.34,1.52)")
						.promise();
		}
	},
	moveIn: function () {
		window.scrollTo(0, 0);
		if(flg.minTransition){
			flg.minTransition = false;
			$(this.newContainer).addClass("fadein");
			this.done();
		}else if(flg.singleTransition){
			//ページ遷移simple
			flg.singleTransition = false;
			$(this.newContainer).addClass("fadeinScroll");
			this.done();
		}else{
			//リムル遷移
			this.done();
			$("body").removeClass("pagechanging");
			if(flg.changenavi){
				$(".gnavi-list").attr("data-index",flg.changenavi);
				flg.changenavi = null;
			}
			$(".pagechanger-riml")
				.css({
					height:"auto",
					"border-radius": "50%"
				})
				.transition({
					y:"-50%",
					top:"50%",
					width:"0%",
				},300, "cubic-bezier(.17,.67,.34,1.52)")
		}
	}
});

/* アニメーションの関数を実行
--------------------------------------------------*/
Barba.Pjax.getTransition = function () {
	return PageTransition;
};
/* headタグ内の書き換え
--------------------------------------------------*/
Barba.Dispatcher.on('linkClicked', function (currentStatus, oldStatus, container, newPageRawHTML) {
	$("body").removeClass("header-open");
});

Barba.Dispatcher.on('newPageReady', function (currentStatus, oldStatus, container, newPageRawHTML) {
	var head = document.head;
	var newPageRawHead = newPageRawHTML.match(/<head[^>]*>([\s\S.]*)<\/head>/i)[0];
	var newPageHead = document.createElement('head');
	newPageHead.innerHTML = newPageRawHead;
	var removeHeadTags = ["meta[name='description']", "meta[property^='og']", "meta[name^='twitter']", "link[rel='canonical']"].join(',');
	var headTags = head.querySelectorAll(removeHeadTags)
	for (var i = 0; i < headTags.length; i++) {
		head.removeChild(headTags[i]);
	}
	var newHeadTags = newPageHead.querySelectorAll(removeHeadTags)
	for (var i = 0; i < newHeadTags.length; i++) {
		head.appendChild(newHeadTags[i]);
	}
	//pagetop
	pagetop();
});
Barba.Dispatcher.on('transitionCompleted', function (currentStatus, oldStatus, container, newPageRawHTML) {
	//背景Canvas
	if(!is_sp){
		block_canvas();
	}
});

/* SVGのpath差し替え
--------------------------------------------------*/
var article_svg = {
	beforePath: 'M0,92.9c0,0,49.1-41.3,170.2-40.9c118.1,0.4,169.7,40.9,169.7,40.9s0,65.7,0,102.5c0.2,0,0,24.4,0,24.4 s-19.6,0.3-20.4,0c-80.4,0-319.5,0-319.5,0V92.9z',
	afterPath: 'M0,92.9c0,0,49.1,79.7,170.2,80.1c118.1,0.4,169.7-80.1,169.7-80.1s0,65.7,0,102.5c0.2,0,0,24.4,0,24.4 s-19.6,0.3-20.4,0c-80.4,0-319.5,0-319.5,0V92.9z'
}
function article_hover(){
	$(".article-item").on({
		mouseenter:function(){
			if(!is_sp){
				$(this).find("path").attr("d",article_svg.afterPath);
			}
		},
		mouseleave:function(){
			if(!is_sp){
				$(this).find("path").attr("d",article_svg.beforePath);
			}
		}
	});
	$(".article-link").on({
		click:function(e){
			if(is_sp){
				var flg_act = $(this).hasClass("act");
				$(".act").find("path").attr("d",article_svg.beforePath);
				$(".article-link").removeClass("act");
				if(!flg_act){
					e.preventDefault();
					$(this).addClass("act");
					$(this).find("path").attr("d",article_svg.afterPath);
					return false;
				}
			}
			flg.singleTransition = true;
		}
	});
}

/* pagetop
--------------------------------------------------*/
function pagetop(){
	$(".pagetop").on({
		click:function(){
			$("html,body").animate({scrollTop:0},300);
		}
	})
}

/* canvas - main
--------------------------------------------------*/
var listener;
function block_canvas(){
	//console.log("block_canvas");
	var block = $("#block").get(0);
	if($("#block").length==0){
		return;
	}
	var stage = new createjs.Stage("block");
	stage.canvas.width = window.innerWidth - 280;
	stage.canvas.height = $(".contents").height();
	var bitmap = new createjs.Bitmap(block.dataset.src);
	var shape = {
		w:51,
		h:44.5
	}
	var w_max = block.width / shape.w + 2;
	var h_max = block.height / shape.h + 2;

	for(var i=0; i<15; i++){
		setTimeout(function(){
			createBlock(Math.floor( Math.random() * w_max ),Math.floor( Math.random() * h_max ));
		},i*150);
	}

	function createBlock(w,h){
		var diff = -1;
		if(h%2!=0){
			diff = shape.w/2;
		}
		var x = -shape.w+(w*shape.w)+diff+2;
		var y = -29.5+(h*shape.h);

		var m = bitmap.clone();
		m.x = x;
		m.y = y;
		m.alpha = 0;
		stage.addChild(m);

		var tweenObj = createjs.Tween.get(m);
		tweenObj.to({alpha: 1},2000)
			.wait(3000)
			.to({alpha: 0},2000)
			.call(function(e) {
				createBlock(Math.floor( Math.random() * w_max ),Math.floor( Math.random() * h_max ));
			})

		if(Math.random() > 0.90){
			var n = bitmap.clone();
			n.x = x + shape.w/2;
			n.y = y + shape.h/4;
			n.alpha = 0;
			stage.addChild(n);
			var tweenObj_ = createjs.Tween.get(n);
			tweenObj_.to({alpha: 1},2000).wait(2000).to({alpha: 0},2000)
		}
	}
	listener = createjs.Ticker.addEventListener('tick', function(){
		stage.update();
	});
}

/* canvas - main
--------------------------------------------------*/
function ch_main(){
	var block = document.getElementById("ch-bg");
	block.width = window.innerWidth;
	block.height = $(".contents").height();
}

function term_link(){
	$(".term-link").on({
		click:function(e){
			flg.minTransition = true;
		}
	})
}


/* Common
--------------------------------------------------*/
$(function(){
	//グロナビ
	$(".gnavi-link").on({
		click:function(){
			var i = $(".gnavi-link").index(this);
			//Twitterの時のみreturn
			if(i==$(".gnavi-link").length-1){
				return;
			}
			flg.changenavi = i;
		}
	});

	//pagetop
	pagetop();

	//背景
	block_canvas();

	//PV紹介用
	setting_pv();

	//SNS
	snsbutton();

	//header-menu
	$(".header-menu").on({
		click:function(){
			$("body").toggleClass("header-open");
		}
	});

})

//SNS
function snsbutton(){
	//SNS
	$(".twitter-link").on({
		click:function(e){
			e.preventDefault();
			window.open("http://twitter.com/share?url="+location.href);
		}
	});
	$(".facebook-link").on({
		click:function(e){
			e.preventDefault();
			window.open("https://www.facebook.com/sharer/sharer.php?u="+location.href);
		}
	});
}

/* show pv
--------------------------------------------------*/
function setting_pv(){
	$(".popup-cover,.popup-close").on({
		click:function(){
			$(".popup-embed-inner").empty();
			$("body").removeClass("show_pv");
		}
	});
}

function show_pv(id){
	$(".popup-embed-inner").empty().append('<iframe src="https://www.youtube.com/embed/'+id+'?rel=0&autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>');
	$("body").addClass("show_pv");
}

function movie_item(){
	$(".movie-item").on({
		click:function(e){
			e.preventDefault();
			var id = $(this).attr("data-id");
			show_pv(id);
		}
	})
}

/* character setting
--------------------------------------------------*/
function character_setting(){
	$(".ch-btn-before").on({
		click: function () {
			var i = $(".ch-btn-before").index($(this));
			$(".ch-transform").eq(i).attr("data-show", true);
			$(".ch-img-list").eq(i).attr("data-show", true);
		}
	});

	//after
	$(".ch-btn-after").on({
		click: function () {
			var i = $(".ch-btn-after").index($(this));
			$(".ch-transform").eq(i).attr("data-show", false);
			$(".ch-img-list").eq(i).attr("data-show", false);
		}
	});
	var nowNumber = 1;
	var status = {
		rotation: 0,
		is_animation : false
	};
	var elm = {
		circle: $(".ch-icon-list-circle"),
		svg: $(".ch-bg-svg"),
		view: $(".contents-inner"),
		chBlock: $(".ch-block"),
		iconList: $(".ch-icon-list"),
		icon:(function(){
			var data = [];
			var t = $(".ch-icon-ch");
			for (var i = 0; i < t.length; i++) {
				data.push(t.eq(i));
			}
			return data;
		}())
	}
	var moveSteps = {
		17: -5,
		19: -6,
		20: -5,
		21: -4,
		22: -3,
		23: -2,
		24: -1,
		1: 0,
		2: 1,
		3: 2,
		4: 3,
		5: 4,
		6: 5,
		7: 6
	}
	var ch = {
		data:(function(){
			var data = {};
			for (var i = 0; i < elm.chBlock.length; i++) {
				data[elm.chBlock.eq(i).attr("data-ch")] = getIndexList(i)
			}
			return data;
		}()),
		list: (function(){
			var data = [];
			for (var i = 0; i < elm.chBlock.length; i++) {
				data.push(elm.chBlock.eq(i).attr("data-ch"));
			}
			return data;
		}())
	};
	$(".prev").on({
		click: function (e) {
			e.preventDefault();
			if (!status.is_animation){
				nowNumber = ch.data[nowNumber].prev;
				move(-1);
			}
		}
	});
	$(".next").on({
		click: function (e) {
			e.preventDefault();
			if (!status.is_animation) {
				nowNumber = ch.data[nowNumber].next;
				move(1);
			}
		}
	});
	$(".ch-icon-ch").on({
		click:function(){
			nowNumber = Number($(this).attr("data-ch"));
			var m = moveSteps[Number($(this).attr("data-index"))];
			move(m);
		}
	});
	function set(i){
		var data = ch.data[i].index;
		elm.icon[12].attr("data-ch", data[0]);
		elm.icon[13].attr("data-ch", data[1]);
		elm.icon[14].attr("data-ch", data[2]);
		elm.icon[15].attr("data-ch", data[3]);
		elm.icon[16].attr("data-ch", data[4]);
		elm.icon[17].attr("data-ch", data[5]);
		elm.icon[18].attr("data-ch", data[6]);
		elm.icon[19].attr("data-ch", data[7]);
		elm.icon[20].attr("data-ch", data[8]);
		elm.icon[21].attr("data-ch", data[9]);
		elm.icon[22].attr("data-ch", data[10]);
		elm.icon[23].attr("data-ch", data[11]);
		elm.icon[0].attr("data-ch", data[12]);
		elm.icon[1].attr("data-ch", data[13]);
		elm.icon[2].attr("data-ch", data[14]);
		elm.icon[3].attr("data-ch", data[15]);
		elm.icon[4].attr("data-ch", data[16]);
		elm.icon[5].attr("data-ch", data[17]);
		elm.icon[6].attr("data-ch", data[18]);
		elm.icon[7].attr("data-ch", data[19]);
		elm.icon[8].attr("data-ch", data[20]);
		elm.icon[9].attr("data-ch", data[21]);
		elm.icon[10].attr("data-ch", data[22]);
		elm.icon[11].attr("data-ch", data[23]);
		//アニメーション許可
		status.is_animation = false;
	}
	//INDEXリスト作成
	function getIndexList(i){
		var data = [];
		var next = -1;
		var prev = -1;
		for (var f=-12; f<12; f++) {
			var n = i + f;
			if(n<0){
				n = elm.chBlock.length + n;
			}
			if (n >= elm.chBlock.length){
				n = n - elm.chBlock.length;
			}
			n = Number(elm.chBlock.eq(n).attr("data-ch"));
			if(f == -1){
				prev = n;
			}
			if(f == 1){
				next = n;
			}
			data.push(
				n
			);
		}
		return {
			index: data,
			next: next,
			prev: prev
		};
	}
	function setView(){
		//表示切り替え
		elm.view.attr("data-selected", nowNumber);
		elm.svg.attr("data-ch", nowNumber);
		//ハッシュ変更
		location.hash = "ch"+nowNumber;
	}
	//移動アニメーション
	function move(i){
		status.is_animation = true;
		//表示切り替え
		setView();
		//アニメーション
		elm.iconList.transition({ rotate: i * 15 + 'deg' }, 300, reset);
		status.rotation += i * 15;
		elm.circle.transition({ rotate: status.rotation + 'deg' }, 300)
	}
	//リセット
	function reset(){
		elm.iconList.css({
			rotate:0
		},0);
		set(nowNumber);
	}
	//ハッシュなど初期表示
	if (location.hash) {
		var num = Number(location.hash.replace("#ch", ""));
		if(isNaN(num)){
			setView();
			set(nowNumber);
		}else{
			if(num == 0){
				num = 1;
			}
			nowNumber = num;
			setView();
			set(nowNumber);
		}
	}else{
		setView();
		set(nowNumber);
	}
}


/* keyword
--------------------------------------------------*/
function keyword_setting(){
	//ハッシュタグ処理
	if(location.hash){
		if ($(location.hash)){
			var data = $(location.hash).attr("data-type");
			$(".keyword-contents").attr("data-view",data);
			if(data == "map"){
				$(".term-item").removeClass("active");
				$(".term-item").eq(1).addClass("active");
			}
		}
	}
	//ターム処理
	$(".term-item").on({
		click: function () {
			$(".active").removeClass("active");
			$(this).addClass("active");
			var type = $(this).attr("data-view");
			$(".keyword-contents").attr("data-view", type);
			keyword_categoryset(type);
		}
	});
	//ページ内アンカー処理
	$('a[href^="#"]').on({
		click: function (e) {
			e.preventDefault();
			var t = $($(this).attr("href")).offset().top;
			//表示タブが違う場合の処理
			if (t == 0) {
				var type = ($(".term-item.active").attr("data-view") == "keyword") ? "map":"keyword";
				$(".term-item.active").removeClass("active");
				$('.term-item[data-view="'+type+'"]').addClass("active");
				$(".keyword-contents").attr("data-view", type);
				keyword_categoryset(type);
				t = $($(this).attr("href")).offset().top;
			}
			if (window.innerWidth < 950) {
				$("html, body").animate({ scrollTop: t - 80 }, 500);
			} else {
				$("html, body").animate({ scrollTop: t }, 500);
			}
		}
	});
}

function keyword_categoryset(type){
	for (var i = 0; i < $(".keyword-row-inner").length; i++) {
		var d = $(".keyword-row-inner").eq(i).find('.keyword-item[data-type="' + type + '"]');
		if (d.length == 0) {
			$(".keyword-row").eq(i).hide();
		} else {
			$(".keyword-row").eq(i).show();
		}
	}
}
