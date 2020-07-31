import * as FS from "fs";
import * as Path from "path";
import * as OS from "os";
import * as Process from "process";

const { remote } = window.require("electron");
const fs: typeof FS = remote.require('fs');
const path: typeof Path = remote.require('path');
const os: typeof OS = remote.require('os');
const process: typeof Process = remote.require('process');

export class Files {

  public static getHomeDir(subDir: string = null) {
    const home = os.homedir();
    if (subDir) return path.join(home, subDir);
    else return home;
  }

  public static joinPath(...paths: Array<string>) {
    return path.join(...paths);
  }

  public static exists(path: string) {
    return fs.existsSync(path);
  }

  public static getTempFile(extension: string) {
    const ext = (extension || '').toLowerCase().replace(/[^a-z0-9]*/g, '');
    const fileName = this.joinPath(this.getTempDir(), `${Date.now()}.${ext}`);
    return fileName;
  }

  public static getTempDir() {
    return this.joinPath(os.tmpdir(), 'sootnotes');
  }

  public static getDefaultAppSettingsDir() {
    if (process.env.APPDATA) {
      return process.env.APPDATA
    } else if (process.platform == 'darwin') {
      return process.env.HOME + '/Library/Preferences';
    } else {
      return process.env.HOME + '/.local/share';
    }
  }

  public static async move(fromPath: string, toPath: string) {
    return new Promise((resolve, reject) => {
      try {
        this.createDirIfNotExist(toPath);
        fs.rename(fromPath, toPath, () => {
          resolve(toPath);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  public static delete(filePath: string) {
    fs.unlinkSync(filePath);
  }

  public static createDir(path: string, errorIfExists: boolean = false) {
    if (fs.existsSync(path)) {
      if (errorIfExists) {
        throw new Error(`Directory ${path} already exists`);
      }
    } else {
      fs.mkdirSync(path, { recursive: true });
    }
  }

  public static createDirIfNotExist(fileName: string) {
    if (!this.exists(fileName)) {
      const dirName = path.dirname(fileName);
      if (!this.exists(dirName)) {
        this.createDir(dirName);
      }
    }
  }

  // Create or append to text file
  public static async appendText(textFileName: string, text: string): Promise<void> {
    this.createDirIfNotExist(textFileName);
    return new Promise((resolve, reject) => {
      try {
        fs.appendFile(textFileName, text + os.EOL + os.EOL, () => { resolve(); });
      } catch (e) {
        reject(e);
      }
    })
  }

  public static async saveBuffer(fileName: string, buffer: Buffer, callback: FS.NoParamCallback) {
    this.createDirIfNotExist(fileName);
    return new Promise((resolve, reject) => {
      try {
        fs.writeFile(fileName, buffer, 'binary', () => {
          if (callback) callback(null);
          resolve();
        });
      } catch (e) {
        callback(e);
        reject(e);
      }
    });
  }

  public static saveJson(filename: string, obj: any) {
    this.createDirIfNotExist(filename);
    const json = JSON.stringify(obj);
    fs.writeFileSync(filename, json, 'utf-8');
  }

  public static openJson(filename: string): any {
    const json: string = fs.readFileSync(filename, 'utf-8');
    return JSON.parse(json);
  }
}
