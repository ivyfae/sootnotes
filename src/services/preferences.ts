import { Files } from "./files";

const { remote } = window.require("electron");
const {Menu} = remote.require("electron");

const userPreferencesDir = Files.joinPath(Files.getDefaultAppSettingsDir(), 'SootNotes');
const userPreferencesFileName = Files.joinPath(userPreferencesDir, 'sootnotes-preferences.json');

const defaultPreferences: Preferences = {
  alwaysOnTop: true,
  manuallyNameCaptures: false,
  outputDirectory: Files.getHomeDir('Desktop'),
  notesFilename: 'notes.md',
  imageSubdirectory: 'images',
  videoSubdirectory: 'videos'
} as Preferences;

export class Preferences {
  save() {
    const p = { ...this };

    Files.saveJson(userPreferencesFileName, p);
  }

  load() {
    try {
      const loadedPreferences: Preferences = Files.openJson(userPreferencesFileName);
      this.setValues(loadedPreferences as Preferences);
      this.updateMenu();
    } catch (e) {
      this.resetToDefaults();
      this.save();
    }
  }

  setValues(changes: Preferences, save: boolean = true) {
    for (const k in changes) {
      (this as any)[k] = (changes as any)[k];
    }
    if (save) {
      this.save();
    }
  }

  resetToDefaults() {
    this.setValues(defaultPreferences);
    this.updateMenu();
    this.save();
  }

  updateMenu() {
    debugger;
    const menu = Menu.getApplicationMenu();
    for(const k in (this as any)) {
      const item = menu.getMenuItemById(k);
      if(item && item.type === 'checkbox') {
        item.checked = !!(this as any)[k];
      }
    }
  }

  alwaysOnTop: boolean;
  manuallyNameCaptures: boolean;
  outputDirectory: string;
  notesFilename: string;
  imageSubdirectory: string;
  videoSubdirectory: string;
}