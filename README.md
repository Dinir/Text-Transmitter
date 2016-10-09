# Text-Transmitter

Text based Twitter client powered by electron.js 

# How to Setup Your Twitter Account

1. Go to **[https://apps.twitter.com](https://apps.twitter.com)**.
2. Click '**Create New App**'.
3. Fill up **Application Details**. Name should be unique (it checks duplicated name through all the apps created in this site).
4. Agree the **Developer Agreement**, and click '**Create your Twitter application**'.

5. Now you have made your app on this site. Go to '**Permissions**' Tab, and change '**Access Level**' to 'Read, Write and Access direct messages' so you can access direct messages in the app. Click 'Update Settings'.
7. Go to '**Keys and Access Tokens**' tab. In **Your Access Token**, click '**Create my access token**'.
8. Now you have your **Consumer Key** and Secret, **Access Token** and secret. In the app folder, go to **`resources/app/js`** and open **`_twit.js`**.
9. Fill in your tokens and secrets in the variable named **`ck, cks, at, ats`**, wrapped in double quotes. Then save the file.