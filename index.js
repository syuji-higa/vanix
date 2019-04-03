/**
 * vanix v0.0.7
 * (c) 2019 Syuji Higa
 * @license MIT
 */

class Vanix {
  /**
   * @param {Object} object
   * @param {Object} [object.state]
   * @param {Object} [object.mutations]
   * @param {Object} [object.actions]
   */
  constructor({ state, mutations, actions }) {
    this._update = new Map();
    this._stateReadOnly = {};
    this._state = {};
    this._mutations = {};
    this._actions = {};

    this._stateReadOnly = this._createSstateReadOnly(state);
    this._state = this._createState(state);

    Object.assign(this._mutations, mutations || {});
    Object.assign(this._actions, actions || {});
  }

  /**
   * @return {Object}
   * @property {Object} state
   * @property {function} commit
   * @property {function} dispatch
   * @property {function} observe
   * @property {function} unobserve
   */
  create() {
    return {
      state: this._stateReadOnly,
      commit: this._commit.bind(this),
      dispatch: this._dispatch.bind(this),
      observe: this._observe.bind(this),
      unobserve: this._unobserve.bind(this)
    };
  }

  /**
   * @return {Instance}
   */
  destroy() {
    this._update.clear();
    for (const prop of Object.keys(this._stateReadOnly)) {
      delete this._stateReadOnly[prop];
    }
    for (const prop of Object.keys(this._state)) {
      delete this._state[prop];
    }
    return this;
  }

  /**
   * @param {Object} state
   * @return {Object}
   */
  _createSstateReadOnly(state) {
    return Object.keys(state).reduce((memo, prop) => {
      Object.defineProperty(memo, prop, {
        enumerable: true,
        configurable: true,
        get: function() {
          return state[prop];
        }
      });
      return memo;
    }, {});
  }

  /**
   * @param {Object} state
   * @return {Object}
   */
  _createState(state) {
    return Object.keys(state).reduce((memo, prop) => {
      const _this = this;
      Object.defineProperty(memo, prop, {
        enumerable: true,
        configurable: true,
        get: function() {
          return state[prop];
        },
        set: function(val) {
          if (state[prop] === val) {
            return;
          }
          state[prop] = val;
          if (_this._update.has(prop)) {
            _this._update.get(prop).forEach(func => {
              func(_this._stateReadOnly);
            });
          }
        }
      });
      return memo;
    }, {});
  }

  /**
   * @param {string} prop
   * @param {*} arg
   */
  _commit(prop, ...arg) {
    if (!(prop in this._mutations)) {
      throw new Error(`Not found "${prop}" mutations.`);
    }
    this._mutations[prop](this._state, ...arg);
  }

  /**
   * @param {string} prop
   * @param {*} arg
   */
  _dispatch(prop, ...arg) {
    if (!(prop in this._actions)) {
      throw new Error(`Not found "${prop}" actions.`);
    }
    this._actions[prop](
      {
        commit: this._commit.bind(this),
        state: this._state,
        getters: this._stateReadOnly,
        dispatch: this._dispatch.bind(this)
      },
      ...arg
    );
  }

  /**
   * @param {Object} observeObj
   * @return {Object}
   */
  _observe(observeObj) {
    for (const [prop, func] of Object.entries(observeObj)) {
      if (!this._update.has(prop)) {
        this._update.set(prop, new Set());
      }
      this._update.get(prop).add(func);
    }
    return observeObj;
  }

  /**
   * @param {Object} observeObj
   */
  _unobserve(observeObj) {
    for (const [prop, func] of Object.entries(observeObj)) {
      if (this._update.has(prop) && this._update.get(prop).has(func)) {
        this._update.get(prop).delete(func);
        if (0 >= this._update.get(prop).size) {
          this._update.delete(prop);
        }
      }
    }
  }
}

export { Vanix as default };
