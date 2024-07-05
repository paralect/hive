import appModulePath from "app-module-path";
import migrator from "migrations/migrator";
appModulePath.addPath(__dirname);
migrator.exec();
