var ttm = angular.module("textTransmitter", []);

ttm.controller("bufferCtrl", function(){
	this.fetchContents = function() {
		
	}
});

ttm.controller("tabCtrl", function(){
	this.tl = {};
	this.tlOrder = [];
	this.tlCurrent = 0;
	
	this.add = function(tabName,){};
});

ttm.controller("contentsCtrl", function(){
	this.contents = [];
});