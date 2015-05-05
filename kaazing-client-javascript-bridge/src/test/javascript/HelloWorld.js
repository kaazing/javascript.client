/**
 * Copyright (c) 2007-2013, Kaazing Corporation. All rights reserved.
 */

HelloWorldTest = AsyncTestCase("HelloWorldTest");

/*
 * Hello World Test
 */
HelloWorldTest.prototype.test1 = addTest('HelloWorldTest1', function() {

    log("HELLO WORLD");

    if (true == false) {
        failTest();
    }

    if (2+2 == 4) {
        completeTest();
    }
});
