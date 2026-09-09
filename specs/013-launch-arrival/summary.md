Launching this app from the platform always failed. The platform opens it on a web address
carrying a pass, and the app refused every time, saying it had been opened from outside the
platform — without asking the platform anything.

Two parts of the startup code both wanted that pass. The first read it and immediately wiped it
out of the address bar, which is the right thing to do once it has been checked. The second was
the part that checks it, and by the time it looked, the pass was gone.

Now the part that checks it goes first, and the address bar is cleaned by the redirect that
follows instead. Refreshing inside the app still keeps you signed in, and a pass the platform
rejects still leaves nothing stored.

Every existing test passed throughout, because none started the app the way it really
starts. One now does.
