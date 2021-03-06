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

goog.provide('thin.editor.ShapeStructure');

goog.require('goog.dom');
goog.require('goog.array');
goog.require('goog.object');
goog.require('goog.json');
goog.require('goog.json.Serializer');
goog.require('goog.math.Coordinate');
goog.require('thin.editor.TextStyle');
goog.require('thin.editor.TextStyle.HorizonAlignType');
goog.require('thin.editor.TextStyle.VerticalAlignType');


/**
 * @type {string}
 * @private
 */
thin.editor.ShapeStructure.BLANK_ = '';


/**
 * @param {Element} shape
 * @return {string}
 */
thin.editor.ShapeStructure.serialize = function(shape) {
  var shapeClassId = shape.getAttribute('class');
  var json = {
    'type': shapeClassId,
    'id': shape.getAttribute('x-id'),
    'display': shape.getAttribute('x-display') || 'true',
    'desc': shape.getAttribute('x-desc')
  };
  
  switch(shapeClassId) {
    case thin.editor.TblockShape.CLASSID:
      json = thin.editor.ShapeStructure.serializeForTblock_(shape, json);
      break;
    case thin.editor.ListShape.CLASSID:
      json = thin.editor.ShapeStructure.serializeForList_(shape, json);
      break;
    case thin.editor.TextShape.CLASSID:
      json = thin.editor.ShapeStructure.serializeForText_(shape, json);
      break;
    case thin.editor.ImageblockShape.CLASSID:
      json = thin.editor.ShapeStructure.serializeForImageblock_(shape, json);
      break;
    case thin.editor.PageNumberShape.CLASSID:
      json = thin.editor.ShapeStructure.serializeForPageNumber_(shape, json);
      break;
    default:
      var attrs = {};
      thin.editor.ShapeStructure.forEachShapeAttribute_(shape,
        function(key, value) {
          attrs[key] = value;
        });
      
      json['svg'] = {
        'tag':   shape.tagName,
        'attrs': attrs
      };
      break;
  }
  
  return goog.json.serialize(json);
};


/**
 * @param {Element} shape
 * @param {Object} json
 * @return {Object}
 * @private
 */
thin.editor.ShapeStructure.serializeForText_ = function(shape, json) {
  var attrs = {};
  var blank = thin.editor.ShapeStructure.BLANK_;

  if (shape.hasAttribute('x-line-height')) {
    json['line-height'] = Number(shape.getAttribute('x-line-height'));
  } else {
    json['line-height'] = blank;
  }

  json['valign'] = shape.getAttribute('x-valign') || blank;
  json['box'] = {
    'x': Number(shape.getAttribute('x-left')),
    'y': Number(shape.getAttribute('x-top')),
    'width': Number(shape.getAttribute('x-width')),
    'height': Number(shape.getAttribute('x-height'))
  };
  
  thin.editor.ShapeStructure.forEachShapeAttribute_(shape,
    function(key, value) {
      if (key == 'space') {
        key = 'xml:space'
      }
      attrs[key] = value;
    });
  
  var textLineShapes = [];
  var textLineContainer = [];
  
  goog.array.forEach(shape.childNodes, function(textlineElement) {
    if (textlineElement.tagName == 'text') {
      goog.array.insertAt(textLineShapes, 
            textlineElement, textLineShapes.length);
      goog.array.insertAt(textLineContainer, 
            textlineElement.firstChild.data, textLineContainer.length);
    }
  });

  json['text'] = textLineContainer;
  json['svg'] = {
    'tag':     shape.tagName,
    'attrs':   attrs,
    'content': thin.editor.ShapeStructure.serializeToContent(textLineShapes)
  };
  return json;
};


/**
 * @param {Element} shape
 * @param {Object} json
 * @return {Object}
 * @private
 */
thin.editor.ShapeStructure.serializeForImageblock_ = function(shape, json) {
  var left = Number(shape.getAttribute('x-left'));
  var top = Number(shape.getAttribute('x-top'));
  var width = Number(shape.getAttribute('x-width'));
  var height = Number(shape.getAttribute('x-height'));
  
  json['box'] = {
    'x': left,
    'y': top,
    'width': width,
    'height': height
  };
  
  json['position-x'] = shape.getAttribute('x-position-x')
    || thin.editor.ImageblockShape.PositionX.DEFAULT;
  json['position-y'] = shape.getAttribute('x-position-y')
    || thin.editor.ImageblockShape.PositionY.DEFAULT;
  
  json['svg'] = {
    'tag': 'image',
    'attrs': {
      'x': left,
      'y': top,
      'width': width,
      'height': height
    }
  };
  return json;
};



/**
 * @param {Element} shape
 * @param {Object} json
 * @return {Object}
 * @private
 */
thin.editor.ShapeStructure.serializeForTblock_ = function(shape, json) {
  var blank = thin.editor.ShapeStructure.BLANK_;
  var mutliple = shape.getAttribute('x-multiple') || 'false';
  var isMultiMode = mutliple == 'true';
  var anchor = shape.getAttribute('text-anchor');
  var tag = isMultiMode ? 'textArea' : 'text';
  var formatType = isMultiMode ? blank : shape.getAttribute('x-format-type') || blank;
  
  json['multiple'] = mutliple;
  json['valign'] = shape.getAttribute('x-valign') || blank;
  
  if (shape.hasAttribute('x-line-height')) {
    json['line-height'] = Number(shape.getAttribute('x-line-height'));
  } else {
    json['line-height'] = blank;
  }

  var format = {
    'base': shape.getAttribute('x-format-base') || blank,
    'type': formatType
  };
  if (formatType != blank) {
    switch (formatType) {
      case 'datetime':
        goog.object.set(format, formatType, {
          'format': shape.getAttribute('x-format-datetime-format') || blank
        });
        break;
      case 'number':
        goog.object.set(format, formatType, {
          'delimiter': shape.getAttribute('x-format-number-delimiter') || blank,
          'precision': Number(shape.getAttribute('x-format-number-precision')) || 0
        });        
        break;
      case 'padding':
        goog.object.set(format, formatType, {
          'length': Number(shape.getAttribute('x-format-padding-length')) || 0,
          'char': shape.getAttribute('x-format-padding-char') || '0',
          'direction': shape.getAttribute('x-format-padding-direction') || 'L'
        });        
        break;
    }
  }
  
  var attrs = {};
  
  var left = Number(shape.getAttribute('x-left'));
  var top = Number(shape.getAttribute('x-top'));
  var width = Number(shape.getAttribute('x-width'));
  var height = Number(shape.getAttribute('x-height'));
  
  var family = shape.getAttribute('font-family');
  var fontSize = Number(shape.getAttribute('font-size'));
  var isBold = shape.getAttribute('font-weight') == 'bold';

  json['box'] = {
    'x': left,
    'y': top,
    'width': width,
    'height': height
  };

  if (tag == 'text') {
    switch(anchor) {
      case thin.editor.TextStyle.HorizonAlignType.MIDDLE:
        left = thin.numberWithPrecision(left + (width / 2));
        break;
      case thin.editor.TextStyle.HorizonAlignType.END:
        left = thin.numberWithPrecision(left + width);
        break;
    }
    
    var ascent = thin.core.Font.getAscent(family, fontSize, isBold);
    
    attrs['x'] = left;
    attrs['y'] = thin.numberWithPrecision(top + ascent);
  } else {
    var heightAt = thin.core.Font.getHeight(family, fontSize);
    var lineHeight = thin.core.Font.getLineHeight(family, fontSize, isBold);
    
    attrs['x'] = left;
    attrs['y'] = thin.numberWithPrecision(top - (heightAt - lineHeight));
    attrs['width'] = width;
    attrs['height'] = height;
  }
  attrs['xml:space'] = 'preserve';

  thin.editor.ShapeStructure.forEachShapeAttribute_(shape,
    function(key, value) {
      attrs[key] = value;
    });
  
  json['format'] = format;
  json['value'] = shape.getAttribute('x-value') || blank;
  json['ref-id'] = shape.getAttribute('x-ref-id') || blank;
  json['overflow'] = shape.getAttribute('x-overflow') || blank;
  json['svg'] = {
    'tag': tag,
    'attrs': attrs
  };
  return json;
};


/**
 * @param {Element} shape
 * @param {Object} json
 * @return {Object}
 * @private
 */
thin.editor.ShapeStructure.serializeForPageNumber_ = function(shape, json) {
  var left = Number(shape.getAttribute('x-left'));
  var top = Number(shape.getAttribute('x-top'));
  var width = Number(shape.getAttribute('x-width'));

  var attrs = {};
  
  var family = shape.getAttribute('font-family');
  var fontSize = Number(shape.getAttribute('font-size'));
  var isBold = shape.getAttribute('font-weight') == 'bold';

  json['box'] = {
    'x': left,
    'y': top,
    'width': width, 
    'height': Number(shape.getAttribute('x-height'))
  };

  switch(shape.getAttribute('text-anchor')) {
    case thin.editor.TextStyle.HorizonAlignType.MIDDLE:
      attrs['x'] = thin.numberWithPrecision(left + (width / 2));
      break;
    case thin.editor.TextStyle.HorizonAlignType.END:
      attrs['x'] = thin.numberWithPrecision(left + width);
      break;
    default:
      attrs['x'] = left;
      break;
  }
  
  attrs['y'] = thin.numberWithPrecision(top + 
      thin.core.Font.getAscent(family, fontSize, isBold));

  thin.editor.ShapeStructure.forEachShapeAttribute_(shape,
    function(key, value) {
      attrs[key] = value;
    });
  
  json['start-at'] = shape.getAttribute('x-start-at') || '';
  json['target'] = shape.getAttribute('x-target') || '';
  json['format'] = shape.getAttribute('x-format') || '';
  json['overflow'] = shape.getAttribute('x-overflow') || '';
  json['svg'] = {
    'tag': 'text',
    'attrs': attrs
  };
  return json;
};


/**
 * @param {string} sectionClassId
 * @return {string}
 */
thin.editor.ShapeStructure.getSectionName = function(sectionClassId) {
  return sectionClassId.replace(/s\-list\-/, '');
};


/**
 * @param {Element} element
 * @param {Element} parentElement
 * @return {string}
 */
thin.editor.ShapeStructure.getEnabledOfSection = function(element, parentElement) {
  var sectionClassId = element.getAttribute('class');
  var sectionName = thin.editor.ShapeStructure.getSectionName(sectionClassId);
  return parentElement.getAttribute('x-' + sectionName + '-enabled') || 'true';
};


/**
 * @param {Element} shape
 * @param {Object} json
 * @return {Object}
 * @private
 */
thin.editor.ShapeStructure.serializeForList_ = function(shape, json) {
  var listShapeClassId = thin.editor.ListShape.ClassIds;
  var classIdPrefix = thin.editor.ListShape.CLASSID;
  var headerClassId = classIdPrefix + listShapeClassId['HEADER'];
  var detailClassId = classIdPrefix + listShapeClassId['DETAIL'];
  var listGroupChildNodes = shape.childNodes;
  var detailTop = Number(thin.editor.getElementByClassNameForChildNodes(
                      detailClassId, listGroupChildNodes).getAttribute('x-top'));

  var enabledForSection;
  var sectionName;
  var childGroupClassId;
  var isDetailSection;
  
  goog.array.forEachRight(listGroupChildNodes, function(childShape) {
    childGroupClassId = childShape.getAttribute('class');
    if (childShape.tagName == 'g') {
      enabledForSection = thin.editor.ShapeStructure.getEnabledOfSection(childShape, shape);
      sectionName = thin.editor.ShapeStructure.getSectionName(childGroupClassId);
      isDetailSection = childGroupClassId == detailClassId;
      json[sectionName] = thin.editor.ShapeStructure.serializeForListForSection_(
                              childShape, enabledForSection == 'true', 
                              (childGroupClassId == headerClassId || 
                               isDetailSection) ? null : detailTop);
      if (!isDetailSection) {
        json[sectionName + '-enabled'] = enabledForSection;        
      }
    }
  });
  json['svg'] = {
    'tag': shape.tagName,
    'attrs': {}
  };
  
  var headerStruct = json[thin.editor.ShapeStructure.getSectionName(headerClassId)];
  var headerHeight = 0;
  if (goog.isDef(headerStruct['height'])) {
    headerHeight = Number(headerStruct['height']);
  }
  json['content-height'] = Number(shape.getAttribute('height')) - headerHeight;
  json['page-break'] = shape.getAttribute('x-changing-page') || 'false';
  
  return json;
};


/**
 * @param {Node} sectionGroup
 * @param {boolean} enabled
 * @param {number=} opt_detailTop
 * @return {Object}
 * @private
 */
thin.editor.ShapeStructure.serializeForListForSection_ = function(
    sectionGroup, enabled, opt_detailTop) {

  if (!enabled) {
    goog.dom.removeChildren(sectionGroup);
    return {};
  }
  var json = {
    'height': Number(sectionGroup.getAttribute('x-height')),
    'svg': {
      'tag': sectionGroup.tagName,
      'content': thin.editor.ShapeStructure.serializeToContent(
                    thin.editor.LayoutStructure.serializeShapes(
                        sectionGroup.cloneNode(true).childNodes, 1))
    }
  };

  var translate = thin.editor.ShapeStructure.getTransLateCoordinate(sectionGroup);
  var isCalculateDiff = goog.isNumber(opt_detailTop);
  if (isCalculateDiff) {
    var diffY = Number(sectionGroup.getAttribute('x-top')) - opt_detailTop;
  }
  
  goog.object.set(json, 'translate', {
    'x': translate.x,
    'y': isCalculateDiff ? translate.y - diffY : translate.y
  });

  return json;
};


/**
 * @param {Element|Node} transformElement
 * @return {goog.math.Coordinate}
 */
thin.editor.ShapeStructure.getTransLateCoordinate = function(transformElement) {
  var affineTransform = transformElement.getAttribute('transform');
  var x = 0;
  var y = 0;
  
  if(goog.isDefAndNotNull(affineTransform)) {
    var splitTransLate = affineTransform.match(/[\-\d\,\.]+/)[0].split(',');
    if(splitTransLate.length == 1) {
      x = y = Number(splitTransLate[0]);
    } else {
      x = Number(splitTransLate[0]);
      y = Number(splitTransLate[1]);
    }
  }
  return new goog.math.Coordinate(x, y);
};


/**
 * @param {goog.array.ArrayLike} childNodes
 * @return {string}
 */
thin.editor.ShapeStructure.serializeToContent = function(childNodes) {
  var content = '';
  var xml;
  goog.array.forEach(childNodes, function(element) {
    xml = thin.editor.serializeToXML(element);
    xml = thin.editor.LayoutStructure.fixSerializationXmlSpace(xml);
    xml = thin.editor.LayoutStructure.fixSerializationHref(xml);
    content += xml;
  });
  
  return content;
};


/**
 * @param {Element} shape
 * @param {Function} f
 * @private
 */
thin.editor.ShapeStructure.forEachShapeAttribute_ = function(shape, f) {
  var attrName;
  for(var i = 0, attr; attr = shape.attributes[i]; i++) {
    attrName = attr.name;
    if (!/^x-/.test(attrName) && attrName != 'class' && attrName != 'style') {
      f(attrName, attr.value);
    }
  }
};
