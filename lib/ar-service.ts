"use client";

class ARService {
  private static instance: ARService;
  private detector: any = null;
  private isInitializing: boolean = false;

  private constructor() {}

  public static getInstance(): ARService {
    if (!ARService.instance) {
      ARService.instance = new ARService();
    }
    return ARService.instance;
  }

  public async initialize() {
    if (typeof window === 'undefined') return;
    if (this.detector || this.isInitializing) return;
    this.isInitializing = true;

    try {
      const { ObjectDetector, FilesetResolver } = await import("@mediapipe/tasks-vision");
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      this.detector = await ObjectDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite`,
          delegate: "GPU"
        },
        scoreThreshold: 0.5,
        runningMode: "VIDEO"
      });
      console.log("AR Service (Object Detection) initialized");
    } catch (error) {
      console.error("Failed to initialize AR Service:", error);
    } finally {
      this.isInitializing = false;
    }
  }

  public detectObjects(video: HTMLVideoElement) {
    if (!this.detector) return [];
    try {
      const result = this.detector.detectForVideo(video, performance.now());
      return result.detections;
    } catch (error) {
      console.error("Object detection error:", error);
      return [];
    }
  }

  public getPhraseForObject(category: string): string | null {
    const objectPhrases: Record<string, string> = {
      "cup": "I want water",
      "bottle": "I am thirsty",
      "cell phone": "Where is my phone?",
      "laptop": "I want to work",
      "chair": "I want to sit down",
      "couch": "I want to rest",
      "person": "I want to talk",
      "dining table": "I am hungry",
      "refrigerator": "Is there food?",
      "door": "Open the door",
      "book": "I want to read",
    };

    return objectPhrases[category.toLowerCase()] || null;
  }
}

export const arService = ARService.getInstance();
