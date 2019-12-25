# seo-reporter
A web-app that examines websites and creates a report regarding their SEO optimizations

**Attention. Windows 10 only compatibility**

# How to use:

Run seo-reporter.exe that placed in ./dist/dist.zip (allow to run untrusted app if necessary. You'll see a popup) You should see in an opened terminal the msg about runned server if everything ok go to http://127.0.0.1:5000 in your browser (UI tested in Chrome only) and you can see the app insert an URL to investigate (add another if necessary)

 - click Explore button    (_you will see a result of the explored data_)

 - click on Detail button to expand SEO structure You will see SEO structure of the explored website

 - click on Detail button in the tag row to see it's source

# manual build
If you want to build the executable file by yourself you need to install python 3.7 and all dependencies  from requirements.
Then you need to install pyinstaller and run it via build.spec file. `pyinstaller ./build.spec`
