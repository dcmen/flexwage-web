var Service = require('node-windows').Service;
     // Create a new service object
     var svc = new Service({
          name:'[Test][Web Admin] CashD NodeJS service',
          description: '[Test][Web Admin] CashD NodeJS service',
          script: require('path').join(__dirname,'bin/www')
     });
     
     // Listen for the "install" event, which indicates the
     // process is available as a service.
     if (svc.exists) {
          svc.on('restart',function(){
               svc.restart();
          });
          svc.restart();
     } else {
          svc.on('install',function(){
               svc.start();
          });
          svc.install();
     }