'use strict';

angular.module('multiVideo',[])
  .directive('multiVideo', function ($compile,$sce,$rootScope,$interval) {

    var templateRoundProgressBar = '<div class="progress-wrapper">'+
                                      '<div class="progress-overlay">'+
                                        '<div class="progress-play" ></div>'+
                                        '<div round-progress max="100"'+
                                          'current="progress" color="#45ccce"'+
                                          'bgcolor="#eaeaea" radius="70" stroke="5"'+
                                          'semi="false" rounded="false"'+
                                          'clockwise="true" responsive="true"'+
                                          'iterations="100" animation="easeInSine"'+
                                          'style="cursor: pointer;" ng-click="clickProgress()">'+
                                        '</div>'+
                                      ' </div>'+
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
        clickProgress: '&'
      },
      link: function(scope,element,attrs,ctrl,transclude){

        scope.$watch('src', watchScopeSrc(element,scope));

        $rootScope.$on("multiVideo:finishVideo", actionMultiVideoFinish(element,transclude,scope));

        var multiVideoFinish = function(){
          return $rootScope.$broadcast("multiVideo:finishVideo");
        };

        $rootScope.$on("clappr:finishVideo", multiVideoFinish);
        $rootScope.$on("anguvideo:finishVideo", multiVideoFinish);

        scope.$on("$destroy",clearIntervalProgressBar(scope));

      }

    };

    var interval;

    function clearIntervalProgressBar(scope){
      return function(){
        $interval.cancel(interval);
        interval = undefined;
        scope.progress = 0;
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
        }
      }
    }
    function actionMultiVideoFinish(element,transclude,scope) {
      return function(){
        var countDownElement = element.html(templateRoundProgressBar);
        angular.element(".progress-overlay").after(transclude());
        countDownElement.show();
        $compile(element.contents())(scope);
        scope.progress = 0;
        $(".progress-wrapper").show();
        interval = $interval(incrementCurrentProgress(scope), 50);
      }
    }

  });
