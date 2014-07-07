'use strict';

var module = angular.module('andreax79.partial-date', [])

module.constant('partialDateInputConfig', {
    dayText: 'Day',
    monthText: 'Month',
    yearText: 'Year',
});

module.directive('partialDateInput', [ '$locale', 'partialDateInputConfig', function ($locale, partialDateInputConfig) {
    return {
        restrict: 'A',
        replace: true,
        require: 'ngModel',
        scope: {
            model: '=ngModel',
            dayText: '@',
            monthText: '@',
            yearText: '@'
        },
        controller: [ '$scope', '$locale', function ($scope, $locale) {
            // validate that the date
            $scope.validate = function () {
                if ($scope.day && ($scope.month === 0 || $scope.month) && $scope.year) {
                    var days = new Date($scope.year, $scope.month+1, 0).getDate();
                    if ($scope.day > days) {
                        $scope.day = days;
                    } else if ($scope.day <= 0) {
                        $scope.day = 1;
                    }
                }
                if ($scope.day && parseInt($scope.day) != $scope.day) {
                    $scope.day = null;
                }
                if ($scope.year && parseInt($scope.year) != $scope.year) {
                    $scope.year = null;
                }
                $scope.date.day = $scope.day || null;
                $scope.date.month = ($scope.month === 0 || ($scope.month >= 1 && $scope.month <= 11)) ? $scope.month : null;
                $scope.date.year = $scope.year || null;
            };
            // get labels
            $scope.getText = function (key) {
                return $scope[key + 'Text'] || partialDateInputConfig[key + 'Text'];
            };
            // set up the month name array
            var datetime = $locale.DATETIME_FORMATS;
            $scope.months = [{ value: '', name : '' }];
            angular.forEach(datetime.MONTH, function(month, key) {
                $scope.months.push({ value: key, name: month });
            });
            // model
            $scope.date = { day: '', month: '', year: ''};
            $scope.$watch('model', function (date) {
                $scope.date = date || {};
                $scope.day = (date.day >= 1 && date.day <= 31) ? date.day : null;
                $scope.month = (date.month === 0 || (date.month >= 1 && date.month <= 11)) ? date.month : '';
                $scope.year = date.year;
            }, true);
        }],
        link: function(scope, element, attrs, ctrl) {
            scope.$parent.$watch(attrs.ngDisabled, function(ngDisabled) {
                scope.ngDisabled = ngDisabled;
            });
        },
        template:
            '<div class="form-inline partial-date-input">' +
            '  <div class="form-group col-xs-3 partial-date-day">' +
            '    <label class="sr-only" for="day">{{ getText("day") }}</label>' +
            '    <input type="text" name="day" data-ng-model="day" placeholder="{{ getText(\'day\'); }}" class="form-control" ng-change="validate()" ng-disabled="ngDisabled"></input>' +
            '  </div>' +
            '  <div class="form-group col-xs-6 partial-date-month">' +
            '    <label class="sr-only" for="month">{{ getText("month") }}</label>' +
            '    <select name="month" data-ng-model="month" placeholder="{{ getText(\'month\'); }}" class="form-control" ng-options="month.value as month.name for month in months" ng-change="validate()" ng-disabled="ngDisabled"></select>' +
            '  </div>' +
            '  <div class="form-group col-xs-3 partial-date-year">' +
            '    <label class="sr-only" for="year">{{ getText("year") }}</label>' +
            '    <input type="text" name="year" data-ng-model="year" placeholder="{{ getText(\'year\'); }}" class="form-control" ng-change="validate()" ng-disabled="ngDisabled"></input>' +
            '  </div>' +
            '</div>'
    };
}]);

function padNumber(num, digits, trim) {
    var neg = '';
    if (num < 0) {
        neg =  '-';
        num = -num;
    }
    num = '' + num;
    while(num.length < digits) num = '0' + num;
    if (trim)
        num = num.substr(num.length - digits);
    return neg + num;
}


function dateGetter(name, size, trim, delta) {
    return function(date) {
        var value = date[name];
        if (delta === undefined) {
            delta = 0;
        }
        if (value === undefined || value === null) {
            return '';
        } else {
            return padNumber(value + delta, size, trim);
        }
    };
}

function dateStrGetter(name, shortForm) {
    return function(date, formats) {
        var value = date[name];
        var get = angular.uppercase(shortForm ? ('SHORT' + name) : name);
        return formats[get][value] || '';
    };
}

function emptyGetter() {
    return function() {
        return '';
    };
}

var DATE_FORMATS = {
    yyyy: dateGetter('year', 4),
    yy: dateGetter('year', 2, true),
    y: dateGetter('year', 1),
    MMMM: dateStrGetter('month'),
    MMM: dateStrGetter('month', true),
    MM: dateGetter('month', 2, 1),
    M: dateGetter('month', 1, 1, 1),
    dd: dateGetter('day', 2),
    d: dateGetter('day', 1),
    EEEE: emptyGetter(),
    EEE: emptyGetter(),
    ww: emptyGetter(),
    w: emptyGetter()
};

var DATE_FORMATS_SPLIT = /((?:[^yMdHhmsaZEw']+)|(?:'(?:[^']|'')*')|(?:E+|y+|M+|d+|H+|h+|m+|s+|a|Z|w+))(.*)/;

module.filter('incompleteDate', [ '$locale', function($locale) {
    return function(date, format) {
        var text = '',
        parts = [],
        fn, match;

        format = format || 'mediumDate';
        format = $locale.DATETIME_FORMATS[format] || format;

        while(format) {
            match = DATE_FORMATS_SPLIT.exec(format);
            if (match) {
                parts = parts.concat(match.slice(1));
                format = parts.pop();
            } else {
                parts.push(format);
                format = null;
            }
        }

        angular.forEach(parts, function(value){
            fn = DATE_FORMATS[value];
            text += fn ? fn(date, $locale.DATETIME_FORMATS)
                : value.replace(/(^'|'$)/g, '').replace(/''/g, "'");
        });
        text = text.replace(/^[ :\t,\\\/-]+|[ :\t,\\\/-]+$/gm,'');

        return text;
    };
}]);

