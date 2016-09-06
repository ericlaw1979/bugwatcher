# crBug Watcher
Watches the current bug on bugs.chromium.org for changes while you're editing it, so you don't waste time investigating issues that have already had progress.

Port to call MonoRail API:
https://chromium.googlesource.com/infra/infra/+/master/appengine/monorail/doc/api.md

https://apis-explorer.appspot.com/apis-explorer/?base=https://monorail-prod.appspot.com/_ah/api#p/monorail/v1/monorail.issues.get?projectId=chromium&issueId=642089&fields=updated&_h=2&
GET https://monorail-prod.appspot.com/_ah/api/monorail/v1/projects/chromium/issues/642089?fields=updated

TODO: Figure out OAUTH
