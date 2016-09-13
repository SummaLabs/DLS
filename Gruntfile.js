'use strict';
module.exports = function (grunt) {
    var staticPath = 'app/frontend/';
    var inpPathExt = 'ext_modules';
    var outPathExt = staticPath + 'lib';
    var globalConfig = {
        icons: staticPath + 'assets/icons',
        styles: staticPath + 'assets/css',
        lib: staticPath + 'lib',
        node_modules_path: 'node_modules'
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
                        src: '<%= globalConfig.node_modules_path %>/angular-ui-router/release/angular-ui-router.min.js',
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
                    // ***** FILE MANAGER
                    {
                        expand: true,
                        flatten: true,
                        src: '<%= globalConfig.node_modules_path %>/angular-translate/dist/angular-translate.min.js',
                        dest: '<%= globalConfig.lib %>/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: '<%= globalConfig.node_modules_path %>/ng-file-upload/dist/ng-file-upload.min.js',
                        dest: '<%= globalConfig.lib %>/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: '<%= globalConfig.node_modules_path %>/jquery/dist/jquery.min.js',
                        dest: '<%= globalConfig.lib %>/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: '<%= globalConfig.node_modules_path %>/bootstrap/dist/js/bootstrap.min.js',
                        dest: '<%= globalConfig.lib %>/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: '<%= globalConfig.node_modules_path %>/bootstrap/dist/css/bootstrap.min.css',
                        dest: '<%= globalConfig.styles %>/',
                        filter: 'isFile'
                    },
                    // ***** END

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
                        src: '<%= globalConfig.node_modules_path %>/angular-google-chart/ng-google-chart.js',
                        dest: '<%= globalConfig.lib %>/',
                        filter: 'isFile'
                    },
                    {
                        expand:  true,
                        flatten: true,
                        src: [
                            inpPathExt + '/material-angular-paging.js'
                        ],
                        dest: outPathExt
                    }
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.registerTask('default', ['copy']);
};