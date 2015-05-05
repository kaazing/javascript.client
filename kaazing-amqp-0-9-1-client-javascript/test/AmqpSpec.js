define(['amqp-0-9-1'], function(amqpModule) {
    
    describe('Test to print out jasmine version', function() {
    it('prints jasmine version', function() {
            console.log('jasmine-version:' + jasmine.getEnv().versionString());
        });
    });

    describe('AMQP connection', function() {
        var callbacks, amqpClient;

        beforeEach(function() {

            // creating the client:
            amqpClient = new amqpModule.AmqpClient();

            callbacks = {
                openCallback: function() {
                    console.log("CONNECTION OPEN");
                    console.log("DISCONNECT");
                    amqpClient.disconnect();
                }
            };

            spyOn(callbacks, 'openCallback');
        });

        it("should invoke callback on open", function() {

            runs(function() {
                setTimeout(function() {
                    amqpClient.connect("ws://localhost:8001/amqp", "/",
                        {username:"guest", password:"guest"},
                        callbacks.openCallback);
                }, 3000);
            });

            waitsFor(function() {
              return callbacks.openCallback.calls.length === 1;
            }, "openCallback should be called", 5000);
        });

    });

});