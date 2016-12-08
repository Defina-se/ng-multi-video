'use strict';

angular.module('multiVideo',[])
  .directive('multiVideo', function ($compile,$sce,$rootScope,$interval,$window) {

    var templateAnguVideo = '<div anguvideo ng-model="src"></div>';
    var templateClappr    = '<clappr src="src"></clappr>';
    var templateLightBox  = '<angular-master-lightbox images="src">' +
                            '</angular-master-lightbox>';

    var switchDirectives = function(val){
        var  htmlDirective;
        var extension = val.substring(val.length - 4);

        if( extension === ".mp4"){
          htmlDirective = templateClappr;
        }
        else if(extension === ".jpg" || extension === ".png" || extension === ".gif"){
          htmlDirective = templateLightBox;
        }
        else{
          htmlDirective = templateAnguVideo;
        }

        return htmlDirective;
    }

    return {
      restrict: 'E',
      transclude: true,
      scope:{
        src: '=src',
        clickProgress: '&',
        watchedMinPercentage: '&',
        allowEmmitWatchedMinPercentageEvent: '=',
        automaticNextVideo: '=automaticNextVideo'
      },
      link: function(scope,element,attrs,ctrl,transclude){

        scope.interval = null;
        scope.$watch('src', watchScopeSrc(element,scope));
        var multiVideoWatchedMinPercentage = function(){
          if(scope.allowEmmitWatchedMinPercentageEvent){
            scope.watchedMinPercentage();
          }
        };
        var multiVideoFinish = function(){};
        scope.$on("clappr:finishVideo", multiVideoFinish);
        scope.$on("anguvideo:finishVideo", multiVideoFinish);
        scope.$on("$destroy", clearIntervalProgressBar(scope));
        scope.$on("clappr:watchedMinPercentage", multiVideoWatchedMinPercentage);
        scope.$on("anguvideo:watchedMinPercentage", multiVideoWatchedMinPercentage)
      }
    };

    function clearIntervalProgressBar(scope){
      return function(){
        $interval.cancel(scope.interval);
        scope.interval = undefined;
        scope.progress = 0;


        var mediaElement = angular.element('video')[0];
        if(mediaElement){
          mediaElement.pause();
          mediaElement.src='';
        }

        return false;
      }
    }

    function watchScopeSrc(element,scope) {
        return function(newVal){
          if (!newVal)
            return;

           $(".progress-wrapper").hide();
           clearIntervalProgressBar(scope)();
           element.html(switchDirectives(newVal)).show();
           $compile(element.contents())(scope);
        }

    }

    function incrementCurrentProgress(scope){
      return function(){
        scope.progress += 0.5;
        if(scope.progress >= 100){
          $rootScope.$broadcast("multiVideo:finishProgressbar");
          clearIntervalProgressBar(scope)();
          return false;
        }
      }
    }

  });
