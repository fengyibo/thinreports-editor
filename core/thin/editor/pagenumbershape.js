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

goog.provide('thin.editor.PageNumberShape');
goog.provide('thin.editor.PageNumberShape.ClassIds');

goog.require('goog.dom');
goog.require('goog.array');
goog.require('goog.string');
goog.require('goog.object');
goog.require('goog.math.Rect');
goog.require('goog.math.Coordinate');
goog.require('goog.graphics.Font');
goog.require('thin.editor.Box');
goog.require('thin.editor.IdShape');
goog.require('thin.editor.TextStyle');
goog.require('thin.editor.TextStyle.HorizonAlignType');
goog.require('thin.editor.TextStyle.OverflowType');
goog.require('thin.editor.TextStyle.OverflowTypeName');
goog.require('thin.editor.AbstractTextGroup');
goog.require('thin.editor.ModuleShape');

goog.require('goog.ui.Component');
goog.require('goog.ui.Component.EventType');


/**
 * @param {Element} element
 * @param {thin.editor.Layout} layout
 * @constructor
 * @extends {thin.editor.AbstractTextGroup}
 */
thin.editor.PageNumberShape = function(element, layout) {
  goog.base(this, element, layout);
  this.setCss(thin.editor.PageNumberShape.CLASSID);
};
goog.inherits(thin.editor.PageNumberShape, thin.editor.AbstractTextGroup);
goog.mixin(thin.editor.PageNumberShape.prototype, thin.editor.ModuleShape.prototype);


/**
 * @type {string}
 */
thin.editor.PageNumberShape.CLASSID = 's-pageno';


/**
 * @enum {string}
 */
thin.editor.PageNumberShape.ClassIds = {
  BOX: '-box',
  LABEL: '-label'
};


/**
 * @type {goog.graphics.SolidFill}
 * @private
 */
thin.editor.PageNumberShape.DEFAULT_FILL = new goog.graphics.SolidFill('#000000');


/**
 * @type {goog.graphics.SolidFill}
 * @private
 */
thin.editor.PageNumberShape.BOX_FILL_ = new goog.graphics.SolidFill('#f4e2c4', 0.8);


/**
 * @type {goog.graphics.Stroke}
 * @private
 */
thin.editor.PageNumberShape.BOX_STROKE_ = new goog.graphics.Stroke(0.28, '#7C4007');


/**
 * @type {string}
 * @private
 */
thin.editor.PageNumberShape.DEFAULT_PAGENO_FORMAT_ = '{page}';


/**
 * @type {thin.editor.PageNumberShape.Label_}
 * @private
 */
thin.editor.PageNumberShape.prototype.label_;


/**
 * @type {string}
 * @private
 */
thin.editor.PageNumberShape.prototype.type_;


/**
 * @type {string}
 * @private
 */
thin.editor.PageNumberShape.prototype.base_;


/**
 * @return {string}
 */
thin.editor.PageNumberShape.prototype.getClassId = function() {
  return thin.editor.PageNumberShape.CLASSID;
};


/**
 * Override thin.editor.ModuleShape#canResizeHeight.
 * @return {boolean}
 */
thin.editor.PageNumberShape.prototype.canResizeHeight = function() {
  return false;
};


/** @inheritDoc */
thin.editor.PageNumberShape.prototype.updateToolbarUI = function() {
  goog.base(this, 'updateToolbarUI');
  thin.ui.enablingFontUIs(true, true, true, false, false);
};


/**
 * @param {Element} element
 * @param {thin.editor.Layout} layout
 * @param {thin.editor.ShapeIdManager=} opt_shapeIdManager
 * @return {thin.editor.PageNumberShape}
 */
thin.editor.PageNumberShape.createFromElement = function(element, layout, opt_shapeIdManager) {
  element.removeAttribute('clip-path');
  var shape = new thin.editor.PageNumberShape(element, layout);

  shape.setShapeId(layout.getElementAttribute(element, 'x-id'), opt_shapeIdManager);
  shape.setFill(new goog.graphics.SolidFill(layout.getElementAttribute(element, 'fill')));
  shape.setFontSize(Number(layout.getElementAttribute(element, 'font-size')));
  shape.setFontFamily(layout.getElementAttribute(element, 'font-family'));

  var decoration = layout.getElementAttribute(element, 'text-decoration');
  var kerning = layout.getElementAttribute(element, 'kerning');
  
  if (thin.isExactlyEqual(kerning, thin.editor.TextStyle.DEFAULT_ELEMENT_KERNING)) {
    kerning = thin.editor.TextStyle.DEFAULT_KERNING;
  }
  shape.setKerning(/** @type {string} */ (kerning));
  shape.setFontUnderline(/underline/.test(decoration));
  shape.setFontLinethrough(/line-through/.test(decoration));
  shape.setFontItalic(layout.getElementAttribute(element, 'font-style') == 'italic');
  shape.setFontBold(layout.getElementAttribute(element, 'font-weight') == 'bold');
  shape.setTextAnchor(layout.getElementAttribute(element, 'text-anchor'));
  shape.setDisplay(layout.getElementAttribute(element, 'x-display') == 'true');
  shape.setDesc(layout.getElementAttribute(element, 'x-desc'));
  shape.initIdentifier();

  return shape;
};


/**
 * @param {Element=} opt_element
 * @return {thin.editor.Box}
 * @private
 */
thin.editor.PageNumberShape.prototype.createBox_ = function(opt_element) {
  var opt_classId;
  if (!opt_element) {
    opt_classId = thin.editor.PageNumberShape.CLASSID +
        thin.editor.PageNumberShape.ClassIds.BOX;
  }

  var box = goog.base(this, 'createBox_', opt_element, opt_classId);
  
  box.setStroke(thin.editor.PageNumberShape.BOX_STROKE_);
  box.setFill(thin.editor.PageNumberShape.BOX_FILL_);
  box.setUsableClipPath(true);
  
  return box;
};


/**
 * @param {Element=} opt_element
 * @return {thin.editor.PageNumberShape.Label_}
 * @private
 */
thin.editor.PageNumberShape.prototype.createLabel_ = function(opt_element) {
  var label = new thin.editor.PageNumberShape.Label_(
          this, this.getLayout(), opt_element);
  label.setText(this.getFormat());
  return label;
};


/** @inheritDoc */
thin.editor.PageNumberShape.prototype.setup = function() {
  var element = this.getElement();
  var classId = thin.editor.PageNumberShape.ClassIds;

  var box = thin.editor.getElementByClassNameForChildNodes(
        thin.editor.PageNumberShape.CLASSID + classId.BOX, element.childNodes);

  this.box_ = this.createBox_(box);
  if (!box) {
    this.getLayout().appendChild(this.box_, this);
  }

  var label = goog.dom.getElementsByTagNameAndClass('text', null, element)[0];

  this.label_ = this.createLabel_(label);
  if (!label) {
    this.getLayout().appendChild(this.label_, this);
    this.label_.reposition();
  }
};



thin.editor.PageNumberShape.prototype.createClipPath = function() {
  this.box_.createClipPath(this);
};


thin.editor.PageNumberShape.prototype.removeClipPath = function() {
  this.box_.removeClipPath();
};


thin.editor.PageNumberShape.prototype.setDefaultOutline = function() {
  this.setTargetOutline(this.getLayout().getHelpers().getPageNumberOutline());
};


/**
 * @param {string} shapeId
 * @param {thin.editor.ShapeIdManager=} opt_manager
 */
thin.editor.PageNumberShape.prototype.setShapeId = function(shapeId, opt_manager) {
  this.setShapeId_(shapeId, opt_manager);
};


/** @inheritDoc */
thin.editor.PageNumberShape.prototype.setLeft = function(left) {
  goog.base(this, 'setLeft', left);
  this.label_.repositionX();
};


/** @inheritDoc */
thin.editor.PageNumberShape.prototype.setHeight = function(height) {
  goog.base(this, 'setHeight', height);
  this.label_.repositionY();
};


/** @inheritDoc */
thin.editor.PageNumberShape.prototype.setTop = function(top) {
  goog.base(this, 'setTop', top);
  this.label_.repositionY();
};


/**
 * @param {string} type
 */
thin.editor.PageNumberShape.prototype.setOverflowType = function(type) {
  this.getLayout().setElementAttributes(this.getElement(), {
    'x-overflow': type
  });
};


/**
 * @return {string}
 */
thin.editor.PageNumberShape.prototype.getOverflowType = function() {
  return this.getLayout().getElementAttribute(this.getElement(), 'x-overflow')
    || thin.editor.TextStyle.DEFAULT_OVERFLOWTYPE;
};


/**
 * @param {number} pageNo
 */
thin.editor.PageNumberShape.prototype.setStartAt = function(pageNo) {
  this.getLayout().setElementAttributes(this.getElement(), {
    'x-start-at': pageNo
  });
};


/**
 * @return {number}
 */
thin.editor.PageNumberShape.prototype.getStartAt = function() {
  return this.getLayout().getElementAttribute(this.getElement(), 
      'x-start-at') || 1;
};


/**
 * @param {string} format
 */
thin.editor.PageNumberShape.prototype.setFormat = function(format) {
  this.getLayout().setElementAttributes(this.getElement(), {
    'x-format': format
  });
  this.label_.setText(format);
};


/**
 * @return {string}
 */
thin.editor.PageNumberShape.prototype.getFormat = function() {
  return this.getLayout().getElementAttribute(this.getElement(), 
      'x-format') || thin.editor.PageNumberShape.DEFAULT_PAGENO_FORMAT_;
};


/**
 * @param {string} target
 */
thin.editor.PageNumberShape.prototype.setTarget = function(target) {
  this.getLayout().setElementAttributes(this.getElement(), {
    'x-target': target
  });
};


/**
 * @return {string}
 */
thin.editor.PageNumberShape.prototype.getTarget = function() {
  return this.getLayout().getElementAttribute(this.getElement(), 
      'x-target') || '';
};


/**
 * @param {thin.editor.Helpers} helpers
 * @param {thin.editor.MultiOutlineHelper} multiOutlineHelper
 */
thin.editor.PageNumberShape.prototype.toOutline = function(helpers, multiOutlineHelper) {
  multiOutlineHelper.toPageNumberOutline(this, helpers);
};


/**
 * @return {Function}
 */
thin.editor.PageNumberShape.prototype.getCloneCreator = function() {
  var sourceCoordinate = new goog.math.Coordinate(this.getLeft(), this.getTop()).clone();
  var deltaCoordinateForList = this.getDeltaCoordinateForList().clone();
  var deltaCoordinateForGuide = this.getDeltaCoordinateForGuide().clone();

  var width = this.getWidth();
  var height = this.getHeight();
  var fill = this.getFill();
  var fontsize = this.getFontSize();
  var family = this.getFontFamily();
  
  var bold = this.isFontBold();
  var italic = this.isFontItalic();
  var fontStyle = this.fontStyle_;
  var underline = this.isFontUnderline();
  var linethrough = this.isFontLinethrough();

  var display = this.getDisplay();
  var kerning = this.getKerning();
  var anchor = this.getTextAnchor();
  var isAffiliationListShape = this.isAffiliationListShape();
  var deltaCoordinate = this.getDeltaCoordinateForList();
  var overflow = this.getOverflowType();

  /**
   * @param {thin.editor.Layout} layout
   * @param {boolean=} opt_isAdaptDeltaForList
   * @param {goog.graphics.SvgGroupElement=} opt_renderTo
   * @param {goog.math.Coordinate=} opt_basisCoordinate
   * @param {thin.editor.ShapeIdManager=} opt_shapeIdManager
   * @return {thin.editor.PageNumberShape}
   */
  return function(layout, opt_isAdaptDeltaForList, opt_renderTo, opt_basisCoordinate, opt_shapeIdManager) {

    var shape = layout.createPageNumberShape();
    layout.appendChild(shape, opt_renderTo);
    
    var pasteCoordinate = layout.calculatePasteCoordinate(isAffiliationListShape, deltaCoordinateForList, deltaCoordinateForGuide, sourceCoordinate, opt_isAdaptDeltaForList, opt_renderTo, opt_basisCoordinate);
    shape.setBounds(new goog.math.Rect(pasteCoordinate.x, pasteCoordinate.y, width, height));

    shape.setFill(fill);
    shape.setFontSize(fontsize);
    shape.setFontFamily(family);
    shape.setFontBold(bold);
    shape.setFontItalic(italic);
    shape.setFontUnderline(underline);
    shape.setFontLinethrough(linethrough);
    shape.setTextAnchor(anchor);
    shape.setKerning(kerning);
    shape.setDisplay(display);
    shape.setOverflowType(overflow);

    return shape;
  };
};


/**
 * @private
 */
thin.editor.PageNumberShape.prototype.createPropertyComponent_ = function() {
  var scope = this;
  var layout = this.getLayout();
  var workspace = layout.getWorkspace();
  var guide = layout.getHelpers().getGuideHelper();
  var textStyle = this.textStyle_;
  
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
  
  
  var displayCheckProperty = new thin.ui.PropertyPane.CheckboxProperty(thin.t('field_display'));
  displayCheckProperty.addEventListener(propEventType.CHANGE,
      this.setDisplayForPropertyUpdate, false, this);
  
  proppane.addProperty(displayCheckProperty, baseGroup, 'display');


  var fontGroup = proppane.addGroup(thin.t('property_group_font'));
  

  var colorInputProperty = new thin.ui.PropertyPane.ColorProperty(thin.t('field_font_color'));
  colorInputProperty.getValueControl().getInput().setLabel('none');
  colorInputProperty.addEventListener(propEventType.CHANGE,
      function(e) {
      
        var scope = this;
        var layout = this.getLayout();
        var proppaneBlank = thin.editor.ModuleShape.PROPPANE_SHOW_BLANK;
        var fillNone = thin.editor.ModuleShape.NONE;
        //  choose none color returned null.
        var fillColor = /** @type {string} */(thin.getValIfNotDef(e.target.getValue(), proppaneBlank));
        var fill = new goog.graphics.SolidFill(thin.isExactlyEqual(fillColor, proppaneBlank) ?
                           fillNone : fillColor);
        var captureFill = this.getFill();
        var captureFillColor = captureFill.getColor();
        if (thin.isExactlyEqual(captureFillColor, fillNone)) {
          captureFillColor = proppaneBlank;
        }        

        layout.getWorkspace().normalVersioning(function(version) {
        
          version.upHandler(function() {
            this.setFill(fill);
            proppane.getPropertyControl('font-color').setValue(fillColor);
          }, scope);
          
          version.downHandler(function() {
            this.setFill(captureFill);
            proppane.getPropertyControl('font-color').setValue(captureFillColor);
          }, scope);
        });
      }, false, this);
  
  proppane.addProperty(colorInputProperty , fontGroup, 'font-color');


  var fontSizeCombProperty = new thin.ui.PropertyPane.ComboBoxProperty(thin.t('field_font_size'));
  var fontSizeComb = fontSizeCombProperty.getValueControl();
  var fontSizeInput = fontSizeComb.getInput();
  var fontSizeInputValidation = new thin.ui.Input.NumberValidator(this);
  fontSizeInputValidation.setInputRange(5);
  fontSizeInputValidation.setAllowDecimal(true, 1);
  fontSizeInput.setValidator(fontSizeInputValidation);

  var fontSizeItem;
  goog.array.forEach(thin.editor.FontStyle.FONTSIZE_LIST, function(fontSizeValue) {
    fontSizeItem = new thin.ui.ComboBoxItem(fontSizeValue);
    fontSizeItem.setSticky(true);
    fontSizeComb.addItem(fontSizeItem);
  });

  fontSizeCombProperty.addEventListener(propEventType.CHANGE,
      function(e) {
        workspace.getAction().actionSetFontSize(Number(e.target.getValue()));
      }, false, this);
  
  proppane.addProperty(fontSizeCombProperty , fontGroup, 'font-size');
  

  var fontFamilySelectProperty =
        new thin.ui.PropertyPane.FontSelectProperty();

  fontFamilySelectProperty.addEventListener(propEventType.CHANGE,
      function(e) {
        workspace.getAction().actionSetFontFamily(e.target.getValue());
      }, false, this);
  
  proppane.addProperty(fontFamilySelectProperty , fontGroup, 'font-family');


  var textGroup = proppane.addGroup(thin.t('property_group_text'));
  
  var textAlignSelectProperty = new thin.ui.PropertyPane.SelectProperty(thin.t('field_text_align'));
  var textAlignSelect = textAlignSelectProperty.getValueControl();
  var textAlignType = thin.editor.TextStyle.HorizonAlignTypeName;
  
  textAlignSelect.setTextAlignLeft();
  textAlignSelect.addItem(new thin.ui.Option(textAlignType.START));
  textAlignSelect.addItem(new thin.ui.Option(textAlignType.MIDDLE));
  textAlignSelect.addItem(new thin.ui.Option(textAlignType.END));

  textAlignSelectProperty.addEventListener(propEventType.CHANGE,
      function(e) {
        workspace.getAction().actionSetTextAnchor(
            thin.editor.TextStyle.getHorizonAlignTypeFromTypeName(e.target.getValue()));
      }, false, this);
  
  proppane.addProperty(textAlignSelectProperty , textGroup, 'text-halign');
  
  
  var kerningInputProperty = new thin.ui.PropertyPane.NumberInputProperty(thin.t('field_text_kerning'), 'auto');
  var kerningInput = kerningInputProperty.getValueControl();
  var kerningInputValidation = kerningInput.getNumberValidator();
  kerningInputValidation.setAllowDecimal(true, 1);
  kerningInputValidation.setAllowBlank(true);
  
  kerningInputProperty.addEventListener(propEventType.CHANGE,
      function(e) {
        var kerning = e.target.getValue();
        var captureSpacing = scope.getKerning();
        
        if (kerning !== thin.editor.TextStyle.DEFAULT_KERNING) {
          kerning = String(Number(kerning));
        }
        
        workspace.normalVersioning(function(version) {
          version.upHandler(function() {
            this.setKerning(kerning);
            proppane.getPropertyControl('kerning').setValue(kerning);
          }, scope);
          version.downHandler(function() {
            this.setKerning(captureSpacing);
            proppane.getPropertyControl('kerning').setValue(captureSpacing);
          }, scope);
        });
      }, false, this);
  
  proppane.addProperty(kerningInputProperty, textGroup, 'kerning');


  var textOverflowSelectProperty = new thin.ui.PropertyPane.SelectProperty(thin.t('field_text_overflow'));
  var textOverflowSelect = textOverflowSelectProperty.getValueControl();
  textOverflowSelect.setTextAlignLeft();
  
  var overflowName = thin.editor.TextStyle.OverflowTypeName;
  var overflowType = thin.editor.TextStyle.OverflowType;
  
  textOverflowSelect.addItem(new thin.ui.Option(overflowName.TRUNCATE, overflowType.TRUNCATE));
  textOverflowSelect.addItem(new thin.ui.Option(overflowName.FIT, overflowType.FIT));
  textOverflowSelect.addItem(new thin.ui.Option(overflowName.EXPAND, overflowType.EXPAND));
  
  textOverflowSelectProperty.addEventListener(propEventType.CHANGE,
      function(e) {
        var overflow = e.target.getValue();
        var captureOverflow = scope.getOverflowType();

        workspace.normalVersioning(function(version) {
          version.upHandler(function() {
            this.setOverflowType(overflow);
            proppane.getPropertyControl('overflow').setValue(overflow);
          }, scope);
          version.downHandler(function() {
            this.setOverflowType(captureOverflow);
            proppane.getPropertyControl('overflow').setValue(captureOverflow);
          }, scope);
        });
      }, false, this);
  
  proppane.addProperty(textOverflowSelectProperty, textGroup, 'overflow');


  var pageNoGroup = proppane.addGroup(thin.t('property_group_pageno'));

  var startAtInputProperty = new thin.ui.PropertyPane.InputProperty(thin.t('field_start_pageno'));
  var startAtInput = startAtInputProperty.getValueControl();
  var startAtValidator = new thin.ui.Input.NumberValidator();
  startAtValidator.setAllowBlank(true);
  startAtInput.setValidator(startAtValidator);
  
  startAtInputProperty.addEventListener(propEventType.CHANGE,
      function(e) {
        var newStartAt = Number(e.target.getValue() || 1);
        var oldStartAt = scope.getStartAt();

        workspace.normalVersioning(function(version) {
          version.upHandler(function() {
            this.setStartAt(newStartAt);
            proppane.getPropertyControl('start-at').setValue(newStartAt);
          }, scope);

          version.downHandler(function() {
            this.setStartAt(oldStartAt);
            proppane.getPropertyControl('start-at').setValue(oldStartAt);
          }, scope);
        });
      }, false, this);
  
  proppane.addProperty(startAtInputProperty, pageNoGroup, 'start-at');

  var formatInputProperty = new thin.ui.PropertyPane.InputProperty(thin.t('field_pageno_format'));
  var formatInput = formatInputProperty.getValueControl();
  var formatValidator = new thin.ui.Input.Validator();
  formatValidator.setAllowBlank(true);
  formatValidator.setMessage(thin.t('error_no_valid_placeholder_included'));
  formatValidator.setMethod(function(value) {
    return /\{(page|total)\}/.test(value);
  });

  formatInput.setValidator(formatValidator);
  formatInput.setTooltip(thin.t('text_placeholder_of_pageno_description'));

  formatInputProperty.addEventListener(propEventType.CHANGE, 
      function(e) {
        var newFormat = e.target.getValue() || thin.editor.PageNumberShape.DEFAULT_PAGENO_FORMAT_;
        var oldFormat = scope.getFormat();

        workspace.normalVersioning(function(version) {
          version.upHandler(function() {
            this.setFormat(newFormat);
            proppane.getPropertyControl('format').setValue(newFormat);
          }, scope);

          version.downHandler(function() {
            this.setFormat(oldFormat);
            proppane.getPropertyControl('format').setValue(oldFormat);
          }, scope);
        });
      }, false, this);

  proppane.addProperty(formatInputProperty, pageNoGroup, 'format');

  var targetInputProperty = new thin.ui.PropertyPane.InputProperty(
        thin.t('field_counted_page_target'), thin.t('field_default_counted_page_target'));
  var targetInput = targetInputProperty.getValueControl();
  var targetValidator = new thin.ui.Input.Validator();
  targetValidator.setAllowBlank(true);
  targetValidator.setMethod(function(targetId) {
    var target = layout.getShapeForShapeId(targetId);
    var error = null;

    switch(true) {
      case !target:
        error = thin.t('error_id_not_found', {'id': targetId});
        break;
      case !target.instanceOfListShape():
        error = thin.t('error_id_is_not_list', {'id': targetId});
        break;
    }
    if (error) {
      this.setMessage(error);
      return false;
    } else {
      return true;
    }
  });

  targetInput.setValidator(targetValidator);
  targetInput.setTooltip(thin.t('text_counted_page_target_description'));
  
  targetInputProperty.addEventListener(propEventType.CHANGE,
      function(e) {
        var newTarget = e.target.getValue();
        var oldTarget = scope.getTarget();
        
        workspace.normalVersioning(function(version) {
          version.upHandler(function() {
            this.setTarget(newTarget);
            proppane.getPropertyControl('target').setValue(newTarget);
          }, scope);
          
          version.downHandler(function() {
            this.setShapeId(oldTarget);
            proppane.getPropertyControl('target').setValue(oldTarget);
          }, scope);
        });
      }, false, this);
  
  proppane.addProperty(targetInputProperty, pageNoGroup, 'target');


  var associationGroup = proppane.addGroup(thin.t('property_group_association'));
  
  var idInputProperty = new thin.ui.PropertyPane.IdInputProperty(this, 'ID');
  
  idInputProperty.addEventListener(propEventType.CHANGE,
      function(e) {
        
        var shapeId = e.target.getValue();
        var captureShapeId = scope.getShapeId();
        
        workspace.normalVersioning(function(version) {
          version.upHandler(function() {
            this.setShapeId(shapeId);
            proppane.getPropertyControl('shape-id').setValue(shapeId);
          }, scope);
          
          version.downHandler(function() {
            this.setShapeId(captureShapeId);
            proppane.getPropertyControl('shape-id').setValue(captureShapeId);
          }, scope);
        });
      }, false, this);
  
  proppane.addProperty(idInputProperty, associationGroup, 'shape-id');


  var descProperty = new thin.ui.PropertyPane.InputProperty(thin.t('field_description'));
  descProperty.addEventListener(propEventType.CHANGE,
      this.setDescPropertyUpdate, false, this);
  
  proppane.addProperty(descProperty, associationGroup, 'desc');
};


/**
 * @return {Object}
 */
thin.editor.PageNumberShape.prototype.getProperties = function() {
  var properties = {
    'left': this.getLeft(),
    'top': this.getTop(),
    'width': this.getWidth(),
    'display': this.getDisplay(),
    'font-color': this.getFill().getColor(),
    'font-size': this.getFontSize(),
    'font-family': this.getFontFamily(),
    'text-halign': this.getTextAnchor(),
    'kerning': this.getKerning(),
    'overflow': this.getOverflowType(),
    'start-at': this.getStartAt(), 
    'format': this.getFormat(), 
    'target': this.getTarget(), 
    'shape-id': this.getShapeId(),
    'desc': this.getDesc()
  };
  
  return properties;
};


thin.editor.PageNumberShape.prototype.updateProperties = function() {
  var proppane = thin.ui.getComponent('proppane');

  if (!proppane.isTarget(this)) {
    this.getLayout().updatePropertiesForEmpty();
    proppane.setTarget(this);
    this.createPropertyComponent_();
  }
  
  var properties = this.getProperties();
  var proppaneBlank = thin.editor.ModuleShape.PROPPANE_SHOW_BLANK;
  
  proppane.getPropertyControl('left').setValue(properties['left']);
  proppane.getPropertyControl('top').setValue(properties['top']);
  proppane.getPropertyControl('width').setValue(properties['width']);
  proppane.getPropertyControl('display').setChecked(properties['display']);
  
  var fontColor = properties['font-color'];
  if (thin.isExactlyEqual(fontColor, thin.editor.ModuleShape.NONE)) {
    fontColor = proppaneBlank
  }
  proppane.getPropertyControl('font-color').setValue(fontColor);
  proppane.getPropertyControl('font-size').setInternalValue(properties['font-size']);
  proppane.getPropertyControl('font-family').setValue(properties['font-family']);
  proppane.getPropertyControl('text-halign').setValue(
        thin.editor.TextStyle.getHorizonAlignValueFromType(properties['text-halign']));
  proppane.getPropertyControl('kerning').setValue(properties['kerning']);
  proppane.getPropertyControl('overflow').setValue(properties['overflow']);
  proppane.getPropertyControl('start-at').setValue(properties['start-at']);
  proppane.getPropertyControl('format').setValue(properties['format']);
  proppane.getPropertyControl('target').setValue(properties['target']);
  
  proppane.getPropertyControl('shape-id').setValue(properties['shape-id']);
  proppane.getPropertyControl('desc').setValue(properties['desc']);
};


/**
 * @param {Object} properties
 */
thin.editor.PageNumberShape.prototype.setInitShapeProperties = function(properties) {
  this.setFill(thin.editor.PageNumberShape.DEFAULT_FILL);
  this.setFontSize(properties.SIZE);
  this.setFontFamily(properties.FAMILY);
  this.setFontBold(properties.BOLD);
  this.setFontItalic(properties.ITALIC);
  this.setTextAnchor(properties.ANCHOR);
  this.setFontUnderline(properties.UNDERLINE);
  this.setFontLinethrough(properties.LINETHROUGH);
  this.setBounds(properties.BOUNDS);
};


/** @inheritDoc */
thin.editor.PageNumberShape.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  this.disposeInternalForShape();

  this.label_.dispose();
  delete this.label_;
};


/**
 * @param {thin.editor.PageNumberShape} parent
 * @param {thin.editor.Layout} layout
 * @param {Element=} opt_element
 * @constructor
 * @extends {thin.editor.AbstractText}
 * @private
 */
thin.editor.PageNumberShape.Label_ = function(parent, layout, opt_element) {
  var element = opt_element || layout.createSvgElement('text', 
        {'kerning': 'auto', 'font-size': 11, 'font-family': 'Helvetica', 'text-anchor': 'middle'});
  var fill = new goog.graphics.SolidFill('#666');

  /**
   * @type {thin.editor.PageNumberShape}
   * @private
   */
  this.parent_ = parent;

  goog.base(this, element, layout, null, fill);
};
goog.inherits(thin.editor.PageNumberShape.Label_, thin.editor.AbstractText);


thin.editor.PageNumberShape.Label_.prototype.reposition = function() {
  this.repositionX();
  this.repositionY();
};


thin.editor.PageNumberShape.Label_.prototype.repositionX = function() {
  this.setLeft(this.parent_.getLeft() + Math.floor(this.parent_.getWidth() / 2));
};


thin.editor.PageNumberShape.Label_.prototype.repositionY = function() {
  this.setTop(this.parent_.getTop() + 
      Number(this.getLayout().getElementAttribute(this.getElement(), 'font-size')));
};


/** @inheritDoc */
thin.editor.PageNumberShape.Label_.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  delete this.parent_;
};
