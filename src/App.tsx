import * as React from 'react';
import { Capture } from './services/capture';
import { Files } from './services/files';
import { KEYS } from './services/keys';
import { Preferences } from './services/preferences';
import './App.css';
const  ipcRenderer  = window.require('electron').ipcRenderer;

const UserPreferences = new Preferences();
UserPreferences.load();

export type AppState = {
  outputDirectory: string;
  noteFilename: string;
  videoSubdirectory: string;
  imageSubdirectory: string;
  manuallyNameCaptures: boolean;

  isCaptureEnabled: boolean;
  isOutputDirectorySelected: boolean;
  isRecording: boolean;
  message: string;
  messageType: string;
}

export default class App extends React.Component<any, AppState> {
  constructor(props: any) {
    super(props);
    this.state = {
      outputDirectory: UserPreferences.outputDirectory,
      noteFilename: UserPreferences.notesFilename,
      videoSubdirectory: UserPreferences.videoSubdirectory,
      imageSubdirectory: UserPreferences.imageSubdirectory,
      manuallyNameCaptures: UserPreferences.manuallyNameCaptures,

      isCaptureEnabled: false,
      isOutputDirectorySelected: false,
      isRecording: false,
      message: null,
      messageType: null
    };

    this.onAddNote = this.onAddNote.bind(this);
    this.onStartRecord = this.onStartRecord.bind(this);
    this.onStopRecord = this.onStopRecord.bind(this);
    this.onScreenshot = this.onScreenshot.bind(this);
    this.onSelectSource = this.onSelectSource.bind(this);

    this.capture = new Capture(this.state.outputDirectory, this.state.noteFilename, this.state.videoSubdirectory, this.state.imageSubdirectory, this.state.manuallyNameCaptures);
    this.videoElement = React.createRef<HTMLVideoElement>();

    window.addEventListener('beforeunload', this.onClose.bind(this));

    ipcRenderer.on('notification', (ev: Event, value: string) => {
      this.notify(value);
    });

    ipcRenderer.on('menu-alwaysOnTop', (ev: Event, value: string) => {
      this.updatePreferences({'alwaysOnTop': value});
      this.notify(`Always on Top has been turned ${value ? 'on' : 'off'}`);
    });

    ipcRenderer.on('menu-outputDirectory', (ev: Event, value: string) => {
      const change = { 'outputDirectory': value };
      this.updatePreferences(change);
      this.capture.updateSettings(change);
      this.notify(`Notes, Images, and Videos will be saved to ${value}.`);
    });

    ipcRenderer.on('menu-manuallyNameCaptures', (ev: Event, value: string) => {
      const change = { 'manuallyNameCaptures': value };
      this.capture.updateSettings(change);
      this.updatePreferences(change);
      this.notify(`Manual naming of captures has been turned ${value ? 'on' : 'off'}`);
    });

    ipcRenderer.on('menu-revertAll', (ev: Event, value: string) => {
      UserPreferences.resetToDefaults();
      this.updatePreferences(UserPreferences);
      this.notify(`Manual naming of captures has been turned ${value ? 'on' : 'off'}`);
    });
  }

  public notify(message: string, type: string = 'info') {
    this.setState({ message, messageType: type });
    setTimeout(() => {
      this.setState({ message: null, messageType: null });
    }, 2000);
  }

  public updatePreferences(changes: any) {
    const s = { ...UserPreferences, ...changes };
    UserPreferences.setValues(s);
    this.setState(s);
  }

  videoElement: React.RefObject<HTMLVideoElement> = null;
  capture: Capture = null;

  onClose = (e: BeforeUnloadEvent) => {
    e.preventDefault();
    if (this.state.isRecording) {
      e.returnValue = 'false';
      this.notify('Please stop recording before exiting.');
      return 'Please stop recording before exiting.';
    }
  }

  showMessage(message: string) {
    this.setState({ message: message });
  }

  onOutputDirectorySelected = () => {
    this.updatePreferences({ isOutputDirectorySelected: true });
  }

  onSelectSource = () => {
    this.setState({ isCaptureEnabled: true });
  }

  onScreenshot = () => {
    this.capture.screenshot();
  }

  onStartRecord = () => {
    this.capture.record();
    this.setState({ isRecording: true });
  }
  onStopRecord = () => {
    this.capture.stopRecording();
    this.setState({ isRecording: false });
  }

  onAddNote = () => {

  }

  render() {
    return (
      <div className="dark App">
        <div className={`${this.state.messageType} message`}>{this.state.message}</div>
        <ScreenCap
          captureEnabled={this.state.isCaptureEnabled}
          onSelectSource={this.onSelectSource}
          onScreenshot={this.onScreenshot}
          onStartRecord={this.onStartRecord}
          onStopRecord={this.onStopRecord}
          manuallyNameCaptures={this.state.manuallyNameCaptures}
          capture={this.capture} />
        <TextBox
          enabled={this.state.isOutputDirectorySelected}
          onAddNote={this.onAddNote}
          outputDir={this.state.outputDirectory}
          notesFile={Files.joinPath(this.state.outputDirectory, this.state.noteFilename)}
        />
      </div>
    );
  }
}

export type ScreenCapProps = {
  captureEnabled: boolean,
  manuallyNameCaptures: boolean,
  onSelectSource: Function,
  onStartRecord: Function,
  onStopRecord: Function,
  onScreenshot: Function,
  capture: Capture
}
export type ScreenCapState = {
  isRecording: boolean
}
export class ScreenCap extends React.Component<ScreenCapProps, ScreenCapState> {
  constructor(props: any) {
    super(props);
    this.state = {
      isRecording: false
    }

    this.screenshot = this.screenshot.bind(this);
    this.toggleRecording = this.toggleRecording.bind(this);
  }

  screenshot = () => {

    this.props.onScreenshot();
  }

  startCapture = () => {

    this.props.onStartRecord();
  }

  stopCapture = () => {
    this.props.onStopRecord();
  }

  toggleRecording = () => {
    if (this.state.isRecording) {
      this.setState({ isRecording: false });
      this.stopCapture();
    } else {
      this.setState({ isRecording: true });
      this.startCapture();
    }
  }

  render() {
    return (
      <div className="screencap">
        <SourceSelector
          onSelectSource={this.props.onSelectSource}
          isRecording={this.state.isRecording}
          capture={this.props.capture} />
        <div className="buttons">
          {
            this.state.isRecording
              ? <button type="button" disabled={!this.props.captureEnabled} className="stop recording" onClick={this.toggleRecording}>Stop Recording</button>
              : <button type="button" disabled={!this.props.captureEnabled} className="add recording" onClick={this.toggleRecording}>Add Recording</button>
          }
          <button
            type="button"
            disabled={!this.props.captureEnabled}
            className="add screenshot"
            onClick={this.screenshot}>
            Add Screenshot
          </button>
        </div>
      </div>
    );
  }
}

export type SourceSelectorProps = {
  onSelectSource: Function,
  isRecording: boolean,
  capture: Capture
}
export type SourceSelectorState = {
  source: any,
  showPreview: boolean
}
export class SourceSelector extends React.Component<SourceSelectorProps, SourceSelectorState> {
  constructor(props: any) {
    super(props);
    this.preview = React.createRef<HTMLVideoElement>();
    this.state = {
      source: null,
      showPreview: true
    }
  }

  private preview: React.RefObject<HTMLVideoElement> = null;

  selectSource = () => {
    if(this.props.isRecording) return;
    this.props.capture.getVideoSources().then((selectedStream: MediaStream) => {
      if(this.props.capture) {
        this.setState({ source: this.props.capture.getSource() });
      }
      console.log(selectedStream);
      this.preview.current.srcObject = selectedStream;
      this.preview.current.play();
      this.props.onSelectSource();
    });
  }

  render() {
    return (
      <div className={`source${this.state.showPreview ? '' : ' hidden'} ${this.props.isRecording?' disabled':''}`} onClick={this.selectSource} >
        <video className="preview" ref={this.preview}  height={72} width={150}></video>
        <span className="name">{this.state.source?.name || 'No Source'}</span>
      </div>
    );
  }
}

export type TextBoxProps = {
  enabled: boolean,
  onAddNote: Function,
  notesFile: string,
  outputDir: string
}

export class TextBox extends React.Component<TextBoxProps, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      text: '',
      fileName: Files.joinPath(this.props.outputDir, this.props.notesFile)
    }
  };

  updateText = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ text: e.target.value });
  };

  addNote = () => {
    if(this.state) {
      this.props.onAddNote(this.state.text);
      Files.appendText(this.props.notesFile, this.state.text).then(() => {
        this.clear();
      });
    }
  };

  clear = () => {
    this.setState({ text: '' });
  };

  onKeyDown = (e: any) => {
    if ((e.ctrlKey === true) && (e.charCode == KEYS.enter)) {
      this.addNote();
    }
  };

  render() {
    return (
      <div className="textbox">
        <textarea
          className="note"
          value={this.state.text}
          onKeyPress={this.onKeyDown}
          onChange={this.updateText}></textarea>
        <button
          type="button" className="add note"
          title="CTRL + ENTER"
          onClick={this.addNote}>
          Add Note
        </button>
      </div>
    )
  }
}
