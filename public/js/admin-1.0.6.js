"use strict";

(function () {
	var sideMenu = _("side-menu"),
		sidebarClassName = "sidebar",
		sidebar = _("sidebar"),
		btnSidebar = _("btn-sidebar"),
		btnSidebarShow = null,
		sidebarFakeBg = _("sidebar-fake-bg"),
		pageWrapper = _("page-wrapper");

	if (sideMenu)
		$(sideMenu).metisMenu();

	if (btnSidebar) {
		btnSidebar.onclick = function () {
			if (btnSidebarShow)
				return;
			sidebar.className = sidebarClassName + " visible-xs-block";
			sidebarFakeBg.className = "sidebar-fake-bg hidden";
			sideMenu.className = "nav visible-xs-block";
			pageWrapper.className = "fullscreen nosidebar";
			btnSidebarShow = document.createElement("button");
			btnSidebarShow.className = "btn btn-outline btn-default btn-sidebar btn-sidebar-show hidden-xs";
			btnSidebarShow.setAttribute("title", "Exibir Menu");
			var i = document.createElement("i");
			i.className = "fa fa-bars fa-fw fa-nomargin";
			btnSidebarShow.appendChild(i);
			btnSidebarShow.onclick = function () {
				if (!btnSidebarShow)
					return;
				sidebar.parentNode.removeChild(btnSidebarShow);
				btnSidebarShow = null;
				sidebar.className = sidebarClassName;
				sidebarFakeBg.className = "sidebar-fake-bg";
				sideMenu.className = "nav";
				pageWrapper.className = "";
			};
			sidebar.parentNode.appendChild(btnSidebarShow);
		};
	}

	if (navigator.userAgent.indexOf("Chrome") <= 0 && navigator.userAgent.indexOf("Safari") > -1) {
		$(function () {
			var l = 0;
			sidebarClassName = "sidebar-safari sidebar";
			sidebar.className = sidebarClassName;
			$(window).bind("load scroll", function () {
				var n = (window.pageYOffset <= 10 ? 125 : 0);
				if (l !== n) {
					l = n;
					sidebarFakeBg.style.top = n + "px";
				}
			});
		});
	}

	var originalModal = $.fn.modal;
	$.fn.modal = function () {
		var i, d, p;
		for (i = this.length - 1; i >= 0; i--) {
			if (document.body !== (p = (d = this[i]).parentNode)) {
				if (p)
					p.removeChild(d);
				document.body.appendChild(d);
			}
		}
		originalModal.apply(this, arguments);
	};
})();
/*
$(function () {
	var sideMenu = $("#side-menu");

	if (!sideMenu || !sideMenu.length)
		return;

	sideMenu.metisMenu();

	// Loads the correct sidebar on window load,
	// collapses the sidebar on window resize.
	// Sets the min-height of #page-wrapper to window size
	$(window).bind("load resize", function () {
		var topOffset = 50;
		var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
		if (width < 768) {
			$("#navbar-collapse").addClass("collapse");
			topOffset = 100; // 2-row-menu
		} else {
			var div_navbar_collapse = $("#navbar-collapse");
			div_navbar_collapse.removeClass("collapse");
			if (div_navbar_collapse && div_navbar_collapse[0])
				div_navbar_collapse[0].style.height = "";
		}

		var height = ((window.innerHeight > 0) ? window.innerHeight : screen.height) - 1;
		height = height - topOffset;
		if (height < 1) height = 1;
		if (height > topOffset) {
			$("#page-wrapper").css("min-height", (height) + "px");
		}
	});
});
*/
