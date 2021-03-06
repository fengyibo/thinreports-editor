//  Copyright (C) 2011 Matsukei Co.,Ltd.
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <http://www.gnu.org/licenses/>.

goog.provide('thin.editor.RectShape');

goog.require('goog.string');
goog.require('goog.math.Rect');
goog.require('goog.math.Coordinate');
goog.require('thin.editor.Rect');
goog.require('thin.editor.ModuleShape');


/**
 * @param {Element} element
 * @param {thin.editor.Layout} layout
 * @param {goog.graphics.Stroke?} stroke
 * @param {goog.graphics.Fill?} fill
 * @constructor
 * @extends {thin.editor.Rect}
 */
thin.editor.RectShape = function(element, layout, stroke, fill) {
  thin.editor.Rect.call(this, element, layout, stroke, fill);
  this.setCss(thin.editor.RectShape.CLASSID);
};
goog.inherits(thin.editor.RectShape, thin.editor.Rect);
goog.mixin(thin.editor.RectShape.prototype, thin.editor.ModuleShape.prototype);


/**
 * @type {string}
 */
thin.editor.RectShape.CLASSID = 's-rect';


/**
 * @type {goog.graphics.SolidFill}
 */
thin.editor.RectShape.DEFAULT_FILL = new goog.graphics.SolidFill('#FFFFFF');


/**
 * @type {goog.graphics.Stroke}
 */
thin.editor.RectShape.DEFAULT_STROKE = new goog.graphics.Stroke(1, '#000000');


/**
 * @return {string}
 */
thin.editor.RectShape.prototype.getClassId = function() {
  return thin.editor.RectShape.CLASSID;
};


/**
 * @param {Element} element
 * @param {thin.editor.Layout} layout
 * @param {thin.editor.ShapeIdManager=} opt_shapeIdManager
 * @return {thin.editor.RectShape}
 */
thin.editor.RectShape.createFromElement = function(element, layout, opt_shapeIdManager) {
  var shape = new thin.editor.RectShape(element, layout,
                    new goog.graphics.Stroke(
                       Number(layout.getElementAttribute(element, 'stroke-width')), 
                       layout.getElementAttribute(element, 'stroke')),
                    new goog.graphics.SolidFill(layout.getElementAttribute(element, 'fill')));
  
  shape.setShapeId(layout.getElementAttribute(element, 'x-id'), opt_shapeIdManager);
  shape.setDisplay(layout.getElementAttribute(element, 'x-display') == 'true');
  shape.setDesc(layout.getElementAttribute(element, 'x-desc'));
  shape.setStrokeDashFromType(layout.getElementAttribute(element, 'x-stroke-type'));
  shape.setRounded(Number(layout.getElementAttribute(element, 'rx')));
  shape.initIdentifier();
  return shape;
};


thin.editor.RectShape.prototype.setDefaultOutline = function() {
  this.setTargetOutline(this.getLayout().getHelpers().getRectOutline());
};


/**
 * @param {thin.editor.Helpers} helpers
 * @param {thin.editor.MultiOutlineHelper} multiOutlineHelper
 */
thin.editor.RectShape.prototype.toOutline = function(helpers, multiOutlineHelper) {
  multiOutlineHelper.toRectOutline(this, helpers);
};


/**
 * @return {Function}
 */
thin.editor.RectShape.prototype.getCloneCreator = function() {

  var sourceCoordinate = new goog.math.Coordinate(this.getLeft(), this.getTop()).clone();
  var deltaCoordinateForList = this.getDeltaCoordinateForList().clone();
  var deltaCoordinateForGuide = this.getDeltaCoordinateForGuide().clone();

  var width = this.getWidth();
  var height = this.getHeight();
  var stroke = this.getStroke();
  var strokeWidth = this.getStrokeWidth();
  var fill = this.getFill();
  var radius = this.getRounded();
  var strokeDashType = this.getStrokeDashType();
  var display = this.getDisplay();
  var isAffiliationListShape = this.isAffiliationListShape();
  var deltaCoordinate = this.getDeltaCoordinateForList();

  /**
   * @param {thin.editor.Layout} layout
   * @param {boolean=} opt_isAdaptDeltaForList
   * @param {goog.graphics.SvgGroupElement=} opt_renderTo
   * @param {goog.math.Coordinate=} opt_basisCoordinate
   * @return {thin.editor.RectShape}
   */
  return function(layout, opt_isAdaptDeltaForList, opt_renderTo, opt_basisCoordinate) {
    
    var shape = layout.createRectShape();
    layout.appendChild(shape, opt_renderTo);
    
    var pasteCoordinate = layout.calculatePasteCoordinate(isAffiliationListShape,
          deltaCoordinateForList, deltaCoordinateForGuide, sourceCoordinate,
          opt_isAdaptDeltaForList, opt_renderTo, opt_basisCoordinate);

    shape.setBounds(new goog.math.Rect(pasteCoordinate.x, pasteCoordinate.y, width, height));
    shape.setRounded(radius);

    shape.setStrokeDashFromType(strokeDashType);
    shape.setStroke(stroke);
    shape.setStrokeWidth(strokeWidth);
    shape.setFill(fill);
    shape.setDisplay(display);
    return shape;
  };
};


/**
 * @private
 */
thin.editor.RectShape.prototype.createPropertyComponent_ = function() {
  
  var scope = this;
  var layout = this.getLayout();
  var propEventType = thin.ui.PropertyPane.Property.EventType;
  var proppane = thin.ui.getComponent('proppane');
  
  var baseGroup = proppane.addGroup(thin.t('property_group_basis'));
  
  
  var leftInputProperty = new thin.ui.PropertyPane.NumberInputProperty(thin.t('field_left_position'));
  var leftInput = leftInputProperty.getValueControl();
  leftInput.getNumberValidator().setAllowDecimal(true, 1);
  
  leftInputProperty.addEventListener(propEventType.CHANGE,
      this.setLeftForPropertyUpdate, false, this);
  
  proppane.addProperty(leftInputProperty, baseGroup, 'left');


  var topInputProperty = new thin.ui.PropertyPane.NumberInputProperty(thin.t('field_top_position'));
  var topInput = topInputProperty.getValueControl();
  topInput.getNumberValidator().setAllowDecimal(true, 1);
  
  topInputProperty.addEventListener(propEventType.CHANGE,
      this.setTopForPropertyUpdate, false, this);
  
  proppane.addProperty(topInputProperty, baseGroup, 'top');
  
  
  var widthInputProperty = new thin.ui.PropertyPane.NumberInputProperty(thin.t('field_width'));
  var widthInput = widthInputProperty.getValueControl();
  widthInput.getNumberValidator().setAllowDecimal(true, 1);
  
  widthInputProperty.addEventListener(propEventType.CHANGE,
      this.setWidthForPropertyUpdate, false, this);
  
  proppane.addProperty(widthInputProperty, baseGroup, 'width');
  
  
  var heightInputProperty = new thin.ui.PropertyPane.NumberInputProperty(thin.t('field_height'));
  var heightInput = heightInputProperty.getValueControl();
  heightInput.getNumberValidator().setAllowDecimal(true, 1);
  
  heightInputProperty.addEventListener(propEventType.CHANGE,
      this.setHeightForPropertyUpdate, false, this);
  
  proppane.addProperty(heightInputProperty, baseGroup, 'height');
  
  
  var displayCheckProperty = new thin.ui.PropertyPane.CheckboxProperty(thin.t('field_display'));
  displayCheckProperty.addEventListener(propEventType.CHANGE,
      this.setDisplayForPropertyUpdate, false, this);
  
  proppane.addProperty(displayCheckProperty, baseGroup, 'display');

  
  var shapeGroup = proppane.addGroup(thin.t('property_group_shape'));
  
  
  var fillInputProperty = new thin.ui.PropertyPane.ColorProperty(thin.t('field_fill_color'));
  fillInputProperty.getValueControl().getInput().setLabel('none');
  fillInputProperty.addEventListener(propEventType.CHANGE,
      this.setFillForPropertyUpdate, false, this);
  
  proppane.addProperty(fillInputProperty , shapeGroup, 'fill');
  
  
  var strokeInputProperty = new thin.ui.PropertyPane.ColorProperty(thin.t('field_stroke_color'));
  strokeInputProperty.getValueControl().getInput().setLabel('none');
  strokeInputProperty.addEventListener(propEventType.CHANGE,
      this.setStrokeForPropertyUpdate, false, this);
  
  proppane.addProperty(strokeInputProperty , shapeGroup, 'stroke');
  
  
  var strokeWidthCombProperty = new thin.ui.PropertyPane.ComboBoxProperty(thin.t('field_stroke_width'));
  var strokeWidthComb = strokeWidthCombProperty.getValueControl();
  var strokeWidthInput = strokeWidthComb.getInput();
  strokeWidthInput.setLabel('none');
  var strokeWidthInputValidation = new thin.ui.Input.NumberValidator(this);
  strokeWidthInputValidation.setAllowBlank(true);
  strokeWidthInputValidation.setAllowDecimal(true, 1);
  strokeWidthInput.setValidator(strokeWidthInputValidation);

  var strokeWidthList = ['1', '2', '3', '4', '8', '12', '16', '24'];
  var strokeWidthItem;
  goog.array.forEach(strokeWidthList, function(strokeWidthValue) {
    strokeWidthItem = new thin.ui.ComboBoxItem(strokeWidthValue);
    strokeWidthItem.setSticky(true);
    strokeWidthComb.addItem(strokeWidthItem);
  });
  strokeWidthCombProperty.addEventListener(propEventType.CHANGE,
      this.setStrokeWidthForPropertyUpdate, false, this);
  
  proppane.addProperty(strokeWidthCombProperty , shapeGroup, 'stroke-width');
  
  
  var strokeDashTypeName = thin.editor.ModuleElement.StrokeTypeName;
  var strokeDashSelectProperty = new thin.ui.PropertyPane.SelectProperty(thin.t('field_stroke_type'));
  var strokeDashSelect = strokeDashSelectProperty.getValueControl();
  strokeDashSelect.setTextAlignLeft();
  strokeDashSelect.addItem(new thin.ui.Option(strokeDashTypeName.SOLID));
  strokeDashSelect.addItem(new thin.ui.Option(strokeDashTypeName.DASHED));
  strokeDashSelect.addItem(new thin.ui.Option(strokeDashTypeName.DOTTED));
  
  strokeDashSelectProperty.addEventListener(propEventType.CHANGE,
      this.setStrokeDashTypeForPropertyUpdate, false, this);
  
  proppane.addProperty(strokeDashSelectProperty , shapeGroup, 'stroke-dash-type');


  var radiusInputProperty = new thin.ui.PropertyPane.InputProperty(thin.t('field_corner_radius'));
  radiusInputProperty.getValueControl().setValidator(new thin.ui.Input.NumberValidator(this));
  radiusInputProperty.addEventListener(propEventType.CHANGE,
      function(e) {
        var radius = Number(e.target.getValue());
        var captureRadius = scope.getRounded();
        
        layout.getWorkspace().normalVersioning(function(version) {
        
          version.upHandler(function() {
            this.setRounded(radius);
            proppane.getPropertyControl('radius').setValue(radius);
          }, scope);
          
          version.downHandler(function() {
            this.setRounded(captureRadius);
            proppane.getPropertyControl('radius').setValue(captureRadius);
          }, scope);
        });
      }, false, this);
  
  proppane.addProperty(radiusInputProperty, shapeGroup, 'radius');


  var cooperationGroup = proppane.addGroup(thin.t('property_group_association'));
  
  var idInputProperty = new thin.ui.PropertyPane.IdInputProperty(this, 'ID');
  idInputProperty.addEventListener(propEventType.CHANGE,
      this.setShapeIdForPropertyUpdate, false, this);
  
  proppane.addProperty(idInputProperty, cooperationGroup, 'shape-id');
  
  var descProperty = new thin.ui.PropertyPane.InputProperty(thin.t('field_description'));
  descProperty.addEventListener(propEventType.CHANGE,
      this.setDescPropertyUpdate, false, this);
  
  proppane.addProperty(descProperty, cooperationGroup, 'desc');
};


/**
 * @return {Object}
 */
thin.editor.RectShape.prototype.getProperties = function() {

  return {
    'left': this.getLeft(),
    'top': this.getTop(),
    'width': this.getWidth(),
    'height': this.getHeight(),
    'display': this.getDisplay(),
    'fill': this.getFill().getColor(),
    'stroke': this.getStroke().getColor(),
    'stroke-width': this.getStrokeWidth(),
    'stroke-dash-type': this.getStrokeDashType(),
    'radius': this.getRounded(),
    'shape-id': this.getShapeId(),
    'desc': this.getDesc()
  };
};


thin.editor.RectShape.prototype.updateProperties = function() {
  var proppane = thin.ui.getComponent('proppane');
  if (!proppane.isTarget(this)) {
    this.getLayout().updatePropertiesForEmpty();
    proppane.setTarget(this);
    this.createPropertyComponent_();
  }
  
  var properties = this.getProperties();
  var proppaneBlank = thin.editor.ModuleShape.PROPPANE_SHOW_BLANK;
  var noneColor = thin.editor.ModuleShape.NONE;
  
  proppane.getPropertyControl('left').setValue(properties['left']);
  proppane.getPropertyControl('top').setValue(properties['top']);
  proppane.getPropertyControl('width').setValue(properties['width']);
  proppane.getPropertyControl('height').setValue(properties['height']);
  proppane.getPropertyControl('display').setChecked(properties['display']);
  
  var fill = properties['fill'];
  if (thin.isExactlyEqual(fill, noneColor)) {
    fill = proppaneBlank
  }
  proppane.getPropertyControl('fill').setValue(fill);
  var stroke = properties['stroke'];
  if (thin.isExactlyEqual(stroke, noneColor)) {
    stroke = proppaneBlank
  }
  proppane.getPropertyControl('stroke').setValue(stroke);
  var strokeWidth = properties['stroke-width'];
  if (thin.isExactlyEqual(strokeWidth, thin.editor.ModuleElement.DEFAULT_STROKEWIDTH_OF_PROPPANE)) {
    strokeWidth = proppaneBlank;
  }
  proppane.getPropertyControl('stroke-width').setInternalValue(strokeWidth);
  
  proppane.getPropertyControl('stroke-dash-type').setValue(thin.editor.ModuleElement.getStrokeValueFromType(properties['stroke-dash-type']));
  proppane.getPropertyControl('radius').setValue(properties['radius']);
  
  proppane.getPropertyControl('shape-id').setValue(properties['shape-id']);
  proppane.getPropertyControl('desc').setValue(properties['desc']);
};


/**
 * @param {Object} properties
 */
thin.editor.RectShape.prototype.setInitShapeProperties = function(properties) {
  this.setBounds(properties.BOUNDS);
};


/** @inheritDoc */
thin.editor.RectShape.prototype.disposeInternal = function() {
  thin.editor.RectShape.superClass_.disposeInternal.call(this);
  this.disposeInternalForShape();
};
