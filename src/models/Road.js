class Road {
  constructor() {
    this._material = undefined;
  }

  set material(material) {
    this._material = material; 
  }

  get material() {
    return this._material;
  }
}

export default Road;
