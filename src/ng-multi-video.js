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
        var interval;

        scope.$watch('src', watchScopeSrc(element,scope,interval));

        $rootScope.$on("multiVideo:finishVideo", actionMultiVideoFinish(element,transclude,scope,interval));

        var multiVideoFinish = function(){
          return $rootScope.$broadcast("multiVideo:finishVideo");
        };

        $rootScope.$on("clappr:finishVideo", multiVideoFinish);
        $rootScope.$on("anguvideo:finishVideo", multiVideoFinish);

      }

    };

    function watchScopeSrc(element,scope,interval) {
        return function(newVal){
          if (!newVal)
            return;

           $(".progress-wrapper").hide();
           scope.progress = 0;

           $interval.cancel(interval);
           
           element.html(switchDirectives(newVal)).show();
           $compile(element.contents())(scope);
        }

    }

    function incrementCurrentProgress(scope,interval){
      return function(){
        scope.progress += 0.5;
        if(scope.progress >= 100){
          $interval.cancel(interval);
          $rootScope.$broadcast("multiVideo:finishProgressbar");
        }
      }
    }
    function actionMultiVideoFinish(element,transclude,scope,interval) {
      return function(){
        var countDownElement = element.html(templateRoundProgressBar);
        angular.element(".progress-overlay").after(transclude());
        countDownElement.show();
        $compile(element.contents())(scope);
        scope.progress = 0;
        $(".progress-wrapper").show();
        interval = $interval(incrementCurrentProgress(scope,interval), 50);
      }
    }

  });
