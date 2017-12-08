import axios from 'axios'
import vue from 'vue'
import vuex from 'vuex'
import router from '../router'

let api = axios.create({
  baseURL: 'http://localhost:3000/api/',
  timeout: 2000,
  withCredentials: true
})

let auth = axios.create({
  baseURL: 'http://localhost:3000/',
  timeout: 2000,
  withCredentials: true
})
vue.use(vuex)

var store = new vuex.Store({
  state: {
    dashboard: [],
    activeCategory: {},
    activeLists: [],
    activeProducts: {},
    activeNotes: {},
    error: {},
    user: {}
  },
  mutations: {
    setUser(state, data) {
      state.user = data
      console.log('setUser: ', data)
      console.log("User: ", state.user)
    },
    setCategorys(state, data) {
      state.dashboard = data
    },
    handleError(state, err) {
      state.error = err
    },
    setActiveCategory(state, payload) {
      state.activeCategory = payload
    },
    setActiveLists(state, lists) {
      state.activeLists = lists
    },
    setActiveProducts(state, payload) {
      vue.set(state.activeProducts, payload.listId, payload.product)
    },
    setActiveNotes(state, payload) {
      vue.set(state.activeNotes, payload.productId, payload.note)
    }
  },
  actions: {

    //--------BOARDS-----------//
    getCategorys({ commit, dispatch }) {
      api('userboards')
        .then(res => {
          commit('setCategorys', res.data.data)
        })
        .catch(err => {
          commit('handleError', err)
        })
    },
    getCategory({ commit, dispatch }, payload) {
      api('dashboard/' + payload.categoryId)
        .then(res => {
          commit('setActiveCategory', res.data.data)
          dispatch('getLists', res.data.data._id)
        })
        .catch(err => {
          commit('handleError', err)
        })
    },
    createCategory({ commit, dispatch }, category) {
      api.post('dashboard/', category)
        .then(res => {
          dispatch('getCategorys')
        })
        .catch(err => {
          commit('handleError', err)
        })
    },
    removeCategory({ commit, dispatch }, category) {
      api.delete('dashboard/' + category._id)
        .then(res => {
          dispatch('getCategorys')
        })
        .catch(err => {
          commit('handleError', err)
        })
    },
    //^^^^^^^^^^^^^^BOARDS^^^^^^^^^^^^^^^^^//




    //-------------LISTS-------------------//
    getLists({ commit, dispatch }, id) {
      api('dashboard/' + id + '/lists')
        .then(res => {
          commit('setActiveLists', res.data.data)
        })
        .catch(err => {
          commit('handleError', err)
        })
    },
    createList({ commit, dispatch }, payload) {
      api.post('lists/', payload.list)
        .then(res => {
          dispatch('getLists', payload.list.categoryId)
        })
        .catch(err => {
          commit('handleError', err)
        })
    },
    removeList({ commit, dispatch }, payload) {
      api.delete('lists/' + payload.listId)
        .then(res => {
          dispatch('getLists', payload.categoryId)
        })
        .catch(err => {
          commit('handleError', err)
        })
    },
    //^^^^^^^^^^^^^LISTS^^^^^^^^^^^^^^^^^^//



    //-------------TASKS-----------------//
    getProducts({ commit, dispatch }, payload) {
      api('dashboard/' + payload.categoryId + '/lists/' + payload.listId + '/products')
        .then(res => {
          commit('setActiveProducts', { product: res.data.data, listId: payload.listId })
        })
        .catch(err => {
          commit('handleError', err)
        })
    },

    createProduct({ commit, dispatch }, payload) {
      api.post('/products', payload.product)
        .then(res => {
          dispatch('getProducts', payload.product)
        })
        .catch(err => {
          commit('handleError', err)
        })
    },
    moveProductToDifferentList({ commit, dispatch }, payload) {

      api.put('products/' + payload.productId, {
        listId: payload.listId
      })
        .then(res => {
          dispatch('getProducts', payload)
          dispatch('getProducts', { listId: payload.oldListId, categoryId: payload.categoryId })
          //getProducts?
        })
        .catch(err => {
          commit('handleError', err)
        })
    },
    removeProduct({ commit, dispatch }, payload) {
      api.delete('products/' + payload.productId)
        .then(res => {
          dispatch('getProducts', payload)
        })
        .catch(err => {
          commit('handleError', err)
        })
    },
    //^^^^^^^^^^^^^TASKS^^^^^^^^^^^^^^^^^//



    //------------COMMENTS--------------//
    getNotes({ commit, dispatch }, payload) {
      api('dashboard/' + payload.categoryId + '/lists/' + payload.listId + '/products/' + payload.productId + '/notes')
        .then(res => {

          commit('setActiveNotes', { note: res.data.data, productId: payload.productId })
        })
        .catch(err => {
          commit('handleError', err)
        })
    },
    newNote({ commit, dispatch }, payload) {
      api.post('/notes', payload.note)
        .then(res => {

          dispatch('getNotes', payload.note)
        })
        .catch(err => {
          commit('handleError', err)
        })
    },
    removeNote({ commit, dispatch }, payload) {
      api.delete('notes/' + payload.noteId)
        .then(res => {
          dispatch('getNotes', payload)
        })
        .catch(err => {
          commit('handleError', err)
        })
    },
    //^^^^^^^^^^^COMMENTS^^^^^^^^^^^^^^//



    //---------LOGIN/REGISTER/LOGOUT-----------//
    userLogin({ commit, dispatch }, login) {
      auth.post('login', login)
        .then(res => {
          commit('setUser', res.data.data)
          router.push({ name: 'Dashboard' })
        })
        .catch(() => {
          router.push({ name: "Login" })
        })
    },
    userRegister({ commit, dispatch }, register) {
      auth.post('register', register)
        .then(res => {
          commit('setUser', res.data.data)
          router.push({ name: 'Dashboard' })
        })
        .catch(err => {
          commit('handleError', err)
          router.push({ name: "Login" })
        })
    },
    authenticate({ commit, dispatch }) {
      auth('authenticate')
        .then(res => {
          commit('setUser', res.data.data)
          router.push({ name: 'Dashboard' })
        })
        .catch(() => {
          router.push({ name: "Login" })
        })
    },
    logout({ commit, dispatch }, user) {
      auth.delete('logout')
        .then(res => {
          console.log(res)
          dispatch('authenticate')
        })
        .catch(err => {
          console.log(err)
          res.status(401).send({ Error: err })
        })
    },
    //^^^^^^^^^^^^^^USER/REGISTER/LOGOUT^^^^^^^^^^^//

    handleError({ commit, dispatch }, err) {
      commit('handleError', err)
    }
  }
})


export default store
