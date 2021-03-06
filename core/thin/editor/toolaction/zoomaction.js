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

goog.provide('thin.editor.toolaction.ZoomAction');
goog.provide('thin.editor.toolaction.ZoomAction.CursorPath_');

goog.require('thin.editor.toolaction.AbstractAction');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.math.Coordinate');
goog.require('thin.editor.Cursor');


/**
 * @constructor
 * @extends {thin.editor.toolaction.AbstractAction}
 */
thin.editor.toolaction.ZoomAction = function() {
  thin.editor.toolaction.AbstractAction.call(this);
};
goog.inherits(thin.editor.toolaction.ZoomAction, thin.editor.toolaction.AbstractAction);


/**
 * @enum {string}
 * @private
 */
thin.editor.toolaction.ZoomAction.CursorPath_ = {
  ZOOMIN: 'assets/icons/zoom-in.png',
  ZOOMOUT: 'assets/icons/zoom-out.png'
};


/**
 * @param {thin.editor.Layer} zoomLayer
 * @private
 */
thin.editor.toolaction.ZoomAction.prototype.setZoomOutMode_ = function(zoomLayer) {
  zoomLayer.setCursor(new thin.editor.Cursor(
      thin.editor.toolaction.ZoomAction.CursorPath_.ZOOMOUT, true));
  this.layout.setElementCursor(zoomLayer.getElement(), zoomLayer.getCursor());
};


/**
 * @param {thin.editor.Layer} zoomLayer
 * @private
 */
thin.editor.toolaction.ZoomAction.prototype.setZoomInMode_ = function(zoomLayer) {
  zoomLayer.setCursor(new thin.editor.Cursor(
      thin.editor.toolaction.ZoomAction.CursorPath_.ZOOMIN, true));
  this.layout.setElementCursor(zoomLayer.getElement(), zoomLayer.getCursor());
};


/**
 * @param {goog.events.BrowserEvent} e
 * @private
 */
thin.editor.toolaction.ZoomAction.prototype.setZoomMode_ = function(e) {
  if (e.keyCode == goog.events.KeyCodes.ALT) {
    var zoomLayer = this.layout.getHelpers().getZoomLayer();
    if (e.altKey) {
      this.setZoomOutMode_(zoomLayer);
    } else {
      this.setZoomInMode_(zoomLayer);
    }
  }
};


/**
 * @param {goog.events.BrowserEvent} e
 * @private
 */
thin.editor.toolaction.ZoomAction.prototype.handleMouseDownAction_ = function(e) {
  var workspace = this.workspace;
  workspace.focusElement(e);
  var zoom = workspace.getUiStatusForZoom();
  zoom = e.altKey ? thin.numberWithPrecision(zoom - 10, 0) : 
                    thin.numberWithPrecision(zoom + 10, 0);
  workspace.getAction().actionSetZoom(zoom, this.calculatePosition_(e));
  e.preventDefault();
};


/**
 * @param {goog.events.BrowserEvent} e
 * @return {goog.math.Coordinate}
 * @private
 */
thin.editor.toolaction.ZoomAction.prototype.calculatePosition_ = function(e) {
  var layout = this.layout;
  var bounds = layout.getOffsetTarget().getBoundingClientRect();
  var rate = layout.getPixelScale();
  return new goog.math.Coordinate(
           thin.numberWithPrecision((e.clientX - bounds.left) / rate), 
           thin.numberWithPrecision((e.clientY - bounds.top) / rate));
};


/**
 * @param {goog.events.BrowserEvent} e
 * @param {thin.editor.Workspace} workspace
 * @protected
 */
thin.editor.toolaction.ZoomAction.prototype.handleActionInternal = function(e, workspace) {

  var eventType = goog.events.EventType;
  var zoomLayer = this.layout.getHelpers().getZoomLayer();
  zoomLayer.setDisposed(false);
  this.setZoomInMode_(zoomLayer);
  
  zoomLayer.addEventListener(eventType.MOUSEDOWN, this.handleMouseDownAction_, false, this);

  var eventHandler = workspace.getHandler();
  var workspaceElement = workspace.getElement();
  eventHandler.listen(workspaceElement, eventType.KEYDOWN, this.setZoomMode_, false, this);
  eventHandler.listen(workspaceElement, eventType.KEYUP, this.setZoomMode_, false, this);

  zoomLayer.setVisibled(true);
};