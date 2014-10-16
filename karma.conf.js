module.exports = function(config){
  config.set({
    basePath: '.',

    files : [
      'node_modules/document-register-element/build/document-register-element.js',
      'dist/brick-select.js',
      'test/browser.js',
      {pattern: 'dist/*', watched: true, included: false, served: true}
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
