# Vanix
[Vuex](https://github.com/vuejs/vuex) like Flux Library.  
Not support component.  
Support ES6 or later. Please transpile if want supporting ES5.

## install
```
$ npm install vanix --save-dev
```

## How to use

### store.js
```js
import Vanix from 'vanix'

const state = {
  alpha: 'Alpha',
  beta: 'Beta',
  charlie: 'Charlie'
}

const mutations = {
  setCharlie(state, data) {
    state.charlie = data
  }
}

const actions = {
  async asyncSetCharlie(context, data) {
    // const { commit, state, getters, dispatch } = context
    await new Promise((resolve) => {
      setTimeout(() => {
        context.commit('setCharlie', data)
        resolve()
      }, 1000)
    })
  }
}

const vanix = new Vanix({ state, mutations, actions })

export const store = vanix.create()
```

### main.js
```js
import { store } from './store'

// get
console.log(store.state.alpha) // Alpha

// set (commit)
store.commit('setCharlie', 'New Charlie')

// async commit
store.dispatch('asyncSetCharlie', 'Super Charlie')

// observe
const storeObserveObj = store.observe({
  beta(state) {
    console.log(state.beta) // Beta
  }
})

// unobserve
store.unobserve(storeObserveObj)
```

## Destroy

```js
import Vanix from 'vanix'

const vanix = new Vanix()
const store = vanix.create()

vanix.destroy()
```
