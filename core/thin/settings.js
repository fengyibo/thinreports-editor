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

goog.provide('thin.Settings');

goog.require('goog.array');
goog.require('goog.object');
goog.require('goog.storage.mechanism.HTML5LocalStorage');


/**
 * @constructor
 * @extends {goog.storage.mechanism.HTML5LocalStorage}
 */
thin.Settings = function() {
  goog.base(this);
};
goog.inherits(thin.Settings, goog.storage.mechanism.HTML5LocalStorage);
goog.addSingletonGetter(thin.Settings);


/**
 * @type {Array}
 * @const
 */
thin.Settings.DEFINITION = [
  // Default unit.
  'default_unit', 
  // System locale.
  'locale',
  // The directory of path that accessed image file at the last.
  'last_image_path', 
  // The directory of path that saved the layout definition file at the last.
  'last_layout_doc_path', 
  // The directory of path that accessed layout file at the last.
  'last_layout_path'
];


/**
 * @param {string} unit
 */
thin.Settings.prototype.setDefaultUnit = function(unit) {
  this.set('default_unit', unit);
};


/**
 * @return {string}
 */
thin.Settings.prototype.getDefaultUnit = function() {
  return this.get('default_unit')
      || /** @type {string} */ (thin.ui.InputUnitChanger.Unit.PX);
};


/** @override */
thin.Settings.prototype.set = function(key, value) {
  this.validateKey_(key);
  goog.base(this, 'set', key, value);
};


/** @override */
thin.Settings.prototype.get = function(key) {
  this.validateKey_(key);
  return goog.base(this, 'get', key);
};


/**
 * @param {string} key
 * @private
 */
thin.Settings.prototype.validateKey_ = function(key) {
  if (!goog.array.contains(thin.Settings.DEFINITION, key)) {
    throw new Error('Invalid configuration key');
  }
};

thin.settings = thin.Settings.getInstance();
