# ReactNativePackageInstaller
A script to help installing react native components.

# The problem
I recently had difficulties installing react components, nothing that an update wouldn't solve. However, before that I decided to write this script that fixed the problem.

I advise you to use it if you are having similar problems.

# How to use

Copy the PackageInstaller.js file to your project directory and run node PackageInstaller.js package-name

_During the installation of the package, some main files will be modified, for these files, a backup copy will be created._

# Example

```
$ node PackageInstaller.js test
```

```
** PackageInstaller(Written for React native 0.68) **
> Project name: basics
> Package to install: test
> Getting package test latest version
** The package test will be installed(3.2.1)
- file package-lock.json was backed up to package-lock.json.7190903864305884.backup
- file package.json was backed up to package.json.33303266423105593.backup
> Installing package test

added 28 packages, and audited 1182 packages in 14s

.....

> Installed packages:
- package: @babel/core, version: 7.18.9
- package: expo-status-bar, version: 1.3.0
- package: expo, version: 45.0.6
- package: npm-programatic, version: 1.0.0
- package: react-dom, version: 17.0.2
- package: react-native-camera, version: 4.2.1
- package: react-native-vision-camera, version: 2.14.0
- package: react-native-web, version: 0.17.7
- package: react-native, version: 0.68.2
- package: react, version: 17.0.2
- package: test, version: 3.2.1
*** Done! to undo the operation copy the backup files: 
- package-lock.json.RANDOM_NUMBER.backup to package-lock.json
- package.json.RANDOM_NUMBER.backup to package.json
*** and then remove the folder: node_modules/test if if exists.
*** Now, run npm start --reset-cache to continue developing...
```
