/*jslint browser: true, white: true*/
/*global angular, console, alert*/

(function () {
  'use strict';
  var app = angular.module('engine', ['ui.router', 'ui.bootstrap', 'chieffancypants.loadingBar', 'tableSort', 'ngSanitize']);
  app.filter('getKey',['$sce',function($sce){
     return function(content,match) {
            var str = content.toString();
            var search_list = match.split(" ");
            for( var i=0;i<search_list.length;i++) {
              str = str.replace(new RegExp("(" + search_list[i] + ")","ig"), '<span style="color:red">' + search_list[i] + '</span>');
            }
            
            return $sce.trustAsHtml(str);
      }
  }]) 
  app.controller("HomeController", function($scope, $rootScope, $http, $location, $anchorScroll) {

    var request = app.api + "version",
        itemPanel = angular.element(document.querySelector("#doc-panel")),
        npcPanel = angular.element(document.querySelector("#sof-panel")),
        questPanel = angular.element(document.querySelector("#quest-panel")),
        spellPanel = angular.element(document.querySelector("#spell-panel")),
        noItemsFound = angular.element(document.querySelector("#no-items-found")),
        noNPCsFound = angular.element(document.querySelector("#no-npcs-found")),
        noQuestsFound = angular.element(document.querySelector("#no-quests-found")),
        noSpellsFound = angular.element(document.querySelector("#no-spells-found")),
        nav1 = angular.element(document.querySelector("#doc-nav")),
        nav2 = angular.element(document.querySelector("#sof-nav")); 
        
    var requestLibName = app.api + "lib?language=";
    var requestFromSOF = "";
    var requestFromDoc = "";
    var requestFromRecommend = "";


    $scope.searchstr = $rootScope.history;
    $http.get( request )
      .success(function(data, status, header, config) {

      if (data.length > 0) {
        $scope.version = data[0];
      } else {
        console.log("Error while retrieving database version.");
      }
    })
      .error(function(data, status, header, config) {
      console.log("Error in VERSION $http.get request");
    });

    $scope.showHeader = true;
    $scope.showItems = true;
    $scope.showNPCs = true;
    $scope.showQuests = true;
    $scope.showSpells = true;
    $scope.isFuzzy = true;
    $scope.languages = ["java"];
    $scope.language = $scope.languages[0]; // default first language(java)
    $scope.libNames = ["choose lib"];

    $http.get( requestLibName+ $scope.languages[0])   // fetch lib name for the given language : default java
      .success(function(data, status, header, config) {
      console.log(data);
      
      $scope.libNames = data["lib"];
    })
      .error(function(data, status, header, config) {
      console.log("Error in ITEM $http.get");
    });

    $scope.gotoSection = function(section) {
      console.log(section);
      $location.hash(section);

      $anchorScroll();
      if(section=='doc-panel'){
        nav1.addClass("active");
        nav2.removeClass("active");
      } else if(section == 'sof-panel'){
        nav2.addClass("active");
        nav1.removeClass("active");
        
      } else{

      }

    };

    function highlight(str){
      var search_list = $scope.searchstr.split(" ");
      for( var i=0;i<search_list.length;i++) {
        str = str.replace(new RegExp("(" + search_list[i] + ")","ig"), '<strong style="color:red">' + search_list[i] + '</strong>');
      }
      // console.log(str);
      return str;
    }

    function html_encode(str)   
    {   
      var s = "";   
      if (str.length == 0) return ""; 
      s = str.replace(/</, "&#60");   
      s = s.replace(/>/, "&#62");   
      return s;   
    }   

    $scope.search = function(searchstr) {

      if ($scope.lib == null) {
        alert("Please select a lib name.");
        return;
      }
      if (typeof searchstr === 'undefined' || searchstr == "") {
        alert("Please insert a function name or class name");
        return;
      }
      $rootScope.match = searchstr;
      $rootScope.history = searchstr;
      $scope.showHeader = false;

      itemPanel.addClass("hidden");
      npcPanel.addClass("hidden");
      questPanel.addClass("hidden");
      spellPanel.addClass("hidden");

      noItemsFound.addClass("hidden");
      noNPCsFound.addClass("hidden");
      noQuestsFound.addClass("hidden");
      noSpellsFound.addClass("hidden");

      /* looking for api doc... */
      requestFromDoc = app.api + "qFromDoc?lib=" + $scope.lib +"&keyword=" + searchstr;

      $http.get( requestFromDoc )
        .success(function(data, status, header, config) {
        var temp = [];
        for(var i = 0;i<data["doc"].length;i++){
          var d = data["doc"][i];
          var t = {};
          t["title"] = d["title"];
          t["url"] = d["url"];
          var temp_code = html_encode(d["code"].toString());
          t["code"] = highlight(temp_code);
          t["html"] = "<strong>" + $scope.searchstr + "</strong>"
          temp.push(t);
        }
        $scope.items = temp;
        if ($scope.items.length > 0) { // we found items
          itemPanel.removeClass("hidden");
        } else {  // we didn't find any items
          noItemsFound.removeClass("hidden");
        }

      })
        .error(function(data, status, header, config) {
        console.log("Error in api doc $http.get");
      });

      /* looking for sof... */
      if($scope.isFuzzy){
        requestFromSOF = app.api + "q?lib=" + $scope.lib + "&keyword=" + searchstr;
      } else {
        requestFromSOF = app.api_py + "search?lib=" + $scope.lib + "&q=" + searchstr;
      }

      $http.get( requestFromSOF )
        .success(function(data, status, header, config) {
        var temp = [];
        for(var i = 0;i<data["sof"].length;i++){
          var d = data["sof"][i];
          var t = {};
          t["title"] = d["title"];
          t["url"] = d["url"];
          var temp_code = html_encode(d["code"].toString());
          t["code"] = highlight(temp_code);
          temp.push(t);
        }
        $scope.npcs = temp;
        if ($scope.npcs.length > 0) { // we found npcs
          npcPanel.removeClass("hidden");
        } else {  // we didn't find any npcs
          noNPCsFound.removeClass("hidden");
        }

      })
        .error(function(data, status, header, config) {
        console.log("Error in NPC $http.get");
      });

      /* looking for recommendation... */
      requestFromRecommend = app.api_py + "recommend?q=" + searchstr +"&lib=" + $scope.lib;

      $http.get( requestFromRecommend )
        .success(function(data, status, header, config) {
        console.log(data);
        $scope.quests = data["result"];
        if ($scope.quests.length > 0) { // we found quests
          questPanel.removeClass("hidden");
        } else {  // we didn't find any quests
          noQuestsFound.removeClass("hidden");
        }

      })
        .error(function(data, status, header, config) {
        console.log("Error in QUEST $http.get");
      });

      /* looking for Spells... */
      if (app.spellsApi) {
        request = app.spellsApi + "?search=" + searchstr;

        $http.get( request )
          .success(function(data, status, header, config) {

          $scope.spells = data;
          if ($scope.spells.length > 0) { // we found spells
            spellPanel.removeClass("hidden");
          } else {  // we didn't find any spells
            noSpellsFound.removeClass("hidden");
          }

        })
          .error(function(data, status, header, config) {
          console.log("Error in SPELL $http.get");
        });
      }

    };

  });

}());
