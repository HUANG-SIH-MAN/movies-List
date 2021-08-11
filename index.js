//建立網址的常數(以後若API網址有變化，直接在此更改即可)
const BASE_URL = 'https://movie-list.alphacamp.io'  //API網站主網址
const INDEX_URL = BASE_URL + '/api/v1/movies/'   //不同API版本
const POSTER_URL = BASE_URL + '/posters/'

//常數們
const movies = []  //存放電影資料常數
let filteredMovies = []  //存放搜尋結果
const MOVIES_PER_PAGE = 12

//DOM節點
const moviePanel = document.querySelector('#movie-panel')  //電影列表
const searchMovie = document.querySelector('#search-movies') 
const searchInput = document.querySelector('#search-input') 
const home = document.querySelector('.home') 
const paginator = document.querySelector('#paginator')  //分頁器

//透過API取得電影資訊
axios
.get(INDEX_URL)
.then((response) => {
    movies.push(...response.data.results)
    renderMovieList(getMoviesByPage(1))
    renderPaginator(movies.length)
})
.catch((err) => console.log(err))

//DOM事件(按頁數決定載入那些影片)
paginator.addEventListener('click', function onPaginatorClicked (event){
  if (event.target.tagName !== 'A') return  //如果沒有按到分頁，結束函式
  const page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
})

//建立電影清單畫面函式
function renderMovieList(data) { 
  let moviesList = ''
  data.forEach(item => {
    moviesList += `
    <div class="col-sm-3">
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
              <button class="btn btn-info btn-add-favorite" data-id=${item.id}>+</button>
            </div>
        </div>
      </div>
    </div>`
  }) 
  moviePanel.innerHTML = moviesList
}

//DOM事件
moviePanel.addEventListener('click', function onPanelClicked(event){
  const movieID = event.target.dataset.id
  if (event.target.matches('.btn-show-movie')) {  //按下More按鈕會跳出額外資訊  
    showMovieModal(movieID)
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(movieID)
  }
})

//建立搜尋結果
searchMovie.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()  //避免送出表單後網頁從新整理
  const keyWords = searchInput.value.trim().toLowerCase()  //取得輸入的關鍵字，並去除空白和轉為小寫
  if (keyWords.length > 0) {
    for (const movie of movies) {
      if (movie.title.trim().toLowerCase().includes(keyWords)) {
        filteredMovies.push(movie)
        renderMovieList(getMoviesByPage(1))
        renderPaginator(filteredMovies.length)   
      }
    }
  }
  if (filteredMovies.length === 0) {
    alert(`Can not find ${keyWords} movie`)
  }
})

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


//建立喜愛的電影清單
function addToFavorite(ID) {
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
function getMoviesByPage (page) {
  //如果filteredMovies.length > 0 ，使用 filteredMovies 陣列，如果不是使用 movies 陣列
  const data = filteredMovies.length ? filteredMovies : movies  
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex+MOVIES_PER_PAGE)
}
