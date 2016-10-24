# Text-Transmitter (TTM)

Text based Twitter client powered by electron.js

TTM has a fake-console interface you can use with both a keyboard and a mouse.

*It's my graduation work, so not actually meant for a daily use.*

# Installation

Download the file from Releases, extract the file and execute `Text-Transmitter.exe` (Windows) or `Text-Transmitter` (Linux).

# How to Setup Your Twitter Account

1. Go to **[https://apps.twitter.com](https://apps.twitter.com)**.
2. Click '**Create New App**'.
3. Fill up **Application Details**. Name should be unique (it checks duplicated name through all the apps created in this site).
4. Agree the **Developer Agreement**, and click '**Create your Twitter application**'.
5. Now you have made your app on this site. Go to '**Permissions**' Tab, and change '**Access Level**' to 'Read, Write and Access direct messages' so you can access direct messages in the app. Click 'Update Settings'.
6. Go to '**Keys and Access Tokens**' tab. In **Your Access Token**, click '**Create my access token**'.
7. Now you have your **Consumer Key** and Secret, **Access Token** and secret. In the app folder, go to **`resources/app/js`** and open **`_twit.js`**.
8. Fill in your tokens and secrets in the variable named **`ck, cks, at, ats`**, wrapped in double quotes. Then save the file.

# Available Commands

Press ':' to open the command buffer. You can also open the buffer by pressing shortcuts for some commands, which is shown after command names below.  
Type commands end press 'Enter' to execute. If there's any error, the buffer won't close.  
Press 'Esc' to close buffer.

Press 'Ctrl-R' to reload at any time.

In most cases the commands are case-sensitive.

## Window setting

### resize
```
resize width height
```
(rs for short) Resize the window.

## Tweeting

### compose `i`
```
compose message
```
Compose new tweet. Currently there's no support for a multi-line tweet. 

### reply `o`
```
reply tweetIdToReply message
```
Reply to a tweet with id of tweetIdToReply. The id can be obtained by selecting a tweet you want to reply to and pressing 'o'.

### quote `O`
(command pattern is same as 'compose')

Pressing 'O' will open a buffer for composing and will include the address of the current selected tweet. Sending the tweet will include the address as a quote.

### retweet `R`
```
retweet( id)
```
Retweet a tweet with the id. Omit id to retweet currently selected tweet. 

### del `D`
```
del( id)
```
Delete a tweet with the id. Omit id to delete currently selected tweet. You can undo a retweet by trying to delete your retweeted status.

## Tab Behavior

### add
```
add [nameOfTab(,URI)]( parameters)
```
(a for short) Add new tab. You can specify the URI (the format should be an array: `['name','URI']`, or skip URI and just choose one from below as a nameOfTab:

- mention
- user
- home
- rted (your retweeted tweets)
- dmsent
- search
- dm
- l (for list)

If you know what parameters are, you can add them as a form of an object.

Type 'add user', 'add l', 'add search' and press 'Enter' to change to command to 'adduser', 'addlist', 'addsearch' respectively, which are explained below.

### addlist
```
addlist screenName list-slug
```
(al for short) Add a list with the list-slug, made by screenName. screenName is the twitter username, list-slug is the list name in lower-cases-alphabet-and-hyphens.

### adduser
```
adduser screenName
```
(au for short) Add a tab of specific user tweets. You can add one by clicking the user name in a tweet, shown as  bold characters.

### addsearch
```
addsearch query
```
(as for short) Add a tab of specific search query.

### remove
```
remove nameOfTab
```
(rm for short) Remove a tab with the name. To quickly close a tab, click 'X' at the end of tab list, which resides in the top-right of the screen.

### rename
```
rename nameOfTab nameToApply
```
(rn for short) Rename a tab from nameOfTab to nameToApply.

### reorder
```
reorder oldIndex newIndex swap
```
(ro for short) Move a tab in oldIndex-th position to newIndex-th position. If swap is true, only swap the two position. Otherwise(give no swap argument) the oldIndex-th tab will be picked up and inserted into the newIndex-th position. 

### update `u` `U`
```
update( tabName direction)
```
(u for short) Update current tab of tweets. Direction can be either 1 or -1, meaning 'fetch new tweets' or 'fetch old tweets'. Omit parameters to update current tab to fetch new tweets. 

Shortcut key `u` fetches new tweets, and `U` fetches old tweets.

### save
```
save( fileName)
```
(w for short) Save current state, including tab names and orders and the window size. By default the state will be saved in `resources/app/state/state.json`, and you can specify the name for json.

### load
```
load( fileName)
```
(o for short) Load the saved state. If you specify the file name, load the state saved in that file. 