angular.module('CooperativeIndoorMap')
  .directive('sidebar', ['$compile', 'MapHandler', 'Users',
    function ($compile, MapHandler, Users) {
      return {
        restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
        templateUrl: 'partials/sidebar',
        replace: true,
        link: function postLink($scope, elements) {
          var map = window._map;
          var sidebar = L.control.sidebar('sidebar').addTo(map);

          /**
           * Store all users which are supposed to be watched. Is used by the mapMovement service to check if the map should change when other users move the map
           */
          $scope.watchUsers = {};
          $scope.watchUser = function (userId, event) {
            if ($scope.watchUsers[userId]) {
              delete $scope.watchUsers[userId];
              event.currentTarget.innerHTML = 'Watch';
            } else {
              $scope.watchUsers[userId] = true;
              event.currentTarget.innerHTML = 'Unwatch';
            }
          };

          /**
           * Paint a rectangle on the map to show the viewport of other users
           */
          $scope.userBounds = {};
          $scope.getUserBounds = function (userId) {
            var bounds = $scope.userBounds[userId];
            if (bounds) {
              MapHandler.paintUserBounds(bounds, Users.getUserById(userId).color || 'undefined');
            } else {
              window.alert('The user hasn\'t moved since you logged in');
            }
          };

          $scope.getAllUserBounds = function () {
            var users = {};
            for (var key in $scope.userBounds) {
              users[key] = {};
              users[key].bounds = $scope.userBounds[key];
              users[key].color = Users.getUserById(key).color;
            }
            MapHandler.paintAllUserBounds(users);
          };

          /**
           * Watch all users
           */
          $scope.isWatchingAll = false;
          $scope.watchAll = function () {
            $scope.isWatchingAll = !$scope.isWatchingAll;
          };

          /**
           * Pans to a selcted featured
           * @param {String} id feature id
           */
          $scope.panToFeature = function (id) {
            MapHandler.panToFeature(id);
            MapHandler.highlightFeatureId(id);
          };

          /**
           * Highlights the user Button if a chat message comes in and the user tab is not opened
           */

          function highlightOnChatMessage() {
            $scope.$on('chatmessage', function () {
              if ($scope.views.userView) {
                $("#message").attr({class:"orangeBackground"});
              }
            });

            $scope.$on('toolbox', function (e, event) {
                $("#message").attr({class:""});
            });
          }

          highlightOnChatMessage();

        }
      };
    }])