#face-finder-api

**Note: as of 30/9/19 this is no longer maintained as a separate repository
and has been subsumed within the main face-finder repository.**

This is a very simple back-end for Face-finder which supports the following:
 - register (name, email and password)
 - sign in
 - keep a running total of the number of images analysed
 - CORS proxy to enable images from servers with CORS limitations to be analysed

The user data is stored in two tables in PostgreSQL (login and users).

For now, it does not support:
 - account deletion
 - name, email or password changes
