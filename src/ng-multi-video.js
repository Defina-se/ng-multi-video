'use strict';

angular.module('multiVideo',[])
  .directive('multiVideo', function ($compile,$sce) {

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
      scope:{
        src: '=src'
      },
      link: function(scope,element,attrs){
        scope.$watch('src', function (newVal) {
            if (!newVal)
              return;

             element.html(switchDirectives(newVal)).show();
             $compile(element.contents())(scope);

        });
      }

    };
  });
