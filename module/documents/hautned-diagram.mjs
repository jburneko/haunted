export class SocialDiagram extends Scene {
  static _instance = undefined;

  static get instance() {
    return SocialDiagram._instance;
  }

  static SetInstance(scene) {
    SocialDiagram._instance = scene;
  }
}
