module.exports = function(grunt) {
  "use strict";

  grunt.initConfig({
    pkg: grunt.file.readJSON( "package.json" ),
    jshint: {
      source: {
        src: [ "facebook.js" ]
      },
      grunt: {
        src: [ "Gruntfile.js" ]
      }
    }
  });

  require( "matchdep" ).filterDev( "grunt-*" ).forEach( grunt.loadNpmTasks );

  grunt.registerTask( "default", ["jshint"]);

};

