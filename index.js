//建立網址的常數(以後若API網址有變化，直接在此更改即可)
const BASE_URL = 'https://movie-list.alphacamp.io'  //API網站主網址
const INDEX_URL = BASE_URL + '/api/v1/movies/'   //不同API版本
const POSTER_URL = BASE_URL + '/posters/'

//常數、變數們
const movies = []  //存放電影資料常數
let filteredMovies = []  //存放搜尋結果
const MOVIES_PER_PAGE = 12  //每一個分頁顯示幾個電影
let model = 'picture'  //目前清單排版樣式
let patten = 'up'  //目前清單排列順序
let page = 1 //目前瀏覽頁數

//DOM節點
const moviePanel = document.querySelector('#movie-panel')  //電影列表
const searchMovie = document.querySelector('#search-movies') 
const searchInput = document.querySelector('#search-input') 
const home = document.querySelector('.home') 
const paginator = document.querySelector('#paginator')  //分頁器
const changeModel = document.querySelector('.change-model')  //改變排版模式

//透過API取得電影資訊
axios
.get(INDEX_URL)
.then((response) => {
    movies.push(...response.data.results)
    renderMovieList(getMoviesByPage(page, patten), model)
    renderPaginator(movies.length)
})
.catch((err) => console.log(err))

//DOM事件(按頁數決定載入那些影片)
paginator.addEventListener('click', function onPaginatorClicked (event){
  if (event.target.tagName !== 'A') return  //如果沒有按到分頁，結束函式
  page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page, patten), model)
})

//DOM事件 (顯示電影額外資訊、加入我最愛電影)
moviePanel.addEventListener('click', function onPanelClicked(event){
  const movieID = event.target.dataset.id
  const target = event.target
  if (target.matches('.btn-show-movie')) {  //按下More按鈕會跳出額外資訊  
    showMovieModal(movieID)
  } else if (target.matches('.btn-add-favorite')) {  //按到 + 將電影加入我的最愛
    addToFavorite(movieID)
    let heart
    if (model === 'picture') {
      heart = target.parentElement.nextElementSibling.firstElementChild
    } else if (model === 'list') {
      heart = target.parentElement.previousElementSibling.lastElementChild.lastElementChild
    }
    heart.classList.add('fas')
    heart.classList.remove('far')
  } else if (target.matches('.fa-heart')) {  //按到愛心，移除或加入我的最愛
    if (target.matches('.far')) {  //加入我的最愛
      target.classList.add('fas')
      target.classList.remove('far')
      addToFavorite(movieID)
    } else if (target.matches('.fas')) { //移除我的最愛
      target.classList.add('far')
      target.classList.remove('fas')
      removeFromFavorite(movieID)
    }
  }
})

//DOM事件 (改變排版模式)
changeModel.addEventListener('click', function changeModel(event){
  if (event.target.tagName !== 'I') return
  model = event.target.dataset.model || model
  patten = event.target.dataset.patten  || patten
  renderMovieList(getMoviesByPage(page, patten), model) 
})

//DOM建立搜尋結果(一旦文字輸入，即時顯示搜尋結果)
searchInput.addEventListener('input', function onSearchFormSubmitted(event) {
  const keyWords = searchInput.value.trim().toLowerCase()  //取得輸入的關鍵字，並去除空白和轉為小寫
  filteredMovies.splice(0, filteredMovies.length)
  if (keyWords.length > 0) {
    console.log(filteredMovies)
    for (const movie of movies) {
      if (movie.title.trim().toLowerCase().includes(keyWords)) {
        filteredMovies.push(movie)
      }
    }
  }
  if (filteredMovies.length > 0) {
    renderMovieList(getMoviesByPage(1, patten), model)
    renderPaginator(filteredMovies.length) 
  } else {
    moviePanel.innerHTML = `
      <div class="jumbotron container-fluid">
        <div class="container">
          <div><h1 class="display-4 mb-3">搜尋不到電影</h1><div>
          <div><p class="lead">請嘗試輸入其他關鍵字!!</p></div>
        </div>
      </div>
    `
  }
   
})

//DOM建立搜尋結果(按送出)
searchMovie.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()  //避免送出表單後網頁從新整理
  const keyWords = searchInput.value.trim().toLowerCase()  //取得輸入的關鍵字，並去除空白和轉為小寫
  filteredMovies.splice(0, filteredMovies.length)
  if (keyWords.length > 0) {
    for (const movie of movies) {
      if (movie.title.trim().toLowerCase().includes(keyWords)) {
        filteredMovies.push(movie)
        renderMovieList(getMoviesByPage(1, patten), model)
        renderPaginator(filteredMovies.length)  
      }
    }
  }
  if (filteredMovies.length === 0) {
    swal({
      title: `找不到${keyWords}的電影`,
      text: '嘗試輸入其他關鍵字吧!!',
      timer: 2000,
      showConfirmButton: false
    });
  }
})

//函式們///////////////////////////////////////////////////////////////////////////////////////////////////////////

//建立電影清單畫面函式(網頁整體版面)
function renderMovieList(data, model) { 
  let moviesList = ''
  let style = 'far'
  let list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  if (model === 'picture') {
    data.forEach(item => {
      const ID = item.id
      if (list.some(item => item.id === ID)) {
        style = 'fas'
      } else {
        style = 'far'
      }
      moviesList += `
      <div class="col-sm-6 col-md-4 col-lg-3">
        <div class="mb-2">
          <div class="card">
              <img
                src=${POSTER_URL + item.image}
                class="card-img-top"
                alt="Movie Poster"
              />
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer d-flex justify-content-between">
                <div>
                  <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id=${item.id}>More</button>
                  <button class="btn btn-info btn-add-favorite" data-id=${item.id}>+</button>
                </div>
                <div>
                  <i class="${style} fa-heart fa-2x" data-id=${item.id}></i>
                </div>
              </div>
          </div>
        </div>
      </div>`
    })
  } else if (model === 'list') {
    data.forEach(item => {
      const ID = item.id
      if (list.some(item => item.id === ID)) {
        style = 'fas'
      } else {
        style = 'far'
      }
      moviesList += `
      <hr/>
      <div class="container d-flex justify-content-between m-2">
        <div class="body d-flex justify-content-start">
          <h5 class="card-title">${item.title}</h5>
          <div class="ml-3"><i class="${style} fa-heart fa-2x" data-id=${item.id}></i></div>
        </div>
        <div class="footer"> 
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id=${item.id}>More</button>
          <button class="btn btn-info btn-add-favorite" data-id=${item.id}>+</button>
        </div>
      </div>
      `
    })
  }  
  moviePanel.innerHTML = moviesList
}

//建立電影Modal函式
function showMovieModal (ID) {
  const movieTitle = document.querySelector('.movie-title')
  const movieImg = document.querySelector('#movie-modal-image')
  const movieDate = document.querySelector('#movie-modal-date')
  const movieDescription = document.querySelector('#movie-modal-description')
  axios
  .get(INDEX_URL + ID)
  .then((response) => {
    const movieIfo = response.data.results
    movieTitle.innerText = movieIfo.title
    movieImg.innerHTML = `<img src=${POSTER_URL + movieIfo.image}>`
    movieDescription.innerText = movieIfo.description
    movieDate.innerText = `release at : ${movieIfo.release_date}`
  })
  .catch((err) => console.log(err))
}

//建立喜愛的電影清單
function addToFavorite (ID) {
  let id =Number(ID)
  let list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(item => item.id === id)
  if (list.some(item => item.id === id)) {
    swal("該電影已加入我的最愛")
  } else {
    list.push(movie)
    localStorage.setItem('favoriteMovies',JSON.stringify(list))
  } 
}

//將電影從最愛清單移除
function removeFromFavorite (ID) {
  let id =Number(ID)
  let list = JSON.parse(localStorage.getItem('favoriteMovies'))
  const index = list.findIndex(item => item.id === id)
  list.splice(index, 1)
  localStorage.setItem('favoriteMovies',JSON.stringify(list))
}

//建立分頁器
function renderPaginator (amount) {
  const page = Math.ceil(amount / MOVIES_PER_PAGE)
  let paginatorHTML = ''
  for (let p = 1 ; p <= page ; p++) {
    paginatorHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${p}">${p}</a></li>`
  }
  paginator.innerHTML = paginatorHTML
}

//載入不同分頁電影清單
function getMoviesByPage (page, patten) {
  //如果filteredMovies.length > 0 ，使用 filteredMovies 陣列，如果不是使用 movies 陣列
  let data = filteredMovies.length ? filteredMovies : movies 
  if (patten === 'up') {
    data = data.sort((a, b)=> a.title > b.title ? 1: -1)
  } else if (patten === 'down') {   
    data = data.sort((a, b) => b.title > a.title ? 1: -1)
  } 
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex+MOVIES_PER_PAGE)
}
