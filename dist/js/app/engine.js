/*jslint browser: true, white: true*/
/*global angular, console, alert*/

(function () {
  'use strict';
  var app = angular.module('engine', ['ui.router', 'ui.bootstrap', 'chieffancypants.loadingBar', 'tableSort', 'ngSanitize']);
  app.filter('getKey',['$sce',function($sce){
     return function(content,match) {
            var reg = new　RegExp(match,'g');
            content.replace(reg,'<em>'+match+'</em>');
            return $sce.trustAsHtml(content);
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

    $scope.search = function(searchstr) {

      if ($scope.lib == null) {
        alert("Please select a lib name.");
        return;
      }
      if (typeof searchstr === 'undefined') {
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

      /* looking for items... */
      requestFromDoc = app.api + "qFromDoc?lib=" + $scope.lib +"&keyword=" + searchstr;

      $http.get( requestFromDoc )
        .success(function(data, status, header, config) {
        var temp = [];
        for(var i = 0;i<data["doc"].length;i++){
          var d = data["doc"][i];
          var t = {};
          t["title"] = d["title"];
          t["url"] = d["url"];
          t["code"] = d["code"].toString().replace(new RegExp("(" + $scope.searchstr + ")","ig"), "<strong>" + $scope.searchstr + "</strong>");
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

      /* looking for NPCs... */
      requestFromSOF = app.api + "q?lib=" + $scope.lib + "&keyword=" + searchstr;

      $http.get( requestFromSOF )
        .success(function(data, status, header, config) {

        $scope.npcs = data["sof"];
        if ($scope.npcs.length > 0) { // we found npcs
          npcPanel.removeClass("hidden");
        } else {  // we didn't find any npcs
          noNPCsFound.removeClass("hidden");
        }

      })
        .error(function(data, status, header, config) {
        console.log("Error in NPC $http.get");
      });

      /* looking for Quests... */
      request = app.api + "quest/template/" + searchstr;

      $http.get( request )
        .success(function(data, status, header, config) {

        $scope.quests = data;
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
