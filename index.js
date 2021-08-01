//建立網址的常數(以後若API網址有變化，直接在此更改即可)
const BASE_URL = 'https://movie-list.alphacamp.io'  //API網站主網址
const INDEX_URL = BASE_URL + '/api/v1/movies/'   //不同API版本
const POSTER_URL = BASE_URL + '/posters/'

//常數們
const movies = []  //存放電影資料常數

//DOM節點
const moviePanel = document.querySelector('#movie-panel')  //電影列表
const searchMovie = document.querySelector('#search-movies') 
const searchInput = document.querySelector('#search-input') 

//透過API取得電影資訊
axios
.get(INDEX_URL)
.then((response) => {
    movies.push(...response.data.results)
    renderMovieList(movies)
})
.catch((err) => console.log(err))

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
              <button class="btn btn-info btn-add-favorite">+</button>
            </div>
        </div>
      </div>
    </div>`
  }) 
  moviePanel.innerHTML = moviesList
}

//按下More按鈕會跳出額外資訊
moviePanel.addEventListener('click', function onPanelClicked(event){
  if (event.target.matches('.btn-show-movie')) {
    const movieID = event.target.dataset.id
    showMovieModal(movieID)
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
    console.log(movieIfo.title)
  })
  .catch((err) => console.log(err))

}

//建立搜尋結果
searchMovie.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()  //避免送出表單後網頁從新整理
  const keyWords = searchInput.value.trim().toLowerCase()  //取得輸入的關鍵字，並去除空白和轉為小寫
  let filteredMovies = []
  if (keyWords.length > 0) {
    for (const movie of movies) {
      if (movie.title.trim().toLowerCase().includes(keyWords)) {
        filteredMovies.push(movie)
      }
    }
  }
  renderMovieList(filteredMovies)
})