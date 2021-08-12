//建立網址的常數(以後若API網址有變化，直接在此更改即可)
const BASE_URL = 'https://movie-list.alphacamp.io'  //API網站主網址
const INDEX_URL = BASE_URL + '/api/v1/movies/'   //不同API版本
const POSTER_URL = BASE_URL + '/posters/'

//常數、變數們
const MOVIES_PER_PAGE = 12  //每一個分頁顯示幾個電影
let model = 'picture'  //目前清單排版樣式
let patten = 'up'  //目前清單排列順序
let page = 1 //目前瀏覽頁數


//DOM節點
const moviePanel = document.querySelector('#movie-panel')  //電影列表
const paginator = document.querySelector('#paginator')  //分頁器
const changeModel = document.querySelector('.change-model')  //改變排版模式

//取出最愛電影清單的資料
let movieData = JSON.parse(localStorage.getItem('favoriteMovies')) || []

//一開始載入最愛的電影清單畫面
renderMovieList(getMoviesByPage(1, patten), model)
renderPaginator(movieData.length)

//DOM事件 (看詳細電影資訊、刪除最愛電影清單)
moviePanel.addEventListener('click', function onPanelClicked(event){
    const movieID = event.target.dataset.id
    if (event.target.matches('.btn-show-movie')) {  //按下More按鈕會跳出額外資訊  
        showMovieModal(movieID)
    } else if (event.target.matches('.btn-add-delete')) {
        deleteFavorite(movieID)
    }
})

//DOM事件(按頁數決定載入那些影片)
paginator.addEventListener('click', function onPaginatorClicked (event){
  if (event.target.tagName !== 'A') return  //如果沒有按到分頁，結束函式
  page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page, patten), model)
})

//DOM事件 (改變排版模式)
changeModel.addEventListener('click', function changeModel(event){
  if (event.target.tagName !== 'I') return
  model = event.target.dataset.model || model
  patten = event.target.dataset.patten  || patten
  renderMovieList(getMoviesByPage(page, patten), model) 
})

//建立電影清單畫面函式(網頁整體版面)
function renderMovieList(data, model) { 
  let moviesList = ''
  if (model === 'picture') {
    data.forEach(item => {
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
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id=${item.id}>More</button>
                <button class="btn btn-danger btn-add-delete" data-id=${item.id}>X</button>
              </div>
          </div>
        </div>
      </div>`
    })
  } else if (model === 'list') {
    data.forEach(item => {
      moviesList += `
      <hr/>
      <div class="container d-flex justify-content-between m-2">
        <div class="body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="footer">
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id=${item.id}>More</button>
          <button class="btn btn-danger btn-add-delete" data-id=${item.id}>X</button>
        </div>
      </div>
      `
    })
  }  
  moviePanel.innerHTML = moviesList
}

//建立電影Modal函式
function showMovieModal(ID) {
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

//刪除最愛電影
function deleteFavorite (ID) {
    let id =Number(ID)
    const index = movieData.findIndex(item => item.id === id) 
    if(index === -1) return  //如果沒有找到該電影，則離開函式不往下執行
    movieData.splice(index, 1)
    localStorage.setItem('favoriteMovies',JSON.stringify(movieData))
    renderPaginator(movieData.length)
    if ((page - 1) * MOVIES_PER_PAGE >= movieData.length) {
      page --
    }
    renderMovieList(getMoviesByPage(page, patten), model)
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
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  let data = movieData
  if (patten === 'up') {
    data = data.sort((a, b)=> a.title > b.title ? 1: -1)
  } else if (patten === 'down') {   
    data = data.sort((a, b) => b.title > a.title ? 1: -1)
  }
  return data.slice(startIndex, startIndex+MOVIES_PER_PAGE)
}