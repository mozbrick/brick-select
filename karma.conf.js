module.exports = function(config){
  config.set({
    basePath: '.',

    files : [
      'bower_components/platform/platform.js',
      'test/browser.js',
      {pattern: 'src/*', watched: true, included: false, served: true}
    ],

    autoWatch : true,

    autoWatchBatchDelay: 750, // Try not to race with gulp build

    frameworks: ['mocha', 'chai'],

    browsers : ['Firefox', 'Chrome'],

    reporters: ['spec'],

    plugins : [
      'karma-firefox-launcher',
      'karma-chrome-launcher',
      'karma-mocha',
      'karma-chai',
      'karma-spec-reporter'
    ],
  });
};
