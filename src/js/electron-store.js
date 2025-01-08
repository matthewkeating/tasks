// There are incompatibility issues between the official electron-store and Electron Forge. 
// This mimics the functionality of electron-store to work around the compatibility issues.

import { app } from 'electron';
import path from 'path';
import fs from 'fs';

export class Store {
  get(key) {
    const configPath = path.join(app.getPath('userData'), 'config.json');
    if (!fs.existsSync(configPath)) {
      fs.writeFileSync(configPath, '{}');
    }
    const configJson = fs.readFileSync(configPath, 'utf8');
    const configJs = JSON.parse(configJson);
    return configJs[key];
  }

  set(key, value) {
    const configPath = path.join(app.getPath('userData'), 'config.json');
    if (!fs.existsSync(configPath)) {
      fs.writeFileSync(configPath, '{}');
    }
    const configJson = fs.readFileSync(configPath, 'utf8');
    const configJs = JSON.parse(configJson);
    configJs[key] = value;
    fs.writeFileSync(configPath, JSON.stringify(configJs));
  }

  delete(key) {
    const configPath = path.join(app.getPath('userData'), 'config.json');
    if (!fs.existsSync(configPath)) {
      fs.writeFileSync(configPath, '{}');
    }
    const configJson = fs.readFileSync(configPath, 'utf8');
    const configJs = JSON.parse(configJson);
    delete configJs[key];
    fs.writeFileSync(configPath, JSON.stringify(configJs));
  }

  deleteAll() {
    const configPath = path.join(app.getPath('userData'), 'config.json');
    if (!fs.existsSync(configPath)) {
      return;
    }
    fs.unlinkSync(configPath);
  }
}