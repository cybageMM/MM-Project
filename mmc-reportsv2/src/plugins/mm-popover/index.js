"use strict";
var _ = require('underscore');
var View = require('backbone').View;
var template = require('./default-popover-template.html');

/**
 * Utility that wraps Bootstrap popover component for common uses in MM project.
 * @module plugins/mm-popover/index
 *
 * Usage
 * @example <caption>Open popover over button and close it when use clicks the button</caption>
 * var MMPopover = require('plugins/mm-popover/index');
 *
 * var mmPopover = MMPopover($('#myButton'), { content: 'Press this button to make popover disappear' });
 * $('#myButton').on('click', mmPopover.hide());
 */
module.exports = (function() {
  MMPopover.MM_POPOVER_DATA_NAMESPACE = 'mmPopover';
  MMPopover.BS_POPOVER_DATA_NAMESPACE = 'bs.popover';

  /**
   * Default template used for popover
   */
  MMPopover.MM_DEFAULT_TEMPLATE = template;

  /**
   * @see {@link MMPopover~getTargetPopover}
   */
  MMPopover.getTargetPopover = getTargetPopover;

  /**
   * @see {@link MMPopover~hasPopover}
   */
  MMPopover.hasPopover = hasPopover;

  /**
   * @see {@link MMPopover~destroyPopoverOnTarget}
   */
  MMPopover.destroyPopoverOnTarget = destroyPopoverOnTarget;

  var TIP_MARGIN = 4;
  var TIP_INSET  = -18;

  var TIP_HORIZONTAL_POSITIONS = {
    left:   function(tipBounds, targetBounds) { return targetBounds.left - tipBounds.width - TIP_MARGIN; },
    bottom: function(tipBounds, targetBounds) { return targetBounds.left - tipBounds.width + TIP_MARGIN - TIP_INSET; },
    top:    function(tipBounds, targetBounds) { return Math.max(targetBounds.left - tipBounds.width + TIP_MARGIN - TIP_INSET, -TIP_INSET); },
    right:  function(tipBounds, targetBounds) { return targetBounds.right + TIP_MARGIN; }
  };

  var TIP_VERTICAL_POSITIONS = {
    bottom: function(tipBounds, targetBounds) { return targetBounds.bottom + TIP_MARGIN; },
    top:    function(tipBounds, targetBounds) { return targetBounds.top - tipBounds.height - TIP_MARGIN; },
    left:   function(tipBounds, targetBounds) { return targetBounds.bottom - targetBounds.height / 2 - tipBounds.height / 2; },
    right:  function(tipBounds, targetBounds) { return targetBounds.bottom - targetBounds.height / 2 - tipBounds.height / 2; }
  };

  var ESC_KEY_CODE = 27;

  var NATIVE_POPOVER_OPTIONS = 'animation container content delay html placement selector template title trigger viewport'.split(' ');

  var INITIALIZED_STATE = 'initialized';
  var SHOWING_STATE = 'showing';
  var SHOWN_STATE = 'shown';
  var HIDE_STATE = 'hide';
  var HIDDEN_STATE = 'hidden';
  var DESTROYED_STATE = 'destroyed';

  var defaults = {

    // default native parameters for BS popover
    animation: false,
    container: false,
    placement: 'auto bottom',
    trigger: 'manual',
    html: true,

    /**
     * HTML string or Underscore template function
     */
    template: MMPopover.MM_DEFAULT_TEMPLATE,

    /**
     * Data for Underscore template function
     */
    templateData: { className: ''},

    /**
     * Additional css for popover DOM element
     */
    css: null,

    /**
     * Auto adjust position
     */
    autoPosition: false,

    /**
     * Destroy popover instance when .hide() is called
     */
    destroyOnHide: true,

    /**
     * Automatically open popover after it's creation. If it's false,
     * then .show() method should be called manually
     */
    autoShow: true,

    /**
     * Function that provides content view destruction logic or Boolean true if
     * standard Backbone View destruction should by applied (.off() and .destroy()).
     * If False or nothing is provided then no actions are performed
     */
    destroyView: false,

    /**
     * Callback to execute on `shown.bs.popover` event
     **/
    onShown: null,

    /**
     * Callback to execute on `hide.bs.popover` event
     **/
    onHide: null,

    /**
     * Callback to execute on `hidden.bs.popover` event
     **/
    onHidden: null,

    /**
     * User interaction with current container will not close current popover
     * useful in cases to open another new popover from existing one
     */
    relatedContainer: null
  };

  /**
   * @private
   * @static
   * @param content
   * @param thisObj
   * @returns {Function}
   */
  function contentFactory(content, thisObj) {
    return function() {
      if (content instanceof View) {
        return content.render().$el;
      }
      if (content instanceof $) {
        return content.html();
      }
      if (content instanceof Function) {
        return content.apply(thisObj);
      }
      if (!content) {
        return '';
      }
      return content;
    };
  }

  /**
   * @private
   * @static
   * @param event
   */
  function onKeyUp(event) {
    if (event.keyCode === ESC_KEY_CODE) {
      event.data._closeCallback();
    }
  }

  /**
   * @private
   */
  function getPosition(tipBounds, targetBounds, placement, vertical) {
    if (vertical) {
      return TIP_VERTICAL_POSITIONS[placement](tipBounds, targetBounds);
    } else {
      return TIP_HORIZONTAL_POSITIONS[placement](tipBounds, targetBounds);
    }
  }

  /**
   * @private
   */
  function adjustFixedPositionToTarget($tip, $target) {
    var placement     = getTipPlacement($tip);
    var targetBounds  = $target.get(0).getBoundingClientRect();
    var tipBounds     = $tip.get(0).getBoundingClientRect();

    $tip.css({
      position: 'fixed',
      left: getPosition(tipBounds, targetBounds, placement, false),
      top: getPosition(tipBounds, targetBounds, placement, true)
    });
  }

  /**
   * @private
   */
  function getTipPlacement($tip) {
    return ['top', 'left', 'right', 'bottom'].filter(function(cssClass) {
      return $tip.hasClass(cssClass);
    })[0];
  }

  /**
   * Get MMPopover instance associated with element
   * @param   {Element|jQuery} target
   * @returns {MMPopover}
   */
  function getTargetPopover(target) {
    return $(target).data(MMPopover.MM_POPOVER_DATA_NAMESPACE);
  }

  /**
   * Check if element has MMPopover instance opened
   * @param   {Element|jQuery} target
   * @returns {Boolean}
   */
  function hasPopover(target) {
    return !!getTargetPopover(target);
  }

  /**
   * Destroy MMPopover instance if there is one associated with DOM element or jQuery instance
   * @param   {Element|jQuery} target
   * @returns {MMPopover}
   */
  function destroyPopoverOnTarget(target) {
    var mmPopover = getTargetPopover(target);
    if (mmPopover) {
      mmPopover.destroy();
      return mmPopover;
    }
  }

  /**
   * @callback contentCallback
   * @returns {String} - String template
   */

  /**
   * @callback eventCallback
   * @param {Event} - event
   */

  /**
   * Create popover on element
   * @constructor
   * @param {Element|jQuery} element - DOM element of jQuery selection
   * @param {Object} options
   * @param {String|jQuery|Backbone.View|contentCallback} options.content - content to be displayed in popover.
   * @param {Boolean|String|jQuery} [options.container=false] - container to which popover will be appended. By default it is next to target.<br> Beware that if your content visuals depends on inherited styles then it may brake if you place it in wrong container.
   * @param {String} [options.placement='auto bottom'] - popover placement: 'auto', 'left', 'top', 'right', 'bottom'
   * @param {String|contentCallback|Boolean} [options.template=MMPopover.MM_DEFAULT_TEMPLATE] - Base HTML to use when creating the popover.
   * @param {Object} [options.templateData={ className: ''}] - data to supply to template function
   * @param {Boolean} [options.autoPosition=false] - Adjust popover position if it uses global container.
   * @param {Object} [options.css=] - Additional css for popover DOM element
   * @param {Boolean} [options.autoShow=true] - Automatically open popover after it's creation. If it's false, then MMPopover#show() method should be called manually
   * @param {Boolean} [options.destroyOnHide=true] - Destroy popover instance when MMPopover#hide() is called
   * @param {Object} [options.relatedContainer] - User interaction with current container will not close current popover, useful in cases to open another new popover from existing one
   * @param {Boolean|Function} [options.destroyView=true] - Callback that provides content view destruction logic.<br> If `true` is provided then standard Backbone View destruction would by applied (View#off() and View#destroy()).<br> If false or nothing - no action is taken.
   * @param {eventCallback} [options.onShown] - Callback to execute on `shown.bs.popover` event
   * @param {eventCallback} [options.onHide] - Callback to execute on `hide.bs.popover` event
   * @param {eventCallback} [options.onHidden] - Callback to execute on `hidden.bs.popover` event
   */
  function MMPopover(element, options) {
    // overcome call of the constructor without `new`
    if (this === undefined || this === window) {
      return new MMPopover(element, options);
    }

    if (!element || !((element instanceof Element) || ((element instanceof $) && element.length))) {
      throw new TypeError('Parameter element must be instance of non empty jQuery or DOM Element and not null');
    }

    if ((element instanceof $) && element.length > 1) {
      console.warn('Reducing jQuery set to one element');
      element = element.first();
    }

    if (!options.content) {
      console.warn('No content is set for popover!');
    }

    this.setState(INITIALIZED_STATE);

    var $target = this.$target  = $(element);

    var opts    = this.opts     = _.defaults(options, defaults);

    // Destroy existing MMPopover instance if it already exist on target
    var mmPopover = getTargetPopover($target);
    if (mmPopover) {
      mmPopover.destroy();
    }

    if (opts.scrollParent) {
      this.scrollParent = $(opts.scrollParent);
    } else if ($target.scrollParent) { // it may be undefined if jquery-ui is not loaded
      this.scrollParent = $target.scrollParent();
    } else {
      this.scrollParent = $('body');
    }

    opts.content = contentFactory(opts.content, $target.get(0));

    if (typeof opts.template === 'function') {
      opts.template = opts.template(opts.templateData);
    } else if (opts.template === false) {
      delete opts.template;
    }

    this.setRelatedContainer(opts.relatedContainer);

    var nativePopoverOptions = _.pick(opts, NATIVE_POPOVER_OPTIONS);
    $target.popover(nativePopoverOptions)
      .on('shown.bs.popover', $.proxy(this._onShown, this))
      .on('hide.bs.popover', $.proxy(this._onHide, this))
      .on('hidden.bs.popover', $.proxy(this._onHidden, this));

    // save this instance in elements data for later operations
    $target.data(MMPopover.MM_POPOVER_DATA_NAMESPACE, this);
    this._bsPopoverInstance = $target.data(MMPopover.BS_POPOVER_DATA_NAMESPACE);
    this._closeCallback = this.opts.destroyOnHide ? $.proxy(this.destroy, this) : $.proxy(this.hide, this);

    if (opts.autoShow) {
      this.show();
    }
  }

  /**
   * Show popover
   */
  MMPopover.prototype.show = function show() {
    if (!!~[HIDDEN_STATE, INITIALIZED_STATE].indexOf(this.getState())) {
      this.setState(SHOWING_STATE);
      this.$target.popover('show');
    } else {
      throw new Error('Illegal state transition from state [' + this.getState() + '] to [' + SHOWING_STATE + '].');
    }
  };

  /**
   * Hide popover
   */
  MMPopover.prototype.hide = function hide(event) {
    if (event) {
      event.stopPropagation();
    }
    if (!!~[SHOWN_STATE].indexOf(this.getState())) {
      this.setState(HIDE_STATE);
      this._unbindEvents();
      this.$target.popover('hide');
    } else {
      throw new Error('Illegal state transition from state [' + this.getState() + '] to [' + HIDE_STATE + '].');
    }
  };

  /**
   * @private
   */
  MMPopover.prototype._onShown = function  _onShown(event) {
    this.setState(SHOWN_STATE);
    _.defer(function() {
      document.body.addEventListener('click', this._closeCallback, true);
      $(window).on('show.bs.modal', this._closeCallback);
      $(window).on('resize scroll', this._closeCallback);
      if (this.scrollParent) {
        this.scrollParent.on('scroll', this._closeCallback);
      }
      $(document).on('keyup', null, this, onKeyUp);
    }.bind(this));
    if (this.opts.onShown) {
      this.opts.onShown(event);
    }
    var $tip = this._bsPopoverInstance.tip();

    if (this.opts.css) {
      if (typeof this.opts.css === 'function') {
        $tip.css(this.opts.css($tip[0], this.$target[0]));
      } else {
        $tip.css(this.opts.css);
      }
    }

    if (this.opts.autoPosition) {
      adjustFixedPositionToTarget($tip, this.$target);
    }
  };

  MMPopover.prototype._onHide = function _onHide(event) {
    this._unbindEvents();
    if (this.opts.onHide) {
      this.opts.onHide(event);
    }
  };

  MMPopover.prototype._unbindEvents = function _unbindEvents() {
    document.body.removeEventListener('click', this._closeCallback, true);
    $(window).off('resize scroll', this._closeCallback);
    $(window).off('show.bs.modal', this._closeCallback);
    if (this.scrollParent) {
      this.scrollParent.off('scroll', this._closeCallback);
    }
    $(document).off('keyup', onKeyUp);
  };

  MMPopover.prototype._onHidden = function _onHidden(event) {
    this.setState(HIDDEN_STATE);
    if (this.opts.onHidden) {
      this.opts.onHidden(event);
    }
  };

  /**
   * Check that event is coming from relatedContainer
   * @param target - event target
   * @returns {boolean} - true if event comes from relatedContainer, false otherwise
   */
  MMPopover.prototype.isInRelatedContainer = function(target) {
    var cont = this.getRelatedContainer();
    return !!(cont && (cont.is(target) || cont.has(target).length));
  };

  /**
   * Destroy popover
   * @param event
   */
  MMPopover.prototype.destroy = function destroy(event) {
    // do not react to events coming from within popover except resize
    if ((event instanceof Event) || (event instanceof $.Event) && event.type !== 'resize') {
      var $eventTarget = $(event.target);
      if (!this._bsPopoverInstance || (this._bsPopoverInstance.tip().has($eventTarget).length) || this.isInRelatedContainer($eventTarget)) {
        return;
      }
    }
    this.setState(DESTROYED_STATE);
    this._unbindEvents();
    this.$target.off('hidden.bs.popover hide.bs.popover shown.bs.popover');
    if (this.opts.destroyView) {
      if (typeof this.opts.destroyView === 'function') {
        this.opts.destroyView();
      } else if (this.opts.destroyView === true) {
        console.log('Performing automatic popover view destruction');
        if (this.opts.content instanceof View) {
          this.opts.content.off();
          this.opts.content.remove();
          this.opts.content.destroy();
        }
      }
    }
    if (this.opts.onDestroy) {
      this.opts.onDestroy();
    }
    // There is a chance that view in witch original target was located was re-rendered and target lost it's data so we have to reassign it back
    if (!this.$target.data(MMPopover.BS_POPOVER_DATA_NAMESPACE)) {
      this.$target.data(MMPopover.BS_POPOVER_DATA_NAMESPACE, this._bsPopoverInstance);
    }
    this.$target.popover('destroy');
    this.$target.removeData([MMPopover.MM_POPOVER_DATA_NAMESPACE, MMPopover.BS_POPOVER_DATA_NAMESPACE]);
    this._bsPopoverInstance = undefined;
  };

  /**
   * @private
   * @param state
   */
  MMPopover.prototype.setState = function setState(state) {
    this._state = state;
  };

  /**
   * @private
   * @returns {*}
   */
  MMPopover.prototype.getState = function getState() {
    return this._state;
  };

  /**
   * Is popover currently being displayed
   * @returns {boolean}
   */
  MMPopover.prototype.isShown = function isShown() {
    return this.getState() === SHOWN_STATE;
  };

  /**
   * Is popover hidden
   * @returns {boolean}
   */
  MMPopover.prototype.isHidden = function isHidden() {
    return this.getState() === HIDDEN_STATE;
  };

  /**
   * Returns relatedContainer
   * @returns {jQuery}
   */
  MMPopover.prototype.getRelatedContainer = function() {
    return this._relatedContainer;
  };

  /**
   * Specify additional DOM element
   * @param {HTMLElement| jQuery} container - DOM element or jQuery object
   */
  MMPopover.prototype.setRelatedContainer = function(container) {
    this._relatedContainer = container ? $(container) : null;
  };

  return MMPopover;
})();
