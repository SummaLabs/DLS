'use strict';
module.exports = function (grunt) {
    var staticPath = 'app/frontend/';
    var globalConfig = {
        icons: staticPath + 'assets/icons',
        styles: staticPath + 'assets/css',
        lib: staticPath + 'lib',
        node_modules_path: 'node_modules',
        bower_components_path: 'bower_components'
    };
    grunt.initConfig({
        globalConfig: globalConfig,
        pkg: grunt.file.readJSON('package.json'),
        copy: {
            main: {
                files: [{
                        expand: true,
                        flatten: true,
                        src: '<%= globalConfig.node_modules_path %>/angular/angular.js',
                        dest: '<%= globalConfig.lib %>/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: '<%= globalConfig.node_modules_path %>/angular-animate/angular-animate.js',
                        dest: '<%= globalConfig.lib %>/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: '<%= globalConfig.node_modules_path %>/angular-aria/angular-aria.js',
                        dest: '<%= globalConfig.lib %>/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: '<%= globalConfig.node_modules_path %>/angular-material/angular-material.js',
                        dest: '<%= globalConfig.lib %>/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: '<%= globalConfig.node_modules_path %>/angular-messages/angular-messages.js',
                        dest: '<%= globalConfig.lib %>/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: '<%= globalConfig.node_modules_path %>/angular-material/angular-material.css',
                        dest: '<%= globalConfig.styles %>/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: '<%= globalConfig.node_modules_path %>/d3/build/d3.min.js',
                        dest: '<%= globalConfig.lib %>/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: '<%= globalConfig.bower_components_path %>/angular-translate/angular-translate.min.js',
                        dest: '<%= globalConfig.lib %>/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: '<%= globalConfig.bower_components_path %>/jquery/dist/jquery.min.js',
                        dest: '<%= globalConfig.lib %>/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: '<%= globalConfig.bower_components_path %>/bootstrap/dist/js/bootstrap.min.js',
                        dest: '<%= globalConfig.lib %>/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: '<%= globalConfig.bower_components_path %>/ng-file-upload/ng-file-upload.js',
                        dest: '<%= globalConfig.lib %>/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: '<%= globalConfig.bower_components_path %>/angular-filemanager/dist/angular-filemanager.min.js',
                        dest: '<%= globalConfig.lib %>/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: '<%= globalConfig.bower_components_path %>/angular-filemanager/dist/angular-filemanager.min.css',
                        dest: '<%= globalConfig.styles %>/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: '<%= globalConfig.bower_components_path %>/bootswatch/paper/bootstrap.min.css',
                        dest: '<%= globalConfig.styles %>/',
                        filter: 'isFile'
                    }
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.registerTask('default', ['copy']);
};