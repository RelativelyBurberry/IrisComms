declare module "@mediapipe/tasks-vision" {
  export class FilesetResolver {
    static forVisionTasks(basePath: string): Promise<unknown>;
  }

  export class ObjectDetector {
    static createFromOptions(
      vision: unknown,
      options: unknown,
    ): Promise<ObjectDetector>;
    detectForVideo(
      video: HTMLVideoElement,
      timestampMs: number,
    ): { detections: unknown[] };
  }
}
