var makerjs = require('makerjs');


var Champagne = (function () {
  function Champagne() {
    var args = Array.prototype.slice.call(arguments);

    this.height     = args.shift();
    this.width      = args.shift();
    this.border     = args.shift();
    this.showBorder = args.shift();
    this.shuffle    = args.shift();
    this.jitter     = args.shift();
    this.maxRadius  = args.shift();

    this.steps = args;

    this.units = makerjs.unitType.Millimeter;

    this.paths  = _paths(this);
    this.models = _models(this);
    this.notes  = _notes(this);
  }

  function _paths(_this) {
    var result = {};

    for (var ix = 0; ix < countY(_this); ix++) {
      for (var iy = 0; iy < countX(_this); iy++) {
        var ir = ix + (iy * countY(_this));
        var radius = holeRadii(_this)[ir];
        var j = jitter(radii(_this)[0] - radius);
        result[`_${ix}_${iy}`] = circle(coords(_this, ix, iy, j), radius);
      }
    }

    return result;
  }

  function _models(_this) {
    var result = {
      outsideBox: outsideBox(_this)
    };

    if (_this.showBorder) result.insideBox = insideBox(_this);

    return result;
  }

  function _notes(_this) {
    return `
&nbsp;|&nbsp;
---- | ---
**Hole radii**: | ${radii(_this)}
**Holes Area**: | ${Math.round(totalHolesArea(_this))}mm&#xb2;
**Total Area**: | ${totalArea(_this)}mm&#xb2;
**Open Area**: | ${Math.round((100 * totalHolesArea(_this)) / totalArea(_this))}%`;
  }

  function circle(coords, radius) {
    return new makerjs.paths.Circle(coords, radius);
  }

  function __at(_this, f) {
    var attr = __at.caller.name;
    if (!_this[attr]) _this[attr] = f(_this);
    return _this[attr];
  }

  function outsideBox(_this)     { return __at(_this, _outsideBox    ); }
  function insideBox(_this)      { return __at(_this, _insideBox     ); }
  function holeAreas(_this)      { return __at(_this, _holeAreas     ); }
  function totalHolesArea(_this) { return __at(_this, _totalHolesArea); }
  function totalArea(_this)      { return __at(_this, _totalArea     ); }
  function countX(_this)         { return __at(_this, _countX        ); }
  function countY(_this)         { return __at(_this, _countY        ); }
  function holeCount(_this)      { return __at(_this, _holeCount     ); }
  function radii(_this)          { return __at(_this, _radii         ); }
  function holeRadii(_this)      { return __at(_this, _holeRadii     ); }
  function borderWidth(_this)    { return __at(_this, _borderWidth   ); }
  function borderHeight(_this)   { return __at(_this, _borderHeight  ); }

  function _outsideBox(_this) {
    return new makerjs.models.Rectangle(_this.width, _this.height);
  }

  function _insideBox(_this) {
    return makerjs.$(
      new makerjs.models.Rectangle(borderWidth(_this), borderHeight(_this))
    ).move([_this.border, _this.border]).$result;
  }

  function _radii(_this) {
    var result = [];

    var radius, step = 0;
    for (var is = 0; is < _this.steps.length; is++) {
      step += _this.steps[is];
      radius = _this.maxRadius - step;
      if (radius >= 0) result.push(radius);
    }

    return result;
  }

  function _holeRadii(_this) {
    var result = [];
    for (i = 0; i < holeCount(_this); i++) {
      var radiiNum = i % radii(_this).length; // NB. this will generate an even distribution of radii
      var radius = radii(_this)[radiiNum];
      result[i] = radius;
    }

    if (_this.shuffle) shuffle(result);

    return result;
  }

  function _borderWidth(_this) {
    return _this.width - 2 * _this.border;
  }

  function _borderHeight(_this) {
    return _this.height - 2 * _this.border;
  }

  function _holeAreas(_this) {
    var result = {};
    for (i = 0; i < holeRadii(_this).length; i++) {
      var radius = holeRadii(_this)[i];
      result[radius] = (result[radius] || []).concat([Math.PI * radius * radius]);
    }
    return result;
  }

  function _totalHolesArea(_this) {
    var result = 0.0;
    for (var radius in holeAreas(_this)) {
      var holeArea = holeAreas(_this)[radius].reduce((a, b) => a + b, 0.0);
      result += holeArea;
    }
    return result;
  }

  function _totalArea(_this) {
    return _this.height * _this.width;
  }

  function _countX(_this) {
    return Math.floor((_this.height - (2 * _this.border)) / (2 * _this.maxRadius));
  }

  function _countY(_this) {
    return Math.floor((_this.width - (2 * _this.border)) / (2 * _this.maxRadius));
  }

  function _holeCount(_this) {
    return countX(_this) * countY(_this);
  }

  function jitter(max) {
    return Math.floor((Math.random() * max * 2) - max);
  }

  function coords(_this, ix, iy, jitter) {
    if (!_this.jitter) jitter = 0;

    return [
      _this.border + _this.maxRadius + ix * 2 * _this.maxRadius + jitter,
      _this.border + _this.maxRadius + iy * 2 * _this.maxRadius + jitter
    ];
  }

  function shuffle(a) {
    // NB. shuffles in place
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var x = a[i];
      a[i] = a[j];
      a[j] = x;
    }
    return a;
  }

  return Champagne;
})();

Champagne.metaParameters = [
  { title: "Height (mm)"         , type: "range", value: 110, min: 10, max: 2000, step: 10 },
  { title: "Width (mm)"          , type: "range", value: 210, min: 20, max: 2000, step: 10 },
  { title: "Border (mm)"         , type: "range", value:   5, min:  2, max:   20, step:  1 },
  { title: "Show Border"         , type:  "bool", value: false },
  { title: "Shuffle"             , type:  "bool", value: true  },
  { title: "Jitter"              , type:  "bool", value: false },
  { title: "Max hole radius (mm)", type: "range", value:  20, min: 10, max:  100, step:  1 },
  { title: "Step 1 (mm)"         , type: "range", value:   4, min:  0, max:   20, step:  1 },
  { title: "Step 2 (mm)"         , type: "range", value:   8, min:  0, max:   20, step:  1 },
  { title: "Step 3 (mm)"         , type: "range", value:   4, min:  0, max:   20, step:  1 },
  { title: "Step 4 (mm)"         , type: "range", value:   1, min:  0, max:   20, step:  1 }
];

module.exports = Champagne;
