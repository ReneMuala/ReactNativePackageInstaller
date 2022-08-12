const { error } = require('console');

function System() {
    return {
        shell : {
            childProcess : require('child_process'),
            run(command, printMethod = console.log){
               return this.childProcess.execSync(command).toString();
            },
            runToStdout(command, printMethod = console.log){
                this.childProcess.execSync(command, {stdio: [0,1,2]});
            }
        },
        io : {
            sprint() {
                let buffer = "";
                argc = 1;
                for(let i = 0 ; i < arguments[0].length ; i++){
                    if(arguments[0][i] == '%') {
                        buffer += arguments[argc];
                        argc++;
                    } else {
                        buffer += arguments[0][i];
                    }
                }
                return buffer;
            },
            print() {
                // console.log(this.sprint.apply(arguments));
                let buffer = "";
                argc = 1;
                for(let i = 0 ; i < arguments[0].length ; i++){
                    if(arguments[0][i] == '%') {
                        buffer += arguments[argc];
                        argc++;
                    } else {
                        buffer += arguments[0][i];
                    }
                }
                console.log(buffer);
            },
            arguments(index) {
                return process.argv[index]
            }
        },
        file : {
            fs : require('fs'),
            exists(filename){
                return this.fs.existsSync(filename);
            }
            ,
            read(filename) {
                return this.fs.readFileSync(filename);
            },
            readJson(filename) {
                return JSON.parse(this.read(filename));
            },
            write(filename, data){
                this.fs.writeFileSync(filename,data);
            },
            writeJson(filename, jsonData){
                let data = JSON.stringify(jsonData, null, " ");
                this.write(filename, data);
            },
            backup(filename){
                let data = this.read(filename);
                let backupFilename = filename;
                do {
                    backupFilename = filename+"."+(String(Math.random()).substring(2))+".backup";
                } while(this.exists(backupFilename));
                this.write(backupFilename, data);
                return backupFilename;
            }
        }
    }            
}

function PackageInstaller(Sys) {
    return {
        filesToBackup: ['package-lock.json','package.json'],
        reactNativeDesiredVersion : "0.68",
        printStatus(packageName, projectName, reactNativeVersion){
            Sys.io.print('** PackageInstaller(Written for React native %) **', this.reactNativeDesiredVersion);
            Sys.io.print('> Project name: %', projectName);
            Sys.io.print('> Package to install: %', packageName);
            if(!reactNativeVersion.match(this.reactNativeDesiredVersion+".*")){
                Sys.io.print('Warning, this script was written to work with React Native version %.', packageName);
            }
        },
        listInstalledPackages(){
            Sys.io.print('> Installed packages:');
            let output = Sys.shell.run(Sys.io.sprint('npm --json list'));
            if(!output){
                Sys.io.print("Unable to list project packages");
            } else {
                let jsonParsedOutput = JSON.parse(output);
                if(jsonParsedOutput){
                    let jsonParsedOutputKeys = Object.keys(jsonParsedOutput.dependencies);
                    for(let i = 0 ; i < jsonParsedOutputKeys.length ; i++){
                        Sys.io.print('- package: %, version: %', jsonParsedOutputKeys[i], jsonParsedOutput.dependencies[jsonParsedOutputKeys[i]].version);
                    }
                }
            }
        },
        getPackageVersion(packageName){
            Sys.io.print('> Getting package % latest version', packageName);
            let version = Sys.shell.run(Sys.io.sprint('npm view % version', packageName));
            if(!version){
                Sys.io.print("Unable get package version using npm.");
            } else {
                return version.trim();
            }
        },checkPackageInDependencies(packageName, packageVersion){
            let output = Sys.shell.run(Sys.io.sprint('npm --json list'));
            if(!output){
                Sys.io.print("Unable to get project packages");
            } else {
                let jsonParsedOutput = JSON.parse(output);
                if(jsonParsedOutput){
                    let jsonParsedOutputKeys = Object.keys(jsonParsedOutput.dependencies);
                    for(let i = 0 ; i < jsonParsedOutputKeys.length ; i++){
                        if(jsonParsedOutputKeys[i] == packageName){
                            if(jsonParsedOutput.dependencies[jsonParsedOutputKeys[i]].version == packageVersion){
                                Sys.io.print('** The package % is already installed and updated(%)', packageName, packageVersion);
                                return true;
                            } else {
                                Sys.io.print('** The package % will be be updated from version(%) to(%)', packageName, jsonParsedOutput.dependencies[jsonParsedOutputKeys[i]].version ,  packageVersion);
                                return false;
                            }
                        }
                    } 
                    Sys.io.print('** The package % will be installed(%)', packageName, packageVersion);
                    return false;
                }
            }
        },
        runInstallScript(packageName) {
            Sys.io.print('> Installing package %', packageName);
            Sys.shell.runToStdout(Sys.io.sprint('npm install %', packageName));
        },
        backupFiles(){
            for(let i = 0 ; i < this.filesToBackup.length; i++){
                Sys.io.print('- file % was backed up to %', this.filesToBackup[i], Sys.file.backup(this.filesToBackup[i]));
            }
        },
        updatePackageJson(packageJson, packageName, packageVersion){
            let filename = 'package.json';
            Sys.io.print('> Updating file % in the project adding "%":"%" in dependencies', filename, packageName, packageVersion);
            packageJson.dependencies[packageName] = String(packageVersion);
            let newPackageJsonString = JSON.stringify(packageJson, null, " ");
            Sys.io.print("** after the update it will look like this: %", newPackageJsonString);
            Sys.file.write(filename, newPackageJsonString);
        }, 
        printHelp(packageName){
            Sys.io.print("*** Done! to undo the operation copy the backup files: ");
            for(let i = 0 ; i < this.filesToBackup.length ; i++){
                Sys.io.print('- %.RANDOM_NUMBER.backup to %', this.filesToBackup[i], this.filesToBackup[i]);
            }
            Sys.io.print("*** and then remove the folder: node_modules/% if if exists.", packageName);
            Sys.io.print("*** Now, run npm start --reset-cache to continue developing...")
        },
        install(packageName) {
            try {
                let packageJson = Sys.file.readJson('package.json');
                this.printStatus(packageName, packageJson.name, packageJson.dependencies['react-native']);
                let packageVersion = this.getPackageVersion(packageName);
                if(packageVersion && packageVersion.match("[\d.]+")){
                    if(!this.checkPackageInDependencies(packageName, packageVersion)){
                        this.backupFiles();
                        this.runInstallScript(packageName);
                        this.listInstalledPackages();
                        this.printHelp(packageName);
                    }
                } else {
                    throw error(Sys.io.sprint('Invalid package version returned by npm. Are you sure that the package % exists?', packageName));
                }
            } catch(err){
                Sys.io.print("Unable to install package %, Error: \'%'. Are you sure that the package % exists?",packageName, err, packageName);
            }            
        }
    }
}

let Sys = new System();

let packageInstaller = new PackageInstaller(Sys);

let packageName = Sys.io.arguments(2);

if(packageName){
    packageInstaller.install(packageName);
} else {
    Sys.io.print("Usage: node PackageInstaller.js package-to-install", Sys.io.arguments(1));
}
