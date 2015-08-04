(function() {
'use strict';

angular.module('endiary', [
  'ionic', 
  'muser', 

  // shared module from web
  'yodacore']) 

.run(['$ionicPlatform', 'yodacore.CONSTS', function($ionicPlatform, CONSTS) {
  // CONSTS.ROOT_URL = 'http://localhost:3000';
  CONSTS.ROOT_URL = 'https://endiary.com';
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }


  });
}])

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider

  .state('main', {
    url: '/main',
    templateUrl: 'template/endiary/main.html',
    controller: 'endiary.mainCtrl',
    abstract: true
  })
  .state('main.taskDiary', {
    url: '/taskDiary',
    views: {
      'mainContent': { 
        templateUrl: 'template/endiary/taskDiaryView.html',
        controller: 'endiary.taskDiaryCtrl as vm'
      },
      'topList@main.taskDiary': {
        templateUrl: 'template/task/taskList.html',
      },
      'bottomList@main.taskDiary': {
        templateUrl: 'template/task/taskListWithTime.html',
      }
    }
  }).
  state('main.takeNote', {
    url: '/takeNote',
    views: {
      'mainContent': { 
        templateUrl: 'template/endiary/takeNoteView.html',
        controller: 'endiary.takeNoteCtrl as vm'
      }
    }

  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

});

})();


(function() {
'use strict';

angular.module('mtask', ['yodacore']);

})();


angular.module('muser', ['ionic', 'yodacore'])
.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider

  // login page
  .state('login', {
    url: '/login',
    templateUrl: 'template/user/login.html',
    controller: 'muser.loginCtrl',
    controllerAs: 'vm'
  });

});
;


angular.module('yodacore', ['ngResource']);

'use strict';

angular.module('yodacore').factory('yodacore.superCache', ['$cacheFactory', 'yodacore.CONSTS', function($cacheFactory, CONSTS) {
  var cache = $cacheFactory('super-cache');
  setInterval(function() {
    cache.removeAll();
  }, CONSTS.CACHE_FLUSH_INTERVAL * 1000);

  return cache;
}]);

'use strict' 

angular.module('yodacore').factory('yodacore.helper', [function() {
  return {
    getWindowHeight: function() {
      return window.innerHeight
        || document.documentElement.clientHeight
        || document.body.clientHeight;
    },
    // Returns a random integer between min (included) and max (excluded)
    // Using Math.round() will give you a non-uniform distribution!
    getRandomInt: function (min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    },
    /** 
     * @desc given order number of previous element and next element in the list, compute the order number of new element
     * This is a randomized algorithm with assumption that if the collision occurs, the list is too dense and need re-distributed
     * @todo More rigorous analysis on the behavior of re-distributing and collision rate 
     * @param {number} preElOrder order number of previous element, null if no previous element 0 < preElOrder < limit
     * @param {number} nextElOrder order number of next element, null if no next element 0 < nextElOrder < limit
     */
    getNewOrderNumber: function(preElOrder, nextElOrder) {
      var max = Math.pow(10, 9);
      var min = 1; 

      if(!preElOrder && !nextElOrder) {
        return this.getRandomInt(min, max);
      } else if(!preElOrder) {
        return this.getRandomInt(min, nextElOrder);
      } else if(!nextElOrder) {
        return this.getRandomInt(preElOrder, max);
      } else {
        return this.getRandomInt(preElOrder, nextElOrder);
      }
    },

    getMaxOrder: function() {
      return  Math.pow(10, 9);
    },

    getMinOrder: function() {
      return  1;
    },

    getObjectsByKeyValue: function(objects, key, value, compareFunction) {
      var result = [];
      for(var i = 0, len = objects.length; i < len; i++) {
        var obj = objects[i];
        if(key.indexOf('.') > -1) { 
          var keys = key.split('.');
          var val = obj;
          for(var j = 0, lenj = keys.length; j < lenj; j++) {
            val = val[keys[j]];
          }

          if(compareFunction) {
            if(compareFunction(val,value)) result.push(obj);
          } else {
            if(val === value) {
              result.push(obj);
            }
          }
        } else {
          if(compareFunction) {
            if(compareFunction(obj[key],value)) result.push(obj);
          } else {
            if(obj[key] === value) {
              result.push(obj);
            }
          }
        }
        
      }

      return result;
    },

    /**
     * @desc parse hashtag within string to get item name, quantity & unit
     * @param {String} str string of characters, may contain multiple hashtag
     *
     * @return {Array} an array of items contain: the string containing the hash tag, item name, item unit and item quantity
     */
    parseHashtag: function(str) {
      var result = [];
      var regex = /\#(\w+)(\s+)(\d+)(\s*)(\w*($|\s))/g;
      var myAr;
      while (( myAr = regex.exec(str)) !== null) {
        result.push({
          matchedString: myAr[0],
          itemName: myAr[1].trim(),
          quantity: parseInt(myAr[3], 10),
          unit: myAr[5].trim()
        });
      }
      return result;
    },

    removeMatchedTag: function(str) {
      var items = this.parseHashtag(str);
      for(var i = 0, len = items.length; i < len; i++) {
        var item = items[i];
        str = str.replace(item.matchedString, ''); 
      }
      return str;
    },

    parseTime: function(str, currentDate) {
      var startTime = null;
      var duration = null;
      var endTime = null;
      var replacedString = str;
      var currentDate = currentDate || new Date();


      // parse moment 
      var momentRegex = /(at)(\s)*((\d+)(:?(\d+)))(\s*)((am|pm|a\.m|p\.m)?)/;
      var momentData = str.match(momentRegex);
      if(momentData) {
        var momentStr = momentData[0];
        var momentHour = parseInt(momentData[4], 10);
        var momentMinute = parseInt(momentData[6], 10);
        var period = momentData[8]; //am pm
        var startTime = new Date(currentDate);
        var afternoonPeriod = ['pm', 'p.m'];
        console.log('moment HOur', momentHour, momentData);

        momentHour = momentHour + ((period && afternoonPeriod.indexOf(period) > -1 && momentHour !== 12) ? 12 : 0);
        startTime.setHours(momentHour);
        startTime.setMinutes(momentMinute);
        console.log('startTime', startTime, momentHour, momentMinute);
        replacedString = replacedString.replace(momentStr, '');
      }


      //parse duration 

      var durationRegex = /(for|in)(\s)+((\d+)(\s)*(hours|hour|h))?(\s*)((\d+)(\s*)(minutes|minute|m))?/; 
      var durationData = str.match(durationRegex); 
      if(durationData) {
        console.log('durationdata', durationData);
        var durationStr = durationData[0];
        var durationHour = parseInt(durationData[4], 10);
        var durationMinute = parseInt(durationData[9]);

        duration = (durationHour || 0 ) * 60 + (durationMinute || 0);
        if(durationHour || durationMinute)
          replacedString = replacedString.replace(durationStr, '');
      }

      return {
        startTime: startTime,
        duration: duration, 
        endTime: endTime,
        replacedString: replacedString
      }
      
    }

  };

}]);

'use strict' 

angular.module('yodacore').service('yodacore.merge', [function() {
  var merge = function(spec) {
    var that = {};
    var data = [];
    var keys = {}; // contains keys of each data record
    var groups = {}; // contains each custom group
    var filters = {}; // each group will have a filter, this is used to store the filters
    var groupsIndexes = {}; // groupid -> {itemId -> itemIndex}

    var addNewRecordToData = function(newRecord, key) {
      data.push(newRecord);
      keys[key] = newRecord;

      for(var key in filters) {
        var filter = filters[key];
        if(that.checkIfRecordSatisfyFilter(newRecord, filter)) {
          groups[key].push(newRecord);
        }
      }
    }

    var generateKeyFromObject = function(obj) {
      var str = '';
      // for(var key in obj) {
      //   if(obj.hasOwnProperty(key)) { // don't want its prototype
      //     str = str + key + '-' + obj[key] + '|';
      //   }
      // }
      return JSON.stringify(obj);
    }

    var getRecordsByFilter = function(filter) {
      var result = [];
      for(var i = 0, len = data.length; i < len; i++) {
        var record = data[i];
        if(that.checkIfRecordSatisfyFilter(record, filter) === true) result.push(record);
      }
      return result;
    }

    that.checkIfRecordSatisfyFilter = function(record, filter) {
      var isValid = true;
      for(var key in filter) {
        if(filter.hasOwnProperty(key)) { // don't want its prototype
          if(angular.isUndefined(record[key]) || record[key] !== filter[key]) {
            isValid = false;
            break;
          }
        }
      }

      return isValid;
    }

    /**
     * @desc for each element in data, we check if they have the same id with new added elements 
     * if yes then we merge two object 
     * if not we add new object into structure
     * if an object in data has no ID, that object is just added recently by an add function, we compare the title and merge 
     * @param {Array or Object} data 
     * @return true if nothing wrong happens
     * @todo instead of compare title, we should generate an internal ID to check for new and old data without server's ID 
     */
    var add = function(val) {
      val = angular.isArray(val) ? val : [val];

      for(var i = 0, len = val.length; i < len; i++) {
        var object = val[i]; 
        if(object.hasOwnProperty('_id') || object.hasOwnProperty('title')) {
          var key = object._id ? object._id : object.title;
          var old = keys[object._id] ? keys[object._id] : keys[object.title];

          if(old) {
            if(!old.hasOwnProperty('_id')) { 
              // the old data is a temporary insertion using title as key instead of id, we should remove it from keys
              delete keys[object.title];
              // remove(old, true);

              // Add the _id of new updated object to replace the one just deleted
              keys[key] = old;
            }
            updateRecord(old, object);

          } else { 
            // this record is never inserted before so time to create a new one
            var newRecord = angular.extend({},object);
            addNewRecordToData(newRecord, key);
          }
        }
      }
    }

    var updateRecord = function(oldRecord, newRecord) {
      var record = angular.extend(oldRecord, newRecord);
      for(var key in filters) {
        var filter = filters[key];
        var groupData = groups[key];
        if(that.checkIfRecordSatisfyFilter(record, filter)) {
          groupData.indexOf(record) === -1 && groups[key].push(record);
        } else {
          removeRecordFromGroup(record, groupData);
        }
      }
    }

    var remove = function(val, isTitle) {
      var record = keys[isTitle ? val.title : val._id];
      var index = data.indexOf(record);
      if(index > -1) {
        data.splice(index, 1);
        delete keys[isTitle ? val.title : val._id];
        for(var groupId in groups) {
          var groupData = groups[groupId];
          removeRecordFromGroup(record, groupData);
        }
      } else {
        console.error('Cannot find this element to remove', val);
        console.info('Current keys', keys);
      }
    }

    var removeRecordFromGroup = function(record, groupData) {
      var groupIndex = groupData.indexOf(record);
      if(groupIndex > -1) groupData.splice(groupIndex, 1);
    }

    groups['all'] = data;

    that.remove = remove; 
    that.getAll = function() {
      return data;
    }
    that.add = add;

    /**
     * @desc 
     * @param {String or object} object includes <key, value> pairs to search for matching records
     * @return {Array} array of matches record, reference to this array will hold during the lifetime of this merge structure
     * @todo handle case of filter is string later
     */ 
    that.getGroup = function(filter) {
      var key = angular.isString(filter) ? filter : generateKeyFromObject(filter);

      if(!groups.hasOwnProperty(key)) {
        groups[key] = getRecordsByFilter(filter);
        filters[key] = filter;
      } 

      return groups[key];
    }

    that.updateGroups = function() {
      for(var groupId in groups) {
        var groupData = groups[groupId];
        var filter = filters[groupId];
        groupData.length = 0;
      }

      for(var key in filters) {
        groups[key] = getRecordsByFilter(filter);
      }
    }

    
    return that;
  };

  return merge;
}]);


'use strict' 

angular.module('yodacore').factory('yodacore.time', [function() {
  return {
    areDifferentDates: function(date1, date2) {
      return date1.getFullYear() != date2.getFullYear() || date1.getDate() != date2.getDate() || date1.getMonth() != date2.getMonth() ? true : false;
    },

    areSameDates: function(date1, date2) {
      return !this.areDifferentDates(date1, date2);
    },
    convertTo24h: function (date) { // should always keep the precision
      return date.getHours() + date.getMinutes()/60 + date.getSeconds()/3600;
    },


    getTimeStampInDay: function(date) {
      return (date.getHours() * 60 * 60 + date.getMinutes() * 60 + date.getSeconds()) * 1000;
    },

    isWithinDateRange: function(target, start, end) {
      var beginOfStart = this.getTheBeginningOfDate(start);
      var endOfEnd = this.getTheEndOfDate(end);
      return target.getTime() >= beginOfStart.getTime() && target.getTime() <= endOfEnd.getTime();
    },
    /**
     * @desc convert distance between 2 dates into time unit
     * @param {Date} start 
     * @param {Date} end
     * @return {int} semantic depends on the unit
     */
    distance: function(start, end, unit) {
      var unit = unit || 'm'; 
      var exchange = {
        'm': 60 * 1000, 
        'h': 3600 * 1000, 
        's': 1 * 1000, 
        'ms': 1
      };
      return Math.floor((end.getTime() - start.getTime())/exchange[unit]);
    },
    generateDatesInWeekOfAnchorTime: function(anchor) {
      var daysInMonth = anchor.getDate(); 
      var weekday = anchor.getDay(); // weekday starts at 0, Sunday
      var datesInWeek = [];

      for(var i = 0; i <= 6; i++) {
        var newDate = new Date(anchor);
        var newDaysInMonth = daysInMonth - (weekday - i); 
        newDate.setDate(newDaysInMonth);
        datesInWeek.push(newDate);
      }

      return datesInWeek;
    },
    isPreviousDayOf: function(anchorDate, needCheckingDate) {
      var currentDate = new Date(anchorDate);
      currentDate.setHours(0);
      currentDate.setMinutes(0);
      currentDate.setSeconds(1);
      return needCheckingDate.getTime() < currentDate.getTime();
    },
    /** 
     * @param num {number} is number of minutes
     * @param format {str} 'short' 1h 30m, 'long' 1hours 30minutes 
     * Should be adapted with num is hour and second, ... later
     * return to format lat 1h 30m
     */
    convertToStr: function(num, format) {
      if(isNaN(num)) return '';
      var hour = Math.floor(num /60);
      var minute = Math.floor(num - hour * 60);
      var hourStr = hour + 'h';
      var minStr = minute + 'm';

      return hour > 0 ? (hourStr + ((minute > 0) ? ' ' + minStr : '') ) : minStr;
    },

    getHM: function(num) { // num in minutes
      var hour = Math.floor(num /60);
      var minute = Math.floor(num - hour * 60);

      return [hour, minute];

    },

    /**
     * @desc if string is under clear format like 1h or 30m, then parse like normal, i
     * @param str {String} is a string under format like 1h 30m
     *
     */
    convertFromStr: function() {
    },

    /**
     * @desc change target date into reference date, keep hour
     */
    changeDateKeepHour: function(targetDate, referenceDate) {
      var targetDate = new Date(targetDate);
      var referenceDate = new Date(referenceDate);

      targetDate.setFullYear(referenceDate.getFullYear());
      targetDate.setMonth(referenceDate.getMonth());
      targetDate.setDate(referenceDate.getDate());

      return targetDate;
    },

    getDaysInAWeek: function() {
      return {'Su': 0,'M': 1,'Tu': 2,'W': 3,'Th': 4,'F': 5,'Sa': 6};
    },

    getTheBeginningOfDate: function(date) {
      var date = new Date(date);
      date.setHours(0);
      date.setMinutes(0);
      date.setSeconds(1);
      date.setMilliseconds(0);
      return date;
    },

    getTheEndOfDate: function(date) {
      var date = new Date(date);
      date.setHours(23);
      date.setMinutes(59);
      date.setSeconds(59);
      date.setMilliseconds(0);
      return date;
    },

    /**
     * @desc given a date, we can age start and end timestamp of the week containing it
     * @param {Date} anchor 
     */
    getStartAndEndOfWeekFromDate: function(anchor) {
      var startDate = new Date(anchor);
      var endDate = new Date(anchor);

      startDate.setDate(anchor.getDate() - anchor.getDay());
      startDate = this.getTheBeginningOfDate(startDate);

      endDate.setDate(anchor.getDate() + (6 - anchor.getDay()));
      endDate = this.getTheEndOfDate(endDate);
      return [startDate, endDate];
    },

    getDurationsInDay: function(interval) { //interval in minute
      interval = interval || 30;
      var data = [{name: '15m', value: 15}, {name: '30m', value: 30}, {name: '45m', value: 45}];
      var max = 6; // in hour
      for(var i = 0; i <= (max * 60) / interval; i ++) { 
        var val = 60 + i * interval;
        data.push({
          name: this.convertToStr(val), 
          value: val
        });
      }

      return data;
    },

    getTimePointsInDay: function(interval) {
      interval = interval || 30;
      var cache = {};
      var date = new Date();
      var data = [];
      date.setHours(0);
      date.setMinutes(0);
      date.setSeconds(0);
      for(var i = 0, len = Math.round(24 * 60 / interval); i < len; i++) {
        var newDate = new Date(date);
        newDate.setMinutes(i * interval);
        data.push({value: newDate, name: this.getTimeString(newDate)});
      }

      return data;
    },

    getTimeString: function(date) {
      if(!date) return '';
      function to2DigitsFormat(num) {
        return ('0' + num).slice(-2);
      }

      // return to2DigitsFormat(date.getHours() % 13) + ':' + to2DigitsFormat(date.getMinutes()) + '' + (date.getHours() >= 12 ? 'pm' : 'am');
      return to2DigitsFormat(date.getHours() === 12 ? 12 : (date.getHours() % 12) ) + ':' + to2DigitsFormat(date.getMinutes()) + '' + (date.getHours() >= 12 ? 'pm' : 'am');
    },

  };

}]);



'use strict' 

angular.module('yodacore').factory('yodacore.goalDataService', ['$resource', '$rootScope', 'yodacore.merge', 'yodacore.taskDataService', '$q', 'yodacore.helper', function($resource, $rootScope, merge, TaskService, $q, helper) {
  var goals = merge(); // NEVER change the reference to goal since controller and view watch this object
  var GoalAPI = $resource('/goal/:goalId', {goalId: '@id'}, {
      createNewGoal: {method: 'POST'},
      getAllGoals: {method: 'GET', isArray: true},
      deleteGoal: {method: 'DELETE'},
      updateGoal: {method: 'PUT'}
    });


  return {
    getGoalsByPeriod: getGoalsByPeriod,
    getGoalById: getGoalById,
    removeGoal: removeGoal,
    updateGoal: updateGoal,
    createNewGoal: createNewGoal,
    getAllGoals: getAllGoals,
    fetchData: fetchData,
  };

  function fetchData() {
    var data = GoalAPI.getAllGoals(function() {
      console.log("Fetched Goal Data", data);
      goals.add(data);
    });
  }
  function getAllGoals() {
    return $q(function(resolve, reject) {
      resolve(goals.getGroup({is_inbox: false}));
    });
  }
  function createNewGoal(newGoal) {
    var that = this;
    goals.add(newGoal);
    return $q(function(resolve, reject) {
      GoalAPI.createNewGoal(newGoal, function(data) {
        console.log('Data from new created goal', data);
        resolve(data);
        goals.add(data);
      });
    });
  }
  function updateGoal(goalToBeUpdated) {
    GoalAPI.updateGoal({goalId: goalToBeUpdated._id}, goalToBeUpdated, function(data) {
    });
  }
  function removeGoal(goalToBeRemoved) {
    goals.remove(goalToBeRemoved);
    GoalAPI.deleteGoal({goalId: goalToBeRemoved._id}, function(data) {
      console.log('Data after removing goal', data);
    });
  }
  function getGoalById(id) {
    var result = goals.getGroup({_id: id});
    return result ? result[0] : null;
  }

  function getGoalsByPeriod() {
  }
}]);


'use strict' 

angular.module('yodacore').factory('yodacore.listDataService', ['$resource', '$rootScope', 'yodacore.merge', 'yodacore.taskDataService', '$q', 'yodacore.helper', 'yodacore.superCache', 'yodacore.CONSTS', function($resource, $rootScope, merge, TaskService, $q, helper, superCache, CONSTS) {
  var lists = merge(); // NEVER change the reference to list since controller and view watch this object
  var ListAPI = $resource('/list/:listId', {listId: '@id'}, {
      createNewList: {method: 'POST'},
      getAllLists: {method: 'GET',
        params: {timezone_offset_minute: (new Date()).getTimezoneOffset()}, 
        cache: superCache,
        isArray: true},
      deleteList: {method: 'DELETE'},
      updateList: {method: 'PUT'}
    });


  return {
    fetchData: fetchData,
    getAllLists: getAllLists,
    createNewList: createNewList,
    updateList: updateList,
    updateListColor: updateListColor,
    removeList: removeList,
    getAllListsWithTaskList: getAllListsWithTaskList,
    getOrderNumber: getOrderNumber,
    getOrderNumberGivenNextList: getOrderNumberGivenNextList,
    updateAListOrder: updateAListOrder,
    getInbox: getInbox,
    getListById: getListById
  };

  function fetchData() {
    var data = ListAPI.getAllLists(function() {
      console.log("Fetched List Data", data);
      lists.add(data);
    });
  }
  function getAllLists() {
    return $q(function(resolve, reject) {
      ListAPI.getAllLists(function(data) {
        // console.log('all list', lists.getGroup({is_inbox: false}));
        lists.add(data);
        resolve(lists.getGroup({is_inbox: false}));
      });
    });
  }

  function createNewList(newList) {
    var that = this;
    lists.add(newList);
    $rootScope.$broadcast(CONSTS.EVENT_SOME_LISTS_UPDATED_OR_ADDED, newList);
    return $q(function(resolve, reject) {
      ListAPI.createNewList(newList, function(data) {
        console.log('Data from new created list', data);
        resolve(data);
        lists.add(data);
      });
    });
  }

  function updateList(listToBeUpdated) {
    $rootScope.$broadcast(CONSTS.EVENT_SOME_LISTS_UPDATED_OR_ADDED, listToBeUpdated);
    ListAPI.updateList({listId: listToBeUpdated._id}, listToBeUpdated, function(data) {
    });
  }

  function updateListColor(listToBeUpdated) { 
    ListAPI.updateList({listId: listToBeUpdated._id}, listToBeUpdated, function(data) {
      var tasks = TaskService.getTaskByListIdNoSync(listToBeUpdated._id);
      for(var i = 0, len = tasks.length; i < len; i++) {
        tasks[i].color = listToBeUpdated.color;
      }
    });
  }

  function removeList(listToBeRemoved) {
    $rootScope.$broadcast(CONSTS.EVENT_SOME_LISTS_UPDATED_OR_ADDED, listToBeRemoved);
    lists.remove(listToBeRemoved);
    return ListAPI.deleteList({listId: listToBeRemoved._id}).$promise;
  }

  function getAllListsWithTaskList() {
    var allLists = lists.getAll();
    for(var i = 0, len = allLists.length; i < len; i++) {
      var list = allLists[i];
      list.taskList = TaskService.getTaskByListId(list._id);
    }

    return allLists;
  }
  /** 
   * @desc given the previous (the one above) and list list, we can infer the order number 
   */
  function getOrderNumber(prevList, lists) {
    if(!prevList) return helper.getNewOrderNumber();

    var index = lists.indexOf(prevList);

    // new list is at the end of list list 
    if(index + 1 === lists.length) return helper.getNewOrderNumber(prevList.order_number, null); 

    return helper.getNewOrderNumber(prevList.order_number, lists[index+1].list_order_number);
  }

  function getOrderNumberGivenNextList(nextList, lists) {
    if(!nextList) return helper.getNewOrderNumber();

    var index = lists.indexOf(nextList);

    // new list is at the end of list list 
    if(index === 0) return helper.getNewOrderNumber(null, nextList.order_number); 

    return helper.getNewOrderNumber(lists[index - 1].order_number, nextList.order_number);
  }

  /** 
   * @param {string} pos 'bottom' or 'top', 'top' means we drop a task above anchor, 'bottom' means below
   */
  function updateAListOrder(anchorList, updateList, pos, lists) {
    $rootScope.$broadcast(CONSTS.EVENT_SOME_LISTS_UPDATED_OR_ADDED, updateList);
    if(pos === 'bottom') {
      var newOrder = this.getOrderNumber(anchorList, lists);
    } else if (pos === 'top') {
      var newOrder = this.getOrderNumberGivenNextList(anchorList, lists);
    } else {
      return false;
    }

    updateList.order_number = newOrder;
    this.updateList(updateList);
  }

  function getInbox() {
    var result = lists.getGroup({is_inbox: true});
    return result ? result[0] : null;
  }

  function getListById(id) {
    var result = lists.getGroup({_id: id});
    return result ? result[0] : null;
  }
}]);

'use strict' 

angular.module('yodacore').service('yodacore.mergeRecord', ['yodacore.merge', 'yodacore.time', function(merge, time) {
  var mergeRecord = function(spec) {

    var that = merge(spec);
    that.checkIfRecordSatisfyFilter = function(record, filter) {
      var isValid = true;
      for(var key in filter) {
        if(filter.hasOwnProperty(key)) { // don't want its prototype
          if(key === 'date') { 
            if(!angular.isDate(filter[key])) {
              isValid = false;
              break;
            }

            var filterDate = filter[key];
            var recordDate = new Date(record.start_time);
            if(time.areDifferentDates(filterDate, recordDate)) {
              isValid = false;
              break;
            }
          } else {
            if(angular.isUndefined(record[key]) || record[key] !== filter[key]) {
              isValid = false;
              break;
            }
          }
        }
      }

      return isValid;
    }
    
    return that;
  };

  return mergeRecord;
}]);




(function() {
'use strict' 

angular.module('yodacore').factory('yodacore.recordDataService', RecordService)

RecordService.$inject = ['$resource', '$rootScope', 'yodacore.mergeRecord', 'yodacore.helper', 'yodacore.taskDataService', '$q', 'yodacore.CONSTS', 'yodacore.superCache', 'yodacore.sessionService', 'yodacore.time'];

function RecordService($resource, $rootScope, mergeRecord, helper, TaskService, $q, CONSTS, superCache, SessionService, time) {

  var records = mergeRecord(); 
  var generalParams = {
    timezone_offset_minute: (new Date()).getTimezoneOffset(),
    session_id: SessionService.getSessionId()
  };
  var RecordAPI = $resource(CONSTS.ROOT_URL + '/record/:recordId', {
      recordId: '@id', 
      session_id: SessionService.getSessionId() }, {

      createNewRecord: {method: 'POST'},
      getAllRecords: {
        method: 'GET', 
        params: {
          timezone_offset_minute: (new Date()).getTimezoneOffset(),
        }, 
        cache: superCache,
        isArray: true},
      deleteRecord: {method: 'DELETE'},
      updateRecord: {method: 'PUT'},
    });

  var aggregationListByDateAPI = $resource('/record/aggregatelbd')

  return {
    removeRecordByTaskId: removeRecordByTaskId,
    updateRecordTime: updateRecordTime,
    getSummaryOfListByDate: getSummaryOfListByDate,
    createNewRecordForItem: createNewRecordForItem,
    summaryRecordsByItems: summaryRecordsByItems,
    getItemByName: getItemByName,
    createNewRecordForDoneTask: createNewRecordForDoneTask,
    getRecordByDateNoSync: getRecordByDateNoSync,
    getRecordByDate:getRecordByDate,
    removeRecord: removeRecord,
    updateRecord: updateRecord,
    getAllRecords: getAllRecords,
    fetchData: fetchData,
    createNewRecord: createNewRecord,
    getRecordsByTaskIdNoSync: getRecordsByTaskIdNoSync,
    getRecordsByDateRange: getRecordsByDateRange,
    getRecordNonTaskByDateNoSync: getRecordNonTaskByDateNoSync,
  };

  function getRecordByDate(date) {
    return $q(function(resolve, reject) {
      getRecordsByDateRange(date, date).then(function(data) {
        records.add(data);
        resolve(records.getGroup({date: date}));
      });
    });
  }

  function getRecordByDateNoSync(date) {
    return records.getGroup({date: date});
  }
  
  function getRecordNonTaskByDateNoSync(date) {
    return records.getGroup({date: date, task_id: null});
  }


  function getRecordsByDateRange(start, end) {
    return $q(function(resolve, reject) {
      RecordAPI.getAllRecords({
        start_date: time.getTheBeginningOfDate(start).getTime(), 
        end_date: time.getTheEndOfDate(end.getTime()).getTime()
      }).$promise.then(function(data) {
        records.add(data);
        resolve(data);
      });
    });
  }

  function getRecordsByTaskIdNoSync(id) {
    return records.getGroup({task_id: id});
  }

  function createNewRecord (newRecord) {
    return $q(function(resolve, reject) {
      records.add(newRecord);
      RecordAPI.createNewRecord(newRecord, function(data) {
        console.log('Data from new created record', data);
        records.add(data);
        resolve(data);
      });
      $rootScope.$broadcast(CONSTS.EVENT_SOME_RECORDS_UPDATED_OR_ADDED, newRecord);
    });
  }

  function fetchData() {
    var data = RecordAPI.getAllRecords(function() {
      console.log("Fetched Record Data", data);
      records.add(data);
    });
  }
  /**
   * @return {array} an array of results
   */ 
  function getAllRecords() {
    return records.getAll();
  }
  function updateRecord(recordToBeUpdated) {
    records.add(recordToBeUpdated);
    RecordAPI.updateRecord({recordId: recordToBeUpdated._id}, recordToBeUpdated, function(data) {
    });
    $rootScope.$broadcast(CONSTS.EVENT_SOME_RECORDS_UPDATED_OR_ADDED, recordToBeUpdated);
  }
  function removeRecord(recordToBeRemoved) {
    records.remove(recordToBeRemoved);
    RecordAPI.deleteRecord({recordId: recordToBeRemoved._id}, function(data) {
      console.log('Data after removing record', data);
    });
    $rootScope.$broadcast(CONSTS.EVENT_SOME_RECORDS_UPDATED_OR_ADDED, recordToBeRemoved);
  }


  function createNewRecordForDoneTask(task) {
    var newRecord = {
      title: task.title,
      task_id: task._id,
      list_id: task.list_id, 
      duration: task.duration,
      items: []
    }

    if(task.assigned_date && task.start_time) {
      var newDate = new Date(task.assigned_date);
      var startTime = new Date(task.start_time);
      newDate.setHours(startTime.getHours());
      newDate.setMinutes(startTime.getMinutes());
      newDate.setSeconds(startTime.getSeconds());
      newRecord.start_time = newDate;
    }

    for(var i = 0, len = task.items.length; i < len; i++) {
      var item = task.items[i];
      newRecord.items.push({
        item_name: item.item_name,
        quantity: item.quantity,
        unit: item.unit
      });
    }

    this.createNewRecord(newRecord);
  }

  function getItemByName(name, record) {
    for(var i = 0, len = record.items.length; i < len; i++) {
      var item = record.items[i];
      if(item.item_name === name) return item;
    }

    return false;
  }

  function summaryRecordsByItems(records) {

    /**
     * some time we want to change the unit and quantity accoringly
     * @return {array} 0: new quantity, 1: new unit
     *
     */ 
    function getExchange(item) {
      var newUnit = item.unit;
      var newQuantity = item.quantity;
      if(item.unit === 'minute') {
        newUnit = 'hour';
        newQuantity = newQuantity/60;
      }

      return [newQuantity, newUnit];
    }

    var result = {
    };
    for(var i = 0, len = records.length; i < len; i++) {
      var record = records[i];
      for(var j = 0, lenItems = record.items.length; j < lenItems; j++) {
        var item = record.items[j];
        var exchange = getExchange(item);
        var quantity = exchange[0];
        var unit = exchange[1];

        if(!result.hasOwnProperty(item.item_name)) {
          var data = { };
          data[unit] = quantity;

          result[item.item_name] = {
            item_name: item.item_name, 
            records: [record], // do not worry about duplication since a record contains 1 item only once
            data: data
          };
        } else {
          var itemInResult = result[item.item_name];
          itemInResult.records.push(record);

          if(itemInResult.data.hasOwnProperty(unit)) { // accumulate the same unit
            itemInResult.data[unit] += quantity;
          } else {
            itemInResult.data[unit] = quantity;
          }
        }

      }
    }


    return result;
  }

  function createNewRecordForItem(item) {
  }


  function getSummaryOfListByDate(start, end) {
    var now = new Date();
    return aggregationListByDateAPI.query({start_date: start, end_date: end, timezone_offset_minute: now.getTimezoneOffset()});
  }

  function updateRecordTime(recordToBeUpdated) {
    records.add(recordToBeUpdated);
    RecordAPI.updateRecord({recordId: recordToBeUpdated._id}, recordToBeUpdated, function(data) {
    });
  }

  
  function removeRecordByTaskId(id) {
    var record = this.getRecordByTaskId(id);
    this.removeRecord(record);
  }
};

})();

(function() {
  'use strict';
  angular.module('yodacore').factory('yodacore.sessionService', Session); 
  Session.$inject = ['$window'];
  function Session($window) {
    var SESSION_KEY = 'sesion_id';
    var sessionId = getSessionIdFromStorage();

    return {
      getSessionId: getSessionId,
      setSessionId: setSessionId
    };


    function getSessionIdFromStorage() {
      return $window.localStorage[SESSION_KEY] || '' ;
    }

    function getSessionId() {
      if(!sessionId) return getSessionIdFromStorage(); 
      return sessionId; 
    }

    function setSessionId(id) {
      sessionId = id;
      $window.localStorage[SESSION_KEY] = sessionId;
    }
  };
})();


(function() {
'use strict';

angular.module('yodacore').factory('yodacore.userDataService', UserDataService);

UserDataService.$inject = ['$resource', 'yodacore.CONSTS', 'yodacore.sessionService', '$q'];
function UserDataService($resource, CONSTS, SessionService, $q){
  // MARK: Service variables
  var userProfileAPI =  $resource(CONSTS.ROOT_URL + '/user/profile', {}, {
    updateProfile: {method: 'PUT'}
  });

  var userSession = $resource(CONSTS.ROOT_URL + '/auth/users/session', {}, {
    login: {method: 'POST'}
  });

  var userData = null;


  // MARK: Share services
  return {
    login: login, 
    getProfile: getProfile,
    updateCurrentPage: updateCurrentPage
  };

  // MARK: Service functions 
  function login(email, password) {
    return $q(function(resolve, reject) {
      userSession.login({email: email, password: password}).$promise.then(function(result) {
        if(result.success == true) {
          SessionService.setSessionId(result.session_id);
        }

        resolve(result); 
      });
    });
  }

  function getProfile() {
    return $q(function(resolve, reject) {
      userProfileAPI.get(function(user) {
        userData = user;
        resolve(user);
      });
    })
  }

  function updateCurrentPage(page) {
    if(!userData) return ; 
    userData.current_page = page; 
    updateProfile();
  }

  // MARK: common functions
  function updateProfile() {
    return userProfileAPI.updateProfile(userData).$promise;
  }

};

})();



'use strict' 

angular.module('yodacore').service('yodacore.mergeTask', ['yodacore.merge', 'yodacore.time', function(merge, time) {
  function checkRecurringTaskShouldBeInDate (task, date) {
    var start = new Date(task.recurring_start_date);
    var end = new Date(task.recurring_end_date);
    if(!time.isWithinDateRange(date, start, end)) return false; 

    if(task.recurring_selected_days.indexOf(date.getDay()) === -1) return false; 

    for(var i = 0, len = task.recurring_done_dates.length; i < len; i++) {
      var doneDate = new Date(task.recurring_done_dates[i]);

      if(time.areSameDates(doneDate, date)) {
        return false;
      }
      
    }

    return true;
  }
  var mergeTask = function(spec) {

    var that = merge(spec);
    that.checkIfRecordSatisfyFilter = function(record, filter) {
      var isValid = true;
      for(var key in filter) {
        if(filter.hasOwnProperty(key)) { // don't want its prototype
          if(key === 'date') { 
            if(record.is_recurring) {
              if(angular.isDate(filter[key])) {
                var filterDate = filter[key];
                var idx = record.recurring_selected_days.indexOf(filterDate.getDay());
                if (!checkRecurringTaskShouldBeInDate(record, filterDate)) {
                  isValid = false;
                  break;
                }
              }
            }
            
            // not a recurring task
            else {
              if(!record.assigned_date) {
                isValid = false;
                break;
              }
              if(angular.isDate(filter[key])) {
                var filterDate = filter[key];
                var assignedDate = new Date(record.assigned_date);

                if(time.areDifferentDates(filterDate, assignedDate)) {
                  isValid = false;
                  break;
                }
                    
              } else {
                var query = filter[key];
                var assignedDate = new Date(record.assigned_date);
                if(query.hasOwnProperty('$le')) {
                  if(!time.isPreviousDayOf(query['$le'], assignedDate)) {
                    isValid = false;
                    break;
                  }
                }
                  
              }
            }
          } else {
            if(angular.isUndefined(record[key])) {
              isValid = false;
              break;
            }
            var query = filter[key];
            if(query && query.hasOwnProperty('$neq')) {
              if(record[key] === query['$neq']) {
                isValid = false;
                break;
              }

            } 

            else if(query && query.hasOwnProperty('$gte')) {
              if(record[key] < query['$gte']) {
                isValid = false;
                break;
              }

            }
            else {
              if(angular.isDate(query)) {  // we cannot compare Date objectl ike normal
                var recordDate =  new Date(record[key]);
                if(recordDate.getTime() !== query.getTime()) {
                  isValid = false;
                  break;
                }
              }
              
              else if(record[key] !== filter[key]) {
                isValid = false;
                break;
              }
            }
          }

        }
      }

      return isValid;
    }
    
    return that;
  };

  return mergeTask;
}]);



'use strict' 

angular.module('yodacore').factory('yodacore.sectionService', ['$resource', '$rootScope', 'yodacore.mergeTask', 'yodacore.helper', '$q', 'yodacore.time', 'yodacore.taskDataService', function($resource, $rootScope, mergeTask, helper, $q, time, TaskService) {

  return {
    generateNewEmptySection: generateNewEmptySection,
    getPreviousSectionOfSection: getPreviousSectionOfSection,
    updateOldTasksOfSection: updateOldTasksOfSection,
    getSectionById: getSectionById,
    removeSection: removeSection,
    updateNewSectionFromTask: updateNewSectionFromTask,
    createNewEmptySection: createNewEmptySection,
  };

  function createNewEmptySection(list, currentTask) {
    var result = this.generateNewEmptySection(list, currentTask);
    console.log('result', result);
    var newSection = result.newSection;
    var toUpdateTasks = result.tasks;

    // creat the section, get the id 
    TaskService.createNewTask(newSection).then(function(task) {
      // change section_parent_id of its tasks 
      console.log('batch update', task);
      for(var i = 0, len = toUpdateTasks.length; i < len; i++) {
        toUpdateTasks[i].parent_section_id = task._id;
      }
      TaskService.batchUpdate(toUpdateTasks);

    });
  }

  function updateNewSectionFromTask(nextTask, newSection) {
    var sectionOfNext = this.getSectionById(nextTask.parent_section_id);
    if(sectionOfNext) {
      var tasks = TaskService.getFollowngTaskOf(nextTask, sectionOfNext)
    } else {
      var tasks = TaskService.getFollowngTaskOf(nextTask)
    }

    for(var i = 0, len = tasks.length; i < len; i++) {
      var task = tasks[i];
      task.parent_section_id = newSection._id;
    }
    TaskService.batchUpdate(tasks);

  }

  function removeSection(section, taskList) {
    var index = taskList.indexOf(section);
    if(index <= 0) return ;

    var prevTask = taskList[index - 1];
    var parentSectionID = prevTask.is_section ? prevTask._id : (prevTask.parent_section_id === null ? null : prevTask.parent_section_id)

    if(parentSectionID === null) return; 

    // convert all tasks of this section into prev section 
    var tasks = TaskService.getTasksOfSection(section);
    for(var i = 0, len = tasks.length; i < len; i++) {
      tasks[i].parent_section_id = parentSectionID;
    }
    TaskService.batchUpdate(tasks);
  }

  function getSectionById(id) {
    return TaskService.getTaskById(id);
  }

  function updateOldTasksOfSection(section, nextTask) {
    var prevSection = this.getPreviousSectionOfSection(section);
    if(nextTask.parent_section_id == section._id && nextTask.list_order_number < section.list_order_number)  return; // not need to update 

    var tasks = TaskService.getTasksOfSection(section);
    for(var i = 0, len = tasks.length; i < len; i++) {
      tasks[i].parent_section_id = prevSection ? prevSection._id :null;
    }
    console.log('old task of section', tasks);
    TaskService.batchUpdate(tasks);
  }

  function getPreviousSectionOfSection(section) {
    var sections = TaskService.getSectionsByListId(section.list_id);
    var index = sections.indexOf(section);
    if(index === -1) return null;
    if(index === 0) return null;

    return sections[index - 1];
  }

  function generateNewEmptySection(list, currentTask) {
    var newSection = {
      list_id: list._id, 
      title: '', 
      is_section: true, 
      color: list.color
    };

    var taskList = [];
    var tasksInList = TaskService.getNotDoneTaskByListIdNotSync(list._id);

      console.log('current task', currentTask);
    if(!currentTask) {
      // no current, gonna insert at the first of list 
      taskList = TaskService.getNonSectionTaskInList(list._id);
      newSection.list_order_number = TaskService.getOrderNumber(null, tasksInList);
    }
    else if(currentTask && currentTask.parent_section_id) {
      // get preceding (containing current Task) and following sections 
      var currentSection = this.getSectionById(currentTask.parent_section_id);
      // get section order 
      newSection.list_order_number = TaskService.getOrderNumberGivenNextTask(currentTask, tasksInList, 'list');
      // figure out task should belong to this section 
      taskList = TaskService.getFollowngTaskOf(currentTask, currentSection);
    } 
    
    // has current but no section, get all following task
    else {
      taskList = TaskService.getFollowngTaskOf(currentTask);
      newSection.list_order_number = TaskService.getOrderNumberGivenNextTask(currentTask, tasksInList, 'list');
    }

    return {
      newSection: newSection,
      tasks: taskList // sub tasks of this section 
    };
  }
}]);


(function() {
'use strict' 

angular.module('yodacore').factory('yodacore.taskDataService', TaskDataService); 
                                   
TaskDataService.$inject = ['$resource', '$rootScope', 'yodacore.mergeTask', 'yodacore.helper', '$q', 'yodacore.time', 'yodacore.CONSTS', 'yodacore.superCache', 'yodacore.sessionService'];

function TaskDataService($resource, $rootScope, mergeTask, helper, $q, time, CONSTS, superCache, SessionService) {
  var tasks = mergeTask(); 
  var TaskAPI = $resource(CONSTS.ROOT_URL + '/task/:taskId', {taskId: '@id', session_id: SessionService.getSessionId()}, {
      createNewTask: {method: 'POST'},
      getAllTasks: {
        method: 'GET', 
        params: {
          timezone_offset_minute: (new Date()).getTimezoneOffset(),
        }, 
        cache: superCache,
        isArray: true},
      deleteTask: {method: 'DELETE'},
      updateTask: {method: 'PUT'},
    });


  var orderTypeAndDbField = {
    date: 'date_list_order_number',
    list: 'list_order_number',
  };

  return {
    // MARK: task by date
    getTaskByDate: getTaskByDate,
    getTaskByDateNoSubTask: getTaskByDateNoSubTask,
    getTaskByDateNoSubTaskNoSync: getTaskByDateNoSubTaskNoSync,
    getTasksByDateRange: getTasksByDateRange,
    getTaskNotScheduleNotDoneByDate: getTaskNotScheduleNotDoneByDate,
    getTaskInScheduleNotDoneByDate: getTaskInScheduleNotDoneByDate,
    getTasksInGoalByDateRange: getTasksInGoalByDateRange,
    getTasksInGoalByListIdAndDateRange: getTasksInGoalByListIdAndDateRange,

    cloneTask: cloneTask,
    updateTaskRecurrence: updateTaskRecurrence,
    getTasksOfSection: getTasksOfSection,
    getNonSectionTaskInList: getNonSectionTaskInList,
    getSectionsByListId: getSectionsByListId,
    getFollowngTaskOf: getFollowngTaskOf,
    getTaskNotDoneNotInGoal: getTaskNotDoneNotInGoal,
    getCompletePercentage: getCompletePercentage,
    getTaskById: getTaskById,
    updateTaskQuantity: updateTaskQuantity,
    getSubtasksNotDone: getSubtasksNotDone,
    createBatchTasks: createBatchTasks,
    createNewSubtasksOfTaskFromString: createNewSubtasksOfTaskFromString,
    getSubTasksOf: getSubTasksOf,
    batchUpdate: batchUpdate,
    resetOrder: resetOrder,
    getOldTasks: getOldTasks,
    getInboxTasks: getInboxTasks,
    updateATaskOrderInList: updateATaskOrderInList,
    getOrderNumberGivenNextTask: getOrderNumberGivenNextTask,
    getOrderNumber: getOrderNumber,
    getNotDoneNotInGoalTaskByListId: getNotDoneNotInGoalTaskByListId,
    getNotDoneTaskByListIdNotSync: getNotDoneTaskByListIdNotSync,
    getNotDoneTaskByListId: getNotDoneTaskByListId,
    getTaskByListIdNoSync: getTaskByListIdNoSync,
    getTaskByListId: getTaskByListId,
    removeTask: removeTask,
    updateTaskById: updateTaskById,
    updateTask: updateTask,
    createNewTask: createNewTask,
    getAllTasks: getAllTasks,
    fetchData: fetchData,
  };


  // MARK: functions 
  function getTaskByDate(date) {
    return $q(function(resolve, reject) {
      getTasksByDateRange(date, date).then(function(data) {
        tasks.add(data);
        resolve(tasks.getGroup({date: date}));
      });
    });
  }

  function getTasksByDateRange(start, end) {
    return $q(function(resolve, reject) {
      TaskAPI.getAllTasks({
        start_date: time.getTheBeginningOfDate(start).getTime(), 
        end_date: time.getTheEndOfDate(end.getTime()).getTime()
      })
        .$promise.then(function(data) {
          tasks.add(data);
          resolve(data);
        });
    });
  }

  function fetchData() {
    var data = TaskAPI.getAllTasks(function() {
      console.log("Fetched Task Data", data);
      tasks.add(data);
    });
  }

  /**
   * @return {array} an array of results
   */ 
  function getAllTasks() {
    return tasks.getAll();
  }

  function createNewTask(newTask) {
    var that = this;

    if(!newTask.color) newTask.color = CONSTS.DEFAULT_COLOR;
    tasks.add(newTask);
    $rootScope.$broadcast(CONSTS.EVENT_SOME_TASKS_UPDATED_OR_ADDED, newTask);

    return $q(function(resolve, reject) {
      TaskAPI.createNewTask(newTask, function(data) {
        console.log('Data from new created task', data);
        tasks.add(data);
        resolve(data);
      });
    });
  }

  function updateTask(taskToBeUpdated) {
    var deferred = $q.defer();

    tasks.add(taskToBeUpdated);
    TaskAPI.updateTask({taskId: taskToBeUpdated._id}, taskToBeUpdated, function(data) {
      tasks.add(data);
      deferred.resolve(data);
    });

    $rootScope.$broadcast(CONSTS.EVENT_SOME_TASKS_UPDATED_OR_ADDED, taskToBeUpdated);

    return deferred.promise;
  }

  function updateTaskById(id, newData) {
    var deferred = $q.defer();
    TaskAPI.updateTask({taskId: id}, newData, function(data) {
      tasks.add(data);
      deferred.resolve(data);
    });

    return deferred.promise;
  }

  function removeTask(taskToBeRemoved) {
    console.log('removing task', taskToBeRemoved);
    taskToBeRemoved.is_delete = true;
    tasks.remove(taskToBeRemoved);
    $rootScope.$broadcast(CONSTS.EVENT_SOME_TASKS_UPDATED_OR_ADDED, taskToBeRemoved);
    TaskAPI.deleteTask({taskId: taskToBeRemoved._id}, function(data) {
      console.log('Data after removing task', data);
    });
  }

  function getTaskByListId(listId) {
    TaskAPI.getAllTasks({listId: listId}, function(data) {
      console.log("Fetched Task Data for listID " + listId, data);
      tasks.add(data);
    });
    var taskList = tasks.getGroup({list_id: listId});
    taskList.sort(function(a, b) {
      return a.list_order_number - b.list_order_number;
    });
    return taskList;
  }

  function getTaskByListIdNoSync(listId) {
    var taskList = tasks.getGroup({list_id: listId});
    taskList.sort(function(a, b) {
      return a.list_order_number - b.list_order_number;
    });
    return taskList;
  }

  function getNotDoneTaskByListId(listId) {
    return $q(function(resolve, reject) {
      console.log('getNotDoneTaskByListId');
      var query = {
        list_id: listId,
        is_done: false
      };

      TaskAPI.getAllTasks(query, function(data) {
        tasks.add(data);
        resolve(tasks.getGroup(query));
      });

    });

  }

  function getNotDoneTaskByListIdNotSync(listId) {
    var taskList = tasks.getGroup({
      list_id: listId,
      is_done: false
    });
    taskList.sort(function(a, b) {
      return a.list_order_number - b.list_order_number;
    });
    
    return taskList;
  }

  function getNotDoneNotInGoalTaskByListId(listId) {
    return tasks.getGroup({list_id: listId, is_done: false, is_belong_to_a_goal: false});
  }


  function getTaskByDateNoSubTaskNoSync(date) { // no sync to serve

    return tasks.getGroup({date: date, parent_task_id: null});
  }
  
  function getTaskByDateNoSubTask(date) {
    var that = this;
    return $q(function(resolve, reject) {
      console.log('calling getTaskByDateNoSubTask');
      that.getTasksByDateRange(date, date).then(function(data) {
        tasks.add(data);
        console.log('returing the group date', date, tasks.getGroup({date: date, parent_task_id: null}));
        resolve(tasks.getGroup({date: date, parent_task_id: null}));
      });
    })
  }

  /** 
   * @desc given the previous (the one above) and task list, we can infer the order number 
   * Assume that tasks are already sorted by the increasign of order number
   */
  function getOrderNumber(prevTask, tasks, orderType) {
    var orderType = orderType || 'list';
    if(!prevTask) {
      if(tasks.length === 0) return helper.getNewOrderNumber();

      return helper.getNewOrderNumber(0, tasks[0][orderTypeAndDbField[orderType]]);
    }

    var index = tasks.indexOf(prevTask);

    // new task is at the end of task list 
    if(index + 1 === tasks.length) return helper.getNewOrderNumber(prevTask[orderTypeAndDbField[orderType]], null); 

    return helper.getNewOrderNumber(prevTask[orderTypeAndDbField[orderType]], tasks[index+1][orderTypeAndDbField[orderType]]);
  }

  function getOrderNumberGivenNextTask(nextTask, tasks, orderType) {
    if(!nextTask || nextTask.is_delete) {
      if(tasks.length === 0) return helper.getNewOrderNumber();

      return helper.getNewOrderNumber(0, tasks[0][orderTypeAndDbField[orderType]]);
    }
    console.log('next task', nextTask, tasks, orderType);

    var index = tasks.indexOf(nextTask);
    if(index === -1) return helper.getMaxOrder(); // defensive

    // new task is at the end of task list 
    if(index === 0) return helper.getNewOrderNumber(null, nextTask[orderTypeAndDbField[orderType]]); 

    return helper.getNewOrderNumber(tasks[index - 1][orderTypeAndDbField[orderType]], nextTask[orderTypeAndDbField[orderType]]);
  }
  /** 
   * @param {string} pos 'bottom' or 'top', 'top' means we drop a task above anchor, 'bottom' means below
   * @param {string} orderType 'date' or 'list', means the type of list we want to update order
   */
  function updateATaskOrderInList(anchorTask, updateTask, pos, tasks, orderType) {
    if(!orderTypeAndDbField.hasOwnProperty(orderType)) orderType = 'list';
    var count = 0;
    do {
      if(count === 5) {
        this.resetOrder(tasks, orderType);
      }

      if(count === 7) break;

      if(pos === 'bottom') {
        var newOrder = this.getOrderNumber(anchorTask, tasks, orderType);
      } else if (pos === 'top') {
        var newOrder = this.getOrderNumberGivenNextTask(anchorTask, tasks, orderType);
      } else {
        return false;
      }

      count++;
    } while(newOrder === anchorTask[orderTypeAndDbField[orderType]])


    updateTask[orderTypeAndDbField[orderType]] = newOrder;
    this.updateTask(updateTask);

    $rootScope.$broadcast('task-change-order');
  }

  function getInboxTasks() {
    return tasks.getGroup({is_in_inbox: true});
  }

  function getOldTasks() {
    return tasks.getGroup({'date': {'$le': new Date()}});
  }

  function resetOrder(tasks, orderType) {
    var field = orderTypeAndDbField[orderType];
    var interval = Math.floor(Math.pow(10, 9) / tasks.length); 
    for(var i = 0, len = tasks.length; i < len; i++) {
      var task = tasks[i];
      task[field] = (i + 1) * interval;
    }

    this.batchUpdate(tasks);
  }

  function batchUpdate(tasks) {
    var clone = tasks.slice();
    for(var i = 0, len = clone.length; i < len; i++) {
      var task = clone[i];
      this.updateTask(task);
    }
  }

  function getSubTasksOf(task) {
    return tasks.getGroup({'parent_task_id': task._id});
  }

  function createNewSubtasksOfTaskFromString(str, task) {
    var items = helper.parseHashtag(str);
    var subtasks = [];
    for(var i = 0, len = items.length; i < len; i++) {
      var item = items[i];
      subtasks.push({
        title: item.matchedString,
        parent_task_id: task._id,
        item_name: item.itemName,
        item_quantity: item.quantity,
        item_unit: item.unit,
      });
    }

    this.createBatchTasks(subtasks);
  }

  function createBatchTasks(tasks) {
    for(var i = 0, len = tasks.length; i < len; i++) {
      var task = tasks[i];
      this.createNewTask(task);
    }
  }

  function getSubtasksNotDone() {
    return tasks.getGroup({ is_done: false, parent_task_id: {'$neq': null}});
  }

  function updateTaskQuantity(newQuantity, task) {
    task.item_quantity_done = task.item_quantity_done + newQuantity;
    if(task.item_quantity_done >= task.item_quantity) {
      task.is_done = true;
    }
    this.updateTask(task);
  }

  function getTaskById(id) {
    var result = tasks.getGroup({_id: id});
    return result ? result[0] : null;
  }

  function getCompletePercentage(task) {
    var subtasks = this.getSubTasksOf(task);
    var percent = 0;
    var totalSubtask = subtasks.length;
    if(totalSubtask === 0) return 0;

    for(var i = 0, len = subtasks.length; i < len; i++) {
      var subtask = subtasks[i];
      if(subtask.item_quantity > 0 ) {
        percent += Math.min(subtask.item_quantity_done/subtask.item_quantity, 1) * 100;
      } else {
        percent += subtask.is_done ? 100 : 0;
      }
    }

    return percent / totalSubtask;
  }

  function getTasksInGoalByListIdAndDateRange(listId, startDate, endDate) {
    return tasks.getGroup({list_id: listId, goal_start_date: startDate, goal_end_date: endDate, is_belong_to_a_goal: true});
  }

  function getTasksInGoalByDateRange(startDate, endDate) {
    return tasks.getGroup({
      is_belong_to_a_goal: true,
      goal_start_date: startDate,
      goal_end_date: endDate
    });
  }

  function getTaskNotDoneNotInGoal() {
    return tasks.getGroup({
      is_belong_to_a_goal: false, 
      is_done: false
    });
  }

  function getTaskInScheduleNotDoneByDate(date) {
    return tasks.getGroup({
      start_time: {'$neq': null},
      is_done: false,
      date: date
    });
  }

  function getTaskNotScheduleNotDoneByDate(date) {
    return tasks.getGroup({
      start_time: null,
      is_done: false,
      date: date
    });
  }

  function getFollowngTaskOf(currentTask, section) { // in cluded itself
    if(!currentTask.list_id) {
      console.info('Must have list_id to use this function');
      return [];
    }

    var query = {
      list_id: currentTask.list_id,
      list_order_number: {'$gte': currentTask.list_order_number},
      is_section: false,
      is_done: false,
      parent_section_id: null
    };

    if(section) query.parent_section_id = section._id;
    return tasks.getGroup(query);

  }

  function getSectionsByListId(list_id) {
    var taskList = tasks.getGroup({
      list_id: list_id,
      is_section: true
    });
    taskList.sort(function(a,b) {
      return a.list_order_number - b.list_order_number;
    });
    return taskList;
  }

  function getNonSectionTaskInList(list_id) {
    var taskList = tasks.getGroup({
      list_id: list_id,
      parent_section_id: null,
      is_section: false,
      is_done: false
    });
    taskList.sort(function(a,b) {
      return a.list_order_number - b.list_order_number;
    });
    return taskList;
  }

  function getTasksOfSection(section) {
    var taskList = tasks.getGroup({
      parent_section_id: section._id,

    });
    taskList.sort(function(a,b) {
      return a.list_order_number - b.list_order_number;
    });
    return taskList;
  }

  function updateTaskRecurrence(taskToBeUpdated) {
    var deferred = $q.defer();

    tasks.add(taskToBeUpdated);
    TaskAPI.updateTask({taskId: taskToBeUpdated._id, is_update_recurring: true}, taskToBeUpdated, function(data) {
      deferred.resolve(data);
    });

    return deferred.promise;
  }

  function cloneTask(task) {
    var clone = {
      title: task.title,
      note: task.note,
      start_time: task.start_time, 
      duration: task.duration, 
      list_id: task.list_id, 
      parent_section_id: task.parent_section_id,
      parent_task_id: task.parent_task_id
    };
    return clone;
  }
    
};

})(); 

(function() {
  'use strict';
  angular.module('yodacore').factory('yodacore.taskProcessService', taskProcess); 
  taskProcess.$inject = ['yodacore.time'];
  function taskProcess(time) {

    // MARK: return 
    return {
      sortByStartTime: sortByStartTime
    };


    // MARK: 
    function sortByStartTime(tasks) {
      tasks.sort(function(a, b) {
        return time.convertTo24h(new Date(a.start_time)) - time.convertTo24h(new Date(b.start_time));
      });
    }
  }
})();

(function() {
'use strict' 

angular.module('yodacore').factory('yodacore.taskRecordService', TaskRecordService);

TaskRecordService.$inject = ['$resource', 'yodacore.time', 'yodacore.recordDataService', 'yodacore.taskDataService', 'yodacore.helper', 'yodacore.TASK', '$q', 'yodacore.taskProcessService']

function TaskRecordService($resource, time, RecordService, TaskService, helper, TASK, $q, TaskProcess) {

  return {
    getCurrentTaskAndRecords                                                       : getCurrentTaskAndRecords,
    undoneTask                                                                     : undoneTask,
    predictFutureDurationAndStartTimeOfItempredictFutureDurationAndStartTimeOfItem : predictFutureDurationAndStartTimeOfItempredictFutureDurationAndStartTimeOfItem,
    createRecordFromData                                                           : createRecordFromData,
    predictPastDurationAndStartTimeOfItem                                          : predictPastDurationAndStartTimeOfItem,
    markTaskAsDone                                                                 : markTaskAsDone,
  };

  function getCurrentTaskAndRecords() {
    var now = new Date();
    var now24 = convertTo24h(now);
    return $q(function(resolve, reject) {
      $q.when(TaskService.getTaskByDate(now), RecordService.getRecordByDate(now)).then(function(tasks, records) {
        var chosenTask = null; 
        var prevTask = null;
        var nextTask = null; 
        var records = null;
        var result;

        TaskProcess.sortByStartTime(tasks);

        for(var i = 0, len = tasks.length; i < len; i++) {
          var task = tasks[i];
          if(!task.start_time || !task.duration) continue;
          var start = new Date(task.start_time); 
          var end = new Date(start.getTime() + task.duration * 60 * 1000); 
          var start24 = convertTo24h(start);
          var end24 = convertTo24h(end);

          if(now24 > start24 && now24 > end24 ) prevTask = task; // get last of this kind 

          if(now24 < start24 && !nextTask) nextTask = task; // get first of this kind

          if(now24 >= start24 && now24 <= end24) chosenTask = task;
        }

        if(chosenTask) {
          records = RecordService.getRecordsByTaskIdNoSync(chosenTask._id);
        } else {
          records = RecordService.getRecordNonTaskByDateNoSync(new Date());
        }

        result = {
          currentTask: chosenTask,
          records: records,
          prevTask: prevTask,
          nextTask: nextTask
        };
        resolve(result);
      });
    });
  }


  function markTaskAsDone(task, thisDate) {
    var deferred = $q.defer();
    if(task.is_recurring) {
      thisDate = thisDate || new Date();
      task.recurring_done_dates.push(thisDate);

      var clone = TaskService.cloneTask(task);
      clone.is_done = true;
      clone.assigned_date = thisDate;

      if(clone.assigned_date && clone.start_time === null) {
        var data = this.predictPastDurationAndStartTimeOfItem(clone, RecordService.getRecordByDateNoSync(new Date(clone.assigned_date)), new Date(), 8, 24);
        clone.start_time = data.startTime;
        clone.duration = data.duration;
      }


      TaskService.updateTask(task);
      TaskService.createNewTask(clone).then(function(data) {
        deferred.resolve(data);
      });;

      return deferred.promise;
    } else {
      task.is_done = true;
      if(task.assigned_date && task.start_time === null) {
        var data = this.predictPastDurationAndStartTimeOfItem(task, RecordService.getRecordByDateNoSync(new Date(task.assigned_date)), new Date(), 8, 24);
        task.start_time = data.startTime;
        task.duration = data.duration;
      }
      return TaskService.updateTask(task);
    }

  }

  /**
   * @desc based on current time and item allocation, predict start time and duration of no schedule item 
   * It only works for item in a single day 
   * if item had duration or start time, use that data
   * Only work for predict the past
   * !! It is so sad that I developed the same algorithm based on the interface position, though the interface one is visual, it is not flexible 
   * assumption: 
   *  + item in itemList if done, must have start_time and duration
   * @param {Task} item the item we want to schedule, must have assigned time
   * @param {Tasks} itemList list of items we want to consider, assumed all of them is on the same day 
   * @param {Date} currentTime since the item must have been done before the "now" so we want to take it into consideration
   * @param {Integer} startOfTheDay  24h unit the start working hour  
   * @param {Integer} endOfTheDay same as start can go over 25 and it means the next day
   *
   * @return {Object} startTime: predicted start time, duration: predicted duration
   */
  function predictPastDurationAndStartTimeOfItem(item, itemList, currentTime, startOfTheDay, endOfTheDay, assignedDate) {

    if(item.start_time) { // there is  no need to predict item with start_time 
      return {
        startTime: new Date(item.start_time),
        duration: item.duration || 30
      };
    }

    
    //wanna make sure itemList is sorted by start time
    itemList.sort(function(a,b) {
      var atime = new Date(a.start_time);
      var btime = new Date(b.start_time);
      return atime.getTime() - btime.getTime();
    });

    // sort item by start time order
    // remove item that happens after current time

    var startTime; // in 24h unit
    var assignedDate = assignedDate || new Date(item.assigned_date);
    var duration = (item.duration ? item.duration : 30)/60; // in 24h unit
    var gaps = [];
    var gap;

    // we want to transfer all time data into 24h ( may be greater) for the ease of computing and it is intuitive 
    var currentTime = (time.areDifferentDates(currentTime, assignedDate) && currentTime.getTime() > assignedDate.getTime()) ? endOfTheDay : convertTo24h(currentTime);
    
    if(itemList.length === 0) { // push it at the top of the day
      gap = currentTime - startOfTheDay; 
      gaps.push(gap);

      if(gap < 0) {
        startTime = currentTime - duration;
      } else {
        if(gap >= duration) {
          startTime = startOfTheDay;
        } else {
          
          // respect item duration if having, just change the start time
          if(item.duration) { 
            startTime = currentTime - duration;
          } 
          
          // squeeze duration 
          else {
            duration = gap;
          }
        }
      }
    } 
    
    // there is some items in list
    else {
      var firstItem = itemList[0];
      var lastItem = itemList[itemList.length - 1];
      
      // find first gap that satistiy
      gap = convertTo24h(new Date(firstItem.start_time)) - startOfTheDay;
      gaps.push(gap);
      if(gap >= duration) {
        startTime = startOfTheDay;
      } 

      else {
        // gaps between items 
        if(itemList.length >= 2) {
          var foundGoodGap = false;
          for(var i = 0, len = itemList.length; i < len - 1; i++) {
            var thisItem = itemList[i];
            var nextItem = itemList[i + 1];
            gap = convertTo24h(new Date(nextItem.start_time)) - (convertTo24h(new Date(thisItem.start_time)) + thisItem.duration/60);
            gaps.push(gap);
            if(gap >= duration) {
              startTime = convertTo24h(new Date(thisItem.start_time)) + thisItem.duration/60;
              foundGoodGap = true;
              break;
            }
            
          }
        } 

        if(!foundGoodGap) {
          // last gap that satisfy 
          gap = currentTime - (convertTo24h(new Date(lastItem.start_time)) + lastItem.duration/60);
          gaps.push(gap);
          if(gap >= duration) {
            startTime = convertTo24h(new Date(lastItem.start_time)) + lastItem.duration/60;
          }
          
          //find no suitable gaps, find biggest gap and tuck it in or squeeze the item 
          else {
            // find no suitable place, gonna find biggest gap and tuck it in 
            var max = getMaxOfArray(gaps);

            console.log('gaps', gaps, max);
            if (max <= 0) {
              // no positive gap ><, this case is rare but possible
              // just tuck it on highest top
              startTime = Math.min(startOfTheDay - duration,  convertTo24h(new Date(firstItem.start_time)) - duration);
            } 

            else {
              var index = gaps.indexOf(max);
              duration = item.duration ? item.duration/60 : max; // adjust acoordingly to max
              console.log('duration', duration);

              // order of gap is, 0 - top to first, from 1 -> 0-1, 2 -> 1-2, ... and from last to bottom     
              // respect the recent, it means we should overlap the old 
              if(index === 0) { // insert at position from top to first
                startTime = convertTo24h(new Date(firstItem.start_time)) - duration;
              } 

              else if(index === gaps.length - 1) { // from last to bottom
                startTime = currentTime - duration;
              } 
              
              else {
                console.log('index', index);
                startTime = convertTo24h(new Date(itemList[index].start_time)) - duration;
              }
            }
          }
        }

      }


    }

    var startDate = new Date(assignedDate);
    // round up here
    startDate.setHours(Math.floor(startTime));
    startDate.setMinutes(Math.round((startTime - Math.floor(startTime)) * 60));
    startDate.setSeconds(0);
    console.log('startDate', startDate);
    return {
      startTime: startDate,
      duration: Math.ceil(duration * 60)
    };
  }
  function createRecordFromData(record) {
    var newRecord = {
      title: record.title,
      items: []
    };
    var items = helper.parseHashtag(newRecord.title);
    var todaySubtasks = TaskService.getSubtasksNotDone(new Date());
    var thisDate = new Date();

    for(var i = 0, len = items.length; i < len; i++) {
      var item = items[i];
      var subtasksWithThisItem = helper.getObjectsByKeyValue(todaySubtasks, 'item_name', item.itemName );
      var chosenTask = null;
      if(subtasksWithThisItem.length > 0) {
        chosenTask = subtasksWithThisItem[0]; 
        TaskService.updateTaskQuantity(item.quantity, chosenTask);
      }

      newRecord.items.push({
        item_name: item.itemName,
        quantity: item.quantity,
        unit: item.unit,
        task_id: record.taskId ? record.taskId : (chosenTask ? chosenTask.parent_task_id : null)
      });
    }

    var data = helper.parseTime(newRecord.title, thisDate);
    console.log('data', data);
    if(data.replacedString !== newRecord.title) {
      var newData = {
        start_time: data.startTime,
        duration: data.duration
      };
      var predicted = this.predictPastDurationAndStartTimeOfItem(newData, RecordService.getRecordByDateNoSync(thisDate), new Date(), 8, 24, thisDate);
      newRecord.start_time = predicted.startTime;
      newRecord.duration = predicted.duration;
      newRecord.title = data.replacedString;
      console.log('predicted', predicted);
    }

    RecordService.createNewRecord(newRecord);

  }

  // itemList contains all scheduled item of a day
  function predictFutureDurationAndStartTimeOfItempredictFutureDurationAndStartTimeOfItem(item, itemList, currentTime, startOfTheDay, endOfTheDay) {
    if(itemList.length === 0) {
      return {
        startTime: new Date(currentTime),
        duration: item.duration || TASK.DEFAULT_DURATION_IN_MINUTE
      };
    }
    //wanna make sure itemList is sorted by start time
    itemList.sort(function(a,b) {
      var atime = new Date(a.start_time);
      var btime = new Date(b.start_time);
      return atime.getTime() - btime.getTime();
    });

    var startTime; // in 24h unit
    var assignedDate = assignedDate || new Date(item.assigned_date);
    var duration = (item.duration ? item.duration :  TASK.DEFAULT_DURATION_IN_MINUTE)/60; // in 24h unit
    var gaps = [];
    var gap;
    var assignedDate = new Date(currentTime);
    var currentTime = convertTo24h(currentTime);
    var indexOfFirstAfterCurrent = null;

    for(var i = 0, len = itemList.length; i < len; i++) {
      var tmpItem = itemList[i];
      var startTime = convertTo24h(new Date(tmpItem.start_time));
      if(startTime >= currentTime || (startTime + tmpItem.duration/60) > currentTime) {
        if(startTime < currentTime) {
          currentTime = startTime + tmpItem.duration/60; // if the time of item crosses current, curren can be seen as after finishing that item 
          indexOfFirstAfterCurrent = i + 1;
        } else {
          indexOfFirstAfterCurrent = i;
        }
        console.log('break', indexOfFirstAfterCurrent);
        break;
      }
    }

    if(indexOfFirstAfterCurrent === null || indexOfFirstAfterCurrent > itemList.length - 1) { // no item after current 
      startTime = currentTime;
    } else {

      // check from current to the first after current
      var first = itemList[indexOfFirstAfterCurrent];
      gap = convertTo24h(new Date(first.start_time)) - currentTime;
      gaps.push(gap);
      if(gap >= duration) {
        startTime = currentTime;
      } 
      
      // first gap does not fit, go find another 
      else {
        var foundGoodGap = false;

        if((itemList.length) - indexOfFirstAfterCurrent > 1) { // there is at least 2 items afte current to consider, the current & its next
          console.log('looking for gap in the middle ', indexOfFirstAfterCurrent, itemList.length );
          for(var i = indexOfFirstAfterCurrent, len = itemList.length - 1; i < len; i++) {
            var current = itemList[i];
            var next = itemList[i + 1];
            var startTime = convertTo24h(new Date(current.start_time));
            var nextStart = convertTo24h(new Date(next.start_time));
            
            gap = nextStart - (startTime + current.duration/60);
            gaps.push(gap);
            if(gap >= duration) {
              startTime = startTime + current.duration/60
              foundGoodGap = true;
              break;
            }
          }
        } 

        if(!foundGoodGap) {
          console.log('last gap');
          // last gap
          var last = itemList[itemList.length - 1];
          gap = endOfTheDay - (convertTo24h(new Date(last.start_time)) + last.duration/60);
          gaps.push(gap);
          if(gap >= duration) {
            startTime = convertTo24h(new Date(last.start_time)) + last.duration/60;
          } else {
            // found no good gap in all slots, gonna tuck item in the biggest gap
             var max = getMaxOfArray(gaps);

              if (max <= 0) {
                // no positive gap ><, this case is rare but possible
                // just tuck it on the bottom
                startTime = convertTo24h(new Date(first.start_time)) + last.duration / 60;
              } 

              else {
                var index = gaps.indexOf(max);
                duration = item.duration ? item.duration/60 : max; // adjust acoordingly to max
                console.log('duration', duration);

                // order of gap is, 0 - top to first, from 1 -> indexOfFirstAfterCurrent + 0-1, 2 -> 1-2, ... and from last to bottom     
                // respect the recent, it means we should overlap the further in future 
                if(index === 0) { // insert at position from top to first
                  startTime =  currentTime;
                } 

                else if(index === gaps.length - 1) { // from last to bottom
                  startTime = convertTo24h(new Date(first.start_time)) + last.duration / 60;
                } 
                
                else {
                  console.log('index', index);
                  var chosenItemInList = itemList[indexOfFirstAfterCurrent + index - 1];
                  startTime = convertTo24h(new Date(chosenItemInList.start_time)) + chosenItemInList.duration / 60 ;
                }
              }

          }

        }
      
      }
    }
    
    var startDate = new Date(assignedDate);
    // round up here
    startDate.setHours(Math.floor(startTime));
    startDate.setMinutes(Math.round((startTime - Math.floor(startTime)) * 60));
    startDate.setSeconds(0);
    console.log('startDate', startDate);
    console.log('gaps ', gaps);
    return {
      startTime: startDate,
      duration: Math.ceil(duration * 60)
    };
  }

  function undoneTask(task) {
    // remove record of this task 
    RecordService.removeRecordByTaskId(task._id);
    // mark is done false 
    task.is_done = false;
    TaskService.updateTask(task);
  }

  
  // MARK: common functions 
  function convertTo24h(date) { // should always keep the precision
    return date.getHours() + date.getMinutes()/60 + date.getSeconds()/3600;
  }

  function getMaxOfArray(numArray) {
    return Math.max.apply(null, numArray);
  }

};

})();

(function() {
'use strict';

angular.module('mtask').controller('mtask.taskListCtrl', TaskListCtrl); 
                                   
TaskListCtrl.$inject = ['yodacore.userDataService', '$state'];
                                   
function TaskListCtrl(UserService, $state) { 
  var vm = this; 
};

})();



(function() {
'use strict';

angular.module('endiary').controller('endiary.mainCtrl', MainCtrl); 


MainCtrl.$inject = [];

function MainCtrl() {
}

})();





(function() {
  'use strict';
  angular.module('endiary').controller('endiary.takeNoteCtrl', takeNoteCtrl); 
  takeNoteCtrl.$inject = ['yodacore.taskRecordService', 'yodacore.CONSTS', 'yodacore.time', 'yodacore.recordDataService', '$scope'];
  function takeNoteCtrl(TaskRecordService, CONSTS, time, RecordService, $scope) {
    // MARK: bindable variables
    var vm = this; 
    vm.task = null;
    vm.upcomingTask = null;
    vm.records = [];
    vm.note = ''; 
    vm.defaultColor = CONSTS.DEFAULT_COLOR;
    vm.startTime = null;
    vm.duration = null; 

    // MARK: bindable functions
    vm.addNote = addNote;
    vm.doRefresh = doRefresh;

    // MARK: initialization
    getCurrentTask();

    // MARK: functions
    function getCurrentTask() {
      TaskRecordService.getCurrentTaskAndRecords().then(function(result, a) {
        console.log('a', a, result);
        var task = result.currentTask;
        var records = result.records;
        var prevTask = result.prevTask;
        var nextTask = result.nextTask;

        vm.task = task;
        vm.records = records;

        if(task) {
          vm.startTime = task.start_time;
          vm.duration = task.duration;
        } else {
          if(prevTask) {
            var prevStart = new Date(prevTask.start_time);
            vm.startTime = new Date(prevStart.getTime() + prevTask.duration * 60 * 1000); 
          } else {
            vm.startTime = time.getTheBeginningOfDate(new Date());
          }

          if(nextTask) {
            var nextStart = new Date(nextTask.start_time);
            vm.duration = Math.round((time.convertTo24h(nextStart) - time.convertTo24h(vm.startTime)) * 60); 
            vm.upcomingTask = nextTask;
          } else {
            vm.duration = Math.round((time.convertTo24h(time.getTheEndOfDate(new Date())) - time.convertTo24h(vm.startTime)) * 60); 
          }


        }

        $scope.$broadcast('scroll.refreshComplete');
      });
    }

    function addNote() {
      var newRecord = {
        title: vm.note,
      };
      if(vm.task) {
        newRecord.task_id = vm.task._id;
        newRecord.list_id = vm.task.list_id;
      }
      RecordService.createNewRecord(newRecord).then(function() {
      });
      vm.note = '';
    }

    function doRefresh() {
      getCurrentTask();
    }
  }
})();

(function() {
'use strict';

angular.module('endiary').controller('endiary.taskDiaryCtrl', TaskDiaryCtrl); 


TaskDiaryCtrl.$inject = ['yodacore.taskDataService', 'yodacore.recordDataService', '$q', '$scope'];

function TaskDiaryCtrl(TaskService, RecordService, $q, $scope) {
  var vm = this; 
  vm.thisDate = new Date();
  vm.tasks = [];
  vm.records = [];

  // MARK: share functions
  vm.doRefresh = doRefresh;

  // MARK: initialization 
  doRefresh();

  // MARK: functions
  function doRefresh() {
    $q.when(TaskService.getTaskByDate(vm.thisDate), RecordService.getRecordByDate(vm.thisDate)).then(function(tasks, records) {
      vm.tasks = tasks;
      vm.records = records;
      $scope.$broadcast('scroll.refreshComplete');
    });
  }
}

})();


'use strict';

angular.module('yodacore').constant('yodacore.TASK', {
  DEFAULT_DURATION_IN_MINUTE: 60,
  STATE_NOT_DONE_OVERTIME: 'not-done-overtime',
  STATE_DOING: 'doing',
  STATE_NO_START_TIME: 'no-start-time',
  STATE_TIME_HAS_NOT_COME: 'time-has-not-come',
  STATE_NO_ACTION: 'state-no-action'
});

angular.module('yodacore').constant('yodacore.CONSTS', {
  EVENT_CURRENT_TIME_CHANGE: 'current-time-change',
  EVENT_DROPPED_ITEM_ON_COVER: 'dropped-item-cover',
  EVENT_CREATED_TASK: 'created-task',
  EVENT_SOME_TASKS_UPDATED_OR_ADDED: 'some-tasks-updated-or-added',
  EVENT_SOME_RECORDS_UPDATED_OR_ADDED: 'some-records-updated-or-added',
  EVENT_SOME_LISTS_UPDATED_OR_ADDED: 'some-lists-updated-or-added',
  EVENT_LIST_DELETED: 'list-deleted',
  ITEM_TYPE_TASK: 'task',
  ITEM_TYPE_RECORD: 'record',
  DEFAULT_COLOR: '#36b37a',
  CACHE_FLUSH_INTERVAL: 120, // in seconds

  ROOT_URL: '', // this will not be changed after its first set 
});

(function() {
'use strict';

angular.module('muser').controller('muser.loginCtrl', LoginCtrl); 
                                   
LoginCtrl.$inject = ['yodacore.userDataService', '$state'];
                                   
function LoginCtrl (UserService, $state) { 
  var vm = this; 

  // MARK: Bindable variable
  vm.email = 'minh.truonganh7@gmail.com';
  vm.password = '123456'; 
  vm.message = {};

  // MARK: Bindable functions
  vm.login = login; 

  console.log('vm', vm);
  // MARK: Functions 
  function login() {
    console.log('fdsafds');
    UserService.login(vm.email, vm.password).then(function(result) {
      vm.message.content = result.message; 
      vm.message.success = result.success;

      if(result.success) {
        $state.go('main.taskDiary');
      }

    });
  }
};

})();

angular.module('yodacore')
.filter('cut', function () {
  return function (value, wordwise, max, tail) {
    if (!value) return '';

    max = parseInt(max, 10);
    if (!max) return value;
    if (value.length <= max) return value;

    value = value.substr(0, max);
    if (wordwise) {
      var lastspace = value.lastIndexOf(' ');
      if (lastspace != -1) {
        value = value.substr(0, lastspace);
      }
    }

    return value + (tail || ' …');
  };
});



angular.module('yodacore')
.filter('timeString', ['yodacore.time', function (time) {
  return function (duration) {
    duration = parseFloat(duration); // in minute
    return time.convertToStr(duration);
  };
}]);


angular.module('yodacore')
.filter('startAndEnd', ['yodacore.time', function (time) {
  return function (start, duration) {
    if(!start) return ''; 
    var startDate = new Date(start);

    if(!duration) return time.getTimeString(startDate);

    var endDate = new Date(startDate.getTime() + parseInt(duration, 10) * 60 * 1000);

    return time.getTimeString(startDate) + ' - ' + time.getTimeString(endDate);
  };
}]);


'use strict';

angular.module('yodacore').directive('taskCreatable', ['$document', '$compile', 'yodacore.CONSTS', function($document, $compile, CONSTS) {
  var ADJUSTED_HEIGHT = 122;
	return {
    link: function($scope, $element, $attrs) {
      var $dummyTask = angular.element('<div class="dummy-task time-plate" style="top:-50px;height: 0px; background-color: ' + CONSTS.DEFAULT_COLOR + ' "> <div data-ng-include="\'template/task/createTask.html\'" class="dummy-task-creation-form"></div> </div>');
      var $dummyTask = $compile($dummyTask)($scope);
      var intervalDistance = parseFloat($attrs['taskCreatableInterval']);
      // window.mm = $element;
      angular.element($element.children()[0]).append($dummyTask);
      var scrollableParent = $element.parent().parent().parent().parent().parent().parent();
      var height = parseInt($scope[$attrs['taskCreatableDummyHeight']], 10);
      $scope.createTaskTimeline = false;

      $element.on('mousedown', function(event) {
        // event.preventDefault();
        if(angular.element(event.target).hasClass('te-col-wrapper')) {
          $document.unbind('mousedown', removeDummyHandler);
          var top = (event.clientY + scrollableParent.prop('scrollTop') - ADJUSTED_HEIGHT + height);
          var adjustedTop = intervalDistance ? ((Math.floor((top)/intervalDistance)) * intervalDistance) : top;
          var $input = $element.find('input')[0];


          $dummyTask.css({
            height: height + 'px',
            top: adjustedTop + 'px'
          });

          $scope.taskTopPosition = adjustedTop;
          $scope.createTaskTimeline = true;

          setTimeout(function() {
            $input.focus();
          }, 100);

          setTimeout(function() {
            $document.on('mousedown', removeDummyHandler);
          }, 500);
        }

      });

      function removeDummyHandler(evt) {
        if(angular.element(evt.target).hasClass('task-creation-input')) return;
        removeDummy();
      }

      function removeDummy() {
        console.log('remove dummy');
        $dummyTask.css({
          height: '0px',
          top: '-100px'
        });
        $scope.createTaskTimeline = false;
        $document.unbind('mousedown', removeDummyHandler);
      }

      $scope.$on(CONSTS.EVENT_CREATED_TASK, function() {
        removeDummy();
      });
    }
	};
}]);

'use strict';

angular.module('yodacore').directive('draggable', ['$document', 'yodacore.dragdropState', function($document, state) {

	return {
    link: function($scope, $element, $attrs) {
      var elementOriginalTop = 0;
      var clickedY = 0;
      var dummyEle = angular.element(document.getElementById('drag-drop-dummy'));
      $element.on('mousedown', function(event) {
        var data = $scope[$attrs['draggableData']];

        event.preventDefault();

        state.isDragging = true;
        state.data = data;

        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);

        dummyEle.css({
          top: event.clientY +'px',
          left: event.clientX + 'px'
        });
        dummyEle.removeClass('hidden');

        dummyEle.text(data.title);
      });

      function mousemove(event) {
        dummyEle.css({
          top: event.clientY + 10 +'px',
          left: event.clientX + 10 + 'px'
        });
      }

      function mouseup() {
        dummyEle.css({
          top: '-100px',
          left: '-100px'
        });
        dummyEle.addClass('hidden');
        $document.unbind('mousemove', mousemove);
        $document.unbind('mouseup', mouseup);
        setTimeout(function() { // delay it a bit for others to update before locking the dragging status
          state.isDragging = false;
        }, 0);
      }
    }
	};
}]);


angular.module('yodacore').directive('droppable', ['$document', 'yodacore.dragdropState', function($document, state) {
  var ADJUSTED_HEIGHT = 122;
	return {
    link: function($scope, $element, $attrs) {
      var intervalDistance = parseFloat($attrs['droppableMoveInterval']);
      var $dummyTask = angular.element('<div class="dummy-task time-plate" style="top:-500px;height: 0px;"> </div>');
      // window.mm = $element;
      angular.element($element.children()[0]).append($dummyTask);
      var scrollableParent = $element.parent().parent().parent().parent().parent().parent();

      $element.on('mousemove', function(event) {
        event.preventDefault();
        if(state.isDragging === true) {
          state.data.title && $dummyTask.text(state.data.title.substring(0,5));
          var top = (event.clientY + scrollableParent.prop('scrollTop') - ADJUSTED_HEIGHT);
          var adjustedTop = intervalDistance ? ((Math.round((top)/intervalDistance)) * intervalDistance) : top;
          $dummyTask.css({
            height: $scope[$attrs['droppableDummyHeight']] + 'px',
            top: adjustedTop + 'px',
            'background-color': state.data.color
          });
          $scope.$emit('drag-to', state.data, {
            clientY: event.clientY,
            scrollTop: scrollableParent.prop('scrollTop')
          });
        }

      });

      $element.on('mouseout', function(event) {
        event.preventDefault();
        if(state.isDragging === true) {
          $dummyTask.css({
            height: '0px',
            top: '-1000px',
          });
        }
      });

      $element.on('mouseup', function(event) {
        if(state.isDragging === true) {
          var top = (event.clientY + scrollableParent.prop('scrollTop') - ADJUSTED_HEIGHT);
          var adjustedTop = intervalDistance ? ((Math.round((top)/intervalDistance)) * intervalDistance) : top;
          $scope.$emit('dropped', state.data, {
            top:  adjustedTop,
          });
        }
      });
    }
	};
}]);
angular.module('yodacore').directive('droppableListItem', ['$document', 'yodacore.dragdropState', function($document, state) {
	return {
    link: function($scope, $element, $attrs) {
      var draggedTaskPos = null;
      function toggleBottom() {
        draggedTaskPos = 'bottom';
        $element.removeClass('sign-at-top');
        $element.addClass('sign-at-bottom');
      }

      function toggleTop() {
        draggedTaskPos = 'top';
        $element.removeClass('sign-at-bottom');
        $element.addClass('sign-at-top');
      }

      function removeSigns() {
        $element.removeClass('sign-at-top');
        $element.removeClass('sign-at-bottom');
        draggedTaskPos = null;
      }

      $element.on('mousemove', function(event) {
        if(state.isDragging === true) {
          var rec = $element[0].getBoundingClientRect();
          var posInEl = event.clientY - rec.top;
          var height = rec.bottom - rec.top;
          if(posInEl > height/2) {
            toggleBottom();
          } else {
            toggleTop();
          }
        }

      });

      $element.on('mouseout', function(event) {
        removeSigns();
      });

      $element.on('mouseup', function(event) {
        if(state.isDragging === true) {
          $scope.$emit('dropped-item', state.data, {
            draggedPos: draggedTaskPos
          }, $attrs['droppableListItemModel'] ? $scope[$attrs['droppableListItemModel']] : null);
          removeSigns();
        }
      });
    }
	};
}]);

angular.module('yodacore').factory('yodacore.dragdropState', function() {
  // Under assumption that no two dragging process happen at the same time
  // It is a justified assumption
  return {
    isDragging: false,
    data: null
  };
});

// in case there is no target item to drop on 
angular.module('yodacore').directive('droppableCover', ['$document', 'yodacore.dragdropState', 'yodacore.CONSTS', function($document, state, CONSTS) {
	return {
    scope: {
      attachedInfo: '=droppableCoverAttachedItem'
    },
    link: function($scope, $element, $attrs) {
      // window.mm = $element;

      $element.on('mousemove', function(event) {
        event.preventDefault();
        if(state.isDragging === true) {
          $element.css({
            'border': 'solid 1px blue'
          });
        }

      });

      $element.on('mouseout', function(event) {
        event.preventDefault();
        if(state.isDragging === true) {
          $element.css({
            'border': ''
          });
        }
      });

      $element.on('mouseup', function(event) {
        if(state.isDragging === true) {
          $scope.$emit(CONSTS.EVENT_DROPPED_ITEM_ON_COVER, state.data, $scope.attachedInfo);
          $scope.$broadcast(CONSTS.EVENT_DROPPED_ITEM_ON_COVER, state.data, $scope.attachedInfo);
        }
      });
    }
	};
}]);




angular.module('yodacore').directive('yodaEnter', [function () {
  return function (scope, element, attrs) {
    element.bind("keydown keypress", function (event) {
      if(event.which === 13) {
        scope.$apply(function (){
          scope.$eval(attrs.yodaEnter);
        });
        event.preventDefault();
      }
    });
  };
}]);

angular.module('yodacore').directive('yodaScrollToOnClick', ['yodacore.CONSTS', function (CONSTS) {
  return function (scope, element, attrs) {
    var scrollerId = attrs['yodaScrollToOnClickScrollerId'];
    var $scrollEl = angular.element(document.getElementById(scrollerId));
    scope.$on(CONSTS.EVENT_SOME_RECORDS_UPDATED_OR_ADDED, function() {
      setTimeout(function() { 
        $scrollEl.scrollToElement(element,0, 1000); 
      }, 100);
    });
    setTimeout(function() { // to wait for new element to be inserted before scrolling down
      $scrollEl.scrollToElement(element,0, 1000); 
    }, 100);
  };
}]);

angular.module('yodacore').directive('yodaBackspace', [function () {
  return function (scope, element, attrs) {
    element.bind("keydown keypress", function (event) {
      if(event.which === 8 || event.which === 46) {
        scope.$apply(function (){
          scope.$eval(attrs.yodaBackspace);
        });

        if(scope['newTitle'] === '') { // hardwire to prevent chrome history back
          event.preventDefault();
        }
      }
    });
  };
}]);

angular.module('yodacore').directive('yodaUp', [function () {
  return function (scope, element, attrs) {
    element.bind("keydown keypress", function (event) {
      if(event.which === 38) {
        scope.$apply(function (){
          scope.$eval(attrs.yodaUp);
        });
      }
    });
  };
}]);

/**
 * @desc to detect if user pauses while typing and fire event, pause typing
 */
angular.module('yodacore').directive('yodaPauseTyping', [function () {
  return function (scope, element, attrs) {
    var typeTimeout;
    var time = parseFloat(attrs['yodaPauseTyping']); //in second 

    element.bind("keydown keypress", function (event) {
      if (typeTimeout != undefined) clearTimeout(typeTimeout);
      typeTimeout = setTimeout(callServerScript, time * 1000);
      function callServerScript() {
        scope.$emit('typing-pause');
      }
    });
  };
}]);

angular.module('yodacore').directive('yodaDown', [function () {
  return function (scope, element, attrs) {
    element.bind("keydown keypress", function (event) {
      if(event.which === 40) {
        if(event.type === 'keypress') return;   // 40 is open paren inside a keypress
        scope.$apply(function (){
          scope.$eval(attrs.yodaDown);
        });
      }
    });
  };
}]);

angular.module('yodacore').directive('contenteditable', ['$sce', function($sce) {
  return {
    restrict: 'A', // only activate on element attribute
    require: '?ngModel', // get a hold of NgModelController
    link: function(scope, element, attrs, ngModel) {
      if (!ngModel) return; // do nothing if no ng-model

      // Specify how UI should be updated
      ngModel.$render = function() {
        element.html(ngModel.$viewValue || '');
      };

      // Listen for change events to enable binding
      element.on('blur keyup change', function() {
        scope.$evalAsync(read);
      });
      ngModel.$render();

      // Write data to the model
      function read() {
        var html = element.html();
        // When we clear the content editable the browser leaves a <br> behind
        // If strip-br attribute is provided then we strip this out
        if ( attrs.stripBr && html == '<br>' ) {
          html = '';
        }
        ngModel.$setViewValue(html);
      }
    }
  };
}]);

angular.module('yodacore').directive('focusMe', ['$timeout', '$parse',function($timeout, $parse) {
  function setCaret(el, pos) {
    if(pos === '0' || pos === 0) return ;
    var range = document.createRange();
    var sel = window.getSelection();
    range.setStart(el.childNodes[0], pos > el.childNodes[0].length ? el.childNodes[0].length : pos);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }
  
  return {
    //scope: true,   // optionally create a child scope
    link: function(scope, element, attrs) {
      var model = $parse(attrs.focusMe);
      scope.$watch(model, function(value) {
        if(value === true) { 
          $timeout(function() {
            if(attrs['focusMeCaretPosition']) {
              setCaret(element[0], attrs['focusMeCaretPosition']);
            }
            element[0].focus(); 
          });
        }
      });
    }
  };
}]);

angular.module('yodacore').directive('popoverToggle', ['$timeout', function($timeout) {
  return {
    scope: true,
    link: function(scope, element, attrs) {
      scope.toggle = function() {
        $timeout(function() {
          element.triggerHandler(scope.openned ? 'close' : 'open');
          scope.openned = !scope.openned;
        });
      };
      return element.on('click', scope.toggle);
    }
  };
}]);


angular.module('yodacore').directive('movable', ['$document', function($document) {

	return {
    link: function($scope, $element, $attrs) {
      var elementOriginalTop = 0;
      var clickedY = 0;
      var intervalDistance = parseFloat($attrs['movableInterval']);

      $element.on('mousedown', function(event) {
        event.preventDefault();

        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
        clickedY = event.clientY;
        elementOriginalTop = parseInt($element.css('top').slice(0,-2), 10);
      });

      function mousemove(event) {
        var y = event.clientY - clickedY;
        var top = intervalDistance ? ((Math.round((elementOriginalTop + y)/intervalDistance)) * intervalDistance) : elementOriginalTop + y;

        $element.css({
          top: top + 'px'
        });

      }

      function mouseup() {
        $document.unbind('mousemove', mousemove);
        $document.unbind('mouseup', mouseup);
        $scope.$emit('move-done', $scope.itemData.item, {
          top: parseFloat($element.css('top'), 10),
          height: parseFloat($element.css('height'), 10),
        });
      }
    }
	};
}]);


angular.module('yodacore').directive('resizable', ['$document', function($document) {

	return {
    link: function($scope, $element, $attrs) {
      var $resizer = angular.element('<div class="resizer hidden" > \
                    <div class="rszr-icon-hover">&nbsp; </div>  \
                  </div>');

      var $resizerIcon = $resizer.children().eq(0);
      var elementOriginalHeight = 0;

      var clickedY = 0;
      var intervalDistance = parseFloat($attrs['movableInterval']);
      
      $element.append($resizer);
      $element.on('mouseover', function(event) {
        $resizer.toggleClass('hidden');
      });

      $element.on('mouseout', function(event) {
        $resizer.toggleClass('hidden');
      });

      $resizer.on('mousedown', function(event) {
        event.preventDefault();
        event.stopPropagation();

        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
        clickedY = event.clientY;
        elementOriginalHeight = parseInt($element.css('height').slice(0,-2), 10);
      });

      function mousemove(event) {
        var y = event.clientY - clickedY;
        // console.log(y + elementOriginalHeight);
        var height = intervalDistance ? ((Math.round((elementOriginalHeight + y)/intervalDistance)) * intervalDistance) : elementOriginalHeight + y;
        (y + elementOriginalHeight) > 0 && $element.css({
          height: height  + 'px'
        });
      }

      function mouseup() {
        $document.unbind('mousemove', mousemove);
        $document.unbind('mouseup', mouseup);
        $scope.$emit('resize-done', $scope.itemData.item, {
          top: parseFloat($element.css('top'), 10),
          height: parseFloat($element.css('height'), 10),
        });
      }
    }
	};
}]);
