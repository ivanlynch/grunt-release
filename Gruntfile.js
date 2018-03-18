module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({

    clean: {
      test: 'test/fixtures/_*.{json,md}'
    },
    nodeunit: {
      tests: 'test/release_test.js'
    },
    release: {
      options: {
        bump: true,
        file: 'package.json',
        changelog: 'CHANGELOG.md',
        changelogText: '### <%= version %> - ' + grunt.template.today('yyyy-mm-dd') + '\n',
        commitMessage: 'v<%= version %>',
        add: true,
        commit: true,
        tag: true,
        push: true,
        pushTags: true,
        npm: true,
        npmtag: false,
        github: {
          repo: 'ivanlynch/grunt-release',
          accessTokenVar: 'a35a3b56d8c7481ff39bd2bce44a491841d59bf8'
        }
      }
    },
    releaseTest: {
      options: {
        bump: true,
        add: false,
        commit: false,
        tag: false,
        push: false,
        pushTags: false,
        npm: false,
        npmtag: false,
        github: false
      },
      general: {
        options: {
          file: 'test/fixtures/_component.json',
          changelog: 'test/fixtures/_CHANGELOG.md',
          additionalFiles: ['test/fixtures/_bower.json'],
          changelogText: grunt.template.process('### <%= version %>\n', {data: {'version': '0.0.13'}}),
          commitMessage: grunt.template.process('v<%= version %>', {data: {'version': '0.0.13'}}),
          beforeRelease: ['dummyBefore', { name: 'dummyBefore', preserveFlags: true }]
        }
      },
      absolute: {
        args: ['1.2.3'],
        options: {
          file: 'test/fixtures/_bower-absolute.json'
        }
      },
      patch: {
        args: ['patch'],
        options: {
          file: 'test/fixtures/_component-patch.json'
        }
      },
      minor: {
        args: ['minor'],
        options: {
          file: 'test/fixtures/_component-minor.json'
        }
      },
      major: {
        args: ['major'],
        options: {
          file: 'test/fixtures/_component-major.json'
        }
      }
    },
    setup: {
      test: {
        files: [{
          from: 'test/fixtures/component.json',
          dest: 'test/fixtures/_component.json'
        },{
          from: 'test/fixtures/bower.json',
          dest: 'test/fixtures/_bower.json'
        },{
          from: 'test/fixtures/CHANGELOG.md',
          dest: 'test/fixtures/_CHANGELOG.md'
        },{
          from: 'test/fixtures/bower.json',
          dest: 'test/fixtures/_bower-absolute.json'
        },{
          from: 'test/fixtures/component.json',
          dest: 'test/fixtures/_component-patch.json'
        },{
          from: 'test/fixtures/component.json',
          dest: 'test/fixtures/_component-minor.json'
        },{
          from: 'test/fixtures/component.json',
          dest: 'test/fixtures/_component-major.json'
        }]
      }
    }
  });

  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  grunt.registerTask('test', [
    'clean',
    'setup',
    'releaseTest',
    'nodeunit',
    'clean'
  ]);
  
  grunt.registerTask('dummyBefore', function(){
    var flags = grunt.option.flags().join(' ');
    var filePath = 'test/fixtures/_dummyBefore.json';
    var contents = grunt.file.exists(filePath) ? grunt.file.readJSON(filePath) : { timesCalled: 0, flags: [] };
    var updatedObject = {
      timesCalled: contents.timesCalled+1,
      flags: flags.length ? contents.flags.concat(flags) : contents.flags
    };
    
    grunt.file.write(filePath, JSON.stringify(updatedObject));
  });

  grunt.registerMultiTask('setup', 'Setup test fixtures', function(){
    this.files.forEach(function(f){
      grunt.file.copy(f.from, f.dest);
    });
  });

  grunt.registerMultiTask('releaseTest', function(){
    var args = (this.data.args || []).join(':');

    grunt.option.init({ flag: 'test' });
    grunt.config.set('release', {});
    grunt.config.merge({
      release: grunt.config.data[this.name]
    });

    grunt.config.merge({
      release: grunt.config.data[this.name][this.target]
    });

    grunt.task.run('release' + (args && ':' + args));
  });
};
