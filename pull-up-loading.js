var win = window;
var doc = document;

function getScrollTop() { //返回现有位置里顶部的高度
	return doc.documentElement.scrollTop || doc.body.scrollTop;
}

function getWindowHeight() { //返回当前窗口的高度
	return win.innerHeight || doc.documentElement.clientHeight;
};

function getDocumentHeight() { //返回网页高度
	return doc.body.scrollHeight;
};

function isScrollEnd() { //判断是否到底了
	return (getScrollTop() + getWindowHeight()) == getDocumentHeight();
}
var modInit = function(namespace) {
	var pageInfo = [{
		begin: 1
	}];
	var cid = 0;
	$(namespace).on('click', '.information-link li', function() {
		var index = $(this).data('index') * 1,
			dataType = $(this).attr('id');
		cid = index;
		$(namespace).find('.information-link li').removeClass('ck');
		$(this).addClass('ck');
		$(namespace).find('.information-list').hide();
		$(namespace).find('.article_list_' + index).show();
		setTimeout(function() {
			onScroll();
		}, 100);
	});
	var domList = $(namespace).find(".information-link li");
	var onScroll = function() {
		var idx = cid || 0;
		pageInfo[idx] = pageInfo[idx] || {};
		var info = pageInfo[idx];
		var count = 1;
		var begin = info.begin || 1;
		var listDom = $(namespace).find('.article_list_' + idx);
		var url, link, pageNum;
		if (idx == 0) {
			url = '/wx/open/home/hotspotListPage.html?time=';
			link = '/wx/open/news/hotspotDetail.html?id=';
		} else {
			url = '/wx/open/home/priceInformationPage.html?time=';
			link = '/wx/member/price/priceInformationDetail.html?id=';
		}
		if (isScrollEnd() && !info.isEnd && !info.isLoading) {
			listDom.find(".js_loading").remove();
			listDom.append('<a href="javascript:;" class="block blankBox js_loading"><li>上拉刷新</li></a>');
			info.isLoading = true;
			$.ajax({
				url: url + timestamp + '&page=' + begin,
				type: 'post',
				dataType: "json",
				timeout: "30000",
				success: function(data) {
					listDom.find(".js_loading").hide();
					if (data.result == false) {
						toast(data.msg);
					} else {
						var len = data.rows.length;
						var str = "";
						totalPage = data.totalPage;
						info.begin = begin + count;
						if (len == 0) {
							info.isEnd = true;
						} else {
							for (i = 0; i < len; i++) {
								var publishTime = transFormatDate(data.rows[i].publishTime);
								var title = hideIndexBorrowName3(data.rows[i].title);
								var id = data.rows[i].id;
								if (title.length < 15) {
									title = '<h3 class="mar-t-10">' + title + '</h3>';
								} else {
									title = '<h3>' + title + '</h3>';
								}
								str += '<a href="' + link + id + '" class="block"><li><span>' + publishTime + '</span>' + title + '</li></a>';
								//strBlank = '<a href="javascript:;" class="block blankBox"><li>上拉刷新</li></a>';
							}
							//$('.information-list .blankBox').remove();
							listDom.append(str);
							$('.information-list a li').css('border-bottom', '1px solid #ddd');
							$('.information-list a li').last().css('border', 'none');
							info.isLoading = false;
							onScroll();
						}
					}
				},
				complete: function() {
					info.isLoading = false;
					listDom.find(".js_loading").remove();
				}
			})
		}
	};
	if (domList.length > 0) {
		$(window).on('scroll', onScroll);
		setTimeout(function() {
			onScroll();
		}, 1000);
	}
};
modInit('.information')