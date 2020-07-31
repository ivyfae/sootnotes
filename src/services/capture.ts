import { Files } from "./files";
import * as Path from "path";
import { DesktopCapturerSource, SaveDialogReturnValue } from "electron";
const { remote, desktopCapturer } = window.require("electron");
const { Menu, dialog } = remote;
const path: typeof Path = remote.require("path");

export type CaptureSettings = {
  manuallyNameCaptures: boolean,
  outputDirectory: string,
  notesFile: string,
  videoDirectory: string,
  imageDirectory: string
}

export class Capture {
  constructor(
    outputDirectory: string,
    notesFile: string,
    videoDirectory: string,
    imageDirectory: string,
    manuallyNameCaptures: boolean,
  ) {
    this.mediaRecorder = null;
    this.settings = {
      outputDirectory,
      notesFile,
      manuallyNameCaptures,
      videoDirectory,
      imageDirectory
    } as CaptureSettings;
  }
  private settings: CaptureSettings = null;
  private mediaRecorder: MediaRecorder;
  private stream: MediaStream;
  private source: DesktopCapturerSource;

  public updateSettings(changes: any) {
    this.settings = { ...this.settings, ...changes };
  }

  public getCurrentStream() {
    return this.stream;
  }

  public getMediaRecorder() {
    return this.mediaRecorder;
  }

  public getSource() {
    return this.source;
  }

  public async getVideoSources() {
    const inputSources = await desktopCapturer.getSources({
      types: ['screen', 'window']
    });
    return new Promise<MediaStream>((resolve, reject) => {
      const videoOptionsMenu = Menu.buildFromTemplate(
        inputSources.map((source: DesktopCapturerSource) => {
          this.source = source;
          return {
            label: source.name,
            click: () => {
              this.selectSource(source).then((selectedStream) => {
                resolve(selectedStream);
                this.stream = selectedStream;
              });
            }
          };
        })
      );
      videoOptionsMenu.popup();
    });
  }

  // Change the videoSource window to record
  public async selectSource(source: any): Promise<MediaStream> {
    this.source = source;
    const constraints = {
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: source.id
        }
      }
    } as MediaStreamConstraints;

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    return stream;
  }

  stopRecording() {
    this.mediaRecorder.stop();
  }

  screenshot() {
    if (!this.stream) {
      throw new Error('Cannot take screenshots until a video source has been selected');
    }

    const v = document.createElement('video');
    v.srcObject = this.stream;
    v.onloadeddata = async (ev: Event) => {
      v.play();
      const canvas = document.createElement('canvas');
      canvas.width = v.videoWidth;
      canvas.height = v.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(v, 0, 0);
      
      type BuffBlob = Blob & { arrayBuffer: Function};
      const tempPath = Files.getTempFile('png');
      const blop = await (async (cvs: HTMLCanvasElement): Promise<Blob> => { return new Promise((resolve, reject) => { cvs.toBlob(resolve, 'image/png'); }) })(canvas);
      const ab = await (async (blob: BuffBlob): Promise<ArrayBuffer> => { return new Promise((resolve, reject) => { resolve(blob.arrayBuffer()); }) })(blop as BuffBlob);
      const buf = Buffer.from(ab);
      await Files.saveBuffer(tempPath, buf);

      const defaultFilename =`${Date.now()}.png`;
      let imagePath = Files.joinPath(this.settings.outputDirectory, this.settings.imageDirectory, defaultFilename);
      let textPath = Files.joinPath(this.settings.outputDirectory, this.settings.notesFile);

      if (this.settings.manuallyNameCaptures) {
        const { filePath, canceled } = await this.showSaveAsDialog(imagePath, defaultFilename, 'Save Screenshot');
        if (canceled) {
          Files.delete(tempPath);
        } else {
          imagePath = filePath;
          if(!imagePath.endsWith('.png')) imagePath += '.png';
        };
      }
      Files.move(tempPath, imagePath);
      Files.appendText(textPath, `![](${imagePath})\n`);
    }
  }

  record() {
    // Create the Media Recorder
    const options = { mimeType: 'video/webm; codecs=vp9' };
    this.mediaRecorder = new MediaRecorder(this.stream, options);
    const recordedChunks: Array<any> = [];

    // Captures all recorded chunks
    const handleDataAvailable = function (e: any) {
      console.log('video data available');
      recordedChunks.push(e.data);
    }

    // Saves the video file on stop
    const handleStop = async (e: any) => {
      const blob = new Blob(recordedChunks, {
        type: 'video/webm; codecs=vp9'
      });

      const basePath = this.settings.outputDirectory;
      const textPath = path.join(basePath, this.settings.notesFile);

      const buffer = Buffer.from(await (blob as any).arrayBuffer());
      const tempPath = Files.getTempFile('webm');
      await Files.saveBuffer(tempPath, buffer);

      let videoPath = path.join(basePath, this.settings.videoDirectory, `${Date.now()}.webm`);

      if (this.settings.manuallyNameCaptures) {
        const { filePath, canceled } = await this.showSaveAsDialog(videoPath, `${Date.now()}.webm`);
        if (canceled) {
          Files.delete(tempPath);
          return;
        } else {
          videoPath = filePath;
          if(!videoPath.endsWith('.webm')) videoPath += '.webm';
        }
      }

      Files.move(tempPath, videoPath);
      const relativePath = path.relative(basePath, videoPath);
      Files.appendText(textPath, `![](${relativePath})\n`);
    }

    // Register Event Handlers
    this.mediaRecorder.ondataavailable = handleDataAvailable;
    this.mediaRecorder.onstop = handleStop;
    this.mediaRecorder.start();
  }

  async showSaveAsDialog(defaultPath: string, defaultFilename: string, buttonLabel: string = 'Save'): Promise<SaveDialogReturnValue> {
    let selectedPath = defaultPath;
    while (true) {
      try {
        const { filePath, canceled } = await dialog.showSaveDialog({
          buttonLabel: buttonLabel,
          defaultPath: path.join(defaultPath, defaultFilename)
        });
        if (!canceled) {
          selectedPath = filePath;
          return { filePath: selectedPath, canceled: false };
        } else {
          throw new Error('Cancelled');
        }
      } catch (e) {
        const { response } = await dialog.showMessageBox({ title: 'Save Cancelled', message: 'Save Cancelled. Do you want to delete this capture?', buttons: ['Delete', 'Save'] });
        if (response === 0) {
          return { canceled: true }
        }
      }
    }
  }
}