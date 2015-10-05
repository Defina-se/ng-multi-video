'use strict';

angular.module('multiVideo',[])
  .directive('multiVideo', function ($compile,$sce,$rootScope,$interval) {

    var templateWrapperProgressBar = '<div class="progress-wrapper">'+
                                              '<div class="progress-overlay">'+
                                              ' </div>'+
                                          '</div>';

    var templateProgressBar       =   '<div class="progress-play" ></div>'+
                                      '<div round-progress max="100"'+
                                        'current="progress" color="#45ccce"'+
                                        'bgcolor="#eaeaea" radius="70" stroke="5"'+
                                        'semi="false" rounded="false"'+
                                        'clockwise="true" responsive="true"'+
                                        'iterations="100" animation="easeInSine"'+
                                        'style="cursor: pointer;" ng-click="clickProgress()">'+
                                      '</div>';

    var templateAnguVideo = '<div anguvideo ng-model="src" width="100%" height="360"></div>';
    var templateClappr    = '<clappr src="src"/>';

    var switchDirectives = function(val){

      var  htmlDirective;

      if((val.substring(val.length - 4) === ".mp4")){
        htmlDirective = templateClappr;
      }else{
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
        automaticNextVideo: '=automaticNextVideo'
      },
      link: function(scope,element,attrs,ctrl,transclude){

        scope.interval = null;
        scope.$watch('src', watchScopeSrc(element,scope));
        scope.$on("multiVideo:finishVideo", actionMultiVideoFinish(element,transclude,scope));
        var multiVideoFinish = function(){
            return $rootScope.$broadcast("multiVideo:finishVideo");
        };

        scope.$on("clappr:finishVideo", multiVideoFinish);
        scope.$on("anguvideo:finishVideo", multiVideoFinish);
        scope.$on("$destroy",clearIntervalProgressBar(scope));

      }

    };

    function clearIntervalProgressBar(scope){
      return function(){
        $interval.cancel(scope.interval);
        scope.interval = undefined;
        scope.progress = 0;
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

    function actionMultiVideoFinish(element,transclude,scope) {
      return function(){

        element.html(templateWrapperProgressBar);

        if(scope.automaticNextVideo){
          angular.element(".progress-overlay").append(templateProgressBar);
          scope.progress = 0;
          scope.interval = $interval(incrementCurrentProgress(scope), 50);
        }
        angular.element(".progress-overlay").after(transclude());
        $compile(element.contents())(scope);
        $(".progress-wrapper").show();
      }
    }

  });
