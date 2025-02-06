## copy from
source: https://github.com/obsidianmd/obsidian-clipper

## github

### create remote repo

```sh
cd Utils/jce-clipper

xgit -e makeRepo -n jce-clipper -u jnjsoftone -d "Jnjsoft Chrome Extension For Obsidian Web Clipper(Fork from obsidian-clipper)"
```

### copy remote repo

```sh
cd Utils/jce-clipper

xgit -e copyRepo -n jce-clipper -u jnjsoftone
```

## publish

```sh
cd Utils/jce-clipper

# [syntax] ./publish.sh [patch|minor|major] -m "[commit message]"
# default: patch, "chore: build for publish"
./publish.sh -m "test commit"
```
